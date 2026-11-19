// Xáo trộn ngẫu nhiên một mảng (thuật toán Fisher-Yates), không làm thay đổi mảng gốc
function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = { shuffleArray };
