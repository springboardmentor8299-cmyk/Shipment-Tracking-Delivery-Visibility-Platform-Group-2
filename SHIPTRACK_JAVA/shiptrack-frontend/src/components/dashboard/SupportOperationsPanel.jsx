import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

const STATUS_BADGE = {
    OPEN: "bg-secondary",
    IN_PROGRESS: "bg-primary",
    RESOLVED: "bg-success",
    CLOSED: "bg-dark"
};

const PRIORITY_BADGE = {
    LOW: "bg-success",
    MEDIUM: "bg-info",
    HIGH: "bg-warning text-dark",
    URGENT: "bg-danger"
};

const CATEGORY_BADGE = {
    SUPPORT: "bg-info",
    COMPLAINT: "bg-danger",
    BILLING: "bg-warning text-dark",
    DELIVERY: "bg-primary",
    OTHER: "bg-secondary"
};

const CHART_COLORS = ["#0d6efd", "#6f42c1", "#d63384", "#fd7e14", "#198754", "#dc3545", "#0dcaf0"];

function OverviewCard({ label, value, icon, color, hint }) {
    return (
        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-center">
                    <div className={`bg-${color}-subtle rounded-circle p-3 me-3`}>
                        <i className={`bi ${icon} text-${color} fs-4`}></i>
                    </div>
                    <div>
                        <h6 className="text-muted mb-0 small">{label}</h6>
                        <h4 className="fw-bold mb-0">{value}</h4>
                        {hint && <div className="small text-muted">{hint}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SupportOperationsPanel({ showHeader = true }) {

    const [overview, setOverview] = useState(null);
    const [staff, setStaff] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        status: ""
    });

    const [assignBusyId, setAssignBusyId] = useState(null);
    const [staffBusyId, setStaffBusyId] = useState(null);

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    const fetchTickets = async (filtersToUse) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filtersToUse).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });
            const response = await api.get(
                `/admin/support/tickets?${params.toString()}`,
                authConfig()
            );
            setTickets(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load support tickets.");
        }
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [overviewRes, staffRes, analyticsRes] =
                await Promise.all([
                    api.get("/admin/support/overview", authConfig()),
                    api.get("/admin/support/staff", authConfig()),
                    api.get("/admin/support/analytics", authConfig())
                ]);

            setOverview(overviewRes.data);
            setStaff(staffRes.data || []);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load support overview.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchAll();
            fetchTickets({ status: "" });
        });
        
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => fetchTickets(filters));
        
    }, [filters]);

    const refreshSection = () => {
        fetchAll();
        fetchTickets(filters);
    };

    const assignTicket = async (ticketId, userId) => {
        try {
            setAssignBusyId(ticketId);
            const params = new URLSearchParams();
            if (userId) {
                params.append("userId", userId);
            }
            await api.put(
                `/admin/support/tickets/${ticketId}/assign?${params.toString()}`,
                {},
                authConfig()
            );
            toast.success("Ticket assignment updated.");
            refreshSection();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update ticket assignment.");
        } finally {
            setAssignBusyId(null);
        }
    };

    const toggleStaffActive = async (agent) => {
        try {
            setStaffBusyId(agent.userId);
            await api.put(
                `/admin/support/staff/${agent.userId}/active?active=${!agent.active}`,
                {},
                authConfig()
            );
            toast.success(
                `${agent.fullName} ${agent.active ? "deactivated" : "activated"}.`
            );
            refreshSection();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update staff status.");
        } finally {
            setStaffBusyId(null);
        }
    };

    const statusChartData = analytics?.statusBreakdown
        ? Object.entries(analytics.statusBreakdown)
            .filter(([name]) => name !== "ESCALATED")
            .map(([name, value]) => ({ name, value }))
        : [];

    const staffPerformance = analytics?.staffPerformance || [];

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3">Loading Support Operations...</p>
            </div>
        );
    }

    return (
        <div>

            {showHeader && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Support Operations</h2>
                        <p className="text-muted mb-0">
                            Monitor tickets, manage support staff and complaints.
                        </p>
                    </div>
                    <span className="badge bg-primary fs-6 px-3 py-2">
                        Total Tickets: {overview?.totalTickets || 0}
                    </span>
                </div>
            )}

            {}
            <div className="row g-3 mb-4">
                <OverviewCard label="Open" value={overview?.openTickets || 0} icon="bi-inbox-fill" color="secondary" />
                <OverviewCard label="In Progress" value={overview?.inProgressTickets || 0} icon="bi-hourglass-split" color="primary" />
                <OverviewCard label="Resolved" value={overview?.resolvedTickets || 0} icon="bi-check-circle-fill" color="success" />
                <OverviewCard label="Unassigned" value={overview?.unassignedTickets || 0} icon="bi-person-dash-fill" color="info" />
                <OverviewCard label="Overdue (48h)" value={overview?.overdueTickets || 0} icon="bi-alarm-fill" color="danger" />
                <OverviewCard label="Support Staff" value={overview?.supportStaffCount || 0} icon="bi-headset" color="primary" />
                <OverviewCard label="Avg Response" value={overview ? `${overview.avgResponseHours}h` : "--"} icon="bi-stopwatch-fill" color="success" />
            </div>

            {}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h4 className="mb-3">Ticket Monitoring</h4>

                    <div className="row g-3 mb-3">
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                {Object.keys(STATUS_BADGE).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Subject</th>
                                    <th>Priority</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4">
                                            No tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
                                            <td>
                                                <div className="fw-semibold">{ticket.customerName || "--"}</div>
                                                <div className="small text-muted">{ticket.customerEmail || ""}</div>
                                            </td>
                                            <td>
                                                <div>{ticket.subject}</div>
                                                {ticket.trackingNumber && (
                                                    <div className="small text-muted">TN: {ticket.trackingNumber}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${PRIORITY_BADGE[ticket.priority] || "bg-secondary"}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${CATEGORY_BADGE[ticket.category] || "bg-secondary"}`}>
                                                    {ticket.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${STATUS_BADGE[ticket.status] || "bg-secondary"}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={ticket.assignedUserId || ""}
                                                    disabled={assignBusyId === ticket.id}
                                                    onChange={(e) =>
                                                        assignTicket(ticket.id, e.target.value)
                                                    }
                                                >
                                                    <option value="">Unassigned</option>
                                                    {staff.map((agent) => (
                                                        <option key={agent.userId} value={agent.userId}>
                                                            {agent.fullName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                {ticket.createdAt
                                                    ? new Date(ticket.createdAt).toLocaleString()
                                                    : "--"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h4 className="mb-3">Support Staff Management</h4>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Assigned</th>
                                    <th>Open</th>
                                    <th>Resolved</th>
                                    <th>Avg Resolution</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-4">
                                            No support staff found. Assign ROLE_SUPPORT to a user first.
                                        </td>
                                    </tr>
                                ) : (
                                    staff.map((agent) => (
                                        <tr key={agent.userId}>
                                            <td className="fw-semibold">{agent.fullName}</td>
                                            <td>{agent.email}</td>
                                            <td>{agent.phone || "--"}</td>
                                            <td>
                                                <span className={`badge ${agent.active ? "bg-success" : "bg-secondary"}`}>
                                                    {agent.active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>{agent.totalAssignedTickets}</td>
                                            <td>{agent.openAssignedTickets}</td>
                                            <td>{agent.resolvedAssignedTickets}</td>
                                            <td>{agent.avgResolutionHours}h</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${agent.active ? "btn-outline-warning" : "btn-outline-success"}`}
                                                    disabled={staffBusyId === agent.userId}
                                                    onClick={() => toggleStaffActive(agent)}
                                                >
                                                    {staffBusyId === agent.userId
                                                        ? "Updating..."
                                                        : agent.active
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h4 className="mb-3">Performance Analytics</h4>

                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <div className="card border-0 bg-primary-subtle">
                                <div className="card-body text-center">
                                    <h6 className="text-muted">Avg Response Time</h6>
                                    <h3 className="fw-bold">{analytics?.avgResponseHours ?? "--"}h</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 bg-success-subtle">
                                <div className="card-body text-center">
                                    <h6 className="text-muted">Avg Resolution Time</h6>
                                    <h3 className="fw-bold">{analytics?.avgResolutionHours ?? "--"}h</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-6 mx-auto">
                            <h6 className="text-center mb-3">Tickets by Status</h6>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={90}
                                        label
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-sm align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Assigned</th>
                                    <th>Open</th>
                                    <th>Resolved</th>
                                    <th>Avg Resolution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffPerformance.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-3">
                                            No staff performance data.
                                        </td>
                                    </tr>
                                ) : (
                                    staffPerformance.map((agent) => (
                                        <tr key={agent.userId}>
                                            <td className="fw-semibold">{agent.fullName}</td>
                                            <td>{agent.totalAssignedTickets}</td>
                                            <td>{agent.openAssignedTickets}</td>
                                            <td>{agent.resolvedAssignedTickets}</td>
                                            <td>{agent.avgResolutionHours}h</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default SupportOperationsPanel;
