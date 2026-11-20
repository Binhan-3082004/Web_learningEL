// Gom tất cả route của Learning Service, gắn dưới tiền tố /api/learning (xem app.js)
const express = require('express');
const adminRoutes = require('./adminRoutes');
const lessonRoutes = require('./lessonRoutes');
const vocabularyRoutes = require('./vocabularyRoutes');
const flashcardRoutes = require('./flashcardRoutes');
const quizRoutes = require('./quizRoutes');
const quizSetRoutes = require('./quizSetRoutes');
const examRoutes = require('./examRoutes');
const progressRoutes = require('./progressRoutes');

const router = express.Router();
router.use('/admin', adminRoutes);
router.use('/lessons', lessonRoutes);
router.use('/vocabularies', vocabularyRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/quiz', quizRoutes);
router.use('/quiz-sets', quizSetRoutes);
router.use('/exams', examRoutes);
router.use(progressRoutes);

module.exports = router;
