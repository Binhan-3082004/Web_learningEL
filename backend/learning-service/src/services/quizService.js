// Logic nghiệp vụ Quiz từ vựng (FR04): tạo đề, chấm điểm phía server, ghi lỗi sai, cộng điểm
const { withTransaction } = require('../config/db');
const vocabularyModel = require('../models/vocabularyModel');
const practiceSessionModel = require('../models/practiceSessionModel');
const practiceMistakeModel = require('../models/practiceMistakeModel');
const quizItemModel = require('../models/quizItemModel');
const { addPoints } = require('./pointService');
const HttpError = require('../utils/HttpError');
const { shuffleArray } = require('../utils/arrayHelpers');
const { SESSION_TYPES, QUIZ_QUESTION_TYPES, MISTAKE_ITEM_TYPES, POINTS } = require('../utils/constants');
const { parseId, parseLevel } = require('../validators/commonValidator');

const DEFAULT_QUESTION_COUNT = 10;
const MIN_QUESTION_COUNT = 4;
const MAX_QUESTION_COUNT = 30;
const DISTRACTOR_POOL_SIZE = 300;
const MIN_VOCABULARIES_FOR_QUIZ = 4;
const MIN_QUESTIONS_FOR_BONUS = 5;
const MAX_ANSWERS_PER_SUBMIT = 100;

// Tạo một câu hỏi trắc nghiệm 4 đáp án. Câu chẵn: "từ -> nghĩa", câu lẻ: "nghĩa -> từ".
function buildQuestion(vocabulary, questionIndex, distractorCandidates) {
  const isWordToMeaning = questionIndex % 2 === 0;
  const type = isWordToMeaning ? QUIZ_QUESTION_TYPES.WORD_TO_MEANING : QUIZ_QUESTION_TYPES.MEANING_TO_WORD;
  const answerField = isWordToMeaning ? 'Meaning' : 'Word';
  const correctAnswer = vocabulary[answerField];

  const otherCandidates = distractorCandidates.filter(
    (candidate) => candidate.Id !== vocabulary.Id && candidate[answerField] !== correctAnswer
  );
  const wrongAnswers = [...new Set(shuffleArray(otherCandidates).map((candidate) => candidate[answerField]))].slice(0, 3);

  return {
    vocabularyId: vocabulary.Id,
    type,
    prompt: isWordToMeaning ? vocabulary.Word : vocabulary.Meaning,
    pronunciation: isWordToMeaning ? vocabulary.Pronunciation : null,
    options: shuffleArray([correctAnswer, ...wrongAnswers]),
  };
}

async function startQuiz(userId, { lessonId, level, count }) {
  const questionCount = count === undefined ? DEFAULT_QUESTION_COUNT : Number(count);
  if (!Number.isInteger(questionCount) || questionCount < MIN_QUESTION_COUNT || questionCount > MAX_QUESTION_COUNT) {
    throw new HttpError(400, `Số câu phải từ ${MIN_QUESTION_COUNT} đến ${MAX_QUESTION_COUNT}`);
  }

  const hasLesson = lessonId !== undefined && lessonId !== null;
  const parsedLessonId = hasLesson ? parseId(lessonId, 'Mã bài học') : null;
  const parsedLevel = level ? parseLevel(level) : null;

  const vocabularies = await vocabularyModel.findRandomForQuiz({
    lessonId: parsedLessonId,
    level: parsedLevel,
    limit: questionCount,
  });
  if (vocabularies.length === 0) throw new HttpError(400, 'Không có từ vựng cho lựa chọn này');

  const distractorCandidates = await vocabularyModel.findDistractorCandidates(DISTRACTOR_POOL_SIZE);
  if (distractorCandidates.length < MIN_VOCABULARIES_FOR_QUIZ) {
    throw new HttpError(400, `Cần ít nhất ${MIN_VOCABULARIES_FOR_QUIZ} từ vựng trong hệ thống để tạo Quiz`);
  }

  const questions = vocabularies.map((vocabulary, index) => buildQuestion(vocabulary, index, distractorCandidates));

  const sessionId = await withTransaction(async (connection) => {
    const newSessionId = await practiceSessionModel.create(
      { userId, sessionType: SESSION_TYPES.QUIZ, refId: parsedLessonId, totalQuestions: questions.length },
      connection
    );
    await quizItemModel.insertMany(newSessionId, questions, connection);
    return newSessionId;
  });

  return { sessionId, total: questions.length, questions };
}

// Nộp bài Quiz: so sánh với đáp án lưu trên server (không tin dữ liệu từ client)
async function submitQuiz(userId, sessionId, answers) {
  if (!Array.isArray(answers) || answers.length > MAX_ANSWERS_PER_SUBMIT) {
    throw new HttpError(400, 'Danh sách đáp án không hợp lệ');
  }

  const session = await practiceSessionModel.findOfUser(sessionId, userId, SESSION_TYPES.QUIZ);
  if (!session) throw new HttpError(404, 'Không tìm thấy phiên Quiz');
  if (session.EndTime) throw new HttpError(409, 'Phiên Quiz đã được nộp');

  const quizItems = await quizItemModel.findBySession(sessionId);
  const answerByVocabularyId = new Map();
  for (const answer of answers) {
    if (answer && typeof answer.answer === 'string') {
      answerByVocabularyId.set(Number(answer.vocabularyId), answer.answer.trim());
    }
  }

  const results = quizItems.map((item) => {
    const correctAnswer = item.QuestionType === QUIZ_QUESTION_TYPES.WORD_TO_MEANING ? item.Meaning : item.Word;
    const userAnswer = answerByVocabularyId.get(item.VocabularyId) || '';
    return {
      vocabularyId: item.VocabularyId,
      userAnswer,
      correctAnswer,
      correct: userAnswer.toLowerCase() === correctAnswer.trim().toLowerCase(),
    };
  });

  const correctCount = results.filter((result) => result.correct).length;
  const totalQuestions = results.length;
  const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPerfect = totalQuestions >= MIN_QUESTIONS_FOR_BONUS && correctCount === totalQuestions;
  const points = correctCount + (isPerfect ? POINTS.PERFECT_QUIZ_BONUS : 0);

  await withTransaction(async (connection) => {
    const affectedRows = await practiceSessionModel.markFinished(
      { sessionId, score, correctCount, totalQuestions },
      connection
    );
    if (affectedRows !== 1) throw new HttpError(409, 'Phiên Quiz đã được nộp');

    const mistakes = results
      .filter((result) => !result.correct)
      .map((result) => [sessionId, MISTAKE_ITEM_TYPES.VOCABULARY, result.vocabularyId, result.userAnswer]);
    await practiceMistakeModel.insertMany(mistakes, connection);
    await addPoints(connection, userId, points, `Quiz #${sessionId}: ${correctCount}/${totalQuestions} câu đúng`);
  });

  return { sessionId, score, correct: correctCount, total: totalQuestions, pointsAwarded: points, results };
}

module.exports = { startQuiz, submitQuiz };
