import { useEffect, useState } from "react";
import { getReport } from "../services/reportService";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


function ReportsSection() {

    const [report, setReport] = useState({
    totalShipments: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0,
    totalDrivers: 0,
    totalCustomers: 0,
    driverPerformance: {},
    monthlyShipments: {}
});

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {

        try {

            const response = await getReport();

            setReport(response.data);

        } catch (error) {

            console.error("Failed to load report", error);

        }

    };

    const shipmentStatus = {
        labels: ["Delivered", "In Transit", "Pending"],
        datasets: [
            {
                data: [
                    report.delivered,
                    report.inTransit,
                    report.pending
                ],
                backgroundColor: [
                    "#22c55e",
                    "#3b82f6",
                    "#f59e0b"
                ]
            }
        ]
    };

    const driverPerformance = {

    labels: Object.keys(report.driverPerformance || {}),

    datasets: [

        {

            label: "Deliveries",

            data: Object.values(report.driverPerformance || {}),

            backgroundColor: "#2563eb",

            borderRadius: 8

        }

    ]

};

   const monthlyShipments = {

    labels: Object.keys(report.monthlyShipments || {}),

    datasets: [

        {

            label: "Shipments",

            data: Object.values(report.monthlyShipments || {}),

            borderColor: "#2563eb",

            backgroundColor: "#93c5fd",

            tension: 0.4,

            fill: true

        }

    ]

};

    return (

        <div>

            <h2 style={{ marginBottom: "25px" }}>
                📊 Reports Dashboard
            </h2>

            <div className="cards">

                <div className="card">
                    <h3>Total Shipments</h3>
                    <h1>{report.totalShipments}</h1>
                </div>

                <div className="card">
                    <h3>Delivered</h3>
                    <h1>{report.delivered}</h1>
                </div>

                <div className="card">
                    <h3>In Transit</h3>
                    <h1>{report.inTransit}</h1>
                </div>

                <div className="card">
                    <h3>Pending</h3>
                    <h1>{report.pending}</h1>
                </div>

                <div className="card">
                    <h3>Total Drivers</h3>
                    <h1>{report.totalDrivers}</h1>
                </div>

                <div className="card">
                    <h3>Total Customers</h3>
                    <h1>{report.totalCustomers}</h1>
                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "25px",
                    marginBottom: "25px"
                }}
            >

                <div className="table-section">

                    <h3 style={{ marginBottom: "20px" }}>
                        Shipment Status
                    </h3>

                    <Pie data={shipmentStatus} />

                </div>

                <div className="table-section">

                    <h3 style={{ marginBottom: "20px" }}>
                        Monthly Shipments
                    </h3>

                    <Line data={monthlyShipments} />

                </div>

            </div>

            <div className="table-section">

                <h3 style={{ marginBottom: "20px" }}>
                    Driver Performance
                </h3>

                <Bar data={driverPerformance} />

            </div>

            <div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "30px"
    }}
>
    <button
        className="print-btn"
        onClick={() => window.print()}
    >
        🖨 Print Report
    </button>
</div>

        </div>

    );

}

export default ReportsSection;