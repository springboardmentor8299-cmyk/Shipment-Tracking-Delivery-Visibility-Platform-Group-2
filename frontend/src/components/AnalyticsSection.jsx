import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import { useEffect, useState } from "react";
import { getMonthlyShipmentOverview, getShipmentStatusCounts } from "../services/analyticsService";
import "../styles/AnalyticsSection.css";

const STATUS_COLORS = {
    "CREATED": "#f59e0b",          // Amber / Yellow
    "PICKED UP": "#6366f1",        // Soft Indigo
    "IN TRANSIT": "#3b82f6",       // Blue
    "OUT FOR DELIVERY": "#a855f7", // Purple (cleaned hex string without !important)
    "DELIVERED": "#22C55E",        // Emerald Green
    "CANCELLED": "#EF4444",        // Red
    "FAILED DELIVERY": "#E11D48",  // Crimson Red
};

function AnalyticsSection(){
    const [monthlyData, setMonthlyData] = useState([]);
    const [statusData, setStatusData] = useState([]);

    useEffect(() => {
        fetchAnalytics();

        const refreshCharts = () => {
            fetchAnalytics();
        };

        window.addEventListener("analytics:update", refreshCharts);

        return () => {
            window.removeEventListener("analytics:update", refreshCharts);
        };
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [monthlyOverview, statusCounts] = await Promise.all([
                getMonthlyShipmentOverview(),
                getShipmentStatusCounts()
            ]);

            setMonthlyData(monthlyOverview.map(entry => ({
                month: entry.month,
                shipments: entry.shipments
            })));

            setStatusData(statusCounts.map(entry => ({
                name: entry.status.replace("_", " "),
                value: entry.count
            })));
        } catch (error) {
            console.error("Failed to load analytics", error);
        }
    };

    return(

        <div className="analytics-grid">

            <div className="chart-card">

                <h3>Shipment Overview</h3>

                <ResponsiveContainer width="100%" height={300}>

                    <LineChart data={monthlyData}>

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="month"/>

                        <YAxis/>

                        <Tooltip/>

                        <Line
                            type="monotone"
                            dataKey="shipments"
                            stroke="#2563EB"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div className="chart-card">

                <h3>Shipment Status</h3>

                <ResponsiveContainer width="100%" height={300}>

                    <PieChart>

                        <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {statusData.map((entry, index) => {
                                // Formats "OUT_FOR_DELIVERY" or "out for delivery" -> "OUT FOR DELIVERY"
                                const formattedKey = String(entry.name || '')
                                    .toUpperCase()
                                    .replace(/_/g, ' ')
                                    .trim();

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[formattedKey] || STATUS_COLORS[entry.name] || "#94A3B8"}
                                    />
                                );
                            })}
                        </Pie>

                        <Tooltip/>

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default AnalyticsSection;