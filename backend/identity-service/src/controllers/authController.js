// Controller: nhận request, gọi service, trả response. Không chứa logic nghiệp vụ.
const authService = require('../services/authService');
const getClientIp = require('../utils/getClientIp');
const googleAuthService = require('../services/googleAuthService');

async function register(req, res) {
  const userId = await authService.register(req.body || {});
  res.status(201).json({ message: 'Đăng ký thành công', userId });
}

async function login(req, res) {
  const result = await authService.login({ ...(req.body || {}), ipAddress: getClientIp(req) });
  res.json(result);
}

async function refreshToken(req, res) {
  const tokens = await authService.refreshTokens({
    refreshToken: (req.body || {}).refreshToken,
    ipAddress: getClientIp(req),
  });
  res.json(tokens);
}

async function logout(req, res) {
  await authService.logout((req.body || {}).refreshToken);
  res.json({ message: 'Đã đăng xuất' });
}

async function getMyProfile(req, res) {
  res.json(await authService.getProfile(req.user.id));
}

async function updateMyProfile(req, res) {
  res.json(await authService.updateProfile(req.user.id, req.body || {}));
}

async function changePassword(req, res) {
  await authService.changePassword(req.user.id, req.body || {});
  res.json({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' });
}


async function googleLogin(req, res) {
  const ipAddress = req.ip;
  const tokens = await googleAuthService.loginWithGoogle({
    code: req.body.code,
    ipAddress,
  });
  res.json(tokens);
}

module.exports = { register, login, refreshToken, logout, getMyProfile, updateMyProfile, changePassword, googleLogin };
