import React, { useState, useEffect } from 'react';
import { assetReturnAPI } from '../../api/assets';
import '../../styles/myAssets.css';

const MyAssets = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const response = await assetReturnAPI.getMyAssets();
      const data = response.data;
      setAssignments(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-assets-container">
      <div className="my-assets-header">
        <h2>My Assets</h2>
        <button className="btn-refresh" onClick={fetchMyAssets}>
          🔄 Refresh
        </button>
      </div>

      <div className="assets-grid">
        {loading && <p className="loading-text">Loading your assets...</p>}
        {!loading && assignments.map(assignment => (
          <div key={assignment.id} className="asset-card">
            <div className="asset-icon">
              {assignment.asset_type === 'LAPTOP' && '💻'}
              {assignment.asset_type === 'MOBILE' && '📱'}
              {assignment.asset_type === 'ID_CARD' && '🪪'}
              {assignment.asset_type === 'MONITOR' && '🖥️'}
              {assignment.asset_type === 'OTHER' && '📦'}
            </div>
            <h3>{assignment.asset_name}</h3>
            <p className="asset-type">{assignment.asset_type}</p>
            {assignment.serial_number && <p className="asset-serial">SN: {assignment.serial_number}</p>}
            <p className="asset-date">Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}</p>
            <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
              {assignment.status}
            </span>
          </div>
        ))}
        {!loading && assignments.length === 0 && (
          <p className="no-data">No assets assigned to you yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyAssets;
