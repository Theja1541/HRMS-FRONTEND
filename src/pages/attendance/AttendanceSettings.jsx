import React, { useState } from "react";
import "../../styles/attendance.css";

const AttendanceSettings = () => {
  const [settings, setSettings] = useState({
    officeStartTime: "09:30",
    gracePeriod: 10,
    lateAfter: 15,
    halfDayAfter: 4,
    workingDays: "Mon-Fri",
  });

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Attendance Settings Saved:", settings);
    alert("Attendance settings saved successfully!");
  };

  return (
    <div className="attendance-settings-container">
      <div className="attendance-header">
        <h2>Attendance Settings</h2>
        <p>Configure company attendance rules</p>
      </div>

      <form className="attendance-settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Office Start Time</label>
          <input
            type="time"
            name="officeStartTime"
            value={settings.officeStartTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Grace Period (minutes)</label>
          <input
            type="number"
            name="gracePeriod"
            value={settings.gracePeriod}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Late Mark After (minutes)</label>
          <input
            type="number"
            name="lateAfter"
            value={settings.lateAfter}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Half Day After (hours)</label>
          <input
            type="number"
            name="halfDayAfter"
            value={settings.halfDayAfter}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Working Days</label>
          <select
            name="workingDays"
            value={settings.workingDays}
            onChange={handleChange}
          >
            <option value="Mon-Fri">Monday - Friday</option>
            <option value="Mon-Sat">Monday - Saturday</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettings;
