import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    fetchAnalyticsOverview,
    fetchTrends,
    fetchStatusDistribution,
    fetchDeliveryReport,
    downloadDeliveryReportCsv,
} from "../../services/analyticsService";
import { getStatusLabel } from "../../utils/constants";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const STATUS_COLORS = {
    CREATED: "#F59E0B",
    PICKED_UP: "#F97316",
    AT_SORTING_FACILITY: "#D946EF",
    IN_TRANSIT: "#2563EB",
    OUT_FOR_DELIVERY: "#0EA5E9",
    DELIVERED: "#16A34A",
    CANCELLED: "#EF4444",
    RETURNED: "#64748B",
};

const REPORT_DAYS = [7, 30, 90];

const CHART_OPTIONS = [
    { value: 1, label: "Today" },
    { value: 7, label: "Last 7 days" },
    { value: 30, label: "Last 30 days" },
    { value: 90, label: "Last 90 days" },
];

function AnalyticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [statusDist, setStatusDist] = useState(null);
    const [report, setReport] = useState(null);
    const [reportDays, setReportDays] = useState(30);
    const [trendDays, setTrendDays] = useState(30);
    const [statusDays, setStatusDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [ov, tr, sd, rp] = await Promise.all([
                    fetchAnalyticsOverview(),
                    fetchTrends(trendDays),
                    fetchStatusDistribution(statusDays),
                    fetchDeliveryReport(reportDays),
                ]);
                setOverview(ov);
                setTrends(tr);
                setStatusDist(sd);
                setReport(rp);
                setError("");
            } catch {
                setError("Could not load analytics data.");
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadReport = async (days) => {
        try {
            setReport(await fetchDeliveryReport(days));
            setWarning("");
        } catch {
            setWarning("Could not refresh the delivery performance report. Showing the last loaded data.");
        }
    };

    const handleReportDaysChange = (days) => {
        setReportDays(days);
        loadReport(days);
    };

    const loadTrends = async (days) => {
        setTrendDays(days);
        try {
            setTrends(await fetchTrends(days));
            setWarning("");
        } catch {
            setWarning("Could not refresh shipment trends. Showing the last loaded data.");
        }
    };

    const loadStatusDistribution = async (days) => {
        setStatusDays(days);
        try {
            setStatusDist(await fetchStatusDistribution(days));
            setWarning("");
        } catch {
            setWarning("Could not refresh status distribution. Showing the last loaded data.");
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadDeliveryReportCsv(reportDays);
        } catch {
            setWarning("Could not download the report.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading analytics...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const byStatus = statusDist || overview?.byStatus || {};
    const statusEntries = Object.entries(byStatus).filter(([, count]) => count > 0);

    const doughnutData = {
        labels: statusEntries.map(([status]) => getStatusLabel(status)),
        datasets: [
            {
                data: statusEntries.map(([, count]) => count),
                backgroundColor: statusEntries.map(([status]) => STATUS_COLORS[status] || "#94A3B8"),
                borderWidth: 2,
            },
        ],
    };

    const barData = {
        labels: trends?.points?.map((p) => p.date.slice(5)) || [],
        datasets: [
            {
                label: "Created",
                data: trends?.points?.map((p) => p.created) || [],
                backgroundColor: "rgba(15,76,129,.75)",
            },
            {
                label: "Delivered",
                data: trends?.points?.map((p) => p.delivered) || [],
                backgroundColor: "rgba(22,163,74,.75)",
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
        },
    };

    return (
        <div>
            {warning && <div className="alert alert-warning">{warning}</div>}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon" style={{ backgroundColor: "#16A34A" }}>
                                <i className="bi bi-stopwatch"></i>
                            </div>
                            <div>
                                <div className="stat-title">On-Time Rate</div>
                                <div className="stat-value">{overview?.onTimeRate != null ? `${overview.onTimeRate}%` : "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon" style={{ backgroundColor: "#2563EB" }}>
                                <i className="bi bi-clock"></i>
                            </div>
                            <div>
                                <div className="stat-title">Avg Delivery Time</div>
                                <div className="stat-value">{overview?.avgDeliveryHours != null ? `${overview.avgDeliveryHours} hrs` : "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon" style={{ backgroundColor: "#0EA5E9" }}>
                                <i className="bi bi-rulers"></i>
                            </div>
                            <div>
                                <div className="stat-title">Avg Distance</div>
                                <div className="stat-value">{overview?.avgDistanceKm != null ? `${overview.avgDistanceKm} km` : "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon" style={{ backgroundColor: "#F59E0B" }}>
                                <i className="bi bi-pie-chart"></i>
                            </div>
                            <div>
                                <div className="stat-title">Total Delivered</div>
                                <div className="stat-value">{overview?.delivered ?? 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-7">
                    <div className="chart-card">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0">Shipment Trends</h4>
                            <select className="form-select form-select-sm" style={{ width: "auto" }} value={trendDays} onChange={(e) => loadTrends(Number(e.target.value))}>
                                {CHART_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="chart-card">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0">Status Distribution</h4>
                            <select className="form-select form-select-sm" style={{ width: "auto" }} value={statusDays} onChange={(e) => loadStatusDistribution(Number(e.target.value))}>
                                {CHART_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ height: 300 }}>
                            {statusEntries.length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <p className="text-muted text-center">No shipment data yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="recent-card">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h4 className="mb-0">Delivery Performance Report</h4>
                    <div className="d-flex align-items-center gap-2">
                        <select className="form-select form-select-sm" style={{ width: "auto" }} value={reportDays} onChange={(e) => handleReportDaysChange(Number(e.target.value))}>
                            {REPORT_DAYS.map((d) => (
                                <option key={d} value={d}>Last {d} days</option>
                            ))}
                        </select>
                        <button className="btn btn-primary bluebtn btn-sm" onClick={handleDownload} disabled={downloading}>
                            {downloading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>Downloading...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-download me-1"></i>Download CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {report && (
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Total</th>
                                    <th>Delivered</th>
                                    <th>On Time</th>
                                    <th>Late</th>
                                    <th>On-Time Rate</th>
                                    <th>Avg Delivery (hrs)</th>
                                    <th>Avg Distance (km)</th>
                                    <th>Created</th>
                                    <th>Picked Up</th>
                                    <th>At Sorting</th>
                                    <th>In Transit</th>
                                    <th>Out for Del.</th>
                                    <th>Cancelled</th>
                                    <th>Returned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(report.rows || []).map((row) => (
                                    <tr key={row.periodFrom}>
                                        <td>{row.periodFrom}</td>
                                        <td>{row.totalShipments}</td>
                                        <td>{row.delivered}</td>
                                        <td>{row.onTime}</td>
                                        <td>{row.late}</td>
                                        <td>
                                            <span className={`badge ${row.onTimeRate != null && row.onTimeRate >= 80 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                                                {row.onTimeRate != null ? `${row.onTimeRate}%` : "-"}
                                            </span>
                                        </td>
                                        <td>{row.avgDeliveryHours != null ? row.avgDeliveryHours : "-"}</td>
                                        <td>{row.avgDistanceKm != null ? row.avgDistanceKm : "-"}</td>
                                        <td>{row.created}</td>
                                        <td>{row.pickedUp}</td>
                                        <td>{row.atSortingFacility}</td>
                                        <td>{row.inTransit}</td>
                                        <td>{row.outForDelivery}</td>
                                        <td>{row.cancelled}</td>
                                        <td>{row.returned}</td>
                                    </tr>
                                ))}
                                <tr className="table-active fw-semibold">
                                    <td>
                                        Total ({report.periodFrom} — {report.periodTo})
                                    </td>
                                    <td>{report.totalShipments}</td>
                                    <td>{report.delivered}</td>
                                    <td>{report.onTime}</td>
                                    <td>{report.late}</td>
                                    <td>
                                        <span className={`badge ${report.onTimeRate != null && report.onTimeRate >= 80 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                                            {report.onTimeRate != null ? `${report.onTimeRate}%` : "-"}
                                        </span>
                                    </td>
                                    <td>{report.avgDeliveryHours != null ? report.avgDeliveryHours : "-"}</td>
                                    <td>{report.avgDistanceKm != null ? report.avgDistanceKm : "-"}</td>
                                    <td>{report.created}</td>
                                    <td>{report.pickedUp}</td>
                                    <td>{report.atSortingFacility}</td>
                                    <td>{report.inTransit}</td>
                                    <td>{report.outForDelivery}</td>
                                    <td>{report.cancelled}</td>
                                    <td>{report.returned}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
