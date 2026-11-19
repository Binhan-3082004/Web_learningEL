// Đường dẫn gốc: /api/learning/flashcards
const express = require('express');
const vocabularyController = require('../controllers/vocabularyController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(vocabularyController.getFlashcards));

module.exports = router;
