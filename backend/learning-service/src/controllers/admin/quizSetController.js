// Controller Admin: quản lý bộ quiz và câu hỏi trắc nghiệm độc lập
const quizSetModel = require('../../models/quizSetModel');
const HttpError = require('../../utils/HttpError');
const { parseId } = require('../../validators/commonValidator');

const VALID_OPTIONS = ['A', 'B', 'C', 'D'];

function validateQuizSetBody(body = {}) {
  const title = (body.title || '').trim();
  if (!title || title.length > 256) throw new HttpError(400, 'Tên bộ quiz bắt buộc, tối đa 256 ký tự');
  return {
    title,
    description: (body.description || '').trim() || null,
    thumbnailUrl: (body.thumbnailUrl || '').trim() || null,
  };
}

function validateQuestionBody(body = {}) {
  const question = (body.question || '').trim();
  if (!question) throw new HttpError(400, 'Nội dung câu hỏi bắt buộc');
  const optionA = (body.optionA || '').trim();
  const optionB = (body.optionB || '').trim();
  const optionC = (body.optionC || '').trim();
  const optionD = (body.optionD || '').trim();
  if (!optionA || !optionB || !optionC || !optionD) throw new HttpError(400, 'Phải có đủ 4 đáp án A, B, C, D');
  const correctOption = (body.correctOption || '').toUpperCase();
  if (!VALID_OPTIONS.includes(correctOption)) throw new HttpError(400, 'Đáp án đúng phải là A, B, C hoặc D');
  return {
    question, optionA, optionB, optionC, optionD, correctOption,
    explanation: (body.explanation || '').trim() || null,
    sortOrder: Number(body.sortOrder) || 0,
  };
}

// ── Bộ quiz ──

async function listQuizSets(req, res) {
  const sets = await quizSetModel.findAll();
  res.json(sets.map((s) => ({ ...s, QuestionCount: Number(s.QuestionCount) })));
}

async function createQuizSet(req, res) {
  const data = validateQuizSetBody(req.body);
  const id = await quizSetModel.create(data);
  res.status(201).json({ id });
}

async function updateQuizSet(req, res) {
  const id = parseId(req.params.id);
  const data = validateQuizSetBody(req.body);
  const affected = await quizSetModel.update(id, data);
  if (!affected) throw new HttpError(404, 'Không tìm thấy bộ quiz');
  res.json({ message: 'Đã cập nhật' });
}

async function deleteQuizSet(req, res) {
  const id = parseId(req.params.id);
  const affected = await quizSetModel.remove(id);
  if (!affected) throw new HttpError(404, 'Không tìm thấy bộ quiz');
  res.json({ message: 'Đã xóa' });
}

// ── Câu hỏi ──

async function listQuestions(req, res) {
  const quizSetId = parseId(req.params.id);
  if (!(await quizSetModel.findById(quizSetId))) throw new HttpError(404, 'Không tìm thấy bộ quiz');
  res.json(await quizSetModel.findQuestions(quizSetId));
}

async function addQuestion(req, res) {
  const quizSetId = parseId(req.params.id);
  if (!(await quizSetModel.findById(quizSetId))) throw new HttpError(404, 'Không tìm thấy bộ quiz');
  const data = validateQuestionBody(req.body);
  const id = await quizSetModel.insertQuestion(quizSetId, data);
  res.status(201).json({ id });
}

async function updateQuestion(req, res) {
  const id = parseId(req.params.id);
  const data = validateQuestionBody(req.body);
  const affected = await quizSetModel.updateQuestion(id, data);
  if (!affected) throw new HttpError(404, 'Không tìm thấy câu hỏi');
  res.json({ message: 'Đã cập nhật' });
}

async function deleteQuestion(req, res) {
  const id = parseId(req.params.id);
  const affected = await quizSetModel.removeQuestion(id);
  if (!affected) throw new HttpError(404, 'Không tìm thấy câu hỏi');
  res.json({ message: 'Đã xóa' });
}

module.exports = { listQuizSets, createQuizSet, updateQuizSet, deleteQuizSet, listQuestions, addQuestion, updateQuestion, deleteQuestion };
