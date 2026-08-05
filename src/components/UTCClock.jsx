import { useState, useEffect } from 'react';

export default function UTCClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours   = time.getUTCHours().toString().padStart(2, '0');
  const minutes = time.getUTCMinutes().toString().padStart(2, '0');
  const seconds = time.getUTCSeconds().toString().padStart(2, '0');

  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const day    = time.getUTCDate().toString().padStart(2, '0');
  const month  = months[time.getUTCMonth()];
  const year   = time.getUTCFullYear();

  return (
    <div className="utc-clock" title="Coordinated Universal Time — Maritime Standard">
      <div className="utc-clock-label">
        <span className="utc-clock-icon">🕐</span>
        <span className="utc-clock-zone">UTC</span>
      </div>
      <div className="utc-clock-display">
        <span className="utc-time">{hours}</span>
        <span className="utc-colon">:</span>
        <span className="utc-time">{minutes}</span>
        <span className="utc-colon utc-colon-blink">:</span>
        <span className="utc-time utc-seconds">{seconds}</span>
      </div>
      <div className="utc-clock-date">{day} {month} {year}</div>
    </div>
  );
}