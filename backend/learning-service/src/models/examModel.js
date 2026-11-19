// Truy vấn bảng Exams và ExamQuestions
const { pool } = require('../config/db');

// Danh sách đề thi cho người học
async function findAllForLearner() {
  const [rows] = await pool.query(
    `SELECT e.Id, e.Title, e.ExamType, e.DurationMinutes, e.Description,
            (SELECT COUNT(*) FROM ExamQuestions q WHERE q.ExamId = e.Id) AS QuestionCount
     FROM Exams e ORDER BY e.ExamType, e.Id`
  );
  return rows;
}

// Danh sách đề thi cho Admin (đề mới nhất trước)
async function findAllForAdmin() {
  const [rows] = await pool.query(
    `SELECT e.*, (SELECT COUNT(*) FROM ExamQuestions q WHERE q.ExamId = e.Id) AS QuestionCount
     FROM Exams e ORDER BY e.Id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM Exams WHERE Id = ?', [id]);
  return rows[0] || null;
}

async function create({ title, examType, durationMinutes, description }) {
  const [result] = await pool.query(
    'INSERT INTO Exams (Title, ExamType, DurationMinutes, Description) VALUES (?, ?, ?, ?)',
    [title, examType, durationMinutes, description]
  );
  return result.insertId;
}

async function update(id, { title, examType, durationMinutes, description }) {
  const [result] = await pool.query(
    'UPDATE Exams SET Title = ?, ExamType = ?, DurationMinutes = ?, Description = ? WHERE Id = ?',
    [title, examType, durationMinutes, description, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM Exams WHERE Id = ?', [id]);
  return result.affectedRows;
}

async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM Exams');
  return row.total;
}

// ---------- Câu hỏi ----------

// Toàn bộ câu hỏi kèm đáp án đúng (Admin hoặc xem lại bài sau khi nộp)
async function findQuestionsWithAnswers(examId) {
  const [rows] = await pool.query('SELECT * FROM ExamQuestions WHERE ExamId = ? ORDER BY SortOrder, Id', [examId]);
  return rows;
}

// Câu hỏi để làm bài: KHÔNG kèm đáp án đúng
async function findQuestionsForTaking(examId) {
  const [rows] = await pool.query(
    'SELECT Id, Section, Content, Options, AudioUrl FROM ExamQuestions WHERE ExamId = ? ORDER BY SortOrder, Id',
    [examId]
  );
  return rows;
}

// Chỉ lấy mã câu hỏi và đáp án đúng để chấm điểm
async function findCorrectAnswers(examId) {
  const [rows] = await pool.query('SELECT Id, CorrectOption FROM ExamQuestions WHERE ExamId = ?', [examId]);
  return rows;
}

// questions: mảng đã được validateQuestionBody kiểm tra
async function insertQuestions(examId, questions) {
  await pool.query(
    'INSERT INTO ExamQuestions (ExamId, Section, Content, Options, CorrectOption, Explanation, AudioUrl, SortOrder) VALUES ?',
    [
      questions.map((q) => [examId, q.section, q.content, q.options, q.correctOption, q.explanation, q.audioUrl, q.sortOrder]),
    ]
  );
}

async function updateQuestion(questionId, q) {
  const [result] = await pool.query(
    `UPDATE ExamQuestions
     SET Section = ?, Content = ?, Options = ?, CorrectOption = ?, Explanation = ?, AudioUrl = ?, SortOrder = ?
     WHERE Id = ?`,
    [q.section, q.content, q.options, q.correctOption, q.explanation, q.audioUrl, q.sortOrder, questionId]
  );
  return result.affectedRows;
}

async function removeQuestion(questionId) {
  const [result] = await pool.query('DELETE FROM ExamQuestions WHERE Id = ?', [questionId]);
  return result.affectedRows;
}

module.exports = {
  findAllForLearner,
  findAllForAdmin,
  findById,
  create,
  update,
  remove,
  countAll,
  findQuestionsWithAnswers,
  findQuestionsForTaking,
  findCorrectAnswers,
  insertQuestions,
  updateQuestion,
  removeQuestion,
};
