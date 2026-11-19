// Xác thực JWT ở Gateway rồi chuyển danh tính xuống các service bằng header nội bộ
const jwt = require('jsonwebtoken');
const config = require('../config');
const { PUBLIC_ROUTES, ADMIN_ROUTES } = require('../config/routeRules');

function readBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

const isPublicRoute = (req) => PUBLIC_ROUTES.some((rule) => rule.method === req.method && rule.path.test(req.path));
const isAdminRoute = (req) => ADMIN_ROUTES.some((pattern) => pattern.test(req.path));

function authenticate(req, res, next) {
  // Chống giả mạo: xóa mọi header định danh do client tự gửi, rồi gắn khóa nội bộ
  delete req.headers['x-user-id'];
  delete req.headers['x-user-roles'];
  req.headers['x-internal-key'] = config.internalKey;

  if (req.method === 'OPTIONS') return next(); // preflight của CORS

  const routeIsPublic = isPublicRoute(req);
  const token = readBearerToken(req);
  let payload = null;

  if (token) {
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch (error) {
      // Route công khai: bỏ qua token lỗi, coi như khách
      if (!routeIsPublic) {
        const isExpired = error.name === 'TokenExpiredError';
        return res.status(401).json({
          message: isExpired ? 'Token đã hết hạn' : 'Token không hợp lệ',
          code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        });
      }
    }
  }

  if (!payload && !routeIsPublic) return res.status(401).json({ message: 'Chưa đăng nhập' });

  if (payload) {
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    if (isAdminRoute(req) && !roles.includes('admin')) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    req.headers['x-user-id'] = String(payload.sub);
    req.headers['x-user-roles'] = roles.join(',');
  }
  next();
}

module.exports = authenticate;
