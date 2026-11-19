// Truy vấn bảng PracticeMistakes (các câu người học làm sai)
const { pool } = require('../config/db');
const { MISTAKE_ITEM_TYPES } = require('../utils/constants');

// mistakes: mảng [sessionId, itemType, itemId, userAnswer]
async function insertMany(mistakes, db = pool) {
  if (mistakes.length === 0) return;
  await db.query('INSERT INTO PracticeMistakes (SessionId, ItemType, ItemId, UserAnswer) VALUES ?', [mistakes]);
}

// Các câu hỏi thi bị sai trong một phiên (để xem lại bài)
async function findExamMistakesOfSession(sessionId) {
  const [rows] = await pool.query(
    'SELECT ItemId, UserAnswer FROM PracticeMistakes WHERE SessionId = ? AND ItemType = ?',
    [sessionId, MISTAKE_ITEM_TYPES.EXAM_QUESTION]
  );
  return rows;
}

// Từ vựng hay sai nhất của người dùng
async function findWeakVocabularies(userId, limit = 20) {
  const [rows] = await pool.query(
    `SELECT v.Id, v.Word, v.Meaning, COUNT(*) AS wrongCount
     FROM PracticeMistakes pm
     JOIN PracticeSessions ps ON ps.Id = pm.SessionId
     JOIN Vocabularies v ON v.Id = pm.ItemId
     WHERE ps.UserId = ? AND pm.ItemType = ?
     GROUP BY v.Id, v.Word, v.Meaning ORDER BY wrongCount DESC LIMIT ?`,
    [userId, MISTAKE_ITEM_TYPES.VOCABULARY, limit]
  );
  return rows;
}

// Phần thi (Grammar, Reading...) hay sai nhất của người dùng
async function findWeakSections(userId) {
  const [rows] = await pool.query(
    `SELECT q.Section, COUNT(*) AS wrongCount
     FROM PracticeMistakes pm
     JOIN PracticeSessions ps ON ps.Id = pm.SessionId
     JOIN ExamQuestions q ON q.Id = pm.ItemId
     WHERE ps.UserId = ? AND pm.ItemType = ?
     GROUP BY q.Section ORDER BY wrongCount DESC`,
    [userId, MISTAKE_ITEM_TYPES.EXAM_QUESTION]
  );
  return rows;
}

module.exports = { insertMany, findExamMistakesOfSession, findWeakVocabularies, findWeakSections };
