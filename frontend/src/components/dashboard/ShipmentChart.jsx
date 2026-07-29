import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

function ShipmentChart({ stats }) {
    const data = {
        labels: ["Created", "In Transit", "Out for Delivery", "Delivered", "Cancelled"],
        datasets: [
            {
                label: "Shipments",
                data: [
                    stats?.created || 0,
                    stats?.inTransit || 0,
                    stats?.outForDelivery || 0,
                    stats?.delivered || 0,
                    stats?.cancelled || 0,
                ],
                borderColor: "#0F4C81",
                backgroundColor: "rgba(15,76,129,.15)",
                fill: true,
                tension: .4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="chart-card">
            <h4 className="mb-4">Shipment Analytics</h4>
            <Line data={data} options={options} />
        </div>
    );
}

export default ShipmentChart;
