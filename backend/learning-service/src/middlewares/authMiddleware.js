// Danh tính người dùng do API Gateway xác thực JWT rồi chuyển xuống qua header x-user-id / x-user-roles

// Gắn req.user = { id, roles } nếu request có danh tính
function attachUser(req, res, next) {
  const userId = Number(req.headers['x-user-id']);
  if (userId) {
    const roles = String(req.headers['x-user-roles'] || '').split(',').filter(Boolean);
    req.user = { id: userId, roles };
  }
  next();
}

// Bắt buộc đã đăng nhập
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  next();
}

// Bắt buộc có ít nhất một trong các vai trò được truyền vào (RBAC lớp 2, lớp 1 nằm ở Gateway)
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const hasPermission = allowedRoles.some((role) => req.user.roles.includes(role));
  if (!hasPermission) return res.status(403).json({ message: 'Không đủ quyền truy cập' });
  next();
};

module.exports = { attachUser, requireAuth, requireRole };
