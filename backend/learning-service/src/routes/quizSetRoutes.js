// Route người học: /api/learning/quiz-sets
const express = require('express');
const quizSetController = require('../controllers/quizSetController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(quizSetController.listQuizSets));
router.get('/:id/questions', asyncHandler(quizSetController.getQuestions));
router.post('/:id/submit', asyncHandler(quizSetController.submitAnswers));

module.exports = router;
