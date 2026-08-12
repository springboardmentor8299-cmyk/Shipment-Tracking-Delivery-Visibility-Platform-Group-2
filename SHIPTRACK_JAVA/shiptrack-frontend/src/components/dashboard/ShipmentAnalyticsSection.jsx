import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

const COLORS = [
    "#3b82f6", 
    "#6b7280", 
    "#f59e0b", 
    "#8b5cf6", 
    "#06b6d4", 
    "#22c55e", 
    "#ef4444", 
    "#7c3aed"  
];

function ShipmentAnalyticsSection({
    shipmentAnalytics,
    shipmentChartData
}) {

    if (!shipmentAnalytics) return null;

    return (

        <>

            <div className="mt-5">

                <h4 className="dashboard-section-title mb-4">
                    Shipment Analytics
                </h4>

            </div>

            <div className="row g-4 mb-5">

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-box-seam text-primary mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Total Shipments</h6>

                            <h2>
                                {shipmentAnalytics.Total || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-plus-circle-fill text-primary mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Created</h6>

                            <h2>
                                {shipmentAnalytics.Created || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-hourglass-split text-secondary mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Pending</h6>

                            <h2>
                                {shipmentAnalytics.Pending || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-truck text-warning mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>In Transit</h6>

                            <h2>
                                {shipmentAnalytics["In Transit"] || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-bicycle text-info mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Out For Delivery</h6>

                            <h2>
                                {shipmentAnalytics["Out For Delivery"] || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-check-circle-fill text-success mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Delivered</h6>

                            <h2>
                                {shipmentAnalytics.Delivered || 0}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div className="dashboard-card">

                        <div className="card-body text-center py-4">

                            <i
                                className="bi bi-x-circle-fill text-danger mb-3"
                                style={{ fontSize: "2.5rem" }}
                            ></i>

                            <h6>Cancelled</h6>

                            <h2>
                                {shipmentAnalytics.Cancelled || 0}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>

            <div className="chart-card">

                <h4 className="dashboard-section-title mb-4">
                    Shipment Distribution
                </h4>

                <ResponsiveContainer
                    width="100%"
                    height={420}
                >

                    <PieChart>

                        <Pie
                            data={shipmentChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={140}
                            label
                        >

                            {shipmentChartData.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                        <Legend />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </>

    );

}

export default ShipmentAnalyticsSection;