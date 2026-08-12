import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axiosConfig";

import ReportCards from "../components/reports/ReportCards";
import ShipmentStatusChart from "../components/reports/ShipmentStatusChart";
import MonthlyTrendChart from "../components/reports/MonthlyTrendChart";
import ExportButtons from "../components/reports/ExportButtons";
import KeyMetrics from "../components/reports/KeyMetrics";
import ReportTable from "../components/reports/ReportTable";

const REPORT_TYPES = [

    { value: "daily", label: "Daily", icon: "bi-calendar-day" },
    { value: "weekly", label: "Weekly", icon: "bi-calendar-week" },
    { value: "monthly", label: "Monthly", icon: "bi-calendar-month" },
    { value: "shipment-status", label: "Shipment Status", icon: "bi-clipboard-check" },
    { value: "driver", label: "Driver", icon: "bi-person-badge" },
    { value: "customer", label: "Customer", icon: "bi-person-vcard" }

];

const ACTIVE_STATUSES = [

    "CREATED",
    "PENDING",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY"

];

const ALL_STATUSES = [

    "CREATED",
    "PENDING",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "CANCELLED"

];

const DELIVERY_STATUS_OPTIONS = [

    { value: "", label: "All Deliveries" },
    { value: "delivered", label: "Delivered" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" }

];

const isActive = (shipment) =>
    ACTIVE_STATUSES.includes(shipment.shipmentStatus);

const isDelayed = (shipment) =>
    Number(shipment.delayMinutes || 0) > 0;

const dateKey = (date) =>
    date.toLocaleDateString("en-CA");

const shortDate = (date) =>
    date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });

const summarize = (list) => ({

    created: list.length,

    delivered: list.filter((s) => s.shipmentStatus === "DELIVERED").length,

    failed: list.filter((s) => s.shipmentStatus === "DELIVERY_FAILED").length,

    delayed: list.filter(isDelayed).length,

    active: list.filter(isActive).length

});

const filterShipments = (shipments, filters = {}) => shipments.filter((shipment) => {

    if (filters.from
        && shipment.createdAt
        && shipment.createdAt.slice(0, 10) < filters.from) {
        return false;
    }

    if (filters.to
        && shipment.createdAt
        && shipment.createdAt.slice(0, 10) > filters.to) {
        return false;
    }

    if (filters.driverId
        && shipment.driver
        && String(shipment.driver.id) !== filters.driverId) {
        return false;
    }

    if (filters.shipmentStatus
        && shipment.shipmentStatus !== filters.shipmentStatus) {
        return false;
    }

    if (filters.deliveryStatus === "delivered"
        && shipment.shipmentStatus !== "DELIVERED") {
        return false;
    }

    if (filters.deliveryStatus === "pending"
        && !ACTIVE_STATUSES.includes(shipment.shipmentStatus)) {
        return false;
    }

    if (filters.deliveryStatus === "failed"
        && shipment.shipmentStatus !== "DELIVERY_FAILED") {
        return false;
    }

    return true;

});

const buildDaily = (shipments) => {

    const rows = [];

    const today = new Date();

    for (let i = 13; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - i
        );

        const dayShipments = shipments.filter(
            (s) => s.createdAt
                && s.createdAt.slice(0, 10) === dateKey(date)
        );

        rows.push({
            period: shortDate(date),
            ...summarize(dayShipments)
        });

    }

    return rows;

};

const buildWeekly = (shipments) => {

    const rows = [];

    const today = new Date();

    for (let week = 5; week >= 0; week--) {

        const end = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - week * 7
        );

        const start = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate() - 6
        );

        const weekShipments = shipments.filter(
            (s) => s.createdAt
                && s.createdAt.slice(0, 10) >= dateKey(start)
                && s.createdAt.slice(0, 10) <= dateKey(end)
        );

        rows.push({
            period: `${shortDate(start)} - ${shortDate(end)}`,
            ...summarize(weekShipments)
        });

    }

    return rows;

};

const buildMonthly = (shipments) => {

    const buckets = {};

    shipments.forEach((shipment) => {

        if (!shipment.createdAt) {
            return;
        }

        const created = new Date(shipment.createdAt);

        const key = `${created.getFullYear()}-${String(created.getMonth()).padStart(2, "0")}`;

        if (!buckets[key]) {

            buckets[key] = {
                month: created.toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric"
                }),
                created: 0,
                delivered: 0,
                failed: 0,
                delayed: 0
            };

        }

        buckets[key].created++;

        if (shipment.shipmentStatus === "DELIVERED") {
            buckets[key].delivered++;
        }

        if (shipment.shipmentStatus === "DELIVERY_FAILED") {
            buckets[key].failed++;
        }

        if (isDelayed(shipment)) {
            buckets[key].delayed++;
        }

    });

    return Object.keys(buckets)
        .sort()
        .map((key) => buckets[key]);

};

