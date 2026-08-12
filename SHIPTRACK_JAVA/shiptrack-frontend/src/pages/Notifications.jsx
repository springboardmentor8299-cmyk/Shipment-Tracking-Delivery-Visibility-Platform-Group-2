import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Notifications() {

    const [notifications, setNotifications] = useState([]);

    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {

        loadNotifications();

    }, []);

    const getHeaders = () => {

        const token = localStorage.getItem("token");

        return {

            headers: {
                Authorization: `Bearer ${token}`
            }

        };
    };

    const loadNotifications = async () => {

        try {

            setLoading(true);
            setError("");

            const [notificationResponse, unreadResponse] =
                await Promise.all([

                    api.get(
                        "/notifications",
                        getHeaders()
                    ),

                    api.get(
                        "/notifications/unread-count",
                        getHeaders()
                    )

                ]);

            setNotifications(
                notificationResponse.data
            );

            setUnreadCount(
                unreadResponse.data
            );

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load notifications."
            );

        } finally {

            setLoading(false);

        }

    };

    const refreshNotifications = async () => {

        try {

            setRefreshing(true);

            await loadNotifications();

        } finally {

            setRefreshing(false);

        }

    };


    const markAsRead = async (id) => {

        try {

            await api.put(
                `/notifications/${id}/read`,
                {},
                getHeaders()
            );

            await loadNotifications();

        } catch (err) {

            console.error(err);

            alert("Unable to mark notification as read.");

        }

    };

    const markAllAsRead = async () => {

        try {

            await api.put(
                "/notifications/read-all",
                {},
                getHeaders()
            );

            await loadNotifications();

        } catch (err) {

            console.error(err);

            alert("Unable to mark all notifications as read.");

        }

    };

    const deleteNotification = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/notifications/${id}`,
                getHeaders()
            );

            await loadNotifications();

        } catch (err) {

            console.error(err);

            alert("Unable to delete notification.");

        }

    };

    return (

        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">
                        Notifications
                    </h2>

                    <p className="text-muted mb-0">
                        Total Unread : <strong>{unreadCount}</strong>
                    </p>

                </div>

                <div className="d-flex gap-2">

                    <button
                        className="btn btn-primary"
                        onClick={refreshNotifications}
                        disabled={refreshing}
                    >
                        {
                            refreshing
                                ? "Refreshing..."
                                : "Refresh"
                        }
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={markAllAsRead}
                        disabled={
                            notifications.length === 0 ||
                            unreadCount === 0
                        }
                    >
                        Mark All Read
                    </button>

                </div>

            </div>

            {
                loading && (

                    <div className="text-center py-5">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                    </div>

                )
            }

            {
                !loading && error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )
            }

            {
                !loading &&
                !error &&
                notifications.length === 0 && (

                    <div className="card shadow-sm">

                        <div className="card-body text-center py-5">

                            <h4>No Notifications</h4>

                            <p className="text-muted mb-0">

                                You don't have any notifications yet.

                            </p>

                        </div>

                    </div>

                )
            }

            {
                !loading &&
                !error &&
                notifications.length > 0 && (

                    <div className="row">

                        {

                            notifications.map((notification) => (

                                <div
                                    className="col-lg-6 mb-4"
                                    key={notification.id}
                                >

                                    <div
                                        className={
                                            notification.read
                                                ? "card shadow-sm border-0"
                                                : "card shadow border-primary border-2"
                                        }
                                    >

                                        <div className="card-body">

                                            <div className="d-flex justify-content-between align-items-start">

                                                <div>

                                                    <h5>

                                                        {notification.title}

                                                    </h5>

                                                    <span
                                                        className={
                                                            notification.type === "SUCCESS"
                                                                ? "badge bg-success"
                                                                : notification.type === "WARNING"
                                                                    ? "badge bg-warning text-dark"
                                                                    : notification.type === "ERROR"
                                                                        ? "badge bg-danger"
                                                                        : "badge bg-primary"
                                                        }
                                                    >

                                                        {notification.type}

                                                    </span>

                                                </div>

                                                {

                                                    !notification.read && (

                                                        <span className="badge bg-danger">

                                                            New

                                                        </span>

                                                    )

                                                }

                                            </div>

                                            <hr />

                                            <p>

                                                {notification.message}

                                            </p>

                                            <small className="text-muted">

                                                {

                                                    new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()

                                                }

                                            </small>

                                            <div className="mt-3 d-flex gap-2">

                                                {

                                                    !notification.read && (

                                                        <button
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={() =>
                                                                markAsRead(notification.id)
                                                            }
                                                        >
                                                            Mark Read
                                                        </button>

                                                    )

                                                }

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        deleteNotification(notification.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ))

                        }

                    </div>

                )
            }

        </div>

    );

}

export default Notifications;