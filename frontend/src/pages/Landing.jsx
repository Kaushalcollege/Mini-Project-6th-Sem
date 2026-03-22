// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./Landing.css";
// Assuming you moved cmrlogo.png to src/assets/
import cmrLogo from "../assets/cmrlogo.png";

function Landing() {
  const [loginType, setLoginType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Connect to your Flask Backend
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user info (for standard JS, localStorage is an easy way to keep state)
        localStorage.setItem("user", JSON.stringify(data.user));

        // Route based on role
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/student");
        }
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to server. Is Flask running?");
    }
  };

  return (
    <div className="landing-container">
      <div className="login-card">
        <div className="logo-container">
          <img src={cmrLogo} alt="CMR Technical Campus" />
        </div>

        <h1 className="landing-title">Civic Sense AI</h1>
        <p className="landing-subtitle">Campus Cleanliness Monitoring</p>

        <div className="login-toggle">
          <button
            className={`toggle-btn ${loginType === "student" ? "active" : ""}`}
            onClick={() => setLoginType("student")}
            type="button"
          >
            Student
          </button>
          <button
            className={`toggle-btn ${loginType === "admin" ? "active" : ""}`}
            onClick={() => setLoginType("admin")}
            type="button"
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p
              style={{
                color: "var(--red-600)",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Landing;
