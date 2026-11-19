// Controller quản trị người dùng (Admin)
const userService = require('../services/userService');
const { getPagination } = require('../utils/pagination');

async function listUsers(req, res) {
  const { page, limit, offset } = getPagination(req);
  const keyword = String(req.query.search || '').trim();
  res.json(await userService.listUsers({ keyword, page, limit, offset }));
}

async function getUserStatistics(req, res) {
  res.json(await userService.getUserStatistics());
}

async function updateUserStatus(req, res) {
  const isActive = (req.body || {}).isActive;
  await userService.setUserActiveStatus({ adminId: req.user.id, userId: Number(req.params.id), isActive });
  res.json({ message: isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản' });
}

async function updateUserRoles(req, res) {
  const roleNames = (req.body || {}).roles;
  await userService.setUserRoles({ adminId: req.user.id, userId: Number(req.params.id), roleNames });
  res.json({ message: 'Đã cập nhật vai trò' });
}

module.exports = { listUsers, getUserStatistics, updateUserStatus, updateUserRoles };
