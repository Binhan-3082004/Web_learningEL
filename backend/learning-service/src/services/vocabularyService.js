// Logic nghiệp vụ từ vựng và flashcard (FR04)
const vocabularyModel = require('../models/vocabularyModel');
const HttpError = require('../utils/HttpError');
const { LEVELS } = require('../utils/constants');

function assertValidLevel(level) {
  if (level && !LEVELS.includes(level)) throw new HttpError(400, 'Cấp độ phải thuộc A1-C2');
}

// Tra cứu từ vựng theo cấp độ / từ khóa, sắp xếp theo bảng chữ cái
async function searchVocabularies({ level, keyword, page, limit, offset }) {
  assertValidLevel(level);
  const { total, items } = await vocabularyModel.search({ level, keyword, limit, offset, sortBy: 'alphabet' });
  return { page, limit, total, items };
}

// Bộ flashcard ngẫu nhiên theo bài học hoặc cấp độ
async function getFlashcards({ lessonId, level, limit }) {
  assertValidLevel(level);
  return vocabularyModel.findRandomForFlashcards({ lessonId, level, limit });
}

module.exports = { searchVocabularies, getFlashcards };
