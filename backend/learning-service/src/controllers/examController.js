// Controller thi thử
const examService = require('../services/examService');
const { parseId } = require('../validators/commonValidator');

async function listExams(req, res) {
  res.json(await examService.listExams());
}

async function startExam(req, res) {
  const examId = parseId(req.params.id, 'Mã đề');
  res.status(201).json(await examService.startExam(req.user.id, examId));
}

async function submitExam(req, res) {
  const sessionId = parseId(req.params.sessionId, 'Mã phiên');
  const answers = req.body && req.body.answers;
  res.json(await examService.submitExam(req.user.id, sessionId, answers));
}

async function reviewExam(req, res) {
  const sessionId = parseId(req.params.sessionId, 'Mã phiên');
  res.json(await examService.reviewExam(req.user.id, sessionId));
}

module.exports = { listExams, startExam, submitExam, reviewExam };
