// Đường dẫn: /api/learning/progress, /sessions, /mistakes, /ranking/me
const express = require('express');
const progressController = require('../controllers/progressController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/progress', asyncHandler(progressController.getProgress));
router.get('/sessions', asyncHandler(progressController.getSessionHistory));
router.get('/mistakes', asyncHandler(progressController.getMistakes));
router.get('/ranking/me', asyncHandler(progressController.getMyRanking));

module.exports = router;
