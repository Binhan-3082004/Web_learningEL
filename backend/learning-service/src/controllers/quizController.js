// Controller Quiz từ vựng
const quizService = require('../services/quizService');
const { parseId } = require('../validators/commonValidator');

async function startQuiz(req, res) {
  const quiz = await quizService.startQuiz(req.user.id, req.body || {});
  res.status(201).json(quiz);
}

async function submitQuiz(req, res) {
  const sessionId = parseId(req.params.sessionId, 'Mã phiên');
  const answers = req.body && req.body.answers;
  res.json(await quizService.submitQuiz(req.user.id, sessionId, answers));
}

module.exports = { startQuiz, submitQuiz };
