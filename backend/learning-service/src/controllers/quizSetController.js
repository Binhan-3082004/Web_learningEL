// Controller người học: xem bộ quiz và nộp bài
const quizSetModel = require('../models/quizSetModel');
const HttpError = require('../utils/HttpError');
const { parseId } = require('../validators/commonValidator');

async function listQuizSets(req, res) {
  const sets = await quizSetModel.findAll();
  res.json(sets.map((s) => ({ ...s, QuestionCount: Number(s.QuestionCount) })));
}

async function getQuestions(req, res) {
  const quizSetId = parseId(req.params.id);
  if (!(await quizSetModel.findById(quizSetId))) throw new HttpError(404, 'Không tìm thấy bộ quiz');
  // Người học không nhận được CorrectOption, Explanation
  res.json(await quizSetModel.findQuestionsForUser(quizSetId));
}

async function submitAnswers(req, res) {
  const quizSetId = parseId(req.params.id);
  if (!(await quizSetModel.findById(quizSetId))) throw new HttpError(404, 'Không tìm thấy bộ quiz');

  const answers = req.body && req.body.answers;
  if (!Array.isArray(answers) || answers.length === 0) throw new HttpError(400, 'Danh sách đáp án không hợp lệ');

  const results = await quizSetModel.checkAnswers(quizSetId, answers);
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total ? Math.round((correct / total) * 100) : 0;

  res.json({ total, correct, score, results });
}

module.exports = { listQuizSets, getQuestions, submitAnswers };
