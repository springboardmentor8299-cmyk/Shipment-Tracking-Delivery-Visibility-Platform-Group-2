import { useEffect, useState } from "react";

import api from "../../api/axiosConfig";

function SystemHealth() {

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const serviceConfig = {

        Database: {
            icon: "bi-database-fill",
            color: "success"
        },

        Backend: {
            icon: "bi-hdd-network-fill",
            color: "success"
        },

        Authentication: {
            icon: "bi-shield-lock-fill",
            color: "success"
        },

        API: {
            icon: "bi-cloud-check-fill",
            color: "primary"
        }

    };

    const fetchSystemHealth = async () => {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(

                "/dashboard/system-health",

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            setServices(response.data || []);

        } catch (err) {

            console.error("Error fetching system health:", err);

            setError(

                err.response?.data?.message ||

                "Unable to load system health."

            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchSystemHealth();

    }, []);

    if (loading) {

        return (

            <div className="chart-card mt-5">

                <h4 className="dashboard-section-title">
                    System Health
                </h4>

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="mt-3 mb-0">

                        Loading system health...

                    </p>

                </div>

            </div>

        );

    }

    if (error) {

        return (

            <div className="chart-card mt-5">

                <h4 className="dashboard-section-title">
                    System Health
                </h4>

                <div className="alert alert-danger m-3 d-flex justify-content-between align-items-center">

                    <span>{error}</span>

                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={fetchSystemHealth}
                    >

                        Retry

                    </button>

                </div>

            </div>

        );

    }

    return (

        <div className="chart-card mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h4 className="dashboard-section-title mb-0">
                    System Health
                </h4>

                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchSystemHealth}
                >

                    <i className="bi bi-arrow-clockwise me-1"></i>

                    Refresh

                </button>

            </div>

            <div className="system-health-list">

                {services.length === 0 ? (

                    <div className="text-center py-5 text-muted">

                        <i
                            className="bi bi-heart-pulse-fill"
                            style={{ fontSize: "3rem" }}
                        ></i>

                        <h6 className="mt-3">

                            No system health information available

                        </h6>

                    </div>

                ) : (

                    services.map((service) => {

                        const config = serviceConfig[service.service] || {

                            icon: "bi-gear-fill",
                            color: "secondary"

                        };

                        return (

                            <div
                                key={service.service}
                                className="system-health-item"
                            >

                                <div className="d-flex align-items-center gap-3">

                                    <div
                                        className={`system-health-icon bg-${config.color}-subtle`}
                                    >

                                        <i
                                            className={`bi ${config.icon} text-${config.color}`}
                                        ></i>

                                    </div>

                                    <div>

                                        <h6 className="mb-1">

                                            {service.service}

                                        </h6>

                                        <small className="text-muted">

                                            {service.status || "Unknown"}

                                        </small>

                                    </div>

                                </div>

                                <span
                                    className={`badge ${
                                        service.status === "UP"
                                            ? "bg-success"
                                            : "bg-danger"
                                    }`}
                                >

                                    {service.status || "UNKNOWN"}

                                </span>

                            </div>

                        );

                    })

                )}

            </div>

        </div>

    );

}

export default SystemHealth;