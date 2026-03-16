import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ChatBox.css";

function ChatBox({ receiverId, receiverName, onClose }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/conversation/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages/send`,
        { receiverId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      fetchMessages();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(messages.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.log(error);
      alert("Error deleting message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chatbox">

      {/* Chat Header */}
      <div className="chatbox-header">
        <span>💬 {receiverName}</span>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Messages */}
      <div className="chatbox-messages">
        {loading ? (
          <p className="chat-status">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="chat-status">No messages yet. Say hi! 👋</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender._id === user.id ? "sent" : "received"}`}
            >
              <p>{msg.text}</p>
              <div className="message-footer">
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                {/* Show delete only on sent messages */}
                {msg.sender._id === user.id && (
                  <button
                    className="delete-msg-btn"
                    onClick={() => handleDelete(msg._id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send ➤</button>
      </div>

    </div>
  );
}

export default ChatBox;
