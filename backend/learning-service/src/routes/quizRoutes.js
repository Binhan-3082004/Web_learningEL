// Đường dẫn gốc: /api/learning/quiz
const express = require('express');
const quizController = require('../controllers/quizController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.post('/start', asyncHandler(quizController.startQuiz));
router.post('/:sessionId/submit', asyncHandler(quizController.submitQuiz));

module.exports = router;
