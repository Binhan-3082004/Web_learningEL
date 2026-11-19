// Tạo và băm token: access token (JWT ngắn hạn) + refresh token (chuỗi ngẫu nhiên dài hạn)
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const refreshTokenModel = require('../models/refreshTokenModel');

function signAccessToken(user, roles) {
  const payload = { sub: String(user.Id), name: user.UserName, roles };
  return jwt.sign(payload, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.accessTokenTtl });
}

const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Phát hành cặp token mới cho user và lưu mã băm refresh token vào DB
async function issueTokens(user, roles, ipAddress) {
  const refreshToken = generateRefreshToken();
  await refreshTokenModel.create({
    userId: user.Id,
    tokenHash: hashToken(refreshToken),
    validDays: config.refreshTokenDays,
    ipAddress,
  });
  return {
    accessToken: signAccessToken(user, roles),
    refreshToken,
    accessTokenTtl: config.accessTokenTtl,
  };
}

module.exports = { signAccessToken, hashToken, issueTokens };
