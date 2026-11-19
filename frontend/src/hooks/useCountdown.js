// Đếm ngược đến một thời điểm. Tự gọi onExpire đúng một lần khi hết giờ.
import { useEffect, useRef, useState } from 'react';

const getSecondsUntil = (endTime) => Math.max(0, Math.round((new Date(endTime).getTime() - Date.now()) / 1000));

/**
 * @param {string|Date|null} endTime thời điểm kết thúc
 * @param {{ enabled?: boolean, onExpire?: () => void }} options enabled=false để tạm dừng
 * @returns {number} số giây còn lại
 */
export function useCountdown(endTime, { enabled = true, onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(() => (endTime ? getSecondsUntil(endTime) : 0));
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!endTime || !enabled) return undefined;

    const tick = () => {
      const remaining = getSecondsUntil(endTime);
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerId);
        if (onExpireRef.current) onExpireRef.current();
      }
    };
    const timerId = setInterval(tick, 1000);
    tick();

    return () => clearInterval(timerId);
  }, [endTime, enabled]);

  return secondsLeft;
}
