// src/components/UploadHistory.jsx
import React from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import "./UploadHistory.css";

export function UploadHistory({ history = [] }) {
  return (
    <div className="history-card">
      <h3 className="history-header">Recent Uploads</h3>

      <div className="history-list">
        {history.map((item, index) => (
          <div key={index} className="history-item">
            {item.status === "clean" ? (
              <CheckCircle2 size={18} color="var(--emerald-600)" />
            ) : (
              <AlertCircle size={18} color="var(--red-600)" />
            )}

            <div className="history-item-content">
              <p className="history-item-title">
                {item.status === "clean"
                  ? "Clean Area Verified"
                  : "Violation Reported"}
              </p>
              <p className="history-item-time">
                <Clock size={12} />
                {item.time || "Just now"}
              </p>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-400)" }}>
              No uploads yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
