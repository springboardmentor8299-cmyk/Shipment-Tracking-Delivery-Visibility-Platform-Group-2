import { useEffect, useState } from "react";
import {
  getAllRoutes,
  planRoute,
  optimizeRoute,
  getRouteHistory,
  calculateDistance,
  refreshRouteTraffic,
  getRouteAnalytics,
  updateRouteStatus,
  deleteRoute,
} from "../services/routeService";
import "../styles/Routemanagement.css";

const TABS = [
  { id: "routes", label: "Routes" },
  { id: "history", label: "Route History" },
  { id: "distance", label: "Distance Calculator" },
  { id: "analytics", label: "Analytics" },
];

const STATUS_OPTIONS = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
  "CANCELLED",
];

const badgeClass = (value) =>
  `rm-badge rm-badge-${String(value || "")
    .toLowerCase()
    .replace(/_/g, "-")}`;

const fmt = (value, suffix = "", digits = 1) =>
  value === null || value === undefined || isNaN(value)
    ? "--"
    : `${Number(value).toFixed(digits)}${suffix}`;

export default function RouteManagement() {
  const [tab, setTab] = useState("routes");

  return (
    <div className="rm-wrapper">
      <div className="rm-header">
        <div>
          <h2>Route Management</h2>
          <p className="rm-subtitle">
            Plan, optimize, and monitor delivery routes — with traffic-aware
            ETAs and analytics.
          </p>
        </div>
      </div>

      <div className="rm-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`rm-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "routes" && <RoutesTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "distance" && <DistanceCalculatorTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

// Tab 1: Routes — planning, optimization, traffic, lifecycle
function RoutesTab() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [syncNotice, setSyncNotice] = useState(null);

  const [form, setForm] = useState({
    routeName: "",
    origin: "",
    destination: "",
    assignedTrackingId: "",
    notes: "",
  });

  const load = async (status) => {
    setLoading(true);
    try {
      const data = await getAllRoutes(status || undefined);
      setRoutes(data || []);
    } catch (err) {
      console.error("Failed to load routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  const handlePlan = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await planRoute(form);
      setForm({
        routeName: "",
        origin: "",
        destination: "",
        assignedTrackingId: "",
        notes: "",
      });
      setShowForm(false);
      showSyncNotice(res);
      load(statusFilter);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not plan this route. Check the addresses and try again.",
      );
    }
  };

  const showSyncNotice = (route) => {
    if (!route || route.shipmentSynced === undefined) return;
    setSyncNotice({
      ok: !!route.shipmentSynced,
      message: route.shipmentSyncMessage || "",
    });
    // Auto-dismiss after a few seconds
    setTimeout(() => setSyncNotice(null), 6000);
  };

  const handleOptimize = async (id) => {
    setBusyId(id);
    try {
      const res = await optimizeRoute(id, "SHORTEST");
      showSyncNotice(res);
      load(statusFilter);
    } catch (err) {
      console.error("Optimize failed:", err);
      alert(
        "Optimization failed — the routing service may be unavailable right now.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRefreshTraffic = async (id) => {
    setBusyId(id);
    try {
      const res = await refreshRouteTraffic(id);
      showSyncNotice(res);
      load(statusFilter);
    } catch (err) {
      console.error("Traffic refresh failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      await updateRouteStatus(id, status);
      load(statusFilter);
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await deleteRoute(id);
      load(statusFilter);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="rm-toolbar">
        <select
          className="rm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          className="rm-btn rm-btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Plan New Route"}
        </button>
      </div>

      {syncNotice && (
        <p
          className={
            syncNotice.ok
              ? "rm-sync-notice rm-sync-ok"
              : "rm-sync-notice rm-sync-warn"
          }
        >
          {syncNotice.ok ? "✅ " : "ℹ️ "}
          {syncNotice.message}
        </p>
      )}

      {showForm && (
        <form className="rm-form" onSubmit={handlePlan}>
          <div className="rm-form-grid">
            <input
              placeholder="Route name (optional)"
              value={form.routeName}
              onChange={(e) => setForm({ ...form, routeName: e.target.value })}
            />
            <input
              placeholder="Origin (e.g. Delhi, India)"
              required
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
            <input
              placeholder="Destination (e.g. Mumbai, India)"
              required
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value })
              }
            />
            <input
              placeholder="Linked tracking ID (optional)"
              value={form.assignedTrackingId}
              onChange={(e) =>
                setForm({ ...form, assignedTrackingId: e.target.value })
              }
            />
            <input
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rm-form-notes"
            />
          </div>
          {error && <p className="rm-error">{error}</p>}
          <button type="submit" className="rm-btn rm-btn-primary">
            Plan Route
          </button>
        </form>
      )}

      {loading ? (
        <p className="rm-empty">Loading routes...</p>
      ) : routes.length === 0 ? (
        <p className="rm-empty">
          No routes yet. Click "Plan New Route" to create one.
        </p>
      ) : (
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Origin → Destination</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Traffic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="rm-route-code">{r.routeCode}</div>
                    {r.routeName && (
                      <div className="rm-route-name">{r.routeName}</div>
                    )}
                    {r.assignedTrackingId && (
                      <div className="rm-route-linked">
                        ↳ {r.assignedTrackingId}
                      </div>
                    )}
                  </td>
                  <td>
                    {r.origin} → {r.destination}
                  </td>
                  <td>
                    {r.optimized ? (
                      <>
                        <div className="rm-strike">
                          {fmt(r.distanceKm, " km")}
                        </div>
                        <div className="rm-optimized-value">
                          {fmt(r.optimizedDistanceKm, " km")}
                        </div>
                        {r.optimizationSavingsPercent != null && (
                          <div className="rm-savings">
                            -
                            {fmt(
                              Math.max(r.optimizationSavingsPercent, 0),
                              "%",
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      fmt(r.distanceKm, " km")
                    )}
                  </td>
                  <td>
                    {fmt(r.durationMinutes, " min", 0)}
                    {r.trafficAdjustedDurationMinutes != null && (
                      <div className="rm-traffic-adjusted">
                        ~{fmt(r.trafficAdjustedDurationMinutes, " min", 0)} w/
                        traffic
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={badgeClass(r.trafficCondition)}>
                      {r.trafficCondition || "UNKNOWN"}
                    </span>
                  </td>
                  <td>
                    <span className={badgeClass(r.status)}>{r.status}</span>
                  </td>
                  <td className="rm-actions">
                    <button
                      className="rm-link-btn"
                      disabled={busyId === r.id}
                      onClick={() => handleOptimize(r.id)}
                      title={
                        r.optimized
                          ? "Recalculate again (e.g. after traffic/addresses changed)"
                          : "Recalculate the shortest route"
                      }
                    >
                      {r.optimized ? "Re-optimize" : "Optimize"}
                    </button>
                    <button
                      className="rm-link-btn"
                      disabled={busyId === r.id}
                      onClick={() => handleRefreshTraffic(r.id)}
                      title="Refresh traffic-aware ETA"
                    >
                      Refresh Traffic
                    </button>
                    <select
                      className="rm-select rm-select-sm"
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rm-link-btn rm-link-danger"
                      disabled={busyId === r.id}
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Tab 2: Route History
function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRouteHistory()
      .then((data) => setHistory(data || []))
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="rm-empty">Loading history...</p>;
  if (history.length === 0) {
    return <p className="rm-empty">No completed or archived routes yet.</p>;
  }

  return (
    <div className="rm-table-wrap">
      <table className="rm-table">
        <thead>
          <tr>
            <th>Route</th>
            <th>Origin → Destination</th>
            <th>Distance</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {history.map((r) => (
            <tr key={r.id}>
              <td>
                <div className="rm-route-code">{r.routeCode}</div>
                {r.routeName && (
                  <div className="rm-route-name">{r.routeName}</div>
                )}
              </td>
              <td>
                {r.origin} → {r.destination}
              </td>
              <td>
                {fmt(r.optimized ? r.optimizedDistanceKm : r.distanceKm, " km")}
              </td>
              <td>
                {fmt(
                  r.optimized ? r.optimizedDurationMinutes : r.durationMinutes,
                  " min",
                  0,
                )}
              </td>
              <td>
                <span className={badgeClass(r.status)}>{r.status}</span>
              </td>
              <td>
                {r.completedAt
                  ? new Date(r.completedAt).toLocaleString()
                  : "--"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tab 3: Distance Calculator
function DistanceCalculatorTab() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await calculateDistance(origin, destination);
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not resolve one or both addresses.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-calculator">
      <form className="rm-form" onSubmit={handleCalculate}>
        <div className="rm-form-grid">
          <input
            placeholder="Origin address"
            required
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            placeholder="Destination address"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        {error && <p className="rm-error">{error}</p>}
        <button
          type="submit"
          className="rm-btn rm-btn-primary"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Distance"}
        </button>
      </form>

      {result && (
        <div className="rm-result-grid">
          <div className="rm-result-card">
            <span className="rm-result-label">Driving Distance</span>
            <span className="rm-result-value">
              {fmt(result.drivingDistanceKm, " km")}
            </span>
          </div>
          <div className="rm-result-card">
            <span className="rm-result-label">Driving Duration</span>
            <span className="rm-result-value">
              {fmt(result.drivingDurationMinutes, " min", 0)}
            </span>
          </div>
          <div className="rm-result-card">
            <span className="rm-result-label">Straight-Line Distance</span>
            <span className="rm-result-value">
              {fmt(result.straightLineDistanceKm, " km")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab 4: Analytics
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRouteAnalytics()
      .then(setData)
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="rm-empty">Loading analytics...</p>;
  if (!data)
    return <p className="rm-empty">Analytics unavailable right now.</p>;

  return (
    <div>
      <div className="rm-stats-grid">
        <StatBox label="Total Routes" value={data.totalRoutes} />
        <StatBox label="Planned" value={data.plannedCount} />
        <StatBox label="Active" value={data.activeCount} />
        <StatBox label="Completed" value={data.completedCount} />
        <StatBox label="Archived" value={data.archivedCount} />
        <StatBox label="Cancelled" value={data.cancelledCount} />
        <StatBox
          label="Avg Distance"
          value={fmt(data.averageDistanceKm, " km")}
        />
        <StatBox
          label="Avg Duration"
          value={fmt(data.averageDurationMinutes, " min", 0)}
        />
        <StatBox
          label="Total Distance"
          value={fmt(data.totalDistanceKm, " km", 0)}
        />
        <StatBox label="Optimized Routes" value={data.optimizedRouteCount} />
        <StatBox
          label="Avg Optimization Savings"
          value={fmt(data.averageOptimizationSavingsPercent, "%")}
        />
      </div>

      <div className="rm-analytics-row">
        <div className="rm-panel">
          <h4>Traffic Breakdown</h4>
          {data.trafficBreakdown &&
          Object.keys(data.trafficBreakdown).length > 0 ? (
            <ul className="rm-breakdown-list">
              {Object.entries(data.trafficBreakdown).map(
                ([condition, count]) => (
                  <li key={condition}>
                    <span className={badgeClass(condition)}>{condition}</span>
                    <span className="rm-breakdown-count">{count}</span>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="rm-empty">No data yet.</p>
          )}
        </div>

        <div className="rm-panel">
          <h4>Longest Route</h4>
          {data.longestRoute ? (
            <RouteSummaryCard summary={data.longestRoute} />
          ) : (
            <p className="rm-empty">No data yet.</p>
          )}

          <h4 style={{ marginTop: "18px" }}>Shortest Route</h4>
          {data.shortestRoute ? (
            <RouteSummaryCard summary={data.shortestRoute} />
          ) : (
            <p className="rm-empty">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rm-statbox">
      <div className="rm-statbox-value">{value}</div>
      <div className="rm-statbox-label">{label}</div>
    </div>
  );
}

function RouteSummaryCard({ summary }) {
  return (
    <div className="rm-summary-card">
      <div className="rm-route-code">{summary.routeCode}</div>
      <div>
        {summary.origin} → {summary.destination}
      </div>
      <div className="rm-summary-distance">
        {fmt(summary.distanceKm, " km")}
      </div>
    </div>
  );
}
