import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/employeeAttendance.css";

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/my-attendance/");
        setRecords(res.data);
      } catch (error) {
        alert("Failed to fetch attendance");
      }
    };

    fetchAttendance();
  }, []);

  const filtered = records.filter(r =>
    r.date.startsWith(month)
  );

  const summary = {
    present: filtered.filter(r => r.status === "PRESENT").length,
    leave: filtered.filter(r => r.status === "LEAVE").length,
    absent: filtered.filter(r => r.status === "ABSENT").length,
  };

  return (
    <div className="employee-attendance-page">
      <div className="employee-attendance-header">
        <h2>My Attendance</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="attendance-summary">
        <div>Present: {summary.present}</div>
        <div>Leave: {summary.leave}</div>
        <div>Absent: {summary.absent}</div>
      </div>
    </div>
  );
}