const buildShipmentStatus = (shipments) => ALL_STATUSES.map((status) => ({

    status: status.replace(/_/g, " "),
    count: shipments.filter((s) => s.shipmentStatus === status).length

}));

const buildDriver = (shipments) => {

    const buckets = {};

    shipments.forEach((shipment) => {

        const driver = shipment.driver;

        if (!driver) {
            return;
        }

        const id = driver.id;

        if (!buckets[id]) {

            buckets[id] = {
                driver: driver.fullName,
                shipments: 0,
                completed: 0,
                pending: 0,
                failed: 0
            };

        }

        buckets[id].shipments++;

        if (shipment.shipmentStatus === "DELIVERED") {
            buckets[id].completed++;
        }

        if (isActive(shipment)) {
            buckets[id].pending++;
        }

        if (shipment.shipmentStatus === "DELIVERY_FAILED") {
            buckets[id].failed++;
        }

    });

    return Object.values(buckets)
        .map((bucket) => ({
            ...bucket,
            successRate: bucket.shipments === 0
                ? "0%"
                : `${Math.round(bucket.completed * 100 / bucket.shipments)}%`
        }))
        .sort((a, b) => b.shipments - a.shipments);

};

const groupByCreator = (shipments, roleName) => {

    const buckets = {};

    shipments.forEach((shipment) => {

        const creator = shipment.createdBy;

        if (!creator
            || !creator.role
            || creator.role.name !== roleName) {
            return;
        }

        const id = creator.id;

        if (!buckets[id]) {

            buckets[id] = {
                name: creator.fullName,
                shipments: 0,
                delivered: 0,
                failed: 0,
                delayed: 0,
                cancelled: 0
            };

        }

        buckets[id].shipments++;

        if (shipment.shipmentStatus === "DELIVERED") {
            buckets[id].delivered++;
        }

        if (shipment.shipmentStatus === "DELIVERY_FAILED") {
            buckets[id].failed++;
        }

        if (isDelayed(shipment)) {
            buckets[id].delayed++;
        }

        if (shipment.shipmentStatus === "CANCELLED") {
            buckets[id].cancelled++;
        }

    });

    return Object.values(buckets)
        .map((bucket) => ({
            ...bucket,
            successRate: bucket.shipments === 0
                ? 0
                : Math.round(bucket.delivered * 100 / bucket.shipments)
        }))
        .sort((a, b) => b.shipments - a.shipments);

};

const buildCustomer = (shipments, topCustomers = []) => {

    const grouped = groupByCreator(shipments, "ROLE_CUSTOMER");

    const rows = grouped.length > 0
        ? grouped
        : topCustomers.map((customer) => ({

            name: customer.customerName,
            shipments: customer.totalShipments,
            delivered: customer.deliveredShipments,
            failed: 0,
            delayed: 0,
            cancelled: customer.cancelledShipments

        }));

    return rows.map((row) => ({

        customer: row.name,
        shipments: row.shipments,
        delivered: row.delivered,
        failed: row.failed,
        delayed: row.delayed,
        cancelled: row.cancelled,
        successRate: row.shipments === 0
            ? "0%"
            : `${Math.round(row.delivered * 100 / row.shipments)}%`

    }));

};

