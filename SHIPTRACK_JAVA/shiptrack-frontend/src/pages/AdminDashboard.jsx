import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import ManagementPanel from "../components/dashboard/ManagementPanel";
import UserAnalyticsSection from "../components/dashboard/UserAnalyticsSection";
import ShipmentAnalyticsSection from "../components/dashboard/ShipmentAnalyticsSection";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import AdminStatsCards from "../components/dashboard/AdminStatsCards";
import ShipmentGraphs from "../components/dashboard/ShipmentGraphs";
import SystemHealth from "../components/dashboard/SystemHealth";
import QuickActions from "../components/dashboard/QuickActions";
import DeliveryConfirmationsPanel from "../components/dashboard/DeliveryConfirmationsPanel";

import "../styles/admin-dashboard.css";

function AdminDashboard() {

    const [userAnalytics, setUserAnalytics] = useState(null);
    const [shipmentAnalytics, setShipmentAnalytics] = useState(null);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [shipmentRequests, setShipmentRequests] = useState([]);
    const [perDay, setPerDay] = useState([]);
    const [deliveriesPerMonth, setDeliveriesPerMonth] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingResponseId, setSendingResponseId] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [composeTitle, setComposeTitle] = useState("");
    const [composeMessage, setComposeMessage] = useState("");
    const [composeTarget, setComposeTarget] = useState("ROLE_SUPPORT");
    const [composeSending, setComposeSending] = useState(false);

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true);

                const token = localStorage.getItem("token");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [

                    userResponse,
                    shipmentResponse,
                    monthlyTrendResponse,
                    requestResponse,
                    perDayResponse,
                    deliveriesPerMonthResponse,
                    topDriversResponse,
                    topCustomersResponse

                ] = await Promise.all([

                    api.get("/users/analytics", config),

                    api.get("/shipments/analytics", config),

                    api.get("/shipments/monthly-trend", config),

                    api.get("/shipment-requests", config),

                    api.get("/shipments/analytics/per-day?days=14", config),

                    api.get("/shipments/analytics/deliveries-per-month", config),

                    api.get("/shipments/analytics/top-drivers?limit=5", config),

                    api.get("/shipments/analytics/top-customers?limit=5", config)

                ]);

                setUserAnalytics(userResponse.data);

                setShipmentAnalytics(shipmentResponse.data);

                setMonthlyTrend(monthlyTrendResponse.data);

                setShipmentRequests(requestResponse.data || []);

                setPerDay(perDayResponse.data || []);

                setDeliveriesPerMonth(deliveriesPerMonthResponse.data || []);

                setTopDrivers(topDriversResponse.data || []);

                setTopCustomers(topCustomersResponse.data || []);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        Promise.resolve().then(fetchDashboardData);

    }, []);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {

        const refreshAnalytics = async () => {

            try {

                const token = localStorage.getItem("token");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [userResponse, shipmentResponse] = await Promise.all([
                    api.get("/users/analytics", config),
                    api.get("/shipments/analytics", config)
                ]);

                setUserAnalytics(userResponse.data);
                setShipmentAnalytics(shipmentResponse.data);

            } catch (error) {

                console.error(error);

            }

        };

        const interval = setInterval(refreshAnalytics, 30000);

        return () => clearInterval(interval);

    }, []);

    const adminAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    const loadNotifications = async () => {
        try {
            const response = await api.get("/notifications", adminAuthConfig());
            setNotifications(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {}, adminAuthConfig());
            await loadNotifications();
        } catch (error) {
            toast.error("Failed to mark notification as read.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put("/notifications/read-all", {}, adminAuthConfig());
            await loadNotifications();
        } catch (error) {
            toast.error("Failed to mark notifications as read.");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`, adminAuthConfig());
            await loadNotifications();
        } catch (error) {
            toast.error("Failed to delete notification.");
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
                adminAuthConfig()
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

    const sendShipmentRequestResponse = async (request, shipmentCreated) => {
        const adminMessage = shipmentCreated
            ? ""
            : window.prompt(
                "Enter message for customer",
                "Shipment could not be created at this time."
            );

        if (!shipmentCreated && adminMessage === null) {
            return;
        }

        try {
            setSendingResponseId(request.id);

            const token = localStorage.getItem("token");

            const response = await api.put(
                `/shipment-requests/${request.id}/response`,
                {
                    shipmentCreated,
                    message: adminMessage || ""
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setShipmentRequests((currentRequests) =>
                currentRequests.map((currentRequest) =>
                    currentRequest.id === request.id
                        ? response.data
                        : currentRequest
                )
            );

            toast.success(
                "Response sent to user.",
                {
                    position: "top-right"
                }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Failed to send response to user.",
                {
                    position: "top-right"
                }
            );
        } finally {
            setSendingResponseId(null);
        }
    };

    const userChartData = userAnalytics

        ? [

            {
                role: "Admin",
                count: userAnalytics.ROLE_ADMIN || 0
            },

            {
                role: "Customer",
                count: userAnalytics.ROLE_CUSTOMER || 0
            },

            {
                role: "Support",
                count: userAnalytics.ROLE_SUPPORT || 0
            }

        ]

        : [];

    const shipmentChartData = shipmentAnalytics

        ? [

            {
                name: "Created",
                value: shipmentAnalytics.Created || 0
            },

            {
                name: "Pending",
                value: shipmentAnalytics.Pending || 0
            },

            {
                name: "In Transit",
                value: shipmentAnalytics["In Transit"] || 0
            },

            {
                name: "Picked Up",
                value: shipmentAnalytics["Picked Up"] || 0
            },

            {
                name: "Out For Delivery",
                value: shipmentAnalytics["Out For Delivery"] || 0
            },

            {
                name: "Delivered",
                value: shipmentAnalytics.Delivered || 0
            },

            {
                name: "Cancelled",
                value: shipmentAnalytics.Cancelled || 0
            },

            {
                name: "Delivery Failed",
                value: shipmentAnalytics["Delivery Failed"] || 0
            }

        ]

        : [];

    if (loading) {

        return (

            <div className="container text-center mt-5">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p className="mt-3">

                    Loading Dashboard...

                </p>

            </div>

        );

    }

    return (

        <div className="admin-dashboard">

            <div className="container-fluid">

                <DashboardHeader />

                <AdminStatsCards
                    userAnalytics={userAnalytics}
                    shipmentAnalytics={shipmentAnalytics}
                />

                <ManagementPanel />

                <UserAnalyticsSection
                    userAnalytics={userAnalytics}
                    userChartData={userChartData}
                />

                <ShipmentAnalyticsSection
                    shipmentAnalytics={shipmentAnalytics}
                    shipmentChartData={shipmentChartData}
                />

                <MonthlyTrendChart
                    monthlyTrend={monthlyTrend}
                />

                <ShipmentGraphs
                    perDay={perDay}
                    deliveriesPerMonth={deliveriesPerMonth}
                    delayPercentage={shipmentAnalytics?.["Delay Percentage"] || 0}
                    topDrivers={topDrivers}
                    topCustomers={topCustomers}
                />

                <DeliveryConfirmationsPanel />

                <SystemHealth />

                <QuickActions />

                <div className="card shadow border-0 mt-5 mb-4">
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
                                            <div className="fw-bold">{notification.title}</div>
                                            <div className="text-muted">{notification.message}</div>
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

                <div className="card shadow border-0 mt-5 mb-4">
                    <div className="card-body">
                        <h4 className="mb-3">Shipment Creation Requests</h4>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Sender</th>
                                        <th>Receiver</th>
                                        <th>Source</th>
                                        <th>Destination</th>
                                        <th>Weight</th>
                                        <th>Requested</th>
                                        <th>Response</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipmentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-4">
                                                No shipment creation requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        shipmentRequests.map((request) => (
                                            <tr key={request.id}>
                                                <td>{request.id}</td>
                                                <td>{request.customerName || "--"}</td>
                                                <td>{request.customerEmail || "--"}</td>
                                                <td>{request.customerPhone || "--"}</td>
                                                <td>{request.senderName}</td>
                                                <td>{request.receiverName}</td>
                                                <td>{request.sourceAddress}</td>
                                                <td>{request.destinationAddress}</td>
                                                <td>{request.packageWeight}</td>
                                                <td>{request.requestedStatus}</td>
                                                <td>
                                                    {request.responseSent ? (
                                                        <div>
                                                            <span
                                                                className={`badge ${request.shipmentCreated ? "bg-success" : "bg-warning text-dark"}`}
                                                            >
                                                                {request.shipmentCreated ? "Created" : "Not Created"}
                                                            </span>
                                                            <div className="small text-muted mt-1">
                                                                {request.respondedAt
                                                                    ? new Date(request.respondedAt).toLocaleString()
                                                                    : ""}
                                                            </div>
                                                            {request.createdShipmentId ? (
                                                                <div className="small">
                                                                    Shipment ID: {request.createdShipmentId}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-secondary">Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            disabled={
                                                                request.responseSent ||
                                                                sendingResponseId === request.id
                                                            }
                                                            onClick={() =>
                                                                sendShipmentRequestResponse(request, true)
                                                            }
                                                        >
                                                            {sendingResponseId === request.id
                                                                ? "Sending..."
                                                                : "Created"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            disabled={
                                                                request.responseSent ||
                                                                sendingResponseId === request.id
                                                            }
                                                            onClick={() =>
                                                                sendShipmentRequestResponse(request, false)
                                                            }
                                                        >
                                                            Not Created
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

            </div>

        </div>

    );

}

export default AdminDashboard;
