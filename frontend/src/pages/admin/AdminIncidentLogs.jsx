// src/pages/admin/AdminIncidentLogs.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle2 } from "lucide-react";
import "./AdminIncidentLogs.css";

export function AdminIncidentLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIncidents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch incidents:", err);
        setIsLoading(false);
      });
  }, []);

  const handleResolve = async (formattedId) => {
    // Extract the raw integer ID from "INC-1"
    const rawId = formattedId.replace("INC-", "");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/incidents/${rawId}/resolve`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        // Update the UI locally so we don't have to refresh the whole page
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === formattedId ? { ...inc, status: "clean" } : inc,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.detectedClass.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="logs-header-section">
        <div className="logs-title">
          <h2>Incident Logs</h2>
          <p>
            Complete history of all reported and detected campus violations.
          </p>
        </div>

        <div className="logs-controls">
          <div className="search-box">
            <Search size={18} color="var(--gray-400)" />
            <input
              type="text"
              placeholder="Search by ID, user, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="action-btn">
            <Filter size={16} /> Filter
          </button>
          <button className="action-btn">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="logs-table-container">
        <table className="full-table">
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Date & Time</th>
              <th>Reported By</th>
              <th>Detected Item</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading database records...
                </td>
              </tr>
            ) : filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td style={{ fontWeight: "500", color: "var(--gray-900)" }}>
                    {incident.id}
                  </td>
                  <td>{incident.timestamp}</td>
                  <td>{incident.reportedBy}</td>
                  <td>
                    {incident.detectedClass}
                    {incident.confidence > 0 && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--gray-400)",
                          marginLeft: "8px",
                        }}
                      >
                        ({Math.round(incident.confidence * 100)}%)
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${incident.status === "clean" ? "status-cleaned" : "status-pending"}`}
                    >
                      {incident.status === "clean" ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {incident.status !== "clean" ? (
                      <button
                        onClick={() => handleResolve(incident.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "var(--emerald-600)",
                          gap: "0.3rem",
                          fontWeight: "500",
                          fontSize: "0.85rem",
                        }}
                        title="Mark as resolved"
                      >
                        <CheckCircle2 size={18} /> Resolve
                      </button>
                    ) : (
                      <span
                        style={{
                          color: "var(--gray-400)",
                          fontSize: "0.85rem",
                        }}
                      >
                        No action needed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No incidents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
