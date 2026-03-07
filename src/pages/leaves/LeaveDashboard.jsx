import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/leaves.css";

const localizer = momentLocalizer(moment);

export default function LeaveCalendar() {

  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {

      const res = await api.get("/leaves/calendar/");

      const formatted = res.data.map(e => ({
        title: `${e.title} (${e.leave_type})`,
        start: new Date(e.start),
        end: new Date(e.end),
        leave_type: e.leave_type
      }));

      setEvents(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  // color events based on leave type
  const eventStyleGetter = (event) => {

    let backgroundColor = "#3498db";

    if (event.leave_type === "Sick Leave") {
      backgroundColor = "#e74c3c";
    }

    if (event.leave_type === "Casual Leave") {
      backgroundColor = "#f39c12";
    }

    if (event.leave_type === "Earned Leave") {
      backgroundColor = "#2ecc71";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
        padding: "2px 5px"
      }
    };
  };

  return (
    <div className="leave-calendar-page">

      <div className="calendar-header">
        <h2>Leave Calendar</h2>
        <p>Visual overview of employee leaves</p>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        style={{ height: 650 }}
      />

    </div>
  );
}