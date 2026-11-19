const crypto = require('crypto');
const config = require('../config');

// Chỉ chấp nhận request đi qua API Gateway (Gateway gắn header x-internal-key)
function requireInternalKey(req, res, next) {
  const received = Buffer.from(String(req.headers['x-internal-key'] || ''));
  const expected = Buffer.from(config.internalKey);
  const isValid = received.length === expected.length && crypto.timingSafeEqual(received, expected);
  if (!isValid) {
    return res.status(403).json({ message: 'Chỉ được truy cập qua API Gateway' });
  }
  next();
}

module.exports = { requireInternalKey };
