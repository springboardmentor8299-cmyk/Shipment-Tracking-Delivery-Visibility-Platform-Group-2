import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";

const COLORS = [
    "#2563eb", 
    "#f59e0b", 
    "#7c3aed"  
];

function UserAnalyticsSection({
    userAnalytics,
    userChartData
}) {

    if (!userAnalytics) return null;

    const totalUsers =
        (userAnalytics.ROLE_ADMIN || 0) +
        (userAnalytics.ROLE_CUSTOMER || 0) +
        (userAnalytics.ROLE_SUPPORT || 0);

    return (

        <>

            <h4 className="dashboard-section-title mb-4">
                User Analytics
            </h4>

            <div className="row g-4 mb-5">

                <div className="col-lg-3 col-md-6 col-sm-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-people-fill text-dark mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Total Users</h6>

                            <h2>{totalUsers}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6 col-sm-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-person-workspace text-primary mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Admin</h6>

                            <h2>{userAnalytics.ROLE_ADMIN || 0}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6 col-sm-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-people-fill text-warning mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Customer</h6>

                            <h2>{userAnalytics.ROLE_CUSTOMER || 0}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6 col-sm-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-headset text-info mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Support</h6>

                            <h2>{userAnalytics.ROLE_SUPPORT || 0}</h2>

                        </div>

                    </div>

                </div>

            </div>

            <div className="chart-card">

                <h4 className="dashboard-section-title mb-4">
                    User Distribution
                </h4>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart
                        data={userChartData}
                        margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 10
                        }}
                    >

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="role" />

                        <YAxis allowDecimals={false} />

                        <Tooltip
                            formatter={(value) => [
                                value,
                                "Users"
                            ]}
                        />

                        <Legend />

                        <Bar
                            dataKey="count"
                            name="Users"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                        >

                            {userChartData.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />

                            ))}

                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </>

    );

}

export default UserAnalyticsSection;
