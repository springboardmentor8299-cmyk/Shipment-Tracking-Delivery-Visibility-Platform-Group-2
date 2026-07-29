import { useState, useEffect } from "react";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import RecentShipments from "../../components/dashboard/RecentShipments";
import ShipmentDetailModal from "../../components/support/ShipmentDetailModal";
import EditShipmentModal from "../../components/support/EditShipmentModal";
import QueriesPanel from "../../components/support/QueriesPanel";
import { fetchStats } from "../../services/shipmentService";

function SupportDashboard() {

    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [detailShipmentId, setDetailShipmentId] = useState(null);
    const [editShipmentId, setEditShipmentId] = useState(null);

    const loadStats = async () => {
        try {
            const data = await fetchStats();
            setStats(data);
        } catch {
            setStats(null);
        }
    };

    useEffect(() => {
        loadStats();
    }, [refreshKey]);

    const handleDataChanged = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="dashboard-page">
            <DashboardNavbar />
            <div className="container py-5">
                <WelcomeCard />

                <ul className="nav nav-tabs mt-4 mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                            <i className="bi bi-speedometer2 me-1"></i> Dashboard
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "queries" ? "active" : ""}`} onClick={() => setActiveTab("queries")}>
                            <i className="bi bi-chat-dots me-1"></i> Queries
                        </button>
                    </li>
                </ul>

                {activeTab === "dashboard" && (
                    <>
                        <div className="row mt-2 g-4">
                            <div className="col-lg-12">
                                <div className="row g-4">
                                    <div className="col-md-2">
                                        <StatCard icon="bi-box-seam" title="Total" value={stats?.total ?? 0} color="#0F4C81" />
                                    </div>
                                    <div className="col-md-2">
                                        <StatCard icon="bi-truck" title="In Transit" value={stats?.inTransit ?? 0} color="#2563EB" />
                                    </div>
                                    <div className="col-md-2">
                                        <StatCard icon="bi-geo-alt" title="Out for Del." value={stats?.outForDelivery ?? 0} color="#0EA5E9" />
                                    </div>
                                    <div className="col-md-2">
                                        <StatCard icon="bi-check-circle" title="Delivered" value={stats?.delivered ?? 0} color="#16A34A" />
                                    </div>
                                    <div className="col-md-2">
                                        <StatCard icon="bi-clock-history" title="Pending" value={stats?.created ?? 0} color="#F59E0B" />
                                    </div>
                                    <div className="col-md-2">
                                        <StatCard icon="bi-x-circle" title="Cancelled" value={stats?.cancelled ?? 0} color="#EF4444" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <RecentShipments
                                onDataChanged={handleDataChanged}
                                isSupport={true}
                                onViewDetails={setDetailShipmentId}
                                onEdit={setEditShipmentId}
                            />
                        </div>
                    </>
                )}

                {activeTab === "queries" && <QueriesPanel />}
            </div>

            {detailShipmentId && (
                <ShipmentDetailModal
                    shipmentId={detailShipmentId}
                    onClose={() => setDetailShipmentId(null)}
                />
            )}

            {editShipmentId && (
                <EditShipmentModal
                    shipmentId={editShipmentId}
                    onClose={() => setEditShipmentId(null)}
                    onUpdated={handleDataChanged}
                />
            )}
        </div>
    );
}

export default SupportDashboard;