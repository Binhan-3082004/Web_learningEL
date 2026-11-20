const HttpError = require('../utils/HttpError');
const { parseText, parseLevel, parseIdList } = require('./commonValidator');

// Kiểm tra body khi Admin thêm/sửa bài học (kèm danh sách từ vựng và ngữ pháp thuộc bài)
function validateLessonBody(body = {}) {
  const sortOrder = body.sortOrder === undefined ? 0 : Number(body.sortOrder);
  if (!Number.isInteger(sortOrder)) throw new HttpError(400, 'Thứ tự không hợp lệ');

  const chapter = body.chapter === undefined ? 1 : Number(body.chapter);
  if (!Number.isInteger(chapter) || chapter < 1) throw new HttpError(400, 'Chặng phải là số nguyên dương');

  const quizQuestionCount = body.quizQuestionCount === undefined ? 10 : Number(body.quizQuestionCount);
  if (!Number.isInteger(quizQuestionCount) || quizQuestionCount < 4 || quizQuestionCount > 30) {
    throw new HttpError(400, 'Số câu hỏi Quiz phải từ 4 đến 30');
  }

  return {
    title: parseText(body.title, 'Tiêu đề', { max: 256 }),
    level: parseLevel(body.level),
    description: parseText(body.description, 'Mô tả', { max: 4000, required: false }),
    sortOrder,
    chapter,
    chapterTitle: parseText(body.chapterTitle, 'Tên chặng', { max: 255, required: false }) || '',
    isReview: Boolean(body.isReview),
    thumbnailUrl: parseText(body.thumbnailUrl, 'Ảnh thumbnail', { max: 500, required: false }) || null,
    tag: parseText(body.tag, 'Tag', { max: 100, required: false }) || null,
    quizQuestionCount,
    vocabularyIds: parseIdList(body.vocabularyIds, 'Mã từ vựng'),
    grammarIds: parseIdList(body.grammarIds, 'Mã ngữ pháp'),
  };
}

module.exports = { validateLessonBody };
