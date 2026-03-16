import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user && token) {
      fetchUnreadMessages();
      fetchUnreadNotifs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUnreadMessages = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadMessages(res.data.unread);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUnreadNotifs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadNotifs(res.data.unread);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <h2 className="logo"><span>Blog</span>App</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {user && (
          <>
            <Link to="/feed">Feed</Link>
            <Link to="/create">Create Post</Link>

            {/* Inbox */}
            <Link to="/inbox" className="icon-link">
              📬
              {unreadMessages > 0 && (
                <span className="nav-badge">{unreadMessages}</span>
              )}
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className="icon-link">
              🔔
              {unreadNotifs > 0 && (
                <span className="nav-badge">{unreadNotifs}</span>
              )}
            </Link>
          </>
        )}

        {/* Profile Icon */}
        <span className="profile-icon" onClick={() => setOpen(!open)}>
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="profile"
              className="navbar-profile-img"
            />
          ) : (
            "👤"
          )}
        </span>

        {open && (
          <div className="profile-dropdown">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <span style={{ color: "#00eeff", fontSize: "0.9rem" }}>
                  Hi, {user.name}
                </span>
                <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
                <Link to="/inbox" onClick={() => setOpen(false)}>📬 Inbox</Link>
                <Link to="/notifications" onClick={() => setOpen(false)}>🔔 Notifications</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
