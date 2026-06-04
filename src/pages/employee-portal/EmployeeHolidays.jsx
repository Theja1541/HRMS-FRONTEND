import { useState, useEffect } from "react";
import { getHolidays } from "../../api/holidays";
import "../../styles/dashboard.css";

export default function EmployeeHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await getHolidays();
      setHolidays(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Company Holidays</h2>
      </div>

      <div className="dashboard-card premium-card">
        <h3>Holiday List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="responsive-table-container custom-scrollbar">
            <table className="modern-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No holidays found.</td>
                  </tr>
                ) : (
                  holidays.map(h => {
                    const fromStr = new Date(h.from_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    const toStr = h.to_date ? new Date(h.to_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : fromStr;
                    const dateDisplay = fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`;
                    
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{dateDisplay}</td>
                        <td style={{ fontWeight: 600, color: '#3b82f6' }}>{h.holiday_name}</td>
                        <td>
                          <span className={`badge`} style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: '600' }}>
                            {h.holiday_type}
                          </span>
                        </td>
                        <td>{h.state || "-"}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
