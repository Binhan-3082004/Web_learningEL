const { parseText, parseLevel } = require('./commonValidator');

// Kiểm tra body khi Admin thêm/sửa từ vựng
function validateVocabularyBody(body = {}) {
  return {
    word: parseText(body.word, 'Từ vựng', { max: 100 }),
    pronunciation: parseText(body.pronunciation, 'Phiên âm', { max: 100, required: false }),
    meaning: parseText(body.meaning, 'Nghĩa', { max: 1000 }),
    example: parseText(body.example, 'Ví dụ', { max: 1000, required: false }),
    level: parseLevel(body.level, 'A1'),
    audioUrl: parseText(body.audioUrl, 'Đường dẫn âm thanh', { max: 512, required: false }),
  };
}

module.exports = { validateVocabularyBody };
