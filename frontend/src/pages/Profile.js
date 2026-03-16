import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";

function Profile() {

  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setProfileImage(user.profileImage || "");

    // Fetch follower counts
    axios.get(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`)
      .then((res) => {
        setFollowers(res.data.followers?.length || 0);
        setFollowing(res.data.following?.length || 0);
      })
      .catch((err) => console.log(err));

    fetchMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts/myposts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(res.data);
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const updatedUser = { ...user, profileImage: res.data.profileImage };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfileImage(res.data.profileImage);
      alert("Profile image updated! ✅");

    } catch (error) {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(myPosts.filter((post) => post._id !== postId));
      alert("Post deleted successfully!");
    } catch (error) {
      alert("Error deleting post");
    }
  };

  return (
    <div className="profile">

      {/* Profile Header */}
      <div className="profile-header">

        {/* Avatar with upload */}
        <div className="profile-avatar-container">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar">👤</div>
          )}

          <label className="upload-label" htmlFor="imageUpload">
            {uploading ? "Uploading..." : "📷 Change"}
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="profile-stats">
            <span className="post-count">📝 {myPosts.length} Posts</span>
            <span className="post-count">👥 {followers} Followers</span>
            <span className="post-count">➡️ {following} Following</span>
          </div>
        </div>
      </div>

      {/* My Posts Section */}
      <div className="my-posts">
        <h3>My Blogs</h3>

        {loading ? (
          <p className="profile-status">Loading your posts...</p>
        ) : myPosts.length === 0 ? (
          <p className="profile-status">
            You haven't written any blogs yet.{" "}
            <span onClick={() => navigate("/create")}>Create one! 🚀</span>
          </p>
        ) : (
          <div className="my-posts-grid">
            {myPosts.map((post) => (
              <div key={post._id} className="my-post-card">

                {post.image && (
                  <img src={post.image} alt={post.title} className="my-post-image" />
                )}

                <div className="my-post-content">
                  <h4>{post.title}</h4>
                  <p>{post.content.length > 100
                    ? post.content.substring(0, 100) + "..."
                    : post.content}
                  </p>
                  <span className="my-post-date">
                    🕒 {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="my-post-actions">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/edit/${post._id}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(post._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Profile;
