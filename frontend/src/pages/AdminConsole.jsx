// src/pages/AdminConsole.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Map,
  Settings,
  LogOut,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import "./AdminConsole.css";
import cmrLogo from "../assets/cmrlogo.png";

// Import our custom widgets
import { MetricCard } from "../components/MetricCard";
import { WeeklyChart } from "../components/WeeklyChart";
import { IncidentTable } from "../components/IncidentTable";

// Import the Admin Pages
import { AdminIncidentLogs } from "./admin/AdminIncidentLogs";
import { AdminCampusMap } from "./admin/AdminCampusMap";
import { AdminSettings } from "./admin/AdminSettings";

function AdminConsole() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard State
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({ today: 0, active: 0, resolved: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // 1. Authenticate User
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      navigate("/student");
      return;
    }
    setUser(parsedUser);

    // 2. Load cached incidents from localStorage for instant UI rendering
    const cachedIncidents = localStorage.getItem("adminIncidents");
    if (cachedIncidents) {
      processDashboardData(JSON.parse(cachedIncidents));
    }

    // 3. Fetch fresh data from backend
    fetch("http://127.0.0.1:8000/admin/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Save to state and localStorage
          setIncidents(data);
          localStorage.setItem("adminIncidents", JSON.stringify(data));
          processDashboardData(data);
        }
      })
      .catch((err) => console.error("Failed to fetch admin incidents:", err));
  }, [navigate]);

  // Helper function to calculate all the numbers for the dashboard
  const processDashboardData = (data) => {
    setIncidents(data);

    // Get today's date formatted like "Mar 22, 2026"
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Calculate Metrics
    const todayCount = data.filter((inc) =>
      inc.timestamp.includes(todayStr),
    ).length;
    const activeCount = data.filter((inc) => inc.status === "violation").length;
    const resolvedCount = data.filter((inc) => inc.status === "clean").length;

    setMetrics({
      today: todayCount,
      active: activeCount,
      resolved: resolvedCount,
    });

    // Aggregate Weekly Chart Data
    const daysTemplate = [
      { day: "Sun", incidents: 0 },
      { day: "Mon", incidents: 0 },
      { day: "Tue", incidents: 0 },
      { day: "Wed", incidents: 0 },
      { day: "Thu", incidents: 0 },
      { day: "Fri", incidents: 0 },
      { day: "Sat", incidents: 0 },
    ];

    data.forEach((inc) => {
      // Extract just the date part before the hyphen "Mar 22, 2026 - 02:30 PM"
      const datePart = inc.timestamp.split(" - ")[0];
      const dateObj = new Date(datePart);
      if (!isNaN(dateObj.getTime())) {
        daysTemplate[dateObj.getDay()].incidents += 1;
      }
    });

    setChartData(daysTemplate);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminIncidents");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={cmrLogo} alt="CMR Logo" className="sidebar-logo" />
          <span className="sidebar-title">Civic Sense Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === "incidents" ? "active" : ""}`}
            onClick={() => setActiveTab("incidents")}
          >
            <FileText size={18} />
            Incident Logs
          </button>
          <button
            className={`nav-item ${activeTab === "map" ? "active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            <Map size={18} />
            Campus Map
          </button>
          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ color: "var(--red-600)" }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-user-info">
            <ShieldCheck size={18} color="var(--emerald-600)" />
            <span>Admin: {user.username}</span>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "dashboard" && (
            <>
              <div className="dashboard-header">
                <h2>Overview Dashboard</h2>
                <p>Real-time AI monitoring statistics across the campus.</p>
              </div>

              {/* Metric Cards Row */}
              <div className="metrics-grid">
                <MetricCard
                  title="Total Reports Today"
                  value={metrics.today}
                  icon={<Clock size={20} />}
                  trend="Real-time aggregation"
                  variant="neutral"
                />
                <MetricCard
                  title="Active Violations"
                  value={metrics.active}
                  icon={<AlertCircle size={20} />}
                  trend="Requires dispatch"
                  variant="alert"
                />
                <MetricCard
                  title="Clean Areas Verified"
                  value={metrics.resolved}
                  icon={<CheckCircle2 size={20} />}
                  trend="No action needed"
                  variant="success"
                />
              </div>

              {/* Chart Row */}
              <div className="charts-section">
                <WeeklyChart chartData={chartData} />
              </div>

              {/* Table Row */}
              <div className="table-section">
                <IncidentTable incidents={incidents} />
              </div>
            </>
          )}

          {/* Active Tab Routing */}
          {activeTab === "incidents" && <AdminIncidentLogs />}
          {activeTab === "map" && <AdminCampusMap />}

          {/* Placeholders for remaining tabs */}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}

export default AdminConsole;
