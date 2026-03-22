// src/components/MetricCard.jsx
import React from "react";
import "./MetricCard.css";

export function MetricCard({ title, value, icon, trend, variant }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <p className="metric-title">{title}</p>
        <div className={`metric-icon-wrapper metric-icon-${variant}`}>
          {icon}
        </div>
      </div>
      <p className="metric-value">{value}</p>
      <p className={`metric-trend trend-${variant}`}>{trend}</p>
    </div>
  );
}
