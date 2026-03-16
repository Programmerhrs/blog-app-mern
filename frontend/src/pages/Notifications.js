import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Notifications.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchNotifications();
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/notifications/markread`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleClear = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/notifications/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications([]);
    } catch (error) {
      console.log(error);
    }
  };

  const getIcon = (type) => {
    if (type === "like") return "❤️";
    if (type === "comment") return "💬";
    return "🔔";
  };

  return (
    <div className="notifications-page">

      <div className="notifications-header">
        <h1>🔔 Notifications</h1>
        {notifications.length > 0 && (
          <button className="clear-btn" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <p className="notif-status">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="notif-status">No notifications yet. 🔕</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notif-item ${!notif.read ? "unread" : ""}`}
              onClick={() => navigate(`/post/${notif.post?._id}`)}
            >
              <span className="notif-icon">{getIcon(notif.type)}</span>
              <div className="notif-content">
                <p>
                  <span className="notif-sender">{notif.sender?.name}</span>
                  {" "}{notif.message}{" "}
                  <span className="notif-post">"{notif.post?.title}"</span>
                </p>
                <span className="notif-time">
                  {new Date(notif.createdAt).toLocaleDateString()} {" "}
                  {new Date(notif.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              {!notif.read && <span className="notif-dot" />}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Notifications;
