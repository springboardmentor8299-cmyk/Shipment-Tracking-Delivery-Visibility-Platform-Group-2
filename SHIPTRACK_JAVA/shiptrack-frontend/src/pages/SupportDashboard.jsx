import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";
import DeliveryConfirmationsPanel from "../components/dashboard/DeliveryConfirmationsPanel";
import ThemeToggle from "../components/dashboard/ThemeToggle";

import "../styles/support-dashboard.css";

function SupportDashboard() {

    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyForm, setReplyForm] = useState({
        ticketId: null,
        responseMessage: "",
        status: "IN_PROGRESS"
    });
    const [replyLoading, setReplyLoading] = useState(false);

    const [stats, setStats] = useState({
        Total: 0,
        Created: 0,
        Pending: 0,
        "In Transit": 0,
        "Out For Delivery": 0,
        Delivered: 0,
        Cancelled: 0
    });

    const [ticketFrom, setTicketFrom] = useState("");
    const [ticketTo, setTicketTo] = useState("");
    const [ticketStatus, setTicketStatus] = useState("");
    const [ticketPriority, setTicketPriority] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [composeTitle, setComposeTitle] = useState("");
    const [composeMessage, setComposeMessage] = useState("");
    const [composeTarget, setComposeTarget] = useState("ROLE_ADMIN");
    const [composeSending, setComposeSending] = useState(false);

    const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "ESCALATED"];

    const fetchStats = async () => {

        try {

            const token =
                localStorage.getItem("token");

                const response =
                await api.get(
                    "/shipments/analytics",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setStats(response.data);

        } catch (error) {

            console.error(error);
        }
    };

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/support-requests", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTickets(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    const loadNotifications = async () => {
        try {
            const response = await api.get("/notifications", authConfig());
            setNotifications(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {}, authConfig());
            await loadNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put("/notifications/read-all", {}, authConfig());
            await loadNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`, authConfig());
            await loadNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const sendNotification = async () => {
        if (!composeTitle.trim() || !composeMessage.trim()) {
            toast.error("Please provide a subject and message.");
            return;
        }
        setComposeSending(true);
        try {
            const response = await api.post(
                "/notifications/send",
                {
                    title: composeTitle.trim(),
                    message: composeMessage.trim(),
                    type: "INFO",
                    role: composeTarget
                },
                authConfig()
            );
            toast.success(response.data || "Message sent.");
            setComposeTitle("");
            setComposeMessage("");
            await loadNotifications();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send message."
            );
        } finally {
            setComposeSending(false);
        }
    };

    useEffect(() => {

        Promise.resolve().then(() => {
            fetchStats();
            fetchTickets();
            loadNotifications();
        });

    }, []);

    const submitReply = async (e) => {
        e.preventDefault();
        if (!replyForm.ticketId || !replyForm.responseMessage.trim()) {
            return;
        }

        try {
            setReplyLoading(true);
            const token = localStorage.getItem("token");
            await api.put(
                `/support-requests/${replyForm.ticketId}`,
                {
                    status: replyForm.status,
                    responseMessage: replyForm.responseMessage.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setReplyForm({
                ticketId: null,
                responseMessage: "",
                status: "IN_PROGRESS"
            });
            setSelectedTicket(null);
            toast.success("Support response sent to customer.");
            fetchTickets();
        } catch (error) {
            console.error(error);
        } finally {
            setReplyLoading(false);
        }
    };

    const chartData = [
        {
            name: "Created",
            value: stats.Created || 0
        },
        {
            name: "Delivered",
            value: stats.Delivered || 0
        },
        {
            name: "In Transit",
            value: stats["In Transit"] || 0
        },
        {
            name: "Pending",
            value: stats.Pending || 0
        },
        {
            name: "Out For Delivery",
            value: stats["Out For Delivery"] || 0
        },
        {
            name: "Cancelled",
            value: stats.Cancelled || 0
        }
    ];

    const filteredTickets = tickets.filter((ticket) => {

        if (ticketStatus && ticket.status !== ticketStatus) {
            return false;
        }

        if (ticketPriority && ticket.priority !== ticketPriority) {
            return false;
        }

        const created = ticket.createdAt ? String(ticket.createdAt).slice(0, 10) : "";

        if (ticketFrom && created && created < ticketFrom) {
            return false;
        }

        if (ticketTo && created && created > ticketTo) {
            return false;
        }

        return true;

    });

    const totalTickets = filteredTickets.length;
    const openTickets = filteredTickets.filter((ticket) => ticket.status === "OPEN").length;
    const inProgressTickets = filteredTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
    const resolvedTickets = filteredTickets.filter((ticket) => ticket.status === "RESOLVED").length;
    const escalatedTickets = filteredTickets.filter((ticket) => ticket.status === "ESCALATED").length;

    const todayKey = new Date().toDateString();
    const resolvedToday = filteredTickets.filter((ticket) => {
        if (!ticket.resolvedAt) return false;
        return new Date(ticket.resolvedAt).toDateString() === todayKey;
    }).length;

    const resolutionRate = totalTickets === 0
        ? 0
        : Math.round((resolvedTickets * 100) / totalTickets);

    const resolutionTimes = filteredTickets
        .filter((ticket) => ticket.resolvedAt && ticket.createdAt)
        .map((ticket) =>
            (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / 3600000
        );
    const avgResolutionHours = resolutionTimes.length === 0
        ? 0
        : Math.round(
            (resolutionTimes.reduce((sum, value) => sum + value, 0) /
                resolutionTimes.length) * 10
        ) / 10;

    return (

        <div className="support-dashboard-page">

            <div className="container-fluid mt-4 mb-5 support-dashboard-content px-4">

            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">

                <h2 className="mb-0">
                    Support Dashboard
                </h2>

                <ThemeToggle />

            </div>

            {}

            <div className="row mb-4">

                <div className="col-md-3">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Total Shipments</h6>

                            <h3>
                                {stats.Total || 0}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Delivered</h6>

                            <h3>
                                {stats.Delivered || 0}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>In Transit</h6>

                            <h3>
                                {stats["In Transit"] || 0}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Pending</h6>

                            <h3>
                                {stats.Pending || 0}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

            <div className="row g-3 mb-4">

                <div className="col-md-4">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Created</h6>

                            <h3>
                                {stats.Created || 0}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Out For Delivery</h6>

                            <h3>
                                {stats["Out For Delivery"] || 0}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card shadow border-0">

                        <div className="card-body text-center">

                            <h6>Cancelled</h6>

                            <h3>
                                {stats.Cancelled || 0}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

            {}

            <h4 className="dashboard-section-title mb-3">
                Support Ticket Summary
            </h4>

            <div className="row g-3 mb-4">

                <div className="col-md-4 col-lg">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h6>Total Tickets</h6>
                            <h3>{totalTickets}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h6>Open</h6>
                            <h3 className="text-primary">{openTickets}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h6>In Progress</h6>
                            <h3 className="text-warning">{inProgressTickets}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h6>Resolved</h6>
                            <h3 className="text-success">{resolvedTickets}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h6>Escalated</h6>
                            <h3 className="text-danger">{escalatedTickets}</h3>
                        </div>
                    </div>
                </div>

            </div>

            {}

            <div className="row g-3 mb-4">

                <div className="col-12">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4 className="mb-3">
                                Support Performance
                            </h4>

                            <div className="row g-3">

                                <div className="col-6">
                                    <div className="border rounded p-3 text-center">
                                        <h6 className="text-muted">Avg Resolution Time</h6>
                                        <h3 className="mb-0">
                                            {avgResolutionHours > 0
                                                ? `${avgResolutionHours}h`
                                                : "--"}
                                        </h3>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="border rounded p-3 text-center">
                                        <h6 className="text-muted">Resolved Today</h6>
                                        <h3 className="mb-0 text-success">
                                            {resolvedToday}
                                        </h3>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="border rounded p-3 text-center">
                                        <h6 className="text-muted">Resolution Rate</h6>
                                        <h3 className="mb-0 text-primary">
                                            {resolutionRate}%
                                        </h3>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Quick Actions
                    </h4>

                    <div className="d-flex gap-3 flex-wrap">

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate("/track-shipment")
                            }
                        >
                            Track Shipment
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() =>
                                navigate("/shipments")
                            }
                        >
                            View Shipments
                        </button>

                    </div>

                </div>

            </div>

            <div className="card shadow border-0 mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h4 className="mb-0">Support Tickets</h4>
                        <small className="text-muted">
                            Showing {filteredTickets.length} of {tickets.length} tickets
                        </small>
                    </div>

                    <div className="row g-2 mb-3">

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">From Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={ticketFrom}
                                onChange={(e) => setTicketFrom(e.target.value)}
                            />
                        </div>

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">To Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={ticketTo}
                                onChange={(e) => setTicketTo(e.target.value)}
                            />
                        </div>

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">Status</label>
                            <select
                                className="form-select"
                                value={ticketStatus}
                                onChange={(e) => setTicketStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">Priority</label>
                            <select
                                className="form-select"
                                value={ticketPriority}
                                onChange={(e) => setTicketPriority(e.target.value)}
                            >
                                <option value="">All Priorities</option>
                                {PRIORITY_OPTIONS.map((priority) => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-lg-4 d-flex align-items-end justify-content-lg-end">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setTicketFrom("");
                                    setTicketTo("");
                                    setTicketStatus("");
                                    setTicketPriority("");
                                }}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Clear Filters
                            </button>
                        </div>

                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Tracking No.</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Reply</th>
                                    <th>Created At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-4">
                                            No support tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.customerName || "--"}</td>
                                            <td>{ticket.customerEmail || "--"}</td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.trackingNumber || "--"}</td>
                                            <td>{ticket.status}</td>
                                            <td>{ticket.priority || "--"}</td>
                                            <td>{ticket.responseMessage || "--"}</td>
                                            <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "--"}</td>
                                            <td>
                                                <div className="d-flex gap-2 flex-wrap">

                                                    {ticket.trackingNumber && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() =>
                                                                navigate(`/pod/${ticket.trackingNumber}`)
                                                            }
                                                            title="Verify Proof of Delivery before closing this ticket"
                                                        >
                                                            <i className="bi bi-file-earmark-check me-1"></i>
                                                            Verify POD
                                                        </button>
                                                    )}

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setReplyForm({
                                                                ticketId: ticket.id,
                                                                responseMessage: ticket.responseMessage || "",
                                                                status: ticket.status || "IN_PROGRESS"
                                                            });
                                                        }}
                                                    >
                                                        Reply
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {replyForm.ticketId && (
                <div className="card shadow border-0 mb-4">
                    <div className="card-body">
                        <h4 className="mb-3">Update Ticket #{replyForm.ticketId}</h4>
                        {selectedTicket && (
                            <div className="alert alert-light border mb-3">
                                <div className="mb-2"><strong>Customer:</strong> {selectedTicket.customerName || "--"}</div>
                                <div className="mb-2"><strong>Email:</strong> {selectedTicket.customerEmail || "--"}</div>
                                <div className="mb-2"><strong>Subject:</strong> {selectedTicket.subject}</div>
                                <div className="mb-2"><strong>Tracking No.:</strong> {selectedTicket.trackingNumber || "--"}</div>
                                <div className="mb-0"><strong>Customer Message:</strong> {selectedTicket.message}</div>
                            </div>
                        )}
                        <form onSubmit={submitReply}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={replyForm.status}
                                        onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="ESCALATED">ESCALATED</option>
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label">Response Message</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={replyForm.responseMessage}
                                        onChange={(e) => setReplyForm({ ...replyForm, responseMessage: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                                    {replyLoading ? "Saving..." : "Send Update"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setReplyForm({ ticketId: null, responseMessage: "", status: "IN_PROGRESS" })}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeliveryConfirmationsPanel />

            {}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            <i className="bi bi-bell me-2"></i>
                            Notifications
                        </h4>

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleMarkAllRead}
                        >
                            Mark All as Read
                        </button>

                    </div>

                    <div className="border rounded p-3 mb-4 bg-light">

                        <h6 className="mb-3">
                            <i className="bi bi-send me-1"></i>
                            Send Notification
                        </h6>

                        <div className="row g-3">

                            <div className="col-md-3">

                                <select
                                    className="form-select"
                                    value={composeTarget}
                                    onChange={(event) => setComposeTarget(event.target.value)}
                                >
                                    <option value="ROLE_ADMIN">To Admins</option>
                                    <option value="ROLE_SUPPORT">To Support</option>
                                </select>

                            </div>

                            <div className="col-md-3">

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Subject"
                                    value={composeTitle}
                                    onChange={(event) => setComposeTitle(event.target.value)}
                                />

                            </div>

                            <div className="col-md-4">

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Write your message..."
                                    value={composeMessage}
                                    onChange={(event) => setComposeMessage(event.target.value)}
                                />

                            </div>

                            <div className="col-md-2 d-grid">

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={composeSending}
                                    onClick={sendNotification}
                                >
                                    {composeSending ? "Sending..." : "Send"}
                                </button>

                            </div>

                        </div>

                    </div>

                    {notifications.length === 0 ? (

                        <div className="alert alert-info">
                            No notifications yet.
                        </div>

                    ) : (

                        <div className="list-group">

                            {notifications.map((notification) => (

                                <div
                                    key={notification.id}
                                    className={`list-group-item d-flex justify-content-between align-items-start gap-3 ${notification.read ? "" : "list-group-item-warning"}`}
                                >

                                    <div>

                                        <div className="fw-bold">
                                            {notification.title}
                                        </div>

                                        <div className="text-muted">
                                            {notification.message}
                                        </div>

                                        {notification.senderName && (
                                            <div className="small text-muted">
                                                From: {notification.senderName}
                                            </div>
                                        )}

                                        <div className="small text-muted">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </div>

                                    </div>

                                    <div className="d-flex gap-1 flex-shrink-0">

                                        {!notification.read && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleMarkRead(notification.id)}
                                            >
                                                Read
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

            {}

            <div className="card shadow border-0">

                <div className="card-body">

                    <h4 className="mb-3">
                        Shipment Status Overview
                    </h4>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={120}
                                label
                            >

                                <Cell fill="#198754" />
                                <Cell fill="#0d6efd" />
                                <Cell fill="#fd7e14" />

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>

            </div>

        </div>
    );
}

export default SupportDashboard;
