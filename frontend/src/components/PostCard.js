import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostCard.css";

function PostCard({ post }) {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    post.likes?.includes(user?.id) || false
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like posts!");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/posts/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      alert("Please login to comment!");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/comment/${post._id}`,
        { text: commentText, name: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data.comments);
      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard! 🔗");
  };

  return (
    <div className="post-card">

      {post.image && (
        <img src={post.image} alt={post.title} className="post-image" />
      )}

      <h2 className="post-title">{post.title}</h2>

      <p className="post-author">✍️ {post.author?.name || "Unknown"}</p>

      <p className="post-desc">
        {post.content.length > 150
          ? post.content.substring(0, 150) + "..."
          : post.content}
      </p>

      <p className="post-date">
        🕒 {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {/* Action Buttons */}
      <div className="post-actions">
        <button
          className={`like ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          {liked ? "❤️" : "🤍"} {likes}
        </button>

        <button
          className="comment"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length}
        </button>

        <button className="share" onClick={handleShare}>
          🔗 Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">

          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first!</p>
          ) : (
            comments.map((c, index) => (
              <div key={index} className="comment-item">
                <span className="comment-name">👤 {c.name}</span>
                <p className="comment-text">{c.text}</p>
              </div>
            ))
          )}

          {user && (
            <div className="comment-input">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={handleComment}>Post</button>
            </div>
          )}

        </div>
      )}

      <button
        className="read-btn"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        Read More
      </button>

    </div>
  );
}

export default PostCard;
