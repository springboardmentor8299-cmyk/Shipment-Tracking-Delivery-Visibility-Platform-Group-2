import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis
} from "recharts";

const SHIPMENT_COLOR = "#2563eb";
const DELIVERY_COLOR = "#16a34a";
const DRIVER_COLOR = "#7c3aed";
const CUSTOMER_COLOR = "#0891b2";
const DELAY_COLOR = "#f59e0b";
const WEEKLY_TREND_COLOR = "#0d9488";
const COMPLETED_COLOR = "#16a34a";
const FAILED_COLOR = "#ef4444";

const formatShortDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const buildWeeklyTrend = (perDay) => {
    const buckets = {};
    (perDay || []).forEach((item) => {
        const date = new Date(item.date);
        if (Number.isNaN(date.getTime())) return;
        const dayOffset = (date.getDay() + 6) % 7;
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - dayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const key = weekStart.toISOString();
        buckets[key] = (buckets[key] || 0) + (Number(item.count) || 0);
    });
    return Object.entries(buckets)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([key, count]) => ({ week: key, count }));
};

function ShipmentGraphs({
    perDay,
    deliveriesPerMonth,
    delayPercentage,
    topDrivers,
    topCustomers
}) {

    const delayData = [{ name: "Delay", value: Number(delayPercentage) || 0 }];

    const weeklyTrend = buildWeeklyTrend(perDay);

    return (

        <div className="mt-5">

            <h4 className="dashboard-section-title mb-4">
                Shipment Analytics Dashboard
            </h4>

            <div className="row g-4 mb-4">

                <div className="col-xl-8 col-lg-8 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-4">
                            Shipments Per Day
                        </h4>

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={perDay}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatShortDate}
                                    interval="preserveStartEnd"
                                    minTickGap={18}
                                />

                                <YAxis
                                    allowDecimals={false}
                                />

                                <Tooltip
                                    formatter={(value, name) => [
                                        value,
                                        name === "count" ? "Shipments" : name
                                    ]}
                                    labelFormatter={formatShortDate}
                                />

                                <Legend
                                    formatter={() => "Shipments"}
                                />

                                <Bar
                                    dataKey="count"
                                    name="Shipments"
                                    fill={SHIPMENT_COLOR}
                                    radius={[4, 4, 0, 0]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                <div className="col-xl-4 col-lg-4 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-2">
                            Delay Percentage
                        </h4>

                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: 320 }}
                        >

                            <div
                                className="position-relative"
                                style={{ width: 260, height: 200 }}
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="80%"
                                        outerRadius="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        data={delayData}
                                    >

                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            tick={false}
                                        />

                                        <RadialBar
                                            dataKey="value"
                                            fill={DELAY_COLOR}
                                            cornerRadius={12}
                                            background={{ fill: "#f3f4f6" }}
                                        />

                                    </RadialBarChart>

                                </ResponsiveContainer>

                                <div
                                    className="position-absolute"
                                    style={{
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -30%)",
                                        textAlign: "center"
                                    }}
                                >

                                    <h2 className="mb-0">
                                        {delayData[0].value}%
                                    </h2>

                                    <span className="text-muted small">
                                        of shipments delayed
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <div className="row g-4 mb-4">

                <div className="col-xl-6 col-lg-6 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-4">
                            Deliveries Per Month
                        </h4>

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={deliveriesPerMonth}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
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
                                        "Deliveries"
                                    ]}
                                />

                                <Legend
                                    formatter={() => "Deliveries"}
                                />

                                <Bar
                                    dataKey="count"
                                    name="Deliveries"
                                    fill={DELIVERY_COLOR}
                                    radius={[4, 4, 0, 0]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                <div className="col-xl-6 col-lg-6 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-4">
                            Top Drivers
                        </h4>

                        {topDrivers.length === 0 ? (

                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{ height: 320 }}
                            >

                                <div className="text-center text-muted">

                                    <i
                                        className="bi bi-truck"
                                        style={{ fontSize: "3rem" }}
                                    ></i>

                                    <h5 className="mt-3">
                                        No completed deliveries yet.
                                    </h5>

                                </div>

                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    layout="vertical"
                                    data={topDrivers}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 10,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="driverName"
                                        width={110}
                                    />

                                    <Tooltip
                                        formatter={(value, name) => [
                                            value,
                                            name === "completedDeliveries"
                                                ? "Deliveries"
                                                : name
                                        ]}
                                    />

                                    <Legend
                                        formatter={() => "Completed Deliveries"}
                                    />

                                    <Bar
                                        dataKey="completedDeliveries"
                                        name="Completed Deliveries"
                                        fill={DRIVER_COLOR}
                                        radius={[0, 4, 4, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>

            </div>

            <div className="row g-4 mb-4">

                <div className="col-xl-6 col-lg-6 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-4">
                            Weekly Deliveries Trend
                        </h4>

                        {weeklyTrend.length === 0 ? (

                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{ height: 320 }}
                            >

                                <div className="text-center text-muted">

                                    <i
                                        className="bi bi-calendar-week"
                                        style={{ fontSize: "3rem" }}
                                    ></i>

                                    <h5 className="mt-3">
                                        No shipment data for the selected window.
                                    </h5>

                                </div>

                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    data={weeklyTrend}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="week"
                                        tickFormatter={formatShortDate}
                                        interval="preserveStartEnd"
                                        minTickGap={18}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        formatter={(value, name) => [
                                            value,
                                            name === "count" ? "Shipments" : name
                                        ]}
                                        labelFormatter={formatShortDate}
                                    />

                                    <Legend
                                        formatter={() => "Shipments"}
                                    />

                                    <Bar
                                        dataKey="count"
                                        name="Shipments"
                                        fill={WEEKLY_TREND_COLOR}
                                        radius={[4, 4, 0, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>

                <div className="col-xl-6 col-lg-6 col-md-12">

                    <div className="chart-card h-100">

                        <h4 className="dashboard-section-title mb-4">
                            Driver Delivery Comparison
                        </h4>

                        {topDrivers.length === 0 ? (

                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{ height: 320 }}
                            >

                                <div className="text-center text-muted">

                                    <i
                                        className="bi bi-truck"
                                        style={{ fontSize: "3rem" }}
                                    ></i>

                                    <h5 className="mt-3">
                                        No driver delivery data yet.
                                    </h5>

                                </div>

                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    layout="vertical"
                                    data={topDrivers}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 10,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="driverName"
                                        width={110}
                                    />

                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === "completedDeliveries") {
                                                return [value, "Completed Deliveries"];
                                            }
                                            if (name === "failedDeliveries") {
                                                return [value, "Failed Deliveries"];
                                            }
                                            return [value, name];
                                        }}
                                    />

                                    <Legend
                                        formatter={(value) => {
                                            if (value === "completedDeliveries") {
                                                return "Completed Deliveries";
                                            }
                                            if (value === "failedDeliveries") {
                                                return "Failed Deliveries";
                                            }
                                            return value;
                                        }}
                                    />

                                    <Bar
                                        dataKey="completedDeliveries"
                                        name="completedDeliveries"
                                        fill={COMPLETED_COLOR}
                                        radius={[0, 4, 4, 0]}
                                    />

                                    <Bar
                                        dataKey="failedDeliveries"
                                        name="failedDeliveries"
                                        fill={FAILED_COLOR}
                                        radius={[0, 4, 4, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>

            </div>

            <div className="row g-4 mb-4">

                <div className="col-xl-12 col-lg-12 col-md-12">

                    <div className="chart-card">

                        <h4 className="dashboard-section-title mb-4">
                            Top Customers
                        </h4>

                        {topCustomers.length === 0 ? (

                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{ height: 300 }}
                            >

                                <div className="text-center text-muted">

                                    <i
                                        className="bi bi-people"
                                        style={{ fontSize: "3rem" }}
                                    ></i>

                                    <h5 className="mt-3">
                                        No customer shipments yet.
                                    </h5>

                                </div>

                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    layout="vertical"
                                    data={topCustomers}
                                    margin={{
                                        top: 10,
                                        right: 40,
                                        left: 20,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="customerName"
                                        width={150}
                                    />

                                    <Tooltip
                                        formatter={(value, name) => [
                                            value,
                                            name === "totalShipments"
                                                ? "Total Shipments"
                                                : name
                                        ]}
                                    />

                                    <Legend
                                        formatter={() => "Total Shipments"}
                                    />

                                    <Bar
                                        dataKey="totalShipments"
                                        name="Total Shipments"
                                        fill={CUSTOMER_COLOR}
                                        radius={[0, 4, 4, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}

export default ShipmentGraphs;
