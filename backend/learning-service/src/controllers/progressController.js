// Controller tiến độ và thành tích
const progressService = require('../services/progressService');

const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 100;

async function getProgress(req, res) {
  res.json(await progressService.getProgressOverview(req.user.id));
}

async function getSessionHistory(req, res) {
  const requestedLimit = parseInt(req.query.limit, 10) || DEFAULT_HISTORY_LIMIT;
  const limit = Math.min(MAX_HISTORY_LIMIT, Math.max(1, requestedLimit));
  res.json(await progressService.getSessionHistory({ userId: req.user.id, type: req.query.type, limit }));
}

async function getMistakes(req, res) {
  res.json(await progressService.getWeaknesses(req.user.id));
}

async function getMyRanking(req, res) {
  res.json(await progressService.getRankingPoints(req.user.id));
}

module.exports = { getProgress, getSessionHistory, getMistakes, getMyRanking };
