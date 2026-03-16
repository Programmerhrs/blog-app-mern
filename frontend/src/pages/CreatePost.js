import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreatePost.css";

function CreatePost() {

  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/create`,
        { title, content, image, video },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Post Published Successfully! 🎉");
      navigate("/feed");

    } catch (error) {
      console.log(error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">

      <div className="create-card">
        <h2>Create Blog ✍️</h2>

        <form className="create-form" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <input
            type="text"
            placeholder="Video URL (optional - YouTube or direct link)"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />

          <textarea
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="8"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish 🚀"}
          </button>

        </form>
      </div>

    </div>
  );
}

export default CreatePost;
