// src/components/IncidentTable.jsx
import React from "react";
import "./IncidentTable.css";

export function IncidentTable({ incidents = [] }) {
  // Filter for ONLY resolved (clean) incidents, then take the top 5
  const displayIncidents = incidents
    .filter((inc) => inc.status === "clean")
    .slice(0, 5);

  return (
    <div className="table-card">
      <div className="table-header">
        <h3 className="table-title">Recently Resolved Violations</h3>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Image</th>
            <th>Detected Class</th>
            <th>Confidence</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayIncidents.length > 0 ? (
            displayIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.timestamp}</td>
                <td>
                  <img
                    src={incident.image_url}
                    alt="Thumbnail"
                    className="img-placeholder"
                    style={{ objectFit: "cover" }}
                    crossOrigin="anonymous"
                  />
                </td>
                <td>{incident.detectedClass}</td>
                <td>{Math.round(incident.confidence * 100)}%</td>
                <td>
                  <span className="status-badge status-cleaned">Resolved</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                No resolved incidents yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
