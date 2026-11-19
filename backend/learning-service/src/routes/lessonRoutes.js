// Đường dẫn gốc: /api/learning/lessons
const express = require('express');
const lessonController = require('../controllers/lessonController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', asyncHandler(lessonController.listLessons)); // Khách cũng xem được
router.get('/:id', requireAuth, asyncHandler(lessonController.getLessonDetail));
router.post('/:id/complete', requireAuth, asyncHandler(lessonController.completeLesson));

module.exports = router;
