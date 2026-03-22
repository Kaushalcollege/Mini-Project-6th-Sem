// src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import { Camera, Shield, Bell, Save } from "lucide-react";
import "./AdminSettings.css";

export function AdminSettings() {
  const [settings, setSettings] = useState({
    confidence: "75",
    twoFactor: false,
    emailAlerts: true,
  });
  const [savedMessage, setSavedMessage] = useState(false);

  // Load functional state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adminSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            color: "var(--gray-900)",
            marginBottom: "0.5rem",
          }}
        >
          System Settings
        </h2>
        <p style={{ color: "var(--gray-500)", fontSize: "0.95rem" }}>
          Configure live AI parameters and security.
        </p>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Camera size={20} color="var(--gray-600)" />
          <h3>AI Detection Engine</h3>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <p className="title">Minimum Confidence Threshold</p>
            <p className="desc">
              Ignore YOLO detections below this percentage.
            </p>
          </div>
          <select
            className="setting-select"
            value={settings.confidence}
            onChange={(e) => handleChange("confidence", e.target.value)}
          >
            <option value="50">50% (High Sensitivity)</option>
            <option value="75">75% (Balanced)</option>
            <option value="90">90% (Strict)</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Bell size={20} color="var(--gray-600)" />
          <h3>Notifications</h3>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <p className="title">Email Alerts</p>
            <p className="desc">
              Send emails to cleaning staff for high-priority violations.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => handleChange("emailAlerts", e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Shield size={20} color="var(--gray-600)" />
          <h3>Security</h3>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <p className="title">Two-Factor Authentication</p>
            <p className="desc">Require OTP for Admin Dashboard access.</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={(e) => handleChange("twoFactor", e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {savedMessage && (
          <span
            style={{
              color: "var(--emerald-600)",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Settings Saved!
          </span>
        )}
        <button
          onClick={handleSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.7rem 1.5rem",
            backgroundColor: "var(--emerald-600)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
}
