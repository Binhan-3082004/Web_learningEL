// Logic nghiệp vụ thi thử (FR02, FR05): bắt đầu thi, chấm điểm tự động, xem lại bài
const { withTransaction } = require('../config/db');
const examModel = require('../models/examModel');
const practiceSessionModel = require('../models/practiceSessionModel');
const practiceMistakeModel = require('../models/practiceMistakeModel');
const { addPoints } = require('./pointService');
const HttpError = require('../utils/HttpError');
const parseJsonColumn = require('../utils/parseJsonColumn');
const { SESSION_TYPES, MISTAKE_ITEM_TYPES } = require('../utils/constants');

const SUBMIT_GRACE_SECONDS = 60; // dung sai mạng khi nộp bài sát giờ
const MAX_ANSWERS_PER_SUBMIT = 500;

// Đề xuất trình độ dựa trên điểm bài kiểm tra đầu vào
function suggestLevel(scorePercent) {
  if (scorePercent < 20) return 'A1';
  if (scorePercent < 40) return 'A2';
  if (scorePercent < 60) return 'B1';
  if (scorePercent < 80) return 'B2';
  return 'C1';
}

async function listExams() {
  const exams = await examModel.findAllForLearner();
  return exams.map((exam) => ({ ...exam, QuestionCount: Number(exam.QuestionCount) }));
}

// Bắt đầu thi: tạo phiên, trả đề (KHÔNG kèm đáp án đúng) và thời điểm hết giờ để client đếm ngược
async function startExam(userId, examId) {
  const exam = await examModel.findById(examId);
  if (!exam) throw new HttpError(404, 'Không tìm thấy đề thi');

  const questions = await examModel.findQuestionsForTaking(examId);
  if (questions.length === 0) throw new HttpError(400, 'Đề thi chưa có câu hỏi');

  const sessionId = await practiceSessionModel.create({
    userId,
    sessionType: SESSION_TYPES.EXAM,
    refId: examId,
    totalQuestions: questions.length,
  });
  const startedAt = new Date(await practiceSessionModel.findStartTime(sessionId));
  const endsAt = new Date(startedAt.getTime() + exam.DurationMinutes * 60000);

  return {
    sessionId,
    title: exam.Title,
    examType: exam.ExamType,
    durationMinutes: exam.DurationMinutes,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    questions: questions.map((question) => ({
      id: question.Id,
      section: question.Section,
      content: question.Content,
      options: parseJsonColumn(question.Options),
      audioUrl: question.AudioUrl,
    })),
  };
}

// Nộp bài: chấm điểm tự động, ghi câu sai, cộng điểm
async function submitExam(userId, sessionId, answers) {
  if (!Array.isArray(answers) || answers.length > MAX_ANSWERS_PER_SUBMIT) {
    throw new HttpError(400, 'Danh sách đáp án không hợp lệ');
  }

  const session = await practiceSessionModel.findOfUser(sessionId, userId, SESSION_TYPES.EXAM);
  if (!session) throw new HttpError(404, 'Không tìm thấy phiên thi');
  if (session.EndTime) throw new HttpError(409, 'Bài thi đã được nộp');

  const exam = await examModel.findById(session.RefId);
  if (!exam) throw new HttpError(404, 'Đề thi không còn tồn tại');

  const deadline = new Date(session.StartTime).getTime() + (exam.DurationMinutes * 60 + SUBMIT_GRACE_SECONDS) * 1000;
  if (Date.now() > deadline) throw new HttpError(400, 'Bài thi đã quá thời gian làm bài');

  const answerByQuestionId = new Map();
  for (const answer of answers) {
    if (answer && typeof answer.answer === 'string') {
      answerByQuestionId.set(Number(answer.questionId), answer.answer.trim().toUpperCase().slice(0, 1));
    }
  }

  const correctAnswers = await examModel.findCorrectAnswers(exam.Id);
  const mistakes = [];
  let correctCount = 0;
  for (const question of correctAnswers) {
    const userAnswer = answerByQuestionId.get(question.Id) || '';
    if (userAnswer === question.CorrectOption) {
      correctCount++;
    } else {
      // Câu bỏ trống cũng được ghi nhận là sai
      mistakes.push([sessionId, MISTAKE_ITEM_TYPES.EXAM_QUESTION, question.Id, userAnswer]);
    }
  }

  const totalQuestions = correctAnswers.length;
  const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const points = Math.round(score / 10);

  await withTransaction(async (connection) => {
    const affectedRows = await practiceSessionModel.markFinished(
      { sessionId, score, correctCount, totalQuestions },
      connection
    );
    if (affectedRows !== 1) throw new HttpError(409, 'Bài thi đã được nộp');
    await practiceMistakeModel.insertMany(mistakes, connection);
    await addPoints(connection, userId, points, `Thi thử "${exam.Title}": ${score}%`);
  });

  const result = { sessionId, score, correct: correctCount, total: totalQuestions, pointsAwarded: points };
  // FR02 - bài kiểm tra đầu vào: đề xuất trình độ (client gọi PUT /api/auth/me để lưu vào hồ sơ)
  if (exam.ExamType === 'PLACEMENT') result.suggestedLevel = suggestLevel(score);
  return result;
}

// Xem lại bài làm (chỉ sau khi đã nộp)
async function reviewExam(userId, sessionId) {
  const session = await practiceSessionModel.findOfUser(sessionId, userId, SESSION_TYPES.EXAM);
  if (!session) throw new HttpError(404, 'Không tìm thấy phiên thi');
  if (!session.EndTime) throw new HttpError(400, 'Bạn cần nộp bài trước khi xem lại');

  const questions = await examModel.findQuestionsWithAnswers(session.RefId);
  const mistakes = await practiceMistakeModel.findExamMistakesOfSession(sessionId);
  const wrongAnswerByQuestionId = new Map(mistakes.map((mistake) => [mistake.ItemId, mistake.UserAnswer]));

  return {
    sessionId,
    score: session.Score,
    correct: session.CorrectCount,
    total: session.TotalQuestions,
    questions: questions.map((question) => {
      const isCorrect = !wrongAnswerByQuestionId.has(question.Id);
      return {
        id: question.Id,
        section: question.Section,
        content: question.Content,
        options: parseJsonColumn(question.Options),
        correctOption: question.CorrectOption,
        explanation: question.Explanation,
        userAnswer: isCorrect ? question.CorrectOption : wrongAnswerByQuestionId.get(question.Id) || null,
        isCorrect,
      };
    }),
  };
}

module.exports = { listExams, startExam, submitExam, reviewExam };
