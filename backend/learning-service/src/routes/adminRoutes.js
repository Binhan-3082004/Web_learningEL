// Đường dẫn gốc: /api/learning/admin - toàn bộ chỉ dành cho Admin (RBAC lớp 2, lớp 1 nằm ở API Gateway)
const express = require('express');
const vocabularyController = require('../controllers/admin/vocabularyController');
const grammarController = require('../controllers/admin/grammarController');
const lessonController = require('../controllers/admin/lessonController');
const examController = require('../controllers/admin/examController');
const statisticsController = require('../controllers/admin/statisticsController');
const asyncHandler = require('../utils/asyncHandler');
const { requireRole } = require('../middlewares/authMiddleware');
const { uploadExcel } = require('../middlewares/uploadMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();
router.use(requireRole(ROLES.ADMIN));

// Từ vựng
router.get('/vocabularies', asyncHandler(vocabularyController.listVocabularies));
router.post('/vocabularies', asyncHandler(vocabularyController.createVocabulary));
router.post('/vocabularies/import', uploadExcel.single('file'), asyncHandler(vocabularyController.importVocabularies));
router.put('/vocabularies/:id', asyncHandler(vocabularyController.updateVocabulary));
router.delete('/vocabularies/:id', asyncHandler(vocabularyController.deleteVocabulary));

// Ngữ pháp
router.get('/grammars', asyncHandler(grammarController.listGrammars));
router.post('/grammars', asyncHandler(grammarController.createGrammar));
router.get('/grammars/:id', asyncHandler(grammarController.getGrammar));
router.put('/grammars/:id', asyncHandler(grammarController.updateGrammar));
router.delete('/grammars/:id', asyncHandler(grammarController.deleteGrammar));

// Bài học
router.get('/lessons', asyncHandler(lessonController.listLessons));
router.post('/lessons', asyncHandler(lessonController.createLesson));
router.put('/lessons/:id', asyncHandler(lessonController.updateLesson));
router.delete('/lessons/:id', asyncHandler(lessonController.deleteLesson));

// Đề thi
router.get('/exams', asyncHandler(examController.listExams));
router.post('/exams', asyncHandler(examController.createExam));
router.put('/exams/:id', asyncHandler(examController.updateExam));
router.delete('/exams/:id', asyncHandler(examController.deleteExam));

// Câu hỏi của đề thi
router.get('/exams/:id/questions', asyncHandler(examController.listQuestions));
router.post('/exams/:id/questions', asyncHandler(examController.addQuestions));
router.put('/questions/:id', asyncHandler(examController.updateQuestion));
router.delete('/questions/:id', asyncHandler(examController.deleteQuestion));

// Thống kê
router.get('/stats', asyncHandler(statisticsController.getStatistics));

module.exports = router;
