import "../../styles/ShipmentTable.css";
import { useEffect, useState } from "react";
import { getAllShipments } from "../../services/businessService";

function BusinessShipmentTable({ searchTerm = "" }) {
    const [shipments, setShipments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        loadShipments();
    }, []);

    // Reset to first page when search filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const loadShipments = async () => {
        try {
            const data = await getAllShipments();
            setShipments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load shipments:", error);
        }
    };

    // Filter shipments based on search query
    const filteredShipments = shipments.filter((shipment) =>
        !searchTerm ||
        shipment.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination slices
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentShipments = filteredShipments.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>My Shipments</h2>
                
                {/* Page Size Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label htmlFor="rowsPerPage" style={{ fontSize: "14px" }}>Rows per page:</label>
                    <select
                        id="rowsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        style={{ padding: "4px 8px", borderRadius: "4px" }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tracking ID</th>
                        <th>Customer</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>Shipment Date</th>
                        <th>Delivery Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentShipments.length > 0 ? (
                        currentShipments.map((shipment) => (
                            <tr key={shipment.id}>
                                <td>{shipment.id}</td>
                                <td>{shipment.trackingId}</td>
                                <td>{shipment.customerName}</td>
                                <td>{shipment.origin}</td>
                                <td>{shipment.destination}</td>
                                <td>
                                    {(() => {
                                        const raw = String(shipment.status || "").toUpperCase().trim();
                                        let statusKey;

                                        switch (raw) {
                                            case "CREATED":
                                            case "PENDING":
                                                statusKey = "created";
                                                break;
                                            case "PICKED_UP":
                                            case "PICKED UP":
                                                statusKey = "picked_up";
                                                break;
                                            case "IN_TRANSIT":
                                            case "IN TRANSIT":
                                            case "IN-TRANSIT":
                                                statusKey = "in_transit";
                                                break;
                                            case "OUT_FOR_DELIVERY":
                                            case "OUT FOR DELIVERY":
                                                statusKey = "out_for_delivery";
                                                break;
                                            case "DELIVERED":
                                                statusKey = "delivered";
                                                break;
                                            case "FAILED_DELIVERY":
                                            case "FAILED DELIVERY":
                                                statusKey = "failed_delivery";
                                                break;
                                            case "CANCELLED":
                                                statusKey = "cancelled";
                                                break;
                                            default:
                                                statusKey = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                                        }

                                        const display = raw
                                            .toLowerCase()
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (c) => c.toUpperCase());

                                        return (
                                            <span className={`status ${statusKey}`}>
                                                {display}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td>{shipment.shipmentDate}</td>
                                <td>{shipment.deliveryDate}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                No shipments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div
                className="pagination-container"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "15px",
                    paddingTop: "10px",
                    borderTop: "1px solid #e2e8f0"
                }}
            >
                <div style={{ fontSize: "14px", color: "#64748b" }}>
                    Showing {filteredShipments.length > 0 ? startIndex + 1 : 0} to{" "}
                    {Math.min(endIndex, filteredShipments.length)} of {filteredShipments.length} entries
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: "6px 12px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        Previous
                    </button>

                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "6px 12px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BusinessShipmentTable;