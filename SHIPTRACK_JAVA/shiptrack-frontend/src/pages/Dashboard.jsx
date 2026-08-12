import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import DashboardChart from "../components/DashboardChart";
import ThemeToggle from "../components/dashboard/ThemeToggle";

function Dashboard() {

    const navigate = useNavigate();

    const role =
        localStorage.getItem("role");

    const [stats, setStats] = useState({
        totalShipments: 0,
        delivered: 0,
        inTransit: 0,
        pending: 0
    });


    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response =
                await api.get(
                    "/dashboard/stats",
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

    return (

        <div className="container-fluid py-5 px-4 dashboard-page">

            <div className="d-flex justify-content-end mb-4">

                <ThemeToggle />

            </div>

            <h1 className="text-center mb-4">

                Dashboard

            </h1>

            <p className="text-center">

                Logged in as:

                <strong>
                    {" "}
                    {localStorage.getItem("email")}
                </strong>

                {" | "}

                <strong>
                    {role}
                </strong>

            </p>

            <section className="dashboard-surface dashboard-stats-surface">
            <div className="row">

                <div className="col-md-3 mb-4">
                    <div className="card text-center shadow-sm h-100 border-0 dashboard-stat-card dashboard-stat-total">
                        <div className="card-body">
                            <h5>Total Shipments</h5>
                            <h2>{stats.totalShipments}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-4">
                    <div className="card text-center shadow-sm h-100 border-0 dashboard-stat-card dashboard-stat-delivered">
                        <div className="card-body">
                            <h5>Delivered</h5>
                            <h2>{stats.delivered}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-4">
                    <div className="card text-center shadow-sm h-100 border-0 dashboard-stat-card dashboard-stat-transit">
                        <div className="card-body">
                            <h5>In Transit</h5>
                            <h2>{stats.inTransit}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-4">
                    <div className="card text-center shadow-sm h-100 border-0 dashboard-stat-card dashboard-stat-pending">
                        <div className="card-body">
                            <h5>Pending</h5>
                            <h2>{stats.pending}</h2>
                        </div>
                    </div>
                </div>

            </div>
            </section>

            <section className="dashboard-surface dashboard-main-surface mt-4">
            <div className="row g-4 align-items-stretch">
                <div className="col-lg-4">
                    <section className="dashboard-actions h-100">
                        <h3 className="mb-4">
                            Quick Actions
                        </h3>

                        <div className="d-grid gap-3 dashboard-actions-grid">
                            <button
                                className="btn dashboard-action-button dashboard-action-view"
                                onClick={() =>
                                    navigate("/shipments")
                                }
                            >
                                View Shipments
                            </button>

                            {role === "ROLE_ADMIN" && (

                                <button
                                    className="btn dashboard-action-button dashboard-action-create"
                                    onClick={() =>
                                        navigate("/create-shipment")
                                    }
                                >
                                    Create Shipment
                                </button>

                            )}

                            <button
                                className="btn dashboard-action-button dashboard-action-track"
                                onClick={() =>
                                    navigate("/track-shipment")
                                }
                            >
                                Track Shipment
                            </button>
                        </div>
                    </section>
                </div>

                <div className="col-lg-8">
                    <section className="dashboard-chart-panel h-100">
                        <h3 className="mb-4 text-center text-lg-start">
                            Shipment Analytics
                        </h3>

                        <DashboardChart
                            stats={stats}
                        />
                    </section>
                </div>
            </div>
            </section>

        </div>
    );
}

export default Dashboard;
