// Các hằng số dùng chung trong Learning Service
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ROLES = { USER: 'user', ADMIN: 'admin' };

const SESSION_TYPES = { QUIZ: 'quiz', EXAM: 'exam' };
const QUIZ_QUESTION_TYPES = { WORD_TO_MEANING: 'word_to_meaning', MEANING_TO_WORD: 'meaning_to_word' };
const MISTAKE_ITEM_TYPES = { VOCABULARY: 'vocab', EXAM_QUESTION: 'question' };
const EXAM_TYPES = ['TOEIC', 'IELTS', 'PLACEMENT'];

// Số điểm thưởng
const POINTS = { COMPLETE_LESSON: 10, PERFECT_QUIZ_BONUS: 5 };

module.exports = { LEVELS, ROLES, SESSION_TYPES, QUIZ_QUESTION_TYPES, MISTAKE_ITEM_TYPES, EXAM_TYPES, POINTS };
