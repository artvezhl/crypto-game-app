import React, { useEffect, useState } from "react";

export const CountdownTimer = ({ endTime }: { endTime?: number }) => {
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    // const countDownDate = new Date(endTime);
    const countDownDate = new Date(endTime);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = +countDownDate - now;

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountDown(seconds);

      if (distance < 0) {
        clearInterval(interval);
        setCountDown(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (time: number) => {
    const seconds = time % 60;
    return `${seconds}с`;
  };

  return countDown ? (
    <div>
      <h2>Countdown timer</h2>
      <div>{formatTime(countDown)}</div>
    </div>
  ) : null;
};

export default CountdownTimer;
