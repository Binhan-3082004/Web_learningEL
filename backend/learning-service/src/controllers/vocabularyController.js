// Controller từ vựng và flashcard (người học)
const vocabularyService = require('../services/vocabularyService');
const { getPagination } = require('../utils/pagination');
const { parseId } = require('../validators/commonValidator');

const DEFAULT_FLASHCARD_COUNT = 20;
const MAX_FLASHCARD_COUNT = 100;

async function searchVocabularies(req, res) {
  const { page, limit, offset } = getPagination(req, 100);
  res.json(
    await vocabularyService.searchVocabularies({
      level: req.query.level,
      keyword: req.query.q,
      page,
      limit,
      offset,
    })
  );
}

async function getFlashcards(req, res) {
  const requestedLimit = parseInt(req.query.limit, 10) || DEFAULT_FLASHCARD_COUNT;
  const limit = Math.min(MAX_FLASHCARD_COUNT, Math.max(1, requestedLimit));
  const lessonId = req.query.lessonId ? parseId(req.query.lessonId) : null;
  res.json(await vocabularyService.getFlashcards({ lessonId, level: req.query.level, limit }));
}

module.exports = { searchVocabularies, getFlashcards };
