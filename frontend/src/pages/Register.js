import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      alert("Registered successfully! Please login.");
      navigate("/login");

    } catch (error) {
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
    <div className="register">
      <div className="register-card">
        <h2>Create Account</h2>

        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-register1" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
