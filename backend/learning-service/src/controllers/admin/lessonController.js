// Controller quản lý bài học (Admin) - FR10
const lessonModel = require('../../models/lessonModel');
const lessonService = require('../../services/lessonService');
const HttpError = require('../../utils/HttpError');
const { parseId } = require('../../validators/commonValidator');
const { validateLessonBody } = require('../../validators/lessonValidator');

async function listLessons(req, res) {
  const lessons = await lessonModel.findAllForAdmin();
  res.json(
    lessons.map((lesson) => ({
      ...lesson,
      VocabularyCount: Number(lesson.VocabularyCount),
      GrammarCount: Number(lesson.GrammarCount),
      IsReview: Boolean(lesson.IsReview),
      QuizQuestionCount: Number(lesson.QuizQuestionCount) || 10,
    }))
  );
}

// Trả về chi tiết bài học kèm danh sách vocabularyIds và grammarIds để form admin chỉnh sửa
async function getLessonById(req, res) {
  const id = parseId(req.params.id);
  const lesson = await lessonModel.findById(id);
  if (!lesson) throw new HttpError(404, 'Không tìm thấy bài học');
  const { vocabularyIds, grammarIds } = await lessonModel.findLinkedIds(id);
  res.json({
    ...lesson,
    IsReview: Boolean(lesson.IsReview),
    QuizQuestionCount: Number(lesson.QuizQuestionCount) || 10,
    vocabularyIds,
    grammarIds,
  });
}

async function createLesson(req, res) {
  const id = await lessonService.createLesson(validateLessonBody(req.body));
  res.status(201).json({ id });
}

async function updateLesson(req, res) {
  await lessonService.updateLesson(parseId(req.params.id), validateLessonBody(req.body));
  res.json({ message: 'Đã cập nhật' });
}

async function deleteLesson(req, res) {
  const affectedRows = await lessonModel.remove(parseId(req.params.id));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy bài học');
  res.json({ message: 'Đã xóa' });
}

module.exports = { listLessons, getLessonById, createLesson, updateLesson, deleteLesson };
