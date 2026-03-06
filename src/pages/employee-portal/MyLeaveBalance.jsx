import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/leaveBalance.css";

export default function MyLeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await api.get("/leaves/my-balance/");
        setBalances(res.data);
      } catch (error) {
        console.error("Failed to load leave balance", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading leave balance...</p>;
  }

  return (
    <div className="leave-balance-page">
      <div className="page-header">
        <div>
          <h2>My Leave Balance</h2>
          <p>Track your yearly leave usage</p>
        </div>
      </div>

      {balances.length === 0 ? (
        <div className="empty-card">
          <h3>No Leave Types Available</h3>
        </div>
      ) : (
        <div className="leave-balance-grid">
          {balances.map((item, index) => {
            const percent =
              item.total_allocated > 0
                ? Math.round(
                    (item.used / item.total_allocated) * 100
                  )
                : 0;

            const getLevel = () => {
              if (percent >= 80) return "low";
              if (percent >= 50) return "medium";
              return "healthy";
            };

            return (
              <div
                key={index}
                className={`leave-card ${getLevel()}`}
              >
                <h4>{item.leave_type}</h4>

                <div className="leave-stats">
                  <span>
                    {item.used} / {item.total_allocated} Used
                  </span>
                  <span>{percent}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="remaining">
                  Remaining: {item.remaining}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}