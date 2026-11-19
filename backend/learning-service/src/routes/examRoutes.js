// Đường dẫn gốc: /api/learning/exams
const express = require('express');
const examController = require('../controllers/examController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(examController.listExams));
router.post('/:id/start', asyncHandler(examController.startExam));
router.post('/sessions/:sessionId/submit', asyncHandler(examController.submitExam));
router.get('/sessions/:sessionId/review', asyncHandler(examController.reviewExam));

module.exports = router;
