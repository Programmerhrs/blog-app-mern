import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EditPost.css";

function EditPost() {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch existing post data to pre-fill form
    axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setImage(res.data.image || "");
        setVideo(res.data.video || "");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/posts/edit/${id}`,
        { title, content, image, video },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Post updated successfully! ✅");
      navigate("/profile");

    } catch (error) {
      console.log(error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-loading">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="edit-container">

      <div className="edit-card">
        <h2>Edit Blog ✏️</h2>

        <form className="edit-form" onSubmit={handleSubmit}>

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
            placeholder="Video URL (optional)"
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

          <div className="edit-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes ✅"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default EditPost;
