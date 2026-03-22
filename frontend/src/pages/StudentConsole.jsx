// src/pages/StudentConsole.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, Award, Loader2 } from "lucide-react";
import "./StudentConsole.css";
import cmrLogo from "../assets/cmrlogo.png";
import { UploadZone } from "../components/UploadZone";
import { DetectionResult } from "../components/DetectionResult";
import { UploadHistory } from "../components/UploadHistory";

function StudentConsole() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 👉 NEW: Fetch the user's history from Flask
      fetch(`http://127.0.0.1:8000/user/${parsedUser.id}/incidents`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setHistory(data);
        })
        .catch((err) => console.error("Failed to fetch history:", err));
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    setError("");
    setCurrentDetection(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", user.id);
    formData.append("location", "Campus Default"); // We can make this dynamic later

    try {
      const response = await fetch("http://127.0.0.1:8000/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentDetection(data);
        setHistory((prev) => [
          { status: data.status, time: "Just now" },
          ...prev,
        ]);
        // Bonus: Update the local user score if it changed
        if (data.status === "violation") {
          setUser((prev) => ({ ...prev, civic_score: prev.civic_score - 5 }));
        } else {
          setUser((prev) => ({ ...prev, civic_score: prev.civic_score + 2 }));
        }
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch (err) {
      setError("Failed to connect to the AI server. Is Flask running?");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="console-container">
      {/* Header */}
      <header className="console-header">
        <div className="header-left">
          <img src={cmrLogo} alt="CMR Logo" className="header-logo" />
          <h1 className="header-title">Civic Sense AI</h1>
        </div>

        <div className="header-right">
          <div className="civic-score">
            <Award
              size={16}
              style={{
                display: "inline",
                marginRight: "4px",
                verticalAlign: "text-bottom",
              }}
            />
            Score: {user.civic_score}
          </div>
          <button
            onClick={() => navigate("/student/profile")}
            className="user-info"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              color: "var(--gray-700)",
              padding: "0.5rem",
              borderRadius: "6px",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--gray-100)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <User size={18} />
            {user.username}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut
              size={16}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "text-bottom",
              }}
            />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="console-main">
        {/* Left Column: Upload and Results */}
        <div className="main-action-area">
          <div className="welcome-text">
            <h2>Welcome, {user.username}</h2>
            <p>Upload images to help maintain campus cleanliness</p>
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--red-50)",
                color: "var(--red-700)",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid var(--red-200)",
              }}
            >
              {error}
            </div>
          )}

          {!currentDetection && !isUploading && (
            <UploadZone onUpload={handleImageUpload} />
          )}

          {isUploading && (
            <div
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid var(--gray-200)",
              }}
            >
              <Loader2
                className="lucide-spin"
                size={32}
                color="var(--emerald-600)"
                style={{
                  margin: "0 auto 1rem auto",
                  animation: "spin 2s linear infinite",
                }}
              />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ color: "var(--gray-700)", marginBottom: "0.5rem" }}>
                Analyzing Image...
              </h3>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
                Running YOLOv8 inference model
              </p>
            </div>
          )}

          {currentDetection && !isUploading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <button
                onClick={() => setCurrentDetection(null)}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "none",
                  color: "var(--emerald-600)",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                ← Upload another image
              </button>
              <DetectionResult detection={currentDetection} />
            </div>
          )}
        </div>

        {/* Right Column: History Sidebar */}
        <div className="sidebar-area">
          {/* 👉 Change this line to use the real state variable: */}
          <UploadHistory history={history.slice(0, 3)} />

          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.5rem",
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "0.9rem",
                color: "var(--gray-700)",
                marginBottom: "0.8rem",
              }}
            >
              Your Impact
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--gray-500)",
                lineHeight: "1.5",
              }}
            >
              Every image you upload helps train our AI and keeps the campus
              clean.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentConsole;
