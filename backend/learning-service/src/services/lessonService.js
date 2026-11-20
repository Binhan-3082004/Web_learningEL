// Logic nghiệp vụ bài học (FR03)
const { pool, withTransaction } = require('../config/db');
const lessonModel = require('../models/lessonModel');
const grammarModel = require('../models/grammarModel');
const lessonProgressModel = require('../models/lessonProgressModel');
const { addPoints } = require('./pointService');
const HttpError = require('../utils/HttpError');
const { LEVELS, POINTS } = require('../utils/constants');

// Nhóm mảng bài học phẳng thành [{chapter, chapterTitle, lessons:[]}]
// Lưu ý: nhận vào array đã được map sang camelCase nên dùng lesson.chapter (không phải lesson.Chapter)
function groupByChapter(lessons) {
  const map = new Map();
  for (const lesson of lessons) {
    const key = lesson.chapter;
    if (!map.has(key)) {
      map.set(key, { chapter: lesson.chapter, chapterTitle: lesson.chapterTitle, lessons: [] });
    }
    map.get(key).lessons.push(lesson);
  }
  return Array.from(map.values()).sort((a, b) => a.chapter - b.chapter);
}

// Danh sách bài học nhóm theo chặng. Khách xem được; nếu đã đăng nhập thì kèm trạng thái hoàn thành
async function listLessons({ userId, level }) {
  if (level && !LEVELS.includes(level)) throw new HttpError(400, 'Cấp độ phải thuộc A1-C2');
  const rows = await lessonModel.findAllForLearner({ level, userId });
  const lessons = rows.map((lesson) => ({
    id: lesson.Id,
    title: lesson.Title,
    level: lesson.Level,
    description: lesson.Description,
    sortOrder: lesson.SortOrder,
    chapter: lesson.Chapter,
    chapterTitle: lesson.ChapterTitle,
    isReview: Boolean(lesson.IsReview),
    thumbnailUrl: lesson.ThumbnailUrl,
    tag: lesson.Tag,
    vocabularyCount: Number(lesson.VocabularyCount),
    isCompleted: Boolean(lesson.IsCompleted),
    quizQuestionCount: Number(lesson.QuizQuestionCount) || 10,
    starRating: 0, // TODO: implement rating table
  }));
  return groupByChapter(lessons);
}

// Chi tiết bài học: từ vựng (kèm AudioUrl) + ngữ pháp + trạng thái hoàn thành
async function getLessonDetail({ userId, lessonId }) {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) throw new HttpError(404, 'Không tìm thấy bài học');

  const vocabularies = await lessonModel.findVocabulariesOfLesson(lessonId);
  const grammars = await grammarModel.findByLessonId(lessonId);
  if (grammars.length) {
    const examples = await grammarModel.findExamplesByGrammarIds(grammars.map((g) => g.Id));
    grammars.forEach((grammar) => {
      grammar.Examples = examples.filter((ex) => ex.GrammarId === grammar.Id);
    });
  }

  return {
    id: lesson.Id,
    title: lesson.Title,
    level: lesson.Level,
    description: lesson.Description,
    chapter: lesson.Chapter,
    chapterTitle: lesson.ChapterTitle,
    isReview: Boolean(lesson.IsReview),
    thumbnailUrl: lesson.ThumbnailUrl,
    tag: lesson.Tag,
    quizQuestionCount: Number(lesson.QuizQuestionCount) || 10,
    isCompleted: await lessonProgressModel.isCompleted(userId, lessonId),
    vocabularies: vocabularies.map((v) => ({
      id: v.Id,
      word: v.Word,
      pronunciation: v.Pronunciation,
      meaning: v.Meaning,
      example: v.Example,
      level: v.Level,
      audioUrl: v.AudioUrl,
    })),
    grammars: grammars.map((g) => ({
      id: g.Id,
      pattern: g.Pattern,
      meaning: g.Meaning,
      usage: g.Usage,
      examples: (g.Examples || []).map((ex) => ({
        id: ex.Id,
        sentence: ex.Sentence,
        translation: ex.Translation,
      })),
    })),
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
