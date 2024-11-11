import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/notifications.css"; // Ensure this path is correct

function NotificationBadge() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications =
        JSON.parse(localStorage.getItem("notifications")) || [];
      setNotifications(storedNotifications);
      setUnreadCount(storedNotifications.filter((n) => !n.read).length);
    };

    loadNotifications();
    window.addEventListener("storage", loadNotifications);

    return () => {
      window.removeEventListener("storage", loadNotifications);
    };
  }, []);

  return (
    <div className="notification-container">
      <Link
        to="/notifications"
        className={`notification ${unreadCount === 0 ? "notification-zero" : ""}`}
      >
        <i className="bx bxs-bell"></i>
        {unreadCount > 0 && (
          <span className="badge num">{unreadCount}</span>
        )}
      </Link>
    </div>
  );
}

export default NotificationBadge;
