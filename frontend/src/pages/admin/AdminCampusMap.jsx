// src/pages/admin/AdminCampusMap.jsx
import React, { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import "./AdminCampusMap.css";

export function AdminCampusMap() {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/incidents")
      .then((res) => res.json())
      .then((data) => {
        // 1. Define our static map coordinates with active and total counters
        const mapGrid = [
          {
            id: "Main Building",
            name: "Main Building",
            x: 25,
            y: 20,
            total: 0,
            active: 0,
          },
          {
            id: "Cafeteria",
            name: "Cafeteria",
            x: 60,
            y: 35,
            total: 0,
            active: 0,
          },
          { id: "Library", name: "Library", x: 40, y: 60, total: 0, active: 0 },
          {
            id: "Sports Complex",
            name: "Sports Complex",
            x: 75,
            y: 70,
            total: 0,
            active: 0,
          },
          {
            id: "Parking Area",
            name: "Parking Area",
            x: 15,
            y: 75,
            total: 0,
            active: 0,
          },
          {
            id: "Hostel Block A",
            name: "Hostel Block A",
            x: 85,
            y: 25,
            total: 0,
            active: 0,
          },
          {
            id: "Campus Default",
            name: "General Campus Area",
            x: 50,
            y: 50,
            total: 0,
            active: 0,
          },
        ];

        // 2. Aggregate REAL database violations into the zones
        if (Array.isArray(data)) {
          data.forEach((incident) => {
            // Check if the AI actually detected trash here (ignores purely clean uploads)
            if (
              incident.detectedClass !== "None" &&
              incident.detectedClass !== "Clean Area"
            ) {
              const zoneIndex = mapGrid.findIndex(
                (z) => z.id === incident.location,
              );
              const targetIndex = zoneIndex !== -1 ? zoneIndex : 6; // Fallback to index 6

              // Increment historical total
              mapGrid[targetIndex].total += 1;

              // Increment active count if it hasn't been resolved yet
              if (
                incident.status === "violation" ||
                incident.status === "pending"
              ) {
                mapGrid[targetIndex].active += 1;
              }
            }
          });
        }

        // 3. Assign alert colors based on HISTORICAL TOTALS (creating a heatmap)
        const processedZones = mapGrid.map((zone) => ({
          ...zone,
          status:
            zone.total >= 3 ? "alert" : zone.total > 0 ? "warning" : "clean",
        }));

        setZones(processedZones);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch map data:", err);
        setIsLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    if (status === "alert") return "var(--red-500)";
    if (status === "warning") return "var(--amber-500)";
    return "var(--emerald-500)";
  };

  return (
    <div>
      <div className="map-header">
        <h2>Campus Hotspot Map</h2>
        <p>Historical heatmap of all reported violations across campus.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <Loader2
            className="lucide-spin"
            size={32}
            color="var(--emerald-600)"
            style={{ margin: "0 auto", animation: "spin 2s linear infinite" }}
          />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: "1rem", color: "var(--gray-500)" }}>
            Plotting historical data points...
          </p>
        </div>
      ) : (
        <div className="map-grid-layout">
          {/* Left Side: The Visual Map */}
          <div className="campus-map-visual">
            <div className="map-container">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="map-marker"
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                >
                  <div
                    className="marker-dot"
                    style={{ backgroundColor: getStatusColor(zone.status) }}
                  />
                  <span className="marker-label">{zone.name}</span>
                </div>
              ))}
            </div>

            <div className="map-legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "var(--emerald-500)" }}
                />
                <span>Clean (0)</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "var(--amber-500)" }}
                />
                <span>Warning (1-2)</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "var(--red-500)" }}
                />
                <span>Alert (3+)</span>
              </div>
            </div>
          </div>

          {/* Right Side: Zone List */}
          <div className="zone-list-card">
            <h3 className="zone-list-title">Historical Zone Stats</h3>
            <div>
              {zones.map((zone) => (
                <div key={zone.id} className="zone-item">
                  <div className="zone-info">
                    <MapPin size={16} color="var(--gray-400)" />
                    <div>
                      <p className="zone-name">{zone.name}</p>
                      <p className="zone-stats">
                        <strong style={{ color: "var(--gray-700)" }}>
                          {zone.total}
                        </strong>{" "}
                        total
                        <span
                          style={{
                            color:
                              zone.active > 0
                                ? "var(--red-500)"
                                : "var(--gray-400)",
                            marginLeft: "4px",
                          }}
                        >
                          ({zone.active} active)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(zone.status) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
