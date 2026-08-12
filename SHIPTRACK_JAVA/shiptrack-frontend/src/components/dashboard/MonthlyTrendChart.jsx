import React from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";

function MonthlyTrendChart({ monthlyTrend }) {

    if (!monthlyTrend || monthlyTrend.length === 0) {

        return (

            <div className="chart-card mt-4 mb-5">

                <h4 className="dashboard-section-title">
                    Monthly Shipment Trend
                </h4>

                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "350px" }}
                >

                    <div className="text-center text-muted">

                        <i
                            className="bi bi-bar-chart-line-fill"
                            style={{ fontSize: "3rem" }}
                        ></i>

                        <h5 className="mt-3">
                            No Monthly Trend Data Available
                        </h5>

                    </div>

                </div>

            </div>

        );

    }

    return (

        <div className="chart-card mt-4 mb-5">

            <h4 className="dashboard-section-title mb-4">
                Monthly Shipment Trend
            </h4>

            <ResponsiveContainer
                width="100%"
                height={350}
            >

                <LineChart
                    data={monthlyTrend}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="month"
                    />

                    <YAxis
                        allowDecimals={false}
                    />

                    <Tooltip
                        formatter={(value) => [
                            value,
                            "Shipments"
                        ]}
                    />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="count"
                        name="Shipments"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}

export default MonthlyTrendChart;