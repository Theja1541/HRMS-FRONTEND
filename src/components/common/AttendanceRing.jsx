import { useEffect, useRef, useState } from "react";

export default function AttendanceRing({
  percentage = 0,
  size = 140,
  strokeWidth = 10,
}) {
//Hai from AnilKumar
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);
  const previousValue = useRef(0);

  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  // ================= ANIMATION =================

  useEffect(() => {

    const startValue = previousValue.current;
    const endValue = percentage;
    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      const currentValue =
        startValue + (endValue - startValue) * progressRatio;

      setProgress(Math.round(currentValue));

      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);

  }, [percentage]);

  // ================= STROKE OFFSET =================

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  // ================= COLOR LOGIC =================

  const getColor = () => {
    if (percentage >= 85) return "#16a34a";     // green
    if (percentage >= 60) return "#f59e0b";     // amber
    return "#ef4444";                           // red
  };

  return (
    <div className="attendance-ring" style={{ width: size, height: size }}>

      <svg height={size} width={size}>

        {/* Background */}
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress */}
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.3s ease-out",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />

      </svg>

      <div className="ring-text">
        <h3>{progress}%</h3>
        <span>Attendance</span>
      </div>

    </div>
  );
}