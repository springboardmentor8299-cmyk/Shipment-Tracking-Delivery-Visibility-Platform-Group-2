import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/adminService";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import "./ReportsPage.css";

function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const COLORS = [
    "#f59e0b",
    "#38bdf8",
    "#6366f1",
    "#f97316",
    "#22c55e",
    "#ef4444"
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load shipment reports.");
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        name: "Pending",
        shortName: "Pending",
        value: stats.pending || 0
      },
      {
        name: "Picked Up",
        shortName: "Picked",
        value: stats.pickedUp || 0
      },
      {
        name: "In Transit",
        shortName: "Transit",
        value: stats.inTransit || 0
      },
      {
        name: "Out For Delivery",
        shortName: "Delivery",
        value: stats.outForDelivery || 0
      },
      {
        name: "Delivered",
        shortName: "Delivered",
        value: stats.delivered || 0
      },
      {
        name: "Cancelled",
        shortName: "Cancelled",
        value: stats.cancelled || 0
      }
    ];
  }, [stats]);

  const deliveredPercentage = useMemo(() => {
    if (!stats?.totalShipments) {
      return 0;
    }

    return Math.round(
      ((stats.delivered || 0) / stats.totalShipments) * 100
    );
  }, [stats]);

  const activeShipments = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return (
      (stats.pickedUp || 0) +
      (stats.inTransit || 0) +
      (stats.outForDelivery || 0)
    );
  }, [stats]);

  const customTooltipStyle = {
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "12px",
    color: "#f8fafc",
    boxShadow: "0 16px 35px rgba(0, 0, 0, 0.35)"
  };

  if (loading) {
    return (
      <div className="reports-state-page">
        <div className="reports-loader"></div>
        <h2>Loading reports</h2>
        <p>Preparing the latest shipment analytics.</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="reports-state-page">
        <div className="reports-error-icon">!</div>
        <h2>Unable to load reports</h2>
        <p>{error || "Report information is currently unavailable."}</p>

        <button type="button" onClick={loadReports}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-glow reports-glow-one"></div>
      <div className="reports-glow reports-glow-two"></div>

      <header className="reports-topbar">
        <Link to="/admin" className="reports-brand">
          <div className="reports-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Analytics & Reporting</small>
          </div>
        </Link>

        <div className="reports-topbar-actions">
          <button
            type="button"
            className="reports-refresh-button"
            onClick={loadReports}
          >
            <span>↻</span>
            Refresh
          </button>

          <Link
            to="/admin"
            className="reports-dashboard-button"
          >
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="reports-main">
        <section className="reports-hero">
          <div>
            <div className="reports-page-badge">
              <span></span>
              ANALYTICS OVERVIEW
            </div>

            <h1>Shipment Reports</h1>

            <p>
              Monitor shipment performance, delivery activity and platform
              growth through clear operational insights.
            </p>
          </div>

          <div className="reports-live-card">
            <span className="reports-live-dot"></span>

            <div>
              <strong>Live Analytics</strong>
              <small>Dashboard data is synchronized</small>
            </div>
          </div>
        </section>

        <section className="reports-summary-grid">
          <article className="reports-summary-card reports-users-card">
            <div className="reports-summary-top">
              <div className="reports-summary-icon">👥</div>
              <span className="reports-trend-badge">Platform</span>
            </div>

            <div className="reports-summary-content">
              <span>Total Users</span>
              <strong>{stats.totalUsers || 0}</strong>
              <p>Registered ShipTrack-Pro accounts</p>
            </div>
          </article>

          <article className="reports-summary-card reports-shipments-card">
            <div className="reports-summary-top">
              <div className="reports-summary-icon">📦</div>
              <span className="reports-trend-badge">All time</span>
            </div>

            <div className="reports-summary-content">
              <span>Total Shipments</span>
              <strong>{stats.totalShipments || 0}</strong>
              <p>Shipments registered on the platform</p>
            </div>
          </article>

          <article className="reports-summary-card reports-active-card">
            <div className="reports-summary-top">
              <div className="reports-summary-icon">➜</div>
              <span className="reports-trend-badge">Active</span>
            </div>

            <div className="reports-summary-content">
              <span>Active Deliveries</span>
              <strong>{activeShipments}</strong>
              <p>Shipments currently in delivery workflow</p>
            </div>
          </article>

          <article className="reports-summary-card reports-success-card">
            <div className="reports-summary-top">
              <div className="reports-summary-icon">✓</div>
              <span className="reports-trend-badge">
                {deliveredPercentage}%
              </span>
            </div>

            <div className="reports-summary-content">
              <span>Delivered</span>
              <strong>{stats.delivered || 0}</strong>
              <p>Successfully completed shipments</p>
            </div>
          </article>
        </section>

        <section className="reports-status-strip">
          {data.map((item, index) => (
            <article className="reports-status-item" key={item.name}>
              <div
                className="reports-status-icon"
                style={{
                  backgroundColor: `${COLORS[index]}18`,
                  color: COLORS[index]
                }}
              >
                {index === 0 && "◷"}
                {index === 1 && "↥"}
                {index === 2 && "➜"}
                {index === 3 && "🚚"}
                {index === 4 && "✓"}
                {index === 5 && "×"}
              </div>

              <div>
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="reports-chart-grid">
          <article className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <span className="reports-section-label">
                  DISTRIBUTION ANALYSIS
                </span>
                <h2>Shipment Status Distribution</h2>
                <p>
                  Percentage breakdown of shipments by current status.
                </p>
              </div>

              <div className="reports-chart-icon">◉</div>
            </div>

            <div className="reports-chart-area">
              <ResponsiveContainer width="100%" height={390}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    innerRadius={76}
                    outerRadius={125}
                    paddingAngle={4}
                    stroke="transparent"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={customTooltipStyle}
                    itemStyle={{ color: "#e2e8f0" }}
                    cursor={{ fill: "transparent" }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      color: "#94a3b8",
                      fontSize: "11px",
                      paddingTop: "18px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="reports-donut-center">
                <span>Total</span>
                <strong>{stats.totalShipments || 0}</strong>
                <small>Shipments</small>
              </div>
            </div>
          </article>

          <article className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <span className="reports-section-label">
                  STATUS COMPARISON
                </span>
                <h2>Shipment Status Count</h2>
                <p>
                  Compare the total number of shipments in each stage.
                </p>
              </div>

              <div className="reports-chart-icon">▥</div>
            </div>

            <div className="reports-chart-area reports-bar-chart-area">
              <ResponsiveContainer width="100%" height={390}>
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 15,
                    left: -15,
                    bottom: 15
                  }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeDasharray="4 6"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 10
                    }}
                  />

                  <Tooltip
                    contentStyle={customTooltipStyle}
                    labelStyle={{
                      color: "#93c5fd",
                      fontWeight: 700
                    }}
                    itemStyle={{ color: "#e2e8f0" }}
                    cursor={{
                      fill: "rgba(59, 130, 246, 0.06)"
                    }}
                  />

                  <Bar
                    dataKey="value"
                    name="Shipments"
                    radius={[8, 8, 3, 3]}
                    maxBarSize={44}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="reports-insights-card">
          <div className="reports-insights-heading">
            <div>
              <span className="reports-section-label">
                PERFORMANCE SUMMARY
              </span>
              <h2>Operational Insights</h2>
            </div>

            <span className="reports-generated-label">
              Based on current data
            </span>
          </div>

          <div className="reports-insights-grid">
            <article>
              <div className="reports-insight-icon blue">📦</div>

              <div>
                <span>Shipment Volume</span>
                <strong>{stats.totalShipments || 0}</strong>
                <p>Total shipments currently recorded.</p>
              </div>
            </article>

            <article>
              <div className="reports-insight-icon purple">➜</div>

              <div>
                <span>Active Pipeline</span>
                <strong>{activeShipments}</strong>
                <p>Shipments moving through delivery stages.</p>
              </div>
            </article>

            <article>
              <div className="reports-insight-icon green">✓</div>

              <div>
                <span>Delivery Success</span>
                <strong>{deliveredPercentage}%</strong>
                <p>Percentage of shipments successfully delivered.</p>
              </div>
            </article>

            <article>
              <div className="reports-insight-icon red">×</div>

              <div>
                <span>Cancelled Shipments</span>
                <strong>{stats.cancelled || 0}</strong>
                <p>Shipments removed from the delivery process.</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ReportsPage;