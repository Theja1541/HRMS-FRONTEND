import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaUmbrellaBeach,
} from "react-icons/fa";
import "../../styles/attendanceSummary.css";

const AttendanceSummary = () => {
  const summaryData = [
    {
      title: "Total Employees",
      value: 120,
      icon: <FaUsers />,
      className: "card-blue",
    },
    {
      title: "Present Today",
      value: 98,
      icon: <FaUserCheck />,
      className: "card-green",
    },
    {
      title: "Absent Today",
      value: 12,
      icon: <FaUserTimes />,
      className: "card-red",
    },
    {
      title: "Late Check-ins",
      value: 6,
      icon: <FaClock />,
      className: "card-orange",
    },
    {
      title: "On Leave",
      value: 4,
      icon: <FaUmbrellaBeach />,
      className: "card-purple",
    },
  ];

  return (
    <div className="attendance-summary-container">
      <div className="attendance-header">
        <h2>Attendance Summary</h2>
        <p>Live overview of today’s attendance</p>
      </div>

      <div className="attendance-summary-grid">
        <h1 style={{ color: "red" }}>ATTENDANCE SUMMARY LOADED</h1>
        {summaryData.map((item, index) => (
          <AnimatedCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

/* ===== Animated Card Component ===== */
const AnimatedCard = ({ item }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = item.value;
    const duration = 800;
    const increment = Math.ceil(end / (duration / 20));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [item.value]);

  return (
    <div className={`summary-card ${item.className}`}>
      <div className="card-icon">{item.icon}</div>
      <h3>{count}</h3>
      <span>{item.title}</span>
    </div>
  );
};

export default AttendanceSummary;
