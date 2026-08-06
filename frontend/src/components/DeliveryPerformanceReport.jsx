import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllShipments } from "../services/shipmentService";
import "../styles/DeliveryPerformanceReport.css";

const FINAL_STATUSES = ["DELIVERED", "CANCELLED"];

function daysBetween(a, b) {
    const ms = new Date(b) - new Date(a);
    return ms / (1000 * 60 * 60 * 24);
}

function toCsv(rows) {
    const header = ["Tracking ID", "Customer", "Status", "Shipment Date", "Target Delivery Date", "Overdue"];
    const lines = rows.map((r) =>
        [r.trackingId, r.customerName, r.status, r.shipmentDate, r.deliveryDate, r.overdue ? "Yes" : "No"]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
    );
    return [header.join(","), ...lines].join("\n");
}

export default function DeliveryPerformanceReport() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllShipments();
            setShipments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load shipments for performance report:", err);
            setError("Could not load shipment data for this report.");
        } finally {
            setLoading(false);
        }
    };

    const today = useMemo(() => new Date(), []);

    const rows = useMemo(
        () =>
            shipments.map((s) => {
                const status = String(s.status || "").toUpperCase();
                const isFinal = FINAL_STATUSES.includes(status);
                const overdue = !isFinal && s.deliveryDate && new Date(s.deliveryDate) < today;
                return { ...s, status, overdue };
            }),
        [shipments, today],
    );

    const stats = useMemo(() => {
        const total = rows.length;
        const delivered = rows.filter((r) => r.status === "DELIVERED").length;
        const cancelled = rows.filter((r) => r.status === "CANCELLED").length;
        const overdue = rows.filter((r) => r.overdue).length;
        const inProgress = total - delivered - cancelled;

        const plannedWindows = rows
            .filter((r) => r.shipmentDate && r.deliveryDate)
            .map((r) => daysBetween(r.shipmentDate, r.deliveryDate))
            .filter((d) => Number.isFinite(d) && d >= 0);

        const avgPlannedDays = plannedWindows.length
            ? plannedWindows.reduce((a, b) => a + b, 0) / plannedWindows.length
            : null;

        return { total, delivered, cancelled, inProgress, overdue, avgPlannedDays };
    }, [rows]);

    const overdueByStatus = useMemo(() => {
        const buckets = {};
        rows
            .filter((r) => r.overdue)
            .forEach((r) => {
                buckets[r.status] = (buckets[r.status] || 0) + 1;
            });
        return Object.entries(buckets).map(([status, count]) => ({ status: status.replace(/_/g, " "), count }));
    }, [rows]);

    const handleExport = () => {
        const csv = toCsv(rows);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `delivery-performance-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <p className="dpr-muted">Loading delivery performance…</p>;
    if (error) return <p className="dpr-error">{error}</p>;

    return (
        <div className="dpr-wrapper">
            <div className="dpr-header">
                <h3>Delivery Performance Report</h3>
                <button className="dpr-export-btn" onClick={handleExport}>
                    Export CSV
                </button>
            </div>

            <div className="dpr-stat-grid">
                <div className="dpr-stat">
                    <span className="dpr-stat-value">{stats.total}</span>
                    <span className="dpr-stat-label">Total shipments</span>
                </div>
                <div className="dpr-stat">
                    <span className="dpr-stat-value dpr-green">{stats.delivered}</span>
                    <span className="dpr-stat-label">Delivered</span>
                </div>
                <div className="dpr-stat">
                    <span className="dpr-stat-value dpr-blue">{stats.inProgress}</span>
                    <span className="dpr-stat-label">In progress</span>
                </div>
                <div className="dpr-stat">
                    <span className="dpr-stat-value dpr-red">{stats.overdue}</span>
                    <span className="dpr-stat-label">Overdue (past target date, not yet delivered)</span>
                </div>
                <div className="dpr-stat">
                    <span className="dpr-stat-value">
                        {stats.avgPlannedDays !== null ? stats.avgPlannedDays.toFixed(1) : "—"}
                    </span>
                    <span className="dpr-stat-label">Avg. planned transit (days)</span>
                </div>
            </div>

            {overdueByStatus.length > 0 && (
                <div className="dpr-chart-card">
                    <h4>Overdue shipments by current status</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={overdueByStatus}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <p className="dpr-note">
                "Overdue" compares each shipment's target delivery date against today for shipments not yet delivered
                or cancelled. On-time-vs-late tracking for already-delivered shipments needs an actual-delivered
                timestamp, which the backend doesn't record yet — happy to add that alongside the Proof of Delivery
                backend if useful.
            </p>
        </div>
    );
}
