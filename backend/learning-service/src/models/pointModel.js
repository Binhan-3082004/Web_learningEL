// Truy vấn bảng RankingPointLogs (nhật ký điểm tích lũy)
const { pool } = require('../config/db');

async function insertLog({ userId, points, reason }, db = pool) {
  await db.query('INSERT INTO RankingPointLogs (UserId, Points, Reason) VALUES (?, ?, ?)', [
    userId,
    points,
    String(reason).slice(0, 256),
  ]);
}

async function getTotalPoints(userId) {
  const [[row]] = await pool.query('SELECT COALESCE(SUM(Points), 0) AS total FROM RankingPointLogs WHERE UserId = ?', [userId]);
  return Number(row.total);
}

async function findRecentLogs(userId, limit = 20) {
  const [rows] = await pool.query(
    'SELECT Points, Reason, CreatedAt FROM RankingPointLogs WHERE UserId = ? ORDER BY Id DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

module.exports = { insertLog, getTotalPoints, findRecentLogs };
