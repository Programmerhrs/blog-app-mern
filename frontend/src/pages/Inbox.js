import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import "../styles/Inbox.css";

function Inbox() {

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchInbox();

    // Auto open chat if coming from BlogDetails
    const params = new URLSearchParams(location.search);
    const userId = params.get("user");
    const userName = params.get("name");
    if (userId && userName) {
      setSelectedUser({ _id: userId, name: userName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchInbox = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inbox">

      <div className="inbox-header">
        <h1>📬 Inbox</h1>
      </div>

      <div className="inbox-container">

        {/* Conversations List */}
        <div className="conversations-list">
          {loading ? (
            <p className="inbox-status">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="inbox-status">No messages yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user._id}
                className={`conversation-item ${selectedUser?._id === conv.user._id ? "active" : ""}`}
                onClick={() => setSelectedUser(conv.user)}
              >
                <div className="conv-avatar">👤</div>
                <div className="conv-info">
                  <h4>{conv.user.name}</h4>
                  <p>{conv.lastMessage.length > 40
                    ? conv.lastMessage.substring(0, 40) + "..."
                    : conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="unread-badge">{conv.unread}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <ChatBox
              receiverId={selectedUser._id}
              receiverName={selectedUser.name}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <div className="no-chat-selected">
              <p>👈 Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Inbox;
