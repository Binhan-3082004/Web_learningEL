// Truy vấn bảng LessonProgresses (tiến độ hoàn thành bài học của từng người dùng)
const { pool } = require('../config/db');

async function isCompleted(userId, lessonId) {
  const [rows] = await pool.query('SELECT IsCompleted FROM LessonProgresses WHERE UserId = ? AND LessonId = ?', [userId, lessonId]);
  return Boolean(rows[0] && rows[0].IsCompleted);
}

async function markCompleted(userId, lessonId) {
  await pool.query(
    `INSERT INTO LessonProgresses (UserId, LessonId, IsCompleted, CompletedAt) VALUES (?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE IsCompleted = 1, CompletedAt = NOW()`,
    [userId, lessonId]
  );
}

// Tổng số bài và số bài đã hoàn thành theo từng cấp độ
async function countByLevel(userId) {
  const [rows] = await pool.query(
    `SELECT l.Level, COUNT(*) AS total, COALESCE(SUM(lp.IsCompleted = 1), 0) AS completed
     FROM Lessons l LEFT JOIN LessonProgresses lp ON lp.LessonId = l.Id AND lp.UserId = ?
     GROUP BY l.Level ORDER BY l.Level`,
    [userId]
  );
  return rows;
}

// Tổng số lượt hoàn thành bài học của mọi người dùng (dùng cho thống kê Admin)
async function countAllCompletions() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM LessonProgresses WHERE IsCompleted = 1');
  return row.total;
}

module.exports = { isCompleted, markCompleted, countByLevel, countAllCompletions };
