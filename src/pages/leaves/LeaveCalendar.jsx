import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Select from "react-select";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/leaveCalendar.css";

const localizer = momentLocalizer(moment);

export default function LeaveCalendar() {

  const [events, setEvents] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
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

  /* ================= FETCH EMPLOYEES ================= */

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        type: e.type
      }));

      // Build daily summary events
      const summaryEvents = [];

      Object.entries(counts).forEach(([date, count]) => {

        summaryEvents.push({
          title: `${count} ${count === 1 ? "employee" : "employees"} on leave`,
          start: new Date(date),
          end: new Date(date),
          allDay: true,
          count: count,
          type: "summary"
        });

      });

      setEvents(summaryEvents);

      /* ================= BUILD HEATMAP ================= */

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
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="filter-group">
            <label>🍃 Leave Type</label>
            <select value={leaveType} onChange={(e)=>setLeaveType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
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

      {/* STATS CARDS */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#dbeafe'}}>
            <span style={{color: '#2563eb'}}>👥</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Leaves</span>
            <span className="stat-value">{events.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>
            <span style={{color: '#f59e0b'}}>📅</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Days with Leaves</span>
            <span className="stat-value">{Object.keys(leaveHeatmap).length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fee2e2'}}>
            <span style={{color: '#ef4444'}}>⚠️</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Peak Day</span>
            <span className="stat-value">
              {Object.values(leaveHeatmap).length
              ? Math.max(...Object.values(leaveHeatmap))
              : 0} leaves
            </span>
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className="calendar-legend">
        <div className="legend-title">Leave Density:</div>
        <div className="legend-item">
          <span className="legend-box" style={{background: '#dbeafe'}}></span>
          <span>2-3 leaves</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{background: '#fef3c7'}}></span>
          <span>4-6 leaves</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{background: '#fed7aa'}}></span>
          <span>7-9 leaves</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{background: '#fee2e2'}}></span>
          <span>10+ leaves</span>
        </div>
        <div className="legend-divider"></div>
        <div className="legend-title">Departments:</div>
        <div className="legend-item">
          <span className="legend-dot" style={{background: '#2563eb'}}></span>
          <span>HR</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{background: '#7c3aed'}}></span>
          <span>IT</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{background: '#f59e0b'}}></span>
          <span>Finance</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{background: '#10b981'}}></span>
          <span>Sales</span>
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
            setSelectedEvent(event);
            setShowModal(true);
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
            </div>
          </div>
        </div>
      )}

      {/* DAY DETAILS PANEL */}
      {selectedDate && (
        <div className="side-panel">
          <div className="panel-header">
            <h3>{moment(selectedDate).format('MMMM D, YYYY')}</h3>
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
                    <div key={i} className="employee-card">
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