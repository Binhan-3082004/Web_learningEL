// Truy vấn bảng PracticeSessions (mỗi lượt làm Quiz hoặc thi thử là một phiên)
const { pool } = require('../config/db');

// refId: mã bài học (Quiz) hoặc mã đề thi (Exam). Trả về mã phiên vừa tạo.
async function create({ userId, sessionType, refId, totalQuestions }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO PracticeSessions (UserId, SessionType, RefId, TotalQuestions) VALUES (?, ?, ?, ?)',
    [userId, sessionType, refId, totalQuestions]
  );
  return result.insertId;
}

// Chỉ tìm phiên thuộc về đúng người dùng và đúng loại
async function findOfUser(sessionId, userId, sessionType) {
  const [rows] = await pool.query(
    'SELECT * FROM PracticeSessions WHERE Id = ? AND UserId = ? AND SessionType = ?',
    [sessionId, userId, sessionType]
  );
  return rows[0] || null;
}

async function findStartTime(sessionId) {
  const [rows] = await pool.query('SELECT StartTime FROM PracticeSessions WHERE Id = ?', [sessionId]);
  return rows[0] ? rows[0].StartTime : null;
}

// Ghi điểm và đánh dấu phiên đã nộp. Chỉ cập nhật nếu chưa nộp (tránh nộp hai lần).
// Trả về số dòng bị ảnh hưởng: 1 = thành công, 0 = đã được nộp trước đó.
async function markFinished({ sessionId, score, correctCount, totalQuestions }, db = pool) {
  const [result] = await db.query(
    'UPDATE PracticeSessions SET Score = ?, CorrectCount = ?, TotalQuestions = ?, EndTime = NOW() WHERE Id = ? AND EndTime IS NULL',
    [score, correctCount, totalQuestions, sessionId]
  );
  return result.affectedRows;
}

// ---------- Thống kê cho trang tiến độ ----------

async function summarizeByType(userId) {
  const [rows] = await pool.query(
    `SELECT SessionType, COUNT(*) AS attempts, ROUND(AVG(Score)) AS avgScore, MAX(Score) AS bestScore
     FROM PracticeSessions WHERE UserId = ? AND EndTime IS NOT NULL GROUP BY SessionType`,
    [userId]
  );
  return rows;
}

async function findRecentFinished(userId, limit) {
  const [rows] = await pool.query(
    'SELECT Id, SessionType, Score, EndTime FROM PracticeSessions WHERE UserId = ? AND EndTime IS NOT NULL ORDER BY EndTime DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

// Lịch sử làm bài. sessionType có thể null để lấy cả Quiz lẫn Exam
async function findHistory({ userId, sessionType, limit }) {
  const [rows] = await pool.query(
    `SELECT Id, SessionType, RefId, Score, CorrectCount, TotalQuestions, StartTime, EndTime
     FROM PracticeSessions
     WHERE UserId = ? AND EndTime IS NOT NULL ${sessionType ? 'AND SessionType = ?' : ''}
     ORDER BY EndTime DESC LIMIT ?`,
    sessionType ? [userId, sessionType, limit] : [userId, limit]
  );
  return rows;
}

// Các ngày người dùng có học (làm bài hoặc hoàn thành bài học), mới nhất trước
async function findStudyDays(userId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE(activityTime) AS day FROM (
       SELECT StartTime AS activityTime FROM PracticeSessions WHERE UserId = ?
       UNION ALL
       SELECT CompletedAt FROM LessonProgresses WHERE UserId = ? AND CompletedAt IS NOT NULL
     ) activities
     ORDER BY day DESC LIMIT 400`,
    [userId, userId]
  );
  return rows.map((row) => row.day);
}

async function getToday() {
  const [[row]] = await pool.query('SELECT CURDATE() AS today');
  return row.today;
}

// ---------- Thống kê cho Admin ----------

async function summarizeAllByType() {
  const [rows] = await pool.query(
    `SELECT SessionType, COUNT(*) AS attempts, ROUND(AVG(Score)) AS avgScore
     FROM PracticeSessions WHERE EndTime IS NOT NULL GROUP BY SessionType`
  );
  return rows;
}

async function countActiveLearnersLast7Days() {
  const [[row]] = await pool.query(
    'SELECT COUNT(DISTINCT UserId) AS total FROM PracticeSessions WHERE StartTime >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
  );
  return row.total;
}

module.exports = {
  create,
  findOfUser,
  findStartTime,
  markFinished,
  summarizeByType,
  findRecentFinished,
  findHistory,
  findStudyDays,
  getToday,
  summarizeAllByType,
  countActiveLearnersLast7Days,
};
