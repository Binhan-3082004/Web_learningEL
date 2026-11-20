// Controller bài học (người học)
const lessonService = require('../services/lessonService');
const { parseId } = require('../validators/commonValidator');

async function listLessons(req, res) {
  const userId = req.user ? req.user.id : 0; 
  res.json(await lessonService.listLessons({ userId, level: req.query.level }));
}

async function getLessonDetail(req, res) {
  const lessonId = parseId(req.params.id);
  res.json(await lessonService.getLessonDetail({ userId: req.user.id, lessonId }));
}

async function completeLesson(req, res) {
  const lessonId = parseId(req.params.id);
  res.json(await lessonService.completeLesson({ userId: req.user.id, lessonId }));
}

module.exports = { listLessons, getLessonDetail, completeLesson };
