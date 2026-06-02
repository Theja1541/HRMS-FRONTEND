import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Select from "react-select";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/leaveCalendar.css";

const localizer = momentLocalizer(moment);

export default function LeaveCalendar() {

  const [events, setEvents] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [leaveType, setLeaveType] = useState("");

  const [leaveHeatmap, setLeaveHeatmap] = useState({});
  const [dayEvents, setDayEvents] = useState({});

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState({});

  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  /* ================= CALCULATE STATS ================= */
  const activeRangeStats = useMemo(() => {
    if (!allLeaves.length) return { totalLeaves: 0, uniqueEmployees: 0, peakDayLeaves: 0 };

    let start = moment(date);
    let end = moment(date);

    if (view === "month" || view === "agenda") {
      start = moment(date).startOf("month");
      end = moment(date).endOf("month");
    } else if (view === "week") {
      start = moment(date).startOf("week");
      end = moment(date).endOf("week");
    } else if (view === "day") {
      start = moment(date).startOf("day");
      end = moment(date).endOf("day");
    }

    let total = 0;
    const employeesOnLeave = new Set();
    const dayCounts = {};

    allLeaves.forEach(e => {
      const eventStart = moment(e.start);
      const eventEnd = moment(e.end);

      // Check if event overlaps with the visible range
      if (eventStart.isSameOrBefore(end, "day") && eventEnd.isSameOrAfter(start, "day")) {
        total++;
        if (e.title) employeesOnLeave.add(e.title);

        // Count leaves day by day within the intersection
        let cur = moment.max(eventStart, start).clone();
        const rangeEnd = moment.min(eventEnd, end);
        while (cur.isSameOrBefore(rangeEnd, "day")) {
          const k = cur.format("YYYY-MM-DD");
          dayCounts[k] = (dayCounts[k] || 0) + 1;
          cur.add(1, "day");
        }
      }
    });

    const peakDayCount = Object.values(dayCounts).length ? Math.max(...Object.values(dayCounts)) : 0;

    return {
      totalLeaves: total,
      uniqueEmployees: employeesOnLeave.size,
      peakDayLeaves: peakDayCount
    };
  }, [allLeaves, date, view]);

  const selectedEmployeeLeaves = useMemo(() => {
    if (!selectedEmployee) return [];
    return allLeaves.filter(e => e.title === selectedEmployee.label);
  }, [allLeaves, selectedEmployee]);

  /* ================= FETCH EMPLOYEES ================= */

  useEffect(() => {
    fetchEmployees();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const deptRes = await api.get("/employees/departments/");
      if (deptRes.data && deptRes.data.departments) {
        setDepartmentOptions(deptRes.data.departments);
      }
      const typeRes = await api.get("/leaves/types/");
      if (typeRes.data) {
        setLeaveTypeOptions(typeRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  };

  const fetchEmployees = async () => {
    try {

      const res = await api.get("/employees/");
      const list = res.data.results || res.data;

      const options = list.map(emp => ({
        value: emp.id,
        label: `${emp.first_name} ${emp.last_name}`
      }));

      setEmployeeOptions(options);

    } catch (err) {
      console.error("Employee fetch error", err);
    }
  };

  /* ================= FETCH CALENDAR ================= */

  useEffect(() => {

  const timer = setTimeout(() => {
    fetchCalendar();
  }, 300);

  return () => clearTimeout(timer);

}, [selectedEmployee, selectedDepartment, leaveType]);

  const fetchCalendar = async () => {
    try {
      const params = {};

      if (selectedEmployee) params.employee_id = selectedEmployee.value;
      if (selectedDepartment) params.department = selectedDepartment;
      if (leaveType) params.leave_type = leaveType;

      const res = await api.get("/leaves/calendar/", { params });

      const formatted = res.data.map(e => ({
        title: e.title,
        start: new Date(e.start),
        end: new Date(e.end),
        leave_type: e.leave_type,
        avatar: e.avatar,
        department: e.department,
        document: e.document,
        type: e.type
      }));

      setAllLeaves(formatted);

      /* ================= BUILD HEATMAP & GROUPS ================= */
      const counts = {};
      const grouped = {};

      formatted.forEach(event => {
        let current = moment(event.start);
        const end = moment(event.end);

        while (current.isSameOrBefore(end)) {
          const key = current.format("YYYY-MM-DD");
          counts[key] = (counts[key] || 0) + 1;

          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(event);

          current.add(1, "day");
        }
      });

      setLeaveHeatmap(counts);
      setDayEvents(grouped);

      // Build daily summary events
      const summaryEvents = [];
      Object.entries(counts).forEach(([dateStr, count]) => {
        summaryEvents.push({
          title: `${count} ${count === 1 ? "employee" : "employees"} on leave`,
          start: new Date(dateStr),
          end: new Date(dateStr),
          allDay: true,
          count: count,
          type: "summary"
        });
      });

      setEvents(summaryEvents);

    } catch (err) {
      console.error("Calendar error", err);
    }
  };

  /* ================= DEPARTMENT COLORS ================= */

  const departmentColors = {
    HR: "#2563eb",
    IT: "#7c3aed",
    Finance: "#f59e0b",
    Sales: "#10b981",
    Admin: "#ef4444"
  };

  /* ================= EVENT STYLE ================= */

  const eventStyleGetter = (event) => {

    let backgroundColor = "#64748b";

    if (event.department) {
      backgroundColor = departmentColors[event.department] || "#64748b";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "#fff",
        fontSize: "12px",
        padding: "2px 6px",
        border: "none"
      }
    };
  };

  /* ================= HEATMAP ================= */

  const dayPropGetter = (date) => {
    const key = moment(date).format("YYYY-MM-DD");
    const count = leaveHeatmap[key] || 0;

    let backgroundColor = "";
    let color = "";

    // Heatmap intensity based on leave count
    if (count >= 10) {
      backgroundColor = "#fee2e2"; // Red - Critical
      color = "#991b1b";
    } else if (count >= 7) {
      backgroundColor = "#fed7aa"; // Orange - High
      color = "#9a3412";
    } else if (count >= 4) {
      backgroundColor = "#fef3c7"; // Yellow - Medium
      color = "#92400e";
    } else if (count >= 2) {
      backgroundColor = "#dbeafe"; // Blue - Low
      color = "#1e40af";
    }

    return { style: { backgroundColor, color } };
  };

  /* ================= DATE CLICK ================= */

  const handleDateClick = (date) => {

    const key = moment(date).format("YYYY-MM-DD");
    const eventsForDay = dayEvents[key] || [];

    const grouped = {};

    eventsForDay.forEach(e => {

      const dept = e.department || "Other";

      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(e);

    });

    setDayDetails(grouped);
    setSelectedDate(date);
  };

  /* ================= DATE CELL WITH COUNT BADGE ================= */

  const DateCellWrapper = ({ value, children }) => {
    const key = moment(value).format("YYYY-MM-DD");
    const count = leaveHeatmap[key] || 0;

    if (count === 0) {
      return <div className="rbc-day-bg">{children}</div>;
    }

    return (
      <div className="rbc-day-bg custom-date-cell">
        {children}
        <div className="leave-count-badge">
          {count} {count === 1 ? 'leave' : 'leaves'}
        </div>
      </div>
    );
  };

  /* ================= EVENT COMPONENT - SIMPLIFIED ================= */

  const EventComponent = ({ event }) => {

  if (event.type === "summary") {

    return (
      <div className="calendar-summary-event">
        👥 {event.count} on leave
      </div>
    );
  }

  return null;
};

  /* ================= UI ================= */

  return (
    <div className="leave-calendar-container">
      
      {/* HEADER */}
      <div className="calendar-page-header">
        <div className="header-left">
          <h1>Leave Calendar</h1>
          <p>Track and manage employee leaves across the organization</p>
        </div>
        <div className="header-right">
          <button className="today-btn" onClick={() => setDate(new Date())}>
            <span>📍</span> Today
          </button>
          <input 
            type="date" 
            value={moment(date).format('YYYY-MM-DD')}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="date-picker"
          />
        </div>
      </div>

      {/* FILTERS & STATS ROW */}
      <div className="calendar-controls">
        
        {/* LEFT: FILTERS */}
        <div className="filters-section">
          <div className="filter-group">
            <label>👤 Employee</label>
            <Select
              options={employeeOptions}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="All Employees"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="filter-group">
            <label>🏢 Department</label>
            <select value={selectedDepartment} onChange={(e)=>setSelectedDepartment(e.target.value)}>
              <option value="">All Departments</option>
              {departmentOptions.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>🍃 Leave Type</label>
            <select value={leaveType} onChange={(e)=>setLeaveType(e.target.value)}>
              <option value="">All Types</option>
              {leaveTypeOptions.map((type) => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT: VIEW SWITCHER */}
        <div className="view-controls">
          <div className="view-tabs">
            <button 
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Week
            </button>
            <button 
              className={view === 'day' ? 'active' : ''}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button 
              className={view === 'agenda' ? 'active' : ''}
              onClick={() => setView('agenda')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED EMPLOYEE DETAILS */}
      {selectedEmployee && (
        <div className="selected-employee-details-card">
          <div className="emp-details-header">
            <div className="emp-avatar-circle">
              {selectedEmployee.label.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h3>{selectedEmployee.label}</h3>
              <p className="emp-subtitle">Individual Employee Leave Details</p>
            </div>
            <div className="emp-total-leaves-badge">
              <strong>{selectedEmployeeLeaves.length}</strong> Total Leaves
            </div>
          </div>
          <div className="emp-leaves-list">
            <h4>Leave History & Planned Leaves</h4>
            {selectedEmployeeLeaves.length === 0 ? (
              <p className="no-leaves-msg">No leaves recorded for this employee.</p>
            ) : (
              <div className="leaves-scroll-grid">
                {selectedEmployeeLeaves.map((leave, idx) => (
                  <div key={idx} className="individual-leave-item">
                    <div className="leave-badge-type" style={{ borderLeft: `4px solid ${departmentColors[leave.department] || '#64748b'}` }}>
                      <strong>{leave.leave_type || "Leave"}</strong>
                      <span>{leave.department || "General"}</span>
                    </div>
                    <div className="leave-date-range">
                      📅 {moment(leave.start).format("MMM D, YYYY")} - {moment(leave.end).format("MMM D, YYYY")}
                    </div>
                    <div className="leave-duration">
                      {moment(leave.end).diff(moment(leave.start), 'days') + 1} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#dbeafe'}}>
            <span style={{color: '#2563eb'}}>👥</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">
              {view === "month" ? "Leaves this Month" : view === "week" ? "Leaves this Week" : "Leaves Today"}
            </span>
            <span className="stat-value">{activeRangeStats.totalLeaves}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>
            <span style={{color: '#f59e0b'}}>📅</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Employees on Leave</span>
            <span className="stat-value">{activeRangeStats.uniqueEmployees}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fee2e2'}}>
            <span style={{color: '#ef4444'}}>⚠️</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Peak Day Leaves</span>
            <span className="stat-value">
              {activeRangeStats.peakDayLeaves} leaves
            </span>
          </div>
        </div>
      </div>



      {/* CALENDAR */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={(slot)=>handleDateClick(slot.start)}
          onSelectEvent={(event)=>{
            if (event.type === "summary") {
              handleDateClick(event.start);
            } else {
              setSelectedEvent(event);
              setShowModal(true);
            }
          }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month','week','day','agenda']}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          components={{
            event: EventComponent,
            dateCellWrapper: DateCellWrapper,
          }}
          style={{height: 650}}
        />
      </div>

      {/* EVENT DETAIL MODAL */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {selectedEvent.avatar && (
                <img src={selectedEvent.avatar} alt="" className="employee-avatar-large" />
              )}
              <div className="detail-row">
                <span className="label">Employee:</span>
                <span className="value">{selectedEvent.title}</span>
              </div>
              <div className="detail-row">
                <span className="label">Department:</span>
                <span className="value">{selectedEvent.department || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Leave Type:</span>
                <span className="value">{selectedEvent.leave_type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Duration:</span>
                <span className="value">
                  {moment(selectedEvent.start).format('MMM D, YYYY')} - {moment(selectedEvent.end).format('MMM D, YYYY')}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Total Days:</span>
                <span className="value">{moment(selectedEvent.end).diff(moment(selectedEvent.start), 'days') + 1} days</span>
              </div>
              {selectedEvent.document && (
                <div className="detail-row">
                  <span className="label">Attached Document:</span>
                  <span className="value">
                    <a href={selectedEvent.document} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                      View Document
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAY DETAILS PANEL */}
      {selectedDate && (
        <div className="side-panel">
          <div className="panel-header">
            <div>
              <h3>{moment(selectedDate).format('MMMM D, YYYY')}</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                {Object.values(dayDetails).flat().length} employee(s) on leave
              </p>
            </div>
            <button className="close-btn" onClick={() => setSelectedDate(null)}>×</button>
          </div>
          <div className="panel-body">
            {Object.keys(dayDetails).length === 0 ? (
              <div className="empty-state">
                <p>No leaves on this date</p>
              </div>
            ) : (
              Object.entries(dayDetails).map(([dept, employees]) => (
                <div key={dept} className="dept-section">
                  <h4>{dept}</h4>
                  {employees.map((emp, i) => (
                    <div 
                      key={i} 
                      className="employee-card" 
                      onClick={() => {
                        setSelectedEvent(emp);
                        setShowModal(true);
                      }}
                      style={{ cursor: "pointer", transition: "background 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {emp.avatar && <img src={emp.avatar} alt="" />}
                      <div className="emp-info">
                        <span className="emp-name">{emp.title}</span>
                        <span className="emp-leave-type">{emp.leave_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}