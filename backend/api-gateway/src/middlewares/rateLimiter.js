// Giới hạn tần suất cho các route nhạy cảm (chống dò mật khẩu bằng cách thử liên tục)
const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000; // 15 phút
const MAX_REQUESTS_PER_WINDOW = 30;

const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_REQUESTS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
});

module.exports = { authRateLimiter };
