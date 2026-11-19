// Controller quản lý đề thi và câu hỏi (Admin) - FR10
const examModel = require('../../models/examModel');
const HttpError = require('../../utils/HttpError');
const { parseId } = require('../../validators/commonValidator');
const { validateExamBody, validateQuestionBody } = require('../../validators/examValidator');

const MAX_QUESTIONS_PER_REQUEST = 200;

// ---------- Đề thi ----------

async function listExams(req, res) {
  const exams = await examModel.findAllForAdmin();
  res.json(exams.map((exam) => ({ ...exam, QuestionCount: Number(exam.QuestionCount) })));
}

async function createExam(req, res) {
  const id = await examModel.create(validateExamBody(req.body));
  res.status(201).json({ id });
}

async function updateExam(req, res) {
  const affectedRows = await examModel.update(parseId(req.params.id), validateExamBody(req.body));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy đề thi');
  res.json({ message: 'Đã cập nhật' });
}

async function deleteExam(req, res) {
  const affectedRows = await examModel.remove(parseId(req.params.id));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy đề thi');
  res.json({ message: 'Đã xóa' });
}

// ---------- Câu hỏi ----------

async function listQuestions(req, res) {
  res.json(await examModel.findQuestionsWithAnswers(parseId(req.params.id)));
}

// Thêm 1 câu (object) hoặc nhiều câu (mảng)
async function addQuestions(req, res) {
  const examId = parseId(req.params.id);
  if (!(await examModel.findById(examId))) throw new HttpError(404, 'Không tìm thấy đề thi');

  const questionList = Array.isArray(req.body) ? req.body : [req.body];
  if (questionList.length === 0 || questionList.length > MAX_QUESTIONS_PER_REQUEST) {
    throw new HttpError(400, `Số câu hỏi mỗi lần thêm: 1-${MAX_QUESTIONS_PER_REQUEST}`);
  }

  const questions = questionList.map(validateQuestionBody);
  await examModel.insertQuestions(examId, questions);
  res.status(201).json({ created: questions.length });
}

async function updateQuestion(req, res) {
  const affectedRows = await examModel.updateQuestion(parseId(req.params.id), validateQuestionBody(req.body));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy câu hỏi');
  res.json({ message: 'Đã cập nhật' });
}

async function deleteQuestion(req, res) {
  const affectedRows = await examModel.removeQuestion(parseId(req.params.id));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy câu hỏi');
  res.json({ message: 'Đã xóa' });
}

module.exports = {
  listExams,
  createExam,
  updateExam,
  deleteExam,
  listQuestions,
  addQuestions,
  updateQuestion,
  deleteQuestion,
};
