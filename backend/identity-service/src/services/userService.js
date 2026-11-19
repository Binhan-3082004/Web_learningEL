// Logic nghiệp vụ quản trị người dùng (chỉ Admin) - FR09, FR11
const { withTransaction } = require('../config/db');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const HttpError = require('../utils/HttpError');

async function listUsers({ keyword, page, limit, offset }) {
  const { total, items } = await userModel.search({ keyword, limit, offset });
  const users = items.map((user) => ({ ...user, Roles: user.Roles ? user.Roles.split(',') : [] }));
  return { page, limit, total, items: users };
}

async function getUserStatistics() {
  const row = await userModel.getStatistics();
  return { total: Number(row.total), active: Number(row.active), newLast7Days: Number(row.newLast7Days) };
}

// Khóa / mở khóa tài khoản
async function setUserActiveStatus({ adminId, userId, isActive }) {
  if (!Number.isInteger(userId) || typeof isActive !== 'boolean') throw new HttpError(400, 'Dữ liệu không hợp lệ');
  if (userId === adminId) throw new HttpError(400, 'Không thể tự khóa tài khoản của chính mình');

  const affectedRows = await userModel.updateActiveStatus(userId, isActive);
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy người dùng');

  // Khóa tài khoản: thu hồi refresh token ngay (access token hiện tại còn hiệu lực tối đa ACCESS_TOKEN_TTL)
  if (!isActive) await refreshTokenModel.revokeAllOfUser(userId);
}

// Phân quyền (RBAC): thay toàn bộ vai trò của user
async function setUserRoles({ adminId, userId, roleNames }) {
  if (!Number.isInteger(userId) || !Array.isArray(roleNames) || roleNames.length === 0) {
    throw new HttpError(400, 'Danh sách vai trò không hợp lệ');
  }
  if (userId === adminId && !roleNames.includes('admin')) {
    throw new HttpError(400, 'Không thể tự gỡ quyền admin của chính mình');
  }

  await withTransaction(async (connection) => {
    const foundRoles = await roleModel.findByNames(roleNames, connection);
    if (foundRoles.length !== new Set(roleNames).size) throw new HttpError(400, 'Có vai trò không tồn tại');
    if (!(await userModel.existsById(userId, connection))) throw new HttpError(404, 'Không tìm thấy người dùng');
    await roleModel.replaceUserRoles(userId, foundRoles.map((role) => role.Id), connection);
  });
}

module.exports = { listUsers, getUserStatistics, setUserActiveStatus, setUserRoles };
