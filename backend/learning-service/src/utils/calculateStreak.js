// Tính chuỗi ngày học liên tiếp
const MS_PER_DAY = 86400000;
const toDayNumber = (dateString) => Date.parse(`${dateString}T00:00:00Z`) / MS_PER_DAY;

/**
 * @param {string[]} studyDays danh sách ngày có học (YYYY-MM-DD), sắp xếp giảm dần
 * @param {string} today ngày hôm nay (YYYY-MM-DD)
 * @returns {number} số ngày liên tiếp, tính từ hôm nay (hoặc hôm qua nếu hôm nay chưa học)
 */
function calculateStreak(studyDays, today) {
  if (studyDays.length === 0) return 0;

  let expectedDay = toDayNumber(today);
  const latestStudyDay = toDayNumber(studyDays[0]);
  if (latestStudyDay === expectedDay - 1) expectedDay -= 1;
  else if (latestStudyDay !== expectedDay) return 0;

  let streak = 0;
  for (const day of studyDays) {
    const dayNumber = toDayNumber(day);
    if (dayNumber === expectedDay) {
      streak++;
      expectedDay--;
    } else if (dayNumber < expectedDay) {
      break;
    }
  }
  return streak;
}

module.exports = calculateStreak;
