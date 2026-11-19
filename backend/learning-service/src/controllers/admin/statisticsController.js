// Controller thống kê (Admin) - FR11
const { getAdminStatistics } = require('../../services/statisticsService');

async function getStatistics(req, res) {
  res.json(await getAdminStatistics());
}

module.exports = { getStatistics };
