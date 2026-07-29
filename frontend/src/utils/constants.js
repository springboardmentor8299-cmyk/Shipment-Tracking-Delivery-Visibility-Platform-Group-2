// Maps backend shipment status values to friendly display labels
export const STATUS_LABELS = {
    CREATED: "Pending",
    PICKED_UP: "Picked Up",
    AT_SORTING_FACILITY: "At Sorting Facility",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;

// Bootstrap-style badge classes for MyOrders / RecentShipments tables
export const getStatusBadgeClass = (status) => {
    switch (status) {
        case "DELIVERED":
            return "bg-success-subtle text-success";
        case "IN_TRANSIT":
            return "bg-primary-subtle text-primary";
        case "OUT_FOR_DELIVERY":
            return "bg-info-subtle text-info";
        case "CANCELLED":
            return "bg-danger-subtle text-danger";
        default:
            return "bg-warning-subtle text-warning";
    }
};

export const ALL_STATUSES = [
    "CREATED",
    "PICKED_UP",
    "AT_SORTING_FACILITY",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
];
