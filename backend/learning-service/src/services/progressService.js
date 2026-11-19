// Logic nghiệp vụ theo dõi tiến độ và thành tích (FR08)
const lessonProgressModel = require('../models/lessonProgressModel');
const practiceSessionModel = require('../models/practiceSessionModel');
const practiceMistakeModel = require('../models/practiceMistakeModel');
const pointModel = require('../models/pointModel');
const calculateStreak = require('../utils/calculateStreak');
const { SESSION_TYPES } = require('../utils/constants');

const RECENT_SCORES_LIMIT = 10;

const toPercent = (completed, total) => (total ? Math.round((completed / total) * 100) : 0);

// Tổng quan tiến độ: bài học, điểm các lần làm bài, chuỗi ngày học, điểm tích lũy
async function getProgressOverview(userId) {
  const lessonsByLevel = await lessonProgressModel.countByLevel(userId);
  const sessionSummaries = await practiceSessionModel.summarizeByType(userId);
  const recentSessions = await practiceSessionModel.findRecentFinished(userId, RECENT_SCORES_LIMIT);
  const studyDays = await practiceSessionModel.findStudyDays(userId);
  const today = await practiceSessionModel.getToday();
  const totalPoints = await pointModel.getTotalPoints(userId);

  const levels = lessonsByLevel.map((row) => ({
    level: row.Level,
    total: Number(row.total),
    completed: Number(row.completed),
    percent: toPercent(Number(row.completed), Number(row.total)),
  }));
  const totalLessons = levels.reduce((sum, level) => sum + level.total, 0);
  const completedLessons = levels.reduce((sum, level) => sum + level.completed, 0);

  return {
    lessons: {
      total: totalLessons,
      completed: completedLessons,
      percent: toPercent(completedLessons, totalLessons),
      byLevel: levels,
    },
    sessions: sessionSummaries.map((row) => ({
      type: row.SessionType,
      attempts: Number(row.attempts),
      avgScore: Number(row.avgScore),
      bestScore: Number(row.bestScore),
    })),
    recentScores: recentSessions.reverse(), // cũ -> mới, dùng để vẽ biểu đồ
    streakDays: calculateStreak(studyDays, today),
    totalPoints,
  };
}

// Lịch sử làm bài (có thể lọc theo loại: quiz | exam)
async function getSessionHistory({ userId, type, limit }) {
  const isKnownType = Object.values(SESSION_TYPES).includes(type);
  return practiceSessionModel.findHistory({ userId, sessionType: isKnownType ? type : null, limit });
}

// Danh sách điểm yếu cần cải thiện
async function getWeaknesses(userId) {
  const vocabularies = await practiceMistakeModel.findWeakVocabularies(userId);
  const sections = await practiceMistakeModel.findWeakSections(userId);
  return {
    weakVocabularies: vocabularies.map((item) => ({ ...item, wrongCount: Number(item.wrongCount) })),
    weakSections: sections.map((item) => ({ ...item, wrongCount: Number(item.wrongCount) })),
  };
}

async function getRankingPoints(userId) {
  return {
    totalPoints: await pointModel.getTotalPoints(userId),
    recent: await pointModel.findRecentLogs(userId),
  };
}

module.exports = { getProgressOverview, getSessionHistory, getWeaknesses, getRankingPoints };
