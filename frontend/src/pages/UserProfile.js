import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";
import "../styles/UserProfile.css";

function UserProfile() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${id}`);
      setProfileUser(res.data);
      setFollowersCount(res.data.followers?.length || 0);
      setFollowing(res.data.followers?.includes(user?.id) || false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts/all`);
      const filtered = res.data.filter(
        (post) => post.author?._id === id
      );
      setUserPosts(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(res.data.following);
      setFollowersCount(res.data.followersCount);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="user-profile-loading">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="user-profile">

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Profile Header */}
      <div className="user-profile-header">

        <div className="user-avatar-container">
          {profileUser.profileImage ? (
            <img
              src={profileUser.profileImage}
              alt="Profile"
              className="user-avatar-img"
            />
          ) : (
            <div className="user-avatar">👤</div>
          )}
        </div>

        <div className="user-profile-info">
          <h2>{profileUser.name}</h2>
          <p>{profileUser.email}</p>

          <div className="user-stats">
            <span>📝 {userPosts.length} Posts</span>
            <span>👥 {followersCount} Followers</span>
            <span>➡️ {profileUser.following?.length || 0} Following</span>
          </div>

          {/* Follow Button — don't show on own profile */}
          {user && user.id !== id && (
            <button
              className={`follow-btn ${following ? "following" : ""}`}
              onClick={handleFollow}
            >
              {following ? "✅ Following" : "➕ Follow"}
            </button>
          )}

          {/* Message Button */}
          {user && user.id !== id && (
            <button
              className="msg-btn"
              onClick={() => navigate(`/inbox?user=${id}&name=${profileUser.name}`)}
            >
              💬 Message
            </button>
          )}
        </div>
      </div>

      {/* User Posts */}
      <div className="user-posts-section">
        <h3>📝 {profileUser.name}'s Blogs</h3>

        {userPosts.length === 0 ? (
          <p className="no-posts-status">No posts yet.</p>
        ) : (
          <div className="user-posts-grid">
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default UserProfile;
