// Logic nghiệp vụ tài khoản: đăng ký, đăng nhập, làm mới token, hồ sơ cá nhân, đổi mật khẩu
const bcrypt = require('bcryptjs');
const { withTransaction } = require('../config/db');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const { hashToken, issueTokens } = require('./tokenService');
const HttpError = require('../utils/HttpError');
const { LEVELS, ROLES, BCRYPT_ROUNDS } = require('../utils/constants');
const { isEmail, isUserName, isStrongPassword, isPhoneNumber, isFullName } = require('../utils/validators');

// Dùng so sánh giả khi không tìm thấy user, để thời gian phản hồi không lộ tài khoản nào tồn tại
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

const PASSWORD_RULE_MESSAGE = 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số';
const NEW_PASSWORD_RULE_MESSAGE = 'Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số';

// Chỉ trả về những trường an toàn cho client (không bao giờ có PasswordHash)
function toPublicUser(user, roles) {
  return {
    id: user.Id,
    userName: user.UserName,
    email: user.Email,
    fullName: user.FullName,
    phoneNumber: user.PhoneNumber,
    englishLevel: user.EnglishLevel,
    roles,
    createdAt: user.CreatedAt,
  };
}

// FR01 - Đăng ký tài khoản mới (mặc định vai trò "user")
async function register({ userName, email, password, confirmPassword, fullName, phoneNumber }) {
  if (!isUserName(userName)) throw new HttpError(400, 'Tên đăng nhập gồm 4-30 ký tự chữ, số hoặc dấu gạch dưới');
  if (!isEmail(email)) throw new HttpError(400, 'Email không hợp lệ');
  if (!isStrongPassword(password)) throw new HttpError(400, PASSWORD_RULE_MESSAGE);
  if (confirmPassword !== undefined && confirmPassword !== password) throw new HttpError(400, 'Mật khẩu xác nhận không khớp');
  if (!isFullName(fullName)) throw new HttpError(400, 'Họ tên không hợp lệ');
  if (!isPhoneNumber(phoneNumber)) throw new HttpError(400, 'Số điện thoại không hợp lệ');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    return await withTransaction(async (connection) => {
      const userId = await userModel.create(
        { email: email.toLowerCase(), userName, passwordHash, fullName: fullName.trim(), phoneNumber },
        connection
      );
      await roleModel.assignToUser(userId, [ROLES.USER], connection);
      return userId;
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Tên đăng nhập hoặc email đã được sử dụng');
    throw error;
  }
}

// FR01 - Đăng nhập bằng tên đăng nhập hoặc email
async function login({ usernameOrEmail, password, ipAddress }) {
  if (typeof usernameOrEmail !== 'string' || typeof password !== 'string' || !usernameOrEmail || !password) {
    throw new HttpError(400, 'Vui lòng nhập tài khoản và mật khẩu');
  }

  const user = await userModel.findByUserNameOrEmail(usernameOrEmail, usernameOrEmail.toLowerCase());
  const isPasswordCorrect = await bcrypt.compare(password, user ? user.PasswordHash : DUMMY_PASSWORD_HASH);
  if (!user || !isPasswordCorrect) throw new HttpError(401, 'Tài khoản hoặc mật khẩu không đúng');
  if (!user.IsActive) throw new HttpError(403, 'Tài khoản đã bị khóa');

  const roles = await roleModel.findRoleNamesOfUser(user.Id);
  const tokens = await issueTokens(user, roles, ipAddress);
  return { ...tokens, user: toPublicUser(user, roles) };
}

// Làm mới access token. Mỗi refresh token chỉ dùng được một lần (xoay vòng).
async function refreshTokens({ refreshToken, ipAddress }) {
  if (typeof refreshToken !== 'string' || !refreshToken) throw new HttpError(400, 'Thiếu refresh token');

  const storedToken = await refreshTokenModel.findByHash(hashToken(refreshToken));
  if (!storedToken) throw new HttpError(401, 'Refresh token không hợp lệ');

  if (storedToken.RevokedAt) {
    // Token đã thu hồi mà vẫn bị dùng lại => nghi ngờ bị lộ, thu hồi toàn bộ phiên của user
    await refreshTokenModel.revokeAllOfUser(storedToken.UserId);
    throw new HttpError(401, 'Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại');
  }
  if (await refreshTokenModel.isExpired(storedToken.ExpiresAt)) {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn');
  }

  const user = await userModel.findById(storedToken.UserId);
  if (!user || !user.IsActive) throw new HttpError(403, 'Tài khoản không khả dụng');

  await refreshTokenModel.revokeById(storedToken.Id);
  const roles = await roleModel.findRoleNamesOfUser(user.Id);
  return issueTokens(user, roles, ipAddress);
}

async function logout(refreshToken) {
  if (typeof refreshToken === 'string' && refreshToken) {
    await refreshTokenModel.revokeByHash(hashToken(refreshToken));
  }
}

async function getProfile(userId) {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpError(404, 'Không tìm thấy người dùng');
  return toPublicUser(user, await roleModel.findRoleNamesOfUser(userId));
}

// Chỉ cập nhật những trường client có gửi lên
async function updateProfile(userId, { fullName, phoneNumber, email, englishLevel }) {
  const fieldsToUpdate = {};

  if (fullName !== undefined) {
    if (!isFullName(fullName)) throw new HttpError(400, 'Họ tên không hợp lệ');
    fieldsToUpdate.fullName = fullName.trim();
  }
  if (phoneNumber !== undefined) {
    if (!isPhoneNumber(phoneNumber)) throw new HttpError(400, 'Số điện thoại không hợp lệ');
    fieldsToUpdate.phoneNumber = phoneNumber || null;
  }
  if (email !== undefined) {
    if (!isEmail(email)) throw new HttpError(400, 'Email không hợp lệ');
    fieldsToUpdate.email = email.toLowerCase();
  }
  if (englishLevel !== undefined) {
    if (!LEVELS.includes(englishLevel)) throw new HttpError(400, 'Trình độ phải thuộc A1-C2');
    fieldsToUpdate.englishLevel = englishLevel;
  }
  if (Object.keys(fieldsToUpdate).length === 0) throw new HttpError(400, 'Không có thông tin nào để cập nhật');

  try {
    await userModel.updateProfile(userId, fieldsToUpdate);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Email đã được sử dụng');
    throw error;
  }
  return getProfile(userId);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  if (typeof currentPassword !== 'string' || !isStrongPassword(newPassword)) {
    throw new HttpError(400, NEW_PASSWORD_RULE_MESSAGE);
  }

  const currentHash = await userModel.getPasswordHash(userId);
  const isCurrentCorrect = currentHash && (await bcrypt.compare(currentPassword, currentHash));
  if (!isCurrentCorrect) throw new HttpError(400, 'Mật khẩu hiện tại không đúng');

  await userModel.updatePasswordHash(userId, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
  await refreshTokenModel.revokeAllOfUser(userId); // buộc đăng nhập lại trên mọi thiết bị
}

module.exports = { register, login, refreshTokens, logout, getProfile, updateProfile, changePassword };
