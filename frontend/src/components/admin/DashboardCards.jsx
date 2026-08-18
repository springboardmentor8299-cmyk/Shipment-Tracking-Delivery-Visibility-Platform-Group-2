import { useEffect, useState } from "react";
import { getAllShipments } from "../../services/shipmentService";
import { Package, CheckCircle2, Truck, Clock } from "lucide-react";

function DashboardCards() {
    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        inTransit: 0,
        pending: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const shipments = await getAllShipments();
                setStats({
                    total: shipments.length,
                    delivered: shipments.filter(s => s.status === "DELIVERED").length,
                    inTransit: shipments.filter(s => s.status === "IN_TRANSIT").length,
                    pending: shipments.filter(s => s.status === "PENDING").length
                });
            } catch (error) {
                console.error("Dashboard stats error:", error);
            }
        };

        loadStats();
    }, []);

    return (
        <div className="dashboard-cards-container">
            {/* Card 1: Total */}
            <div className="dashboard-card total">
                <div className="dashboard-card-icon" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}>
                    <Package size={26} />
                </div>
                <div className="dashboard-card-content">
                    <h3>Total Shipments</h3>
                    <p className="card-value">{stats.total}</p>
                </div>
            </div>

            {/* Card 2: Delivered */}
            <div className="dashboard-card delivered">
                <div className="dashboard-card-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                    <CheckCircle2 size={26} />
                </div>
                <div className="dashboard-card-content">
                    <h3>Delivered</h3>
                    <p className="card-value">{stats.delivered}</p>
                </div>
            </div>

            {/* Card 3: In Transit */}
            <div className="dashboard-card in-transit">
                <div className="dashboard-card-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <Truck size={26} />
                </div>
                <div className="dashboard-card-content">
                    <h3>In Transit</h3>
                    <p className="card-value">{stats.inTransit}</p>
                </div>
            </div>

            {/* Card 4: Pending */}
            <div className="dashboard-card pending">
                <div className="dashboard-card-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                    <Clock size={26} />
                </div>
                <div className="dashboard-card-content">
                    <h3>Pending</h3>
                    <p className="card-value">{stats.pending}</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardCards;