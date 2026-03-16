import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/BlogDetails.css";

function BlogDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${id}`)
      .then((res) => {
        setBlog(res.data);
        setLikes(res.data.likes?.length || 0);
        setLiked(res.data.likes?.includes(user?.id) || false);
        setComments(res.data.comments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like posts!");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/like/${id}`,
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
        `http://localhost:5000/api/posts/comment/${id}`,
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
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard! 🔗");
  };

  const getVideoEmbed = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-loading">
        <p>Post not found.</p>
      </div>
    );
  }

  return (
    <div className="blog-details">

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Blog Card */}
      <div className="blog-card">

        {/* Image */}
        {blog.image && (
          <img src={blog.image} alt={blog.title} className="blog-image" />
        )}

        {/* Video */}
        {blog.video && (
          <div className="blog-video">
            <iframe
              src={getVideoEmbed(blog.video)}
              title="Blog Video"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="blog-title">{blog.title}</h1>

        {/* Meta Info */}
        <div className="blog-meta">
          <span
            className="author-link"
            onClick={() => navigate(`/user/${blog.author?._id}`)}
          >
            ✍️ {blog.author?.name || "Unknown"}
          </span>
          <span>📧 {blog.author?.email || ""}</span>
          <span>🕒 {new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Divider */}
        <hr className="blog-divider" />

        {/* Content */}
        <p className="blog-content">{blog.content}</p>

        {/* Divider */}
        <hr className="blog-divider" />

        {/* Like Share Message Buttons */}
        <div className="blog-actions">
          <button
            className={`blog-like-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            {liked ? "❤️" : "🤍"} {likes} {likes === 1 ? "Like" : "Likes"}
          </button>

          <button className="blog-share-btn" onClick={handleShare}>
            🔗 Share
          </button>

          {user && blog.author?._id !== user.id && (
            <button
              className="blog-msg-btn"
              onClick={() => navigate(`/inbox?user=${blog.author?._id}&name=${blog.author?.name}`)}
            >
              💬 Message
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="blog-comments">
          <h3>💬 Comments ({comments.length})</h3>

          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first!</p>
          ) : (
            comments.map((c, index) => (
              <div key={index} className="comment-item">
                <span className="comment-name">👤 {c.name}</span>
                <p className="comment-text">{c.text}</p>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}

          {user ? (
            <div className="comment-input">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={handleComment}>Post</button>
            </div>
          ) : (
            <p className="login-to-comment">
              <span onClick={() => navigate("/login")}>Login</span> to leave a comment
            </p>
          )}
        </div>

      </div>

    </div>
  );
}

export default BlogDetails;
