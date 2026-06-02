import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getHolidayCalendarEvents } from "../../api/holidays";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css"; 

export default function HolidayCalendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getHolidayCalendarEvents();
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch calendar events", err);
    }
  };

  const handleEventClick = (info) => {
    const props = info.event.extendedProps;
    alert(`Holiday: ${info.event.title}\nType: ${props.type}\nState: ${props.state}\nDescription: ${props.description || "N/A"}`);
  };

  return (
    <div className="dashboard-page">
      <div className="header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2>Holiday Calendar</h2>
        <button className="btn-secondary" onClick={() => navigate("/holidays")}>List View</button>
      </div>

      <div className="dashboard-card" style={{ padding: '24px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height="75vh"
        />
      </div>
    </div>
  );
}
