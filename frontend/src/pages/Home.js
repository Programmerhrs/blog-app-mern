import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";
import "../styles/Home.css";

const Home = () => {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPosts();
  }, []);

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Welcome to BlogApp ✨</h1>
            <p>Share your thoughts, explore amazing stories, and connect with a creative community.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-register">Register</Link>
              <Link to="/login" className="btn btn-register">Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>About BlogApp</h2>
        <p>
          BlogApp is a modern blogging platform where you can share your stories, explore ideas,
          and interact with other bloggers. We focus on simplicity, creativity, and a secure experience.
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Create Blogs</h3>
            <p>Write your thoughts and publish beautiful blog posts effortlessly.</p>
          </div>
          <div className="feature-card">
            <h3>Explore Community</h3>
            <p>Discover trending blogs and get inspired by others' creativity.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Account</h3>
            <p>Your account is protected with secure authentication and privacy-focused policies.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <h2>How it Works</h2>
        <p>
          Simply register an account, login, and start writing. Explore other blogs and leave comments.
          All your data is protected and secure.
        </p>
      </section>

      {/* Posts Feed Section */}
      <section className="posts-feed">
        <h2>Latest Blogs</h2>

        {loading ? (
          <p className="feed-status">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="feed-status">No posts yet. Be the first to write! 🚀</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="cta">
        <h2>Ready to Start?</h2>
        <Link to="/register" className="btn btn-register">Join Now</Link>
      </section>

    </div>
  );
};

export default Home;
