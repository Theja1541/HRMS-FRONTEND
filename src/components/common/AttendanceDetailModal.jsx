import { useState } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import "../../styles/attendanceModal.css";

export default function AttendanceDetailModal({ record, onClose }) {
  const { updateAttendance } = useEmployees();
  const [status, setStatus] = useState(record.status);

  const save = () => {
    updateAttendance(record.date, record.employeeId, status);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Attendance Details</h3>

        <p>
          <strong>Employee:</strong> {record.employeeName}
        </p>
        <p>
          <strong>Date:</strong> {record.date}
        </p>

        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>

          <button className="btn primary" onClick={save}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
