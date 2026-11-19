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
    }))
  );
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

module.exports = { listLessons, createLesson, updateLesson, deleteLesson };
