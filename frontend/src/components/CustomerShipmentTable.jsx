import { useEffect, useState, useMemo } from "react";
import { getCustomerShipments } from "../services/customerService";
import "../styles/ShipmentTable.css";

const ITEMS_PER_PAGE = 5;

function CustomerShipmentTable({ searchTerm = "", onTrack }) {
    const [shipments, setShipments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        try {
            const response = await getCustomerShipments();
            setShipments(response || []);
        } catch (error) {
            console.error("Failed to fetch shipments:", error);
        }
    };

    // --- Helper to format status CSS dynamically ---
    const getStatusClass = (status) => {
        if (!status) return "";
        return String(status).toLowerCase().trim().replace(/[\s_]+/g, "-");
    };

    // --- Memoized Filtering ---
    const filteredShipments = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return shipments;
        return shipments.filter((shipment) =>
            shipment.trackingId?.toLowerCase().includes(query)
        );
    }, [shipments, searchTerm]);

    // Reset page on search or data change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, shipments.length]);

    // --- Memoized Pagination Calculations ---
    const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE) || 1;

    const currentShipments = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredShipments.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredShipments, currentPage]);

    const startEntry = filteredShipments.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredShipments.length);

    // --- Helper for Smart Page Number Window ---
    const getPageNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 5;

        if (totalPages <= maxVisibleButtons) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages, currentPage + 1);

            if (currentPage <= 2) {
                endPage = 3;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 2;
            }

            if (startPage > 1) pages.push(1, "...");
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages) pages.push("...", totalPages);
        }

        return pages;
    };

    return (
        <div className="table-card">
            {/* Table Header */}
            <div className="table-header">
                <div className="table-title-group">
                    <h2>My Shipments</h2>
                    <span className="count-badge">{filteredShipments.length} total</span>
                </div>
            </div>

            {/* Table */}
            <table>
                <thead>
                    <tr>
                        <th>Tracking ID</th>
                        <th>Customer</th>
                        <th>Receiver</th>
                        <th>Items</th>
                        <th>Weight</th>
                        <th>Cost</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>Delivery Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentShipments.length > 0 ? (
                        currentShipments.map((shipment) => (
                            <tr key={shipment.trackingId || shipment.id}>
                                <td><strong>{shipment.trackingId}</strong></td>
                                <td><strong>{shipment.customerName || shipment.sender || "—"}</strong></td>
                                <td>{shipment.receiver || "—"}</td>
                                <td>{shipment.items || shipment.itemCount || 1}</td>
                                <td>{shipment.weight ? `${shipment.weight} kg` : "—"}</td>
                                <td>{shipment.cost ? `${shipment.cost}` : "—"}</td>
                                <td>{shipment.origin || "—"}</td>
                                <td>{shipment.destination || "—"}</td>
                                <td>
                                    <span className={`status-pill ${getStatusClass(shipment.status)}`}>
                                        {String(shipment.status || "UNKNOWN").replace(/_/g, " ")}
                                    </span>
                                </td>
                                <td>{shipment.deliveryDate || "—"}</td>
                                <td>
                                    <button
                                        className="track-btn"
                                        onClick={() => onTrack && onTrack(shipment.trackingId)}
                                    >
                                        Track
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="11" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                                No Shipments Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- Pagination Footer --- */}
            {filteredShipments.length > 0 && (
                <div className="pagination-container">
                    <span className="pagination-info">
                        Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{filteredShipments.length}</strong> entries
                    </span>

                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &larr; Previous
                        </button>

                        <div className="pagination-numbers">
                            {getPageNumbers().map((page, idx) =>
                                page === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        className={`pagination-number ${currentPage === page ? "active" : ""}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>

                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerShipmentTable;