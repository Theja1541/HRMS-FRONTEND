import { useState, useEffect } from "react";
import { getHolidays, deleteHoliday, bulkUploadHolidays } from "../../api/holidays";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css"; // Reuse dashboard/table styles

export default function HolidayList() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await getHolidays();
      // Handle paginated or list response
      setHolidays(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await deleteHoliday(id);
      fetchHolidays();
    } catch (err) {
      alert("Failed to delete holiday");
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    const formData = new FormData();
    formData.append("file", uploadFile);
    
    try {
      await bulkUploadHolidays(formData);
      alert("Holidays uploaded successfully!");
      setUploadFile(null);
      fetchHolidays();
    } catch (err) {
      alert("Failed to upload holidays. Ensure it is a valid .xlsx file.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Holiday Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => navigate("/holidays/calendar")}>Calendar View</button>
          <button className="btn-primary" onClick={() => navigate("/holidays/new")}>+ Add Holiday</button>
        </div>
      </div>

      {/* <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>Bulk Upload (Excel)</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              Upload a `.xlsx` file with the following columns: <br/>
              <strong>[Holiday Name, From Date, To Date, Type, State, Description]</strong><br/>
              <span style={{ fontSize: '12px' }}>*Dates should be YYYY-MM-DD. Type: PUBLIC, OPTIONAL, COMPANY, FESTIVAL.</span>
            </p>
            <form onSubmit={handleBulkUpload} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="file" accept=".xlsx" onChange={(e) => setUploadFile(e.target.files[0])} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <button type="submit" className="btn-secondary" disabled={!uploadFile}>Upload Data</button>
            </form>
          </div>
        </div>
      </div> */}

      <div className="dashboard-card">
        <h3>All Holidays</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Dates</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Payment</th>
                <th style={{ padding: '12px' }}>State</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '12px', textAlign: 'center' }}>No holidays found.</td>
                </tr>
              ) : (
                holidays.map(h => {
                  const fromStr = new Date(h.from_date).toLocaleDateString();
                  const toStr = h.to_date ? new Date(h.to_date).toLocaleDateString() : fromStr;
                  const dateDisplay = fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`;
                  
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{dateDisplay}</td>
                      <td style={{ padding: '12px' }}>{h.holiday_name}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${h.holiday_type.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: '500' }}>
                          {h.holiday_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          background: h.payment_type === 'UNPAID' ? '#ffedd5' : '#dcfce7', 
                          color: h.payment_type === 'UNPAID' ? '#c2410c' : '#166534',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {h.payment_type || 'PAID'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{h.state}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => navigate(`/holidays/${h.id}`)} style={{ marginRight: '8px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(h.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
