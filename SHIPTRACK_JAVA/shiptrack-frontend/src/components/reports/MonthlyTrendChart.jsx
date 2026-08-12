import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MonthlyTrendChart({ monthlyTrend = [] }) {

    if (monthlyTrend.length === 0) {

        return (

            <div className="card shadow border-0 h-100">

                <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">

                    <i
                        className="bi bi-graph-up"
                        style={{ fontSize: "3rem" }}
                    ></i>

                    <h6 className="mt-3">

                        No monthly trend data available

                    </h6>

                </div>

            </div>

        );

    }

    const data = {

        labels: monthlyTrend.map(item => item.month),

        datasets: [

            {

                label: "Shipments",

                data: monthlyTrend.map(item => item.count),

                borderColor: "#0d6efd",

                backgroundColor: "rgba(13,110,253,0.25)",

                fill: true,

                tension: 0.4,

                pointRadius: 5,

                pointHoverRadius: 7

            }

        ]

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 1000

        },

        scales: {

            y: {

                beginAtZero: true,

                ticks: {

                    precision: 0

                },

                grid: {

                    color: "#f1f1f1"

                }

            },

            x: {

                grid: {

                    display: false

                }

            }

        },

        plugins: {

            legend: {

                position: "top"

            },

            title: {

                display: true,

                text: "Monthly Shipment Trend"

            },

            tooltip: {

                callbacks: {

                    label(context) {

                        return `Shipments: ${context.raw}`;

                    }

                }

            }

        }

    };

    return (

        <div className="card shadow border-0 h-100">

            <div
                className="card-body"
                style={{ height: "420px" }}
            >

                <Line

                    data={data}

                    options={options}

                />

            </div>

        </div>

    );

}

export default MonthlyTrendChart;