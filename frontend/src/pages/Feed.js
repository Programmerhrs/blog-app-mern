import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";
import "../styles/Feed.css";

const Feed = () => {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts/all`);
      setPosts(res.data);
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearched(false);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearched(true);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/search?query=${searchQuery}`
      );
      setSearchResults(res.data);
    } catch (error) {
      console.log("Error searching posts:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearched(false);
    setSearchResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const displayPosts = searched ? searchResults : posts;

  return (
    <div className="feed">

      {/* Feed Header */}
      <div className="feed-header">
        <h1>Welcome back, <span>{user?.name}</span> 👋</h1>
        <button
          className="create-btn"
          onClick={() => navigate("/create")}
        >
          + Create Blog
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search blogs by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          {searched && (
            <button className="clear-btn" onClick={handleClear}>
              ✕ Clear
            </button>
          )}
        </div>
        {searched && (
          <p className="search-info">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Posts Grid */}
      <div className="feed-container">
        {loading || searching ? (
          <p className="feed-status">
            {searching ? "Searching..." : "Loading posts..."}
          </p>
        ) : displayPosts.length === 0 ? (
          <p className="feed-status">
            {searched ? "No posts found. Try a different search! 🔍" : "No posts yet. Be the first to write! 🚀"}
          </p>
        ) : (
          <div className="posts-grid">
            {displayPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Feed;
