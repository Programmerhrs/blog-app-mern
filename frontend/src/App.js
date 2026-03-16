import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import BlogDetails from "./pages/BlogDetails";
import EditPost from "./pages/EditPost";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<BlogDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
