import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Select from "react-select";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/leaves.css";

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
    fetchCalendar();
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

      setEvents(formatted);

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

    if (count >= 5) backgroundColor = "#fee2e2";
    else if (count >= 3) backgroundColor = "#fef3c7";

    return { style: { backgroundColor } };
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

  /* ================= DATE CELL ================= */

  const DateCellWrapper = ({ value }) => {

    const key = moment(value).format("YYYY-MM-DD");
    const events = dayEvents[key] || [];

    if (events.length === 0) {
      return <span>{moment(value).date()}</span>;
    }

    const avatars = events.slice(0, 3);
    const remaining = events.length - 3;

    return (
      <div className="calendar-day-cell">

        <div className="calendar-date">
          {moment(value).date()}
        </div>

        <div className="leave-avatar-group">

          {avatars.map((e, i) => (
            <img
              key={i}
              src={e.avatar || "/default-avatar.png"}
              className="stack-avatar"
              alt=""
            />
          ))}

          {remaining > 0 && (
            <span className="avatar-more">+{remaining}</span>
          )}

        </div>

      </div>
    );
  };

  /* ================= EVENT COMPONENT ================= */

  const EventComponent = ({ event }) => {

    const start = moment(event.start).format("MMM D");
    const end = moment(event.end).format("MMM D");

    return (
      <div
        className="calendar-event"
        title={`Employee: ${event.title}
Leave Type: ${event.leave_type}
From: ${start}
To: ${end}`}
      >

        {event.avatar && (
          <img
            src={event.avatar}
            className="calendar-avatar"
            alt=""
          />
        )}

        <span>{event.title}</span>

      </div>
    );
  };

  /* ================= UI ================= */

  return (

    <div className="leave-calendar-page">

      <div className="leave-calendar-header">
        <h2>Leave Calendar</h2>
        <p>Company-wide employee leave schedule</p>
      </div>

      {/* FILTERS */}

      <div className="calendar-filters">

        <div className="filter-box">
          <label>Employee</label>

          <Select
            options={employeeOptions}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="Search employee..."
            isClearable
          />
        </div>

        <div className="filter-box">
          <label>Department</label>

          <select
            value={selectedDepartment}
            onChange={(e)=>setSelectedDepartment(e.target.value)}
          >
            <option value="">All</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="filter-box">
          <label>Leave Type</label>

          <select
            value={leaveType}
            onChange={(e)=>setLeaveType(e.target.value)}
          >
            <option value="">All</option>
            <option value="Sick Leave">Sick</option>
            <option value="Casual Leave">Casual</option>
            <option value="Earned Leave">Earned</option>
          </select>
        </div>

      </div>

      {/* CALENDAR */}

      <div className="calendar-container">

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
          views={["month","week","day","agenda"]}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          components={{
            event: EventComponent,
            dateCellWrapper: DateCellWrapper
          }}
          style={{height:700}}
        />

      </div>

      {/* EVENT MODAL */}

      {showModal && selectedEvent && (

        <div className="leave-modal-overlay">

          <div className="leave-modal">

            <h3>Leave Details</h3>

            <p><strong>Employee:</strong> {selectedEvent.title}</p>
            <p><strong>Leave Type:</strong> {selectedEvent.leave_type}</p>
            <p><strong>From:</strong> {moment(selectedEvent.start).format("MMM D")}</p>
            <p><strong>To:</strong> {moment(selectedEvent.end).format("MMM D")}</p>

            <button
              className="modal-close"
              onClick={()=>setShowModal(false)}
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* DAY PANEL */}

      {selectedDate && (

        <div className="leave-day-panel">

          <div className="day-panel-header">

            <h3>
              Leave Details — {moment(selectedDate).format("MMMM D")}
            </h3>

            <button
              className="panel-close"
              onClick={()=>setSelectedDate(null)}
            >
              ✕
            </button>

          </div>

          <div className="day-panel-content">

            {Object.entries(dayDetails).map(([dept, employees])=>(
              <div key={dept} className="dept-group">

                <h4>{dept}</h4>

                {employees.map((emp,i)=>(
                  <div key={i} className="employee-row">

                    {emp.avatar && (
                      <img
                        src={emp.avatar}
                        className="employee-avatar"
                        alt=""
                      />
                    )}

                    <span>{emp.title}</span>

                    <span className="leave-type">
                      {emp.leave_type}
                    </span>

                  </div>
                ))}

              </div>
            ))}

          </div>

        </div>

      )}

    </div>
  );
}