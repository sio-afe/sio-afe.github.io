import React, { useEffect, useState } from 'react';

const getTimeParts = (targetDate) => {
  const now = new Date().getTime();
  const distance = Math.max(new Date(targetDate).getTime() - now, 0);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, ended: distance === 0 };
};

export default function CountdownTimer({ targetDate, label, variant = 'card' }) {
  const [time, setTime] = useState(() => getTimeParts(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeParts(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const segments = [
    { label: 'days', value: time.days.toString().padStart(2, '0') },
    { label: 'hrs', value: time.hours.toString().padStart(2, '0') },
    { label: 'mins', value: time.minutes.toString().padStart(2, '0') },
    { label: 'secs', value: time.seconds.toString().padStart(2, '0') }
  ];

  return (
    <div className={`countdown-wrapper ${variant}`}>
      {label && <p className="countdown-label">{label}</p>}
      {time.ended ? (
        <div className="countdown-ended">Time's up!</div>
      ) : (
        <div className="countdown-grid">
          {segments.map((segment) => (
            <div key={segment.label} className="countdown-segment">
              <span className="segment-value">{segment.value}</span>
              <span className="segment-label">{segment.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