const REPORT_DEFINITIONS = {

    daily: {

        title: "Daily Delivery Report",
        subtitle: "Shipment volumes for the last 14 days (status as of today).",

        columns: [
            { key: "period", label: "Date" },
            { key: "created", label: "Created", align: "right" },
            { key: "delivered", label: "Delivered", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
            { key: "delayed", label: "Delayed", align: "right" },
            { key: "active", label: "Active", align: "right" }
        ]

    },

    weekly: {

        title: "Weekly Delivery Report",
        subtitle: "Shipment volumes grouped into the last 6 weeks.",

        columns: [
            { key: "period", label: "Week" },
            { key: "created", label: "Created", align: "right" },
            { key: "delivered", label: "Delivered", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
            { key: "delayed", label: "Delayed", align: "right" },
            { key: "active", label: "Active", align: "right" }
        ]

    },

    monthly: {

        title: "Monthly Delivery Report",
        subtitle: "Shipment volumes grouped by month.",

        columns: [
            { key: "month", label: "Month" },
            { key: "created", label: "Created", align: "right" },
            { key: "delivered", label: "Delivered", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
            { key: "delayed", label: "Delayed", align: "right" }
        ]

    },

    "shipment-status": {

        title: "Shipment Status Report",
        subtitle: "Shipment counts grouped by current status.",

        columns: [
            { key: "status", label: "Status" },
            { key: "count", label: "Count", align: "right" }
        ]

    },

    driver: {

        title: "Driver Performance Report",
        subtitle: "Delivery performance per driver.",

        columns: [
            { key: "driver", label: "Driver" },
            { key: "shipments", label: "Shipments", align: "right" },
            { key: "completed", label: "Completed", align: "right" },
            { key: "pending", label: "Pending", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
            { key: "successRate", label: "Success %", align: "right" }
        ]

    },

    customer: {

        title: "Customer Shipment Report",
        subtitle: "Shipment activity per customer.",

        columns: [
            { key: "customer", label: "Customer" },
            { key: "shipments", label: "Shipments", align: "right" },
            { key: "delivered", label: "Delivered", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
            { key: "delayed", label: "Delayed", align: "right" },
            { key: "cancelled", label: "Cancelled", align: "right" },
            { key: "successRate", label: "Success %", align: "right" }
        ]

    }

};

function Reports() {

    const [shipmentStats, setShipmentStats] = useState({});
    const [userStats, setUserStats] = useState({});
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [allShipments, setAllShipments] = useState([]);

    const [reportType, setReportType] = useState("daily");

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        driverId: "",
        shipmentStatus: "",
        deliveryStatus: ""
    });

    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const config = {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            };

            const [

                shipmentResponse,
                userResponse,
                trendResponse,
                customersResponse,
                shipmentsResponse

            ] = await Promise.all([

                api.get("/shipments/analytics", config),
                api.get("/users/analytics", config),
                api.get("/shipments/monthly-trend", config),
                api.get("/shipments/analytics/top-customers?limit=20", config),
                api.get("/shipments", config)

            ]);

            setShipmentStats(shipmentResponse.data);
            setUserStats(userResponse.data);
            setMonthlyTrend(trendResponse.data);
            setTopCustomers(customersResponse.data);
            setAllShipments(shipmentsResponse.data || []);

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data?.message ||

                "Failed to load reports."

            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        Promise.resolve().then(fetchReports);

    }, []);

    if (loading) {

        return (

            <div className="text-center mt-5">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <h5 className="mt-3">

                    Loading Reports...

                </h5>

            </div>

        );

    }

    const driverOptions = allShipments
        .map((shipment) => shipment.driver)
        .filter((driver, index, array) => driver
            && array.findIndex((d) => d && d.id === driver.id) === index)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

    const filteredShipments = filterShipments(allShipments, filters);

    const filteredDelivered = filteredShipments.filter(
        (s) => s.shipmentStatus === "DELIVERED"
    ).length;

    const filteredFailed = filteredShipments.filter(
        (s) => s.shipmentStatus === "DELIVERY_FAILED"
    ).length;

    const allFailed = allShipments.filter(
        (s) => s.shipmentStatus === "DELIVERY_FAILED"
    ).length;

    const filteredPending = filteredShipments.filter(isActive).length;

    const successRate = filteredDelivered + filteredFailed === 0
        ? 0
        : Math.round(filteredDelivered * 100 / (filteredDelivered + filteredFailed));

    const delayedShipments = filteredShipments.filter(isDelayed);

    const avgDelay = delayedShipments.length === 0
        ? 0
        : Math.round(
            delayedShipments.reduce(
                (sum, shipment) => sum + Number(shipment.delayMinutes || 0),
                0
            ) / delayedShipments.length
        );

    const metrics = {

        totalShipments: filteredShipments.length,

        delivered: filteredDelivered,

        pending: filteredPending,

        failedDeliveries: Number(allFailed ?? filteredFailed),

        successRate,

        avgDeliveryTime: Number(shipmentStats["Average Delivery Time"] ?? 0),

        avgDelay

    };

    const reportRows = {

        daily: buildDaily(filteredShipments),
        weekly: buildWeekly(filteredShipments),
        monthly: buildMonthly(filteredShipments),
        "shipment-status": buildShipmentStatus(filteredShipments),
        driver: buildDriver(filteredShipments),
        customer: buildCustomer(filteredShipments, topCustomers)

    };

    const activeReport = {

        label: REPORT_TYPES.find((type) => type.value === reportType).label,

        ...REPORT_DEFINITIONS[reportType],

        rows: reportRows[reportType]

    };

    const updateFilter = (key, value) =>
        setFilters((current) => ({ ...current, [key]: value }));

    const clearFilters = () =>
        setFilters({
            from: "",
            to: "",
            driverId: "",
            shipmentStatus: "",
            deliveryStatus: ""
        });

    return (

        <div className="container-fluid mt-4 px-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">

                        Reports Dashboard

                    </h2>

                    <p className="text-muted mb-0">

                        Shipment analytics and system insights.

                    </p>

                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={fetchReports}
                >

                    <i className="bi bi-arrow-clockwise me-2"></i>

                    Refresh

                </button>

            </div>

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="fw-bold mb-0">

                            Report Filters

                        </h5>

                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={clearFilters}
                        >

                            <i className="bi bi-x-circle me-1"></i>

                            Clear

                        </button>

                    </div>

                    <div className="row g-3">

                        <div className="col-6 col-md-3 col-lg-2">

                            <label className="form-label small mb-1">

                                From Date

                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={filters.from}
                                onChange={(e) => updateFilter("from", e.target.value)}
                            />

                        </div>

                        <div className="col-6 col-md-3 col-lg-2">

                            <label className="form-label small mb-1">

                                To Date

                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={filters.to}
                                onChange={(e) => updateFilter("to", e.target.value)}
                            />

                        </div>

                        <div className="col-6 col-md-3 col-lg-2">

                            <label className="form-label small mb-1">

                                Driver

                            </label>

                            <select
                                className="form-select"
                                value={filters.driverId}
                                onChange={(e) => updateFilter("driverId", e.target.value)}
                            >

                                <option value="">

                                    All Drivers

                                </option>

                                {driverOptions.map((driver) => (

                                    <option
                                        key={driver.id}
                                        value={driver.id}
                                    >

                                        {driver.fullName}

                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="col-6 col-md-3 col-lg-2">

                            <label className="form-label small mb-1">

                                Shipment Status

                            </label>

                            <select
                                className="form-select"
                                value={filters.shipmentStatus}
                                onChange={(e) => updateFilter("shipmentStatus", e.target.value)}
                            >

                                <option value="">

                                    All Statuses

                                </option>

                                {ALL_STATUSES.map((status) => (

                                    <option
                                        key={status}
                                        value={status}
                                    >

                                        {status.replace(/_/g, " ")}

                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="col-6 col-md-3 col-lg-2">

                            <label className="form-label small mb-1">

                                Delivery Status

                            </label>

                            <select
                                className="form-select"
                                value={filters.deliveryStatus}
                                onChange={(e) => updateFilter("deliveryStatus", e.target.value)}
                            >

                                {DELIVERY_STATUS_OPTIONS.map((option) => (

                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >

                                        {option.label}

                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>

                </div>

            </div>

            <ReportCards

                shipmentStats={shipmentStats}

                userStats={userStats}

            />

            <div className="mt-4">

                <KeyMetrics metrics={metrics} />

            </div>

            <div className="row mt-4">

                <div className="col-lg-7 mb-4">

                    <MonthlyTrendChart

                        monthlyTrend={monthlyTrend}

                    />

                </div>

                <div className="col-lg-5 mb-4">

                    <ShipmentStatusChart

                        shipmentStats={shipmentStats}

                    />

                </div>

            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">

                {REPORT_TYPES.map((type) => (

                    <button
                        key={type.value}
                        className={
                            reportType === type.value
                                ? "btn btn-primary"
                                : "btn btn-outline-primary"
                        }
                        onClick={() => setReportType(type.value)}
                    >

                        <i className={`bi ${type.icon} me-2`}></i>

                        {type.label}

                    </button>

                ))}

            </div>

            <div className="mb-5">

                <ReportTable

                    title={activeReport.title}
                    subtitle={activeReport.subtitle}
                    columns={activeReport.columns}
                    rows={activeReport.rows}

                />

            </div>

            <div className="mb-5 pb-4">

                <ExportButtons

                    shipmentStats={shipmentStats}
                    userStats={userStats}
                    monthlyTrend={monthlyTrend}
                    metrics={metrics}
                    reportLabel={activeReport.label}
                    reportColumns={activeReport.columns}
                    reportRows={activeReport.rows}

                />

            </div>

        </div>

    );

}

export default Reports;
