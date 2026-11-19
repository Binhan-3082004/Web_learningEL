// Truy vấn bảng QuizSessionItems: danh sách câu hỏi của mỗi lượt Quiz (để chấm điểm phía server)
const { pool } = require('../config/db');

// items: mảng { vocabularyId, type }
async function insertMany(sessionId, items, db = pool) {
  await db.query('INSERT INTO QuizSessionItems (SessionId, VocabularyId, QuestionType) VALUES ?', [
    items.map((item) => [sessionId, item.vocabularyId, item.type]),
  ]);
}

// Câu hỏi của phiên kèm từ và nghĩa đúng
async function findBySession(sessionId) {
  const [rows] = await pool.query(
    `SELECT i.VocabularyId, i.QuestionType, v.Word, v.Meaning
     FROM QuizSessionItems i JOIN Vocabularies v ON v.Id = i.VocabularyId
     WHERE i.SessionId = ?`,
    [sessionId]
  );
  return rows;
}

module.exports = { insertMany, findBySession };
