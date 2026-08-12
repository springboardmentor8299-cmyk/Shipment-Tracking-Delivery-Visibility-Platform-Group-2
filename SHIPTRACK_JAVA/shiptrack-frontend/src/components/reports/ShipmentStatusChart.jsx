import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function ShipmentStatusChart({ shipmentStats = {} }) {

    const chartData = [

        Number(shipmentStats.Created ?? 0),
        Number(shipmentStats.Pending ?? 0),
        Number(shipmentStats["In Transit"] ?? 0),
        Number(shipmentStats["Out For Delivery"] ?? 0),
        Number(shipmentStats.Delivered ?? 0),
        Number(shipmentStats.Cancelled ?? 0)

    ];

    const total = chartData.reduce((sum, value) => sum + value, 0);

    if (total === 0) {

        return (

            <div className="card shadow border-0 h-100">

                <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">

                    <i
                        className="bi bi-pie-chart-fill"
                        style={{ fontSize: "3rem" }}
                    ></i>

                    <h6 className="mt-3">

                        No shipment data available

                    </h6>

                </div>

            </div>

        );

    }

    const data = {

        labels: [

            "Created",
            "Pending",
            "In Transit",
            "Out For Delivery",
            "Delivered",
            "Cancelled"

        ],

        datasets: [

            {

                data: chartData,

                backgroundColor: [

                    "#3b82f6",
                    "#6c757d",
                    "#f59e0b",
                    "#06b6d4",
                    "#198754",
                    "#dc3545"

                ],

                borderColor: "#ffffff",

                borderWidth: 2,

                hoverOffset: 10

            }

        ]

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 1000

        },

        plugins: {

            legend: {

                position: "bottom",

                labels: {

                    padding: 20

                }

            },

            title: {

                display: true,

                text: "Shipment Status Distribution"

            },

            tooltip: {

                callbacks: {

                    label(context) {

                        return `${context.label}: ${context.raw}`;

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

                <Doughnut

                    data={data}

                    options={options}

                />

            </div>

        </div>

    );

}

export default ShipmentStatusChart;