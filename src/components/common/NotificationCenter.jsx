import { useEffect, useMemo, useRef, useState } from "react";
import { getMyNotifications, markNotificationRead } from "../../api/notifications";

const typeStyles = {
  INFO: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  SUCCESS: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  WARNING: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  ERROR: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    setLoading(true);
    getMyNotifications()
      .then((response) => {
        setNotifications(response.data?.notifications || []);
        setUnreadCount(response.data?.unread_count || 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 20),
    [notifications]
  );

  const handleMarkRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      loadNotifications();
    }
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) loadNotifications();
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          height: 40,
          minWidth: 40,
          border: "1px solid #dbe3ef",
          borderRadius: 8,
          background: "#fff",
          color: "#0f172a",
          cursor: "pointer",
          fontWeight: 800,
        }}
      >
        N
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -7,
              right: -7,
              minWidth: 20,
              height: 20,
              padding: "0 5px",
              borderRadius: 999,
              background: "#dc2626",
              color: "#fff",
              fontSize: 11,
              lineHeight: "20px",
              border: "2px solid #f6f8fc",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 380,
            maxWidth: "calc(100vw - 40px)",
            background: "#fff",
            border: "1px solid #dbe3ef",
            borderRadius: 8,
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 850, color: "#0f172a" }}>Notifications</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                {unreadCount} unread
              </div>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              style={{
                border: "1px solid #dbe3ef",
                background: "#f8fafc",
                borderRadius: 8,
                padding: "7px 10px",
                cursor: "pointer",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ maxHeight: 430, overflowY: "auto" }}>
            {loading && visibleNotifications.length === 0 ? (
              <div style={{ padding: 18, color: "#64748b" }}>Loading notifications...</div>
            ) : visibleNotifications.length === 0 ? (
              <div style={{ padding: 18, color: "#64748b" }}>No notifications yet.</div>
            ) : (
              visibleNotifications.map((notification) => {
                const style = typeStyles[notification.type] || typeStyles.INFO;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleMarkRead(notification)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #f1f5f9",
                      background: notification.is_read ? "#fff" : "#f8fafc",
                      textAlign: "left",
                      padding: "13px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontWeight: 850, color: "#0f172a" }}>
                        {notification.title}
                      </span>
                      <span
                        style={{
                          flex: "0 0 auto",
                          alignSelf: "start",
                          borderRadius: 999,
                          border: `1px solid ${style.border}`,
                          background: style.bg,
                          color: style.text,
                          padding: "3px 8px",
                          fontSize: 11,
                          fontWeight: 850,
                        }}
                      >
                        {notification.type}
                      </span>
                    </div>
                    {notification.message && (
                      <div style={{ marginTop: 7, color: "#475569", lineHeight: 1.45, fontSize: 13 }}>
                        {notification.message}
                      </div>
                    )}
                    <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 12 }}>
                      {formatDate(notification.created_at)}
                      {!notification.is_read && " · click to mark read"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
