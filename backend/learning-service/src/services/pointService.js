// Cộng điểm tích lũy cho người học
const pointModel = require('../models/pointModel');

// db có thể là pool hoặc connection của transaction đang chạy
async function addPoints(db, userId, points, reason) {
  if (!points) return;
  await pointModel.insertLog({ userId, points, reason }, db);
}

module.exports = { addPoints };
