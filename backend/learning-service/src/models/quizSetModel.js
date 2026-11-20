// Model cho QuizSets và QuizSetQuestions (quiz độc lập, không liên quan bài học)
const { pool } = require('../config/db');

// ── Quiz Sets ──

async function findAll() {
  const [rows] = await pool.query(
    `SELECT q.*, (SELECT COUNT(*) FROM QuizSetQuestions WHERE QuizSetId = q.Id) AS QuestionCount
     FROM QuizSets q ORDER BY q.CreatedAt DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM QuizSets WHERE Id = ?', [id]);
  return rows[0] || null;
}

async function create({ title, description, thumbnailUrl }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO QuizSets (Title, Description, ThumbnailUrl) VALUES (?, ?, ?)',
    [title, description || null, thumbnailUrl || null]
  );
  return result.insertId;
}

async function update(id, { title, description, thumbnailUrl }, db = pool) {
  const [result] = await db.query(
    'UPDATE QuizSets SET Title = ?, Description = ?, ThumbnailUrl = ? WHERE Id = ?',
    [title, description || null, thumbnailUrl || null, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM QuizSets WHERE Id = ?', [id]);
  return result.affectedRows;
}

// ── Quiz Questions ──

// Dành cho admin — kèm đáp án
async function findQuestions(quizSetId) {
  const [rows] = await pool.query(
    'SELECT * FROM QuizSetQuestions WHERE QuizSetId = ? ORDER BY SortOrder, Id',
    [quizSetId]
  );
  return rows;
}

// Dành cho người học — KHÔNG có CorrectOption, Explanation
async function findQuestionsForUser(quizSetId) {
  const [rows] = await pool.query(
    'SELECT Id, QuizSetId, Question, OptionA, OptionB, OptionC, OptionD, SortOrder FROM QuizSetQuestions WHERE QuizSetId = ? ORDER BY SortOrder, Id',
    [quizSetId]
  );
  return rows;
}

async function insertQuestion(quizSetId, { question, optionA, optionB, optionC, optionD, correctOption, explanation, sortOrder }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO QuizSetQuestions (QuizSetId, Question, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation, SortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [quizSetId, question, optionA, optionB, optionC, optionD, correctOption, explanation || null, sortOrder || 0]
  );
  return result.insertId;
}

async function updateQuestion(id, { question, optionA, optionB, optionC, optionD, correctOption, explanation, sortOrder }, db = pool) {
  const [result] = await db.query(
    'UPDATE QuizSetQuestions SET Question=?, OptionA=?, OptionB=?, OptionC=?, OptionD=?, CorrectOption=?, Explanation=?, SortOrder=? WHERE Id=?',
    [question, optionA, optionB, optionC, optionD, correctOption, explanation || null, sortOrder || 0, id]
  );
  return result.affectedRows;
}

async function removeQuestion(id) {
  const [result] = await pool.query('DELETE FROM QuizSetQuestions WHERE Id = ?', [id]);
  return result.affectedRows;
}

// Chấm điểm: nhận [{questionId, selectedOption}], trả về kết quả chi tiết
async function checkAnswers(quizSetId, answers) {
  const questions = await findQuestions(quizSetId);
  const qMap = new Map(questions.map((q) => [q.Id, q]));

  return answers.map(({ questionId, selectedOption }) => {
    const q = qMap.get(Number(questionId));
    if (!q) return { questionId, selectedOption, correct: false, correctOption: null, explanation: null };
    const correct = (selectedOption || '').toUpperCase() === q.CorrectOption.toUpperCase();
    return { questionId: q.Id, selectedOption, correct, correctOption: q.CorrectOption, explanation: q.Explanation };
  });
}

module.exports = { findAll, findById, create, update, remove, findQuestions, findQuestionsForUser, insertQuestion, updateQuestion, removeQuestion, checkAnswers };
