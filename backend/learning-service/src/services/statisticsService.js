// Thống kê học liệu và mức độ học tập cho Admin (FR11)
const vocabularyModel = require('../models/vocabularyModel');
const lessonModel = require('../models/lessonModel');
const grammarModel = require('../models/grammarModel');
const examModel = require('../models/examModel');
const lessonProgressModel = require('../models/lessonProgressModel');
const practiceSessionModel = require('../models/practiceSessionModel');

async function getAdminStatistics() {
  const [vocabularies, lessons, grammars, exams, sessionSummaries, activeLearners, completedLessons] = await Promise.all([
    vocabularyModel.countAll(),
    lessonModel.countAll(),
    grammarModel.countAll(),
    examModel.countAll(),
    practiceSessionModel.summarizeAllByType(),
    practiceSessionModel.countActiveLearnersLast7Days(),
    lessonProgressModel.countAllCompletions(),
  ]);

  return {
    content: {
      vocabularies: Number(vocabularies),
      lessons: Number(lessons),
      grammars: Number(grammars),
      exams: Number(exams),
    },
    sessions: sessionSummaries.map((row) => ({
      type: row.SessionType,
      attempts: Number(row.attempts),
      avgScore: Number(row.avgScore),
    })),
    activeLearnersLast7Days: Number(activeLearners),
    completedLessons: Number(completedLessons),
  };
}

module.exports = { getAdminStatistics };
