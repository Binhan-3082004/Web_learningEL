// Đổi số giây thành dạng mm:ss, ví dụ 125 -> "02:05"
export function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}
