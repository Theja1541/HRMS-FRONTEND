import { useEffect, useState } from "react";
import { getMyNotifications, markNotificationRead } from "../../api/notifications";
import "../../styles/pages.css";

const typeStyles = {
  INFO: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", icon: "ℹ️" },
  SUCCESS: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0", icon: "✅" },
  WARNING: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", icon: "⚠️" },
  ERROR: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", icon: "❌" },
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadNotifications = () => {
    setLoading(true);
    getMyNotifications()
      .then((response) => {
        setNotifications(response.data?.notifications || []);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );
    } catch {
      loadNotifications();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Notifications</h2>
        <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
          {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: filter === "all" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: filter === "all" ? "#eff6ff" : "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: filter === "unread" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: filter === "unread" ? "#eff6ff" : "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("read")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: filter === "read" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: filter === "read" ? "#eff6ff" : "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
          <button
            type="button"
            onClick={loadNotifications}
            className="btn"
            style={{ padding: "8px 16px" }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <p style={{ marginTop: 12 }}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
            <div style={{ fontSize: 32 }}>📭</div>
            <p style={{ marginTop: 12 }}>
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredNotifications.map((notification) => {
              const style = typeStyles[notification.type] || typeStyles.INFO;
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkRead(notification)}
                  style={{
                    width: "100%",
                    border: notification.is_read ? "1px solid #e2e8f0" : `2px solid ${style.border}`,
                    borderRadius: 12,
                    background: notification.is_read ? "#fff" : style.bg,
                    textAlign: "left",
                    padding: 16,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = style.border;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = notification.is_read ? "#e2e8f0" : `2px solid ${style.border}`;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{style.icon}</span>
                        <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>
                          {notification.title}
                        </span>
                        {!notification.is_read && (
                          <span
                            style={{
                              borderRadius: 999,
                              background: "#dc2626",
                              color: "#fff",
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      {notification.message && (
                        <div style={{ color: "#475569", lineHeight: 1.6, fontSize: 14, marginBottom: 8 }}>
                          {notification.message}
                        </div>
                      )}
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>
                        {formatDate(notification.created_at)}
                        {!notification.is_read && " · Click to mark as read"}
                      </div>
                    </div>
                    <span
                      style={{
                        flex: "0 0 auto",
                        borderRadius: 999,
                        border: `1px solid ${style.border}`,
                        background: "#fff",
                        color: style.text,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {notification.type}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
