import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 1600, className }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    // Small delay for dramatic effect
    const timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{count}</span>;
}