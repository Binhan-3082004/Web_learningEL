// Truy vấn bảng RefreshTokens. Trong DB chỉ lưu mã băm (SHA-256) của token, không lưu token gốc.
const { pool } = require('../config/db');

async function create({ userId, tokenHash, validDays, ipAddress }) {
  await pool.query(
    'INSERT INTO RefreshTokens (UserId, Token, ExpiresAt, CreatedByIp) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?)',
    [userId, tokenHash, validDays, ipAddress]
  );
}

async function findByHash(tokenHash) {
  const [rows] = await pool.query('SELECT * FROM RefreshTokens WHERE Token = ?', [tokenHash]);
  return rows[0] || null;
}

// So sánh với NOW() của MySQL để cùng múi giờ với lúc tạo token
async function isExpired(expiresAt) {
  const [[row]] = await pool.query('SELECT ? <= NOW() AS expired', [expiresAt]);
  return Boolean(row.expired);
}

async function revokeById(tokenId) {
  await pool.query('UPDATE RefreshTokens SET RevokedAt = NOW() WHERE Id = ?', [tokenId]);
}

async function revokeByHash(tokenHash) {
  await pool.query('UPDATE RefreshTokens SET RevokedAt = NOW() WHERE Token = ? AND RevokedAt IS NULL', [tokenHash]);
}

// Thu hồi mọi phiên đăng nhập của một người dùng
async function revokeAllOfUser(userId) {
  await pool.query('UPDATE RefreshTokens SET RevokedAt = NOW() WHERE UserId = ? AND RevokedAt IS NULL', [userId]);
}

module.exports = { create, findByHash, isExpired, revokeById, revokeByHash, revokeAllOfUser };
