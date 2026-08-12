import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function DashboardChart({ stats }) {

    const data = {
        labels: [
            "Delivered",
            "In Transit",
            "Pending"
        ],
        datasets: [
            {
                data: [
                    stats.delivered,
                    stats.inTransit,
                    stats.pending
                ],
                backgroundColor: [
                    "#2f855a",
                    "#315d8f",
                    "#9a6a18"
                ],
                borderColor: [
                    "#276749",
                    "#274c74",
                    "#7c5413"
                ],
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#cbd5e1",
                    padding: 16
                }
            }
        }
    };

    return (
        <div className="dashboard-chart">
            <Pie data={data} options={options} />
        </div>
    );
}

export default DashboardChart;
