const HttpError = require('../utils/HttpError');
const { parseText, parseLevel, parseIdList } = require('./commonValidator');

// Kiểm tra body khi Admin thêm/sửa bài học (kèm danh sách từ vựng và ngữ pháp thuộc bài)
function validateLessonBody(body = {}) {
  const sortOrder = body.sortOrder === undefined ? 0 : Number(body.sortOrder);
  if (!Number.isInteger(sortOrder)) throw new HttpError(400, 'Thứ tự không hợp lệ');

  return {
    title: parseText(body.title, 'Tiêu đề', { max: 256 }),
    level: parseLevel(body.level),
    description: parseText(body.description, 'Mô tả', { max: 4000, required: false }),
    sortOrder,
    vocabularyIds: parseIdList(body.vocabularyIds, 'Mã từ vựng'),
    grammarIds: parseIdList(body.grammarIds, 'Mã ngữ pháp'),
  };
}

module.exports = { validateLessonBody };
