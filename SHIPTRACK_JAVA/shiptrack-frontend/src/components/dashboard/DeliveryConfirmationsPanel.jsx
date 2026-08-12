import { useCallback, useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

const COLUMNS = [
    { key: "trackingNumber", label: "Tracking No." },
    { key: "deliveryStatus", label: "Delivery Status" },
    { key: "shipmentStatus", label: "Shipment Status" },
    { key: "receivedBy", label: "Received By" },
    { key: "driver", label: "Driver" },
    { key: "deliveredAt", label: "Delivered At" },
    { key: "signature", label: "Signature" }
];

const deriveDeliveryStatus = (shipmentStatus) => {
    switch (shipmentStatus) {
        case "DELIVERED":
            return "CONFIRMED";
        case "DELIVERY_FAILED":
            return "FAILED";
        case "CANCELLED":
            return "CANCELLED";
        default:
            return "PENDING";
    }
};

function DeliveryConfirmationsPanel() {

    const [confirmations, setConfirmations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedConfirmation, setSelectedConfirmation] = useState(null);
    const [showColumns, setShowColumns] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(
        () => new Set(COLUMNS.map((column) => column.key))
    );

    const toggleColumn = (key) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const renderCell = (confirmation, key) => {
        switch (key) {
            case "trackingNumber":
                return confirmation.trackingNumber;
            case "deliveryStatus": {
                const status = confirmation.deliveryStatus;
                let badgeClass = "bg-secondary";
                if (status === "CONFIRMED" || status === "DELIVERED") {
                    badgeClass = "bg-success";
                } else if (status === "FAILED" || status === "CANCELLED") {
                    badgeClass = "bg-danger";
                } else if (status === "PENDING") {
                    badgeClass = "bg-warning text-dark";
                }
                return (
                    <span className={`badge ${badgeClass}`}>
                        {status || "--"}
                    </span>
                );
            }
            case "shipmentStatus":
                return confirmation.shipmentStatus;
            case "receivedBy":
                return confirmation.receiverName || "--";
            case "driver":
                return confirmation.driverName || "--";
            case "deliveredAt":
                return confirmation.deliveryTime
                    ? new Date(confirmation.deliveryTime).toLocaleString()
                    : "--";
            case "signature":
                return confirmation.signatureData ? (
                    <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        onClick={() => setSelectedConfirmation(confirmation)}
                    >
                        View Signature
                    </button>
                ) : (
                    <span className="text-muted">--</span>
                );
            default:
                return "--";
        }
    };

    const filteredConfirmations = (confirmations || []).filter((confirmation) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
            (confirmation.trackingNumber || "").toLowerCase().includes(query) ||
            (confirmation.receiverName || "").toLowerCase().includes(query) ||
            (confirmation.driverName || "").toLowerCase().includes(query) ||
            (confirmation.shipmentStatus || "").toLowerCase().includes(query)
        );
    });

    const downloadPod = async (confirmation) => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(`/pod/download/${confirmation.shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const url = URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = `POD-${confirmation.trackingNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to download the Proof of Delivery document."
            );
        }
    };

    const fetchConfirmations = useCallback(async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const [shipmentsResponse, confirmationsResponse] = await Promise.all([
                api.get("/shipments", config),
                api.get("/delivery-confirmations", config)
            ]);

            const shipments = shipmentsResponse.data || [];
            const confirmations = confirmationsResponse.data || [];

            const confirmationByShipmentId = {};
            confirmations.forEach((confirmation) => {
                confirmationByShipmentId[confirmation.shipmentId] = confirmation;
            });

            const merged = shipments.map((shipment) => {
                const confirmation = confirmationByShipmentId[shipment.id] || null;
                return {
                    id: confirmation?.id || shipment.id,
                    shipmentId: shipment.id,
                    trackingNumber: shipment.trackingNumber,
                    deliveryStatus: confirmation?.deliveryStatus
                        || deriveDeliveryStatus(shipment.shipmentStatus),
                    shipmentStatus: shipment.shipmentStatus,
                    receiverName: confirmation?.receiverName || shipment.receiverName || null,
                    driverName: confirmation?.driverName || shipment.driver?.fullName || null,
                    customerName: confirmation?.customerName || shipment.createdBy?.fullName || shipment.senderName || null,
                    deliveryTime: confirmation?.deliveryTime || null,
                    signatureData: confirmation?.signatureData || null,
                    deliveryPhoto: confirmation?.deliveryPhoto || null,
                    remarks: confirmation?.remarks || null,
                    createdAt: shipment.createdAt || null
                };
            });

            const confirmedWithoutTime = merged.filter(
                (item) =>
                    item.deliveryStatus === "CONFIRMED" &&
                    !item.deliveryTime
            );

            await Promise.all(
                confirmedWithoutTime.map(async (item) => {
                    try {
                        const historyResponse = await api.get(
                            `/tracking/${item.shipmentId}`,
                            config
                        );
                        const deliveredEntry = (historyResponse?.data || [])
                            .slice()
                            .sort(
                                (a, b) =>
                                    new Date(a?.timestamp) - new Date(b?.timestamp)
                            )
                            .find(
                                (entry) =>
                                    String(entry?.status) === "DELIVERED"
                            );
                        if (deliveredEntry?.timestamp) {
                            item.deliveryTime = deliveredEntry.timestamp;
                        }
                    } catch {
                        
                    }
                })
            );

            merged.sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );

            setConfirmations(merged);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load delivery confirmations."
            );

        } finally {

            setLoading(false);

        }
    }, []);

    useEffect(() => {
        
        fetchConfirmations();
    }, [fetchConfirmations]);

    return (

        <>

            <div className="card shadow border-0 mt-5 mb-4">

                <div className="card-body">

                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">

                    <h4 className="mb-0 fw-bold">
                        Delivery Confirmations
                    </h4>

                    <div className="d-flex align-items-center gap-2 flex-wrap">

                        <div className="position-relative">

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowColumns((value) => !value)}
                            >
                                <i className="bi bi-table me-1"></i>
                                Columns
                            </button>

                            {showColumns && (
                                <div
                                    className="border rounded shadow-sm bg-white p-2 position-absolute end-0 mt-1"
                                    style={{ minWidth: "220px", zIndex: 1050 }}
                                >
                                    {COLUMNS.map((column) => (
                                        <div className="form-check" key={column.key}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`column-${column.key}`}
                                                checked={visibleColumns.has(column.key)}
                                                onChange={() => toggleColumn(column.key)}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`column-${column.key}`}
                                            >
                                                {column.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search by tracking no, receiver, driver..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            style={{ minWidth: "240px" }}
                        />

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchConfirmations}
                        >
                            Refresh
                        </button>

                    </div>

                </div>

                {loading ? (

                    <div className="text-center py-4">

                        <div className="spinner-border text-primary" role="status"></div>

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-dark">

                                <tr>

                                    {COLUMNS.map((column) => visibleColumns.has(column.key) && (
                                        <th key={column.key}>{column.label}</th>
                                    ))}

                                </tr>

                            </thead>

                            <tbody>

                                {filteredConfirmations.length === 0 ? (

                                    <tr>

                                        <td colSpan={visibleColumns.size} className="text-center py-4">
                                            {confirmations.length === 0
                                                ? "No shipments found."
                                                : "No shipments match your search."}
                                        </td>

                                    </tr>

                                ) : (

                                    filteredConfirmations.map((confirmation) => (

                                        <tr key={confirmation.id}>

                                            {COLUMNS.map((column) => visibleColumns.has(column.key) && (
                                                <td key={column.key}>
                                                    {renderCell(confirmation, column.key)}
                                                </td>
                                            ))}

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

        {selectedConfirmation && (

            <div
                className="modal fade show d-block"
                tabIndex={-1}
                role="dialog"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >

                <div className="modal-dialog modal-dialog-centered">

                    <div className="modal-content">

                        <div className="modal-header">

                            <h5 className="modal-title">
                                Delivery Verification — {selectedConfirmation.trackingNumber}
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setSelectedConfirmation(null)}
                            ></button>

                        </div>

                        <div className="modal-body">

                            <div className="row g-4">

                                <div className="col-md-6">

                                    <h6>Delivery Details</h6>

                                    <div className="mb-2">
                                        <span className="text-muted">Shipment Status:</span>
                                        <div className="fw-semibold">{selectedConfirmation.shipmentStatus}</div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-muted">Delivery Status:</span>
                                        <div className="fw-semibold">{selectedConfirmation.deliveryStatus}</div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-muted">Customer:</span>
                                        <div className="fw-semibold">{selectedConfirmation.customerName || "--"}</div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-muted">Driver:</span>
                                        <div className="fw-semibold">{selectedConfirmation.driverName || "--"}</div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-muted">Receiver:</span>
                                        <div className="fw-semibold">{selectedConfirmation.receiverName || "--"}</div>
                                    </div>

                                        <div className="mb-2">
                                            <span className="text-muted">Delivered At:</span>
                                            <div className="fw-semibold">
                                                {selectedConfirmation.deliveryTime
                                                    ? new Date(selectedConfirmation.deliveryTime).toLocaleString()
                                                    : "--"}
                                            </div>
                                        </div>

                                </div>

                                <div className="col-md-6">

                                    <h6>Digital Signature Preview</h6>

                                    <img
                                        src={selectedConfirmation.signatureData}
                                        alt="Receiver signature"
                                        className="border rounded bg-white"
                                        style={{ maxWidth: "100%", maxHeight: "240px" }}
                                    />

                                    {selectedConfirmation.deliveryPhoto && (
                                        <div className="mt-3">
                                            <h6>Delivery Photo</h6>
                                            <img
                                                src={selectedConfirmation.deliveryPhoto}
                                                alt="Delivery proof"
                                                className="border rounded"
                                                style={{ maxWidth: "100%", maxHeight: "180px" }}
                                            />
                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => downloadPod(selectedConfirmation)}
                            >
                                Download POD
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedConfirmation(null)}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        )}

        </>

    );
}

export default DeliveryConfirmationsPanel;
