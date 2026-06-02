import React, { useEffect, useState } from "react";
import { getAssetHistory, getAssets } from "../../api/assets";
import "../../styles/employees.css";

export default function AssetHistory() {
  const [history, setHistory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("");

  useEffect(() => {
    fetchAssets();
    fetchHistory();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (assetId = null) => {
    try {
      setLoading(true);
      const params = assetId ? { asset: assetId } : {};
      const res = await getAssetHistory(params);
      setHistory(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetChange = (e) => {
    const val = e.target.value;
    setSelectedAsset(val);
    fetchHistory(val);
  };

  const getColorByAction = (action) => {
    const colors = {
      CREATED: "#10b981", // green
      UPDATED: "#3b82f6", // blue
      ASSIGNED: "#8b5cf6", // purple
      RETURNED: "#06b6d4", // cyan
      MAINTENANCE: "#f59e0b", // orange
      LOST: "#0f172a", // black
      DAMAGED: "#ef4444", // red
      RETIRED: "#64748b" // gray
    };
    return colors[action] || "#3b82f6";
  };

  const getAssetEmoji = (categoryName) => {
    if (!categoryName) return '📦';
    const name = categoryName.toLowerCase();
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) return '💻';
    if (name.includes('mobile') || name.includes('phone') || name.includes('smartphone')) return '📱';
    if (name.includes('monitor') || name.includes('display') || name.includes('screen')) return '🖥️';
    if (name.includes('id') || name.includes('badge') || name.includes('card')) return '🪪';
    if (name.includes('mouse')) return '🖱️';
    if (name.includes('keyboard')) return '⌨️';
    if (name.includes('headphone') || name.includes('headset') || name.includes('audio')) return '🎧';
    if (name.includes('tablet') || name.includes('ipad')) return '📱';
    return '📦';
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset History Timeline</h2>
          <p className="page-subtitle">Track lifecycle events for all assets</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedAsset}
            onChange={handleAssetChange}
            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '250px' }}
          >
            <option value="">All Assets</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.asset_code} - {a.asset_name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedAsset ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {assets.map(asset => (
            <div 
              key={asset.id} 
              onClick={() => handleAssetChange({ target: { value: asset.id } })}
              style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ width: '100%', height: '120px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '48px' }}>
                  {getAssetEmoji(asset.category_details?.name)}
                </span>
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>{asset.asset_name}</h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>{asset.asset_code}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{asset.category_details?.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: asset.status === 'AVAILABLE' ? '#10b981' : asset.status === 'ASSIGNED' ? '#0ea5e9' : '#64748b' }}>
                    {asset.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          {loading ? (
            <div className="empty-state">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">No history found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {history.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    minWidth: '20px'
                  }}>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      backgroundColor: getColorByAction(item.action_type),
                      zIndex: 2,
                      marginTop: '5px'
                    }}></div>
                    {index !== history.length - 1 && (
                      <div style={{ 
                        flex: 1, 
                        width: '2px', 
                        backgroundColor: '#e2e8f0',
                        marginTop: '5px',
                        marginBottom: '-15px'
                      }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: index !== history.length - 1 ? '20px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{item.action_type}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(item.action_date).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ marginTop: '5px', fontSize: '14px', color: '#334155' }}>
                      <strong>{item.asset_details?.asset_name}</strong> ({item.asset_details?.asset_code})
                    </div>
                    {item.description && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        {item.description}
                      </div>
                    )}
                    {item.performed_by_details && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                        Performed by: {item.performed_by_details.first_name} {item.performed_by_details.last_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
