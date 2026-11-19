// Logic nghiệp vụ bài học (FR03)
const { pool, withTransaction } = require('../config/db');
const lessonModel = require('../models/lessonModel');
const grammarModel = require('../models/grammarModel');
const lessonProgressModel = require('../models/lessonProgressModel');
const { addPoints } = require('./pointService');
const HttpError = require('../utils/HttpError');
const { LEVELS, POINTS } = require('../utils/constants');

// Danh sách bài học. Khách xem được; nếu đã đăng nhập thì kèm trạng thái hoàn thành (userId = 0 là khách)
async function listLessons({ userId, level }) {
  if (level && !LEVELS.includes(level)) throw new HttpError(400, 'Cấp độ phải thuộc A1-C2');
  const lessons = await lessonModel.findAllForLearner({ level, userId });
  return lessons.map((lesson) => ({
    ...lesson,
    VocabularyCount: Number(lesson.VocabularyCount),
    IsCompleted: Boolean(lesson.IsCompleted),
  }));
}

// Chi tiết bài học: từ vựng + ngữ pháp (kèm ví dụ) + trạng thái hoàn thành
async function getLessonDetail({ userId, lessonId }) {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) throw new HttpError(404, 'Không tìm thấy bài học');

  const vocabularies = await lessonModel.findVocabulariesOfLesson(lessonId);
  const grammars = await grammarModel.findByLessonId(lessonId);
  if (grammars.length) {
    const examples = await grammarModel.findExamplesByGrammarIds(grammars.map((grammar) => grammar.Id));
    grammars.forEach((grammar) => {
      grammar.Examples = examples.filter((example) => example.GrammarId === grammar.Id);
    });
  }

  return {
    ...lesson,
    IsCompleted: await lessonProgressModel.isCompleted(userId, lessonId),
    Vocabularies: vocabularies,
    Grammars: grammars,
  };
}

// Đánh dấu hoàn thành bài (chỉ cộng điểm ở lần đầu)
async function completeLesson({ userId, lessonId }) {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) throw new HttpError(404, 'Không tìm thấy bài học');

  if (await lessonProgressModel.isCompleted(userId, lessonId)) {
    return { alreadyCompleted: true, pointsAwarded: 0 };
  }
  await lessonProgressModel.markCompleted(userId, lessonId);
  await addPoints(pool, userId, POINTS.COMPLETE_LESSON, `Hoàn thành bài học #${lessonId}`);
  return { alreadyCompleted: false, pointsAwarded: POINTS.COMPLETE_LESSON };
}

// ---------- Dành cho Admin (FR10) ----------

// Lỗi khóa ngoại nghĩa là có mã từ vựng/ngữ pháp không tồn tại
function translateForeignKeyError(error) {
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new HttpError(400, 'Có từ vựng hoặc ngữ pháp không tồn tại');
  }
  return error;
}

async function createLesson(lessonData) {
  try {
    return await withTransaction(async (connection) => {
      const lessonId = await lessonModel.create(lessonData, connection);
      await lessonModel.replaceLinks(lessonId, lessonData, connection);
      return lessonId;
    });
  } catch (error) {
    throw translateForeignKeyError(error);
  }
}

async function updateLesson(lessonId, lessonData) {
  try {
    await withTransaction(async (connection) => {
      const affectedRows = await lessonModel.update(lessonId, lessonData, connection);
      if (!affectedRows) throw new HttpError(404, 'Không tìm thấy bài học');
      await lessonModel.replaceLinks(lessonId, lessonData, connection);
    });
  } catch (error) {
    throw translateForeignKeyError(error);
  }
}

module.exports = { listLessons, getLessonDetail, completeLesson, createLesson, updateLesson };
