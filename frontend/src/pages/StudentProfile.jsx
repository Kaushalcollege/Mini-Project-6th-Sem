// src/pages/StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Calendar,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import cmrLogo from "../assets/cmrlogo.png";
import "./StudentProfile.css";

function StudentProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Tracks which row is open

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 1. Load instantly from Local Storage if available
    const cachedHistory = localStorage.getItem(`history_${parsedUser.id}`);
    if (cachedHistory) {
      setHistory(JSON.parse(cachedHistory));
      setIsLoading(false);
    }

    // 2. Fetch fresh data from the backend in the background
    fetch(`http://127.0.0.1:8000/user/${parsedUser.id}/incidents`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
          // Save the fresh images and data to local storage
          localStorage.setItem(
            `history_${parsedUser.id}`,
            JSON.stringify(data),
          );
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setIsLoading(false);
      });
  }, [navigate]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!user) return null;

  const totalUploads = history.length;
  // Calculate violations by checking if the AI detected something other than a Clean Area
  const violationsFound = history.filter(
    (item) => item.detected_class !== "Clean Area",
  ).length;

  return (
    <div className="profile-container">
      <header className="profile-header-bar">
        <button className="back-btn" onClick={() => navigate("/student")}>
          <ArrowLeft size={20} />
        </button>
        <img src={cmrLogo} alt="CMR Logo" style={{ height: "40px" }} />
        <h1
          style={{
            fontSize: "1.2rem",
            color: "var(--gray-900)",
            borderLeft: "1px solid var(--gray-200)",
            paddingLeft: "1.5rem",
          }}
        >
          Civic Sense AI
        </h1>
      </header>

      <main className="profile-content">
        <h2 className="page-title">Student Profile</h2>

        <div className="profile-card">
          <div className="profile-avatar">
            <User size={48} color="var(--emerald-600)" />
          </div>
          <div className="profile-info">
            <h3>{user.username}</h3>
            <p>
              <Award size={16} /> Standard Student Account
            </p>
            <p>
              <Mail size={16} /> {user.email || `${user.username}@cmrtc.ac.in`}
            </p>
            <p>
              <Phone size={16} /> {user.phone_number || "Not provided"}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Total Uploads</span>
              <Camera size={20} color="var(--gray-400)" />
            </div>
            <div className="stat-value">
              {isLoading && history.length === 0 ? "-" : totalUploads}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Violations Found</span>
              <TrendingUp size={20} color="var(--gray-400)" />
            </div>
            <div className="stat-value">
              {isLoading && history.length === 0 ? "-" : violationsFound}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Member Since</span>
              <Calendar size={20} color="var(--gray-400)" />
            </div>
            <div
              className="stat-value"
              style={{ fontSize: "1.2rem", marginTop: "10px" }}
            >
              {user.member_since || "Mar 2026"}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Civic Score</span>
              <Award size={20} color="var(--emerald-600)" />
            </div>
            <div className="stat-value highlight">{user.civic_score}</div>
          </div>
        </div>

        <div className="activity-card">
          <h3 className="activity-header">Detailed Activity Log</h3>
          {isLoading && history.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--gray-500)",
                padding: "1rem",
              }}
            >
              Loading history...
            </p>
          ) : history.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {history.map((item) => {
                const isResolved =
                  item.status === "clean" &&
                  item.detected_class !== "Clean Area";
                const isCleanArea =
                  item.status === "clean" &&
                  item.detected_class === "Clean Area";
                const isPending = item.status === "violation";
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "var(--gray-50)",
                      border: "1px solid var(--gray-200)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Clickable Header Row */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem",
                        cursor: "pointer",
                        backgroundColor: isExpanded
                          ? "var(--gray-100)"
                          : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                        }}
                      >
                        {isPending ? (
                          <AlertCircle size={18} color="var(--amber-600)" />
                        ) : (
                          <CheckCircle2 size={18} color="var(--emerald-600)" />
                        )}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                backgroundColor: "var(--gray-200)",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                                color: "var(--gray-600)",
                                fontWeight: "600",
                              }}
                            >
                              INC-{item.id}
                            </span>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.9rem",
                                color: "var(--gray-800)",
                                fontWeight: "500",
                              }}
                            >
                              {isCleanArea && "Verified Clean Area"}
                              {isPending &&
                                `Reported Violation: ${item.detected_class}`}
                              {isResolved && `Resolved: ${item.detected_class}`}
                            </p>
                          </div>
                          <p
                            style={{
                              margin: "0.3rem 0 0 0",
                              fontSize: "0.8rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            {item.time}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: isPending
                              ? "var(--amber-600)"
                              : "var(--emerald-600)",
                            fontWeight: "500",
                            textAlign: "right",
                          }}
                        >
                          {isCleanArea
                            ? "+2 Score"
                            : isResolved
                              ? "Action Taken"
                              : "-5 Score"}
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} color="var(--gray-400)" />
                        ) : (
                          <ChevronDown size={18} color="var(--gray-400)" />
                        )}
                      </div>
                    </div>

                    {/* Expanding Content Area */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "1rem",
                          borderTop: "1px solid var(--gray-200)",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <div style={{ display: "flex", gap: "1.5rem" }}>
                          <div style={{ flex: "0 0 150px" }}>
                            <img
                              src={item.image_url}
                              alt="Upload"
                              style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "4px",
                                border: "1px solid var(--gray-200)",
                                objectFit: "cover",
                              }}
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "0.85rem",
                                color: "var(--gray-600)",
                              }}
                            >
                              <strong>AI Detection:</strong>{" "}
                              {item.detected_class}
                            </p>
                            <p
                              style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "0.85rem",
                                color: "var(--gray-600)",
                              }}
                            >
                              <strong>Current Status:</strong>{" "}
                              {item.status === "clean"
                                ? "Clean / Resolved"
                                : "Pending Action"}
                            </p>
                            <a
                              href={item.image_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--emerald-600)",
                                textDecoration: "none",
                                fontWeight: "500",
                              }}
                            >
                              View Full Image ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "var(--gray-500)",
                padding: "1rem",
              }}
            >
              No uploads yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
