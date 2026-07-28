import "../../styles/ShipmentTable.css";
import { useEffect, useState, useMemo } from "react";
import {
    getAllShipments,
    updateShipment
} from "../../services/operatorService";
import AddShipmentModal from "../AddShipmentModal";

const ITEMS_PER_PAGE = 5;

function OperatorShipmentTable({ searchTerm = "" }) {
    const [shipments, setShipments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingShipment, setEditingShipment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        try {
            const data = await getAllShipments();
            setShipments(data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const saveShipment = async (shipment) => {
        try {
            await updateShipment(editingShipment.id, shipment);
            alert("Shipment Updated Successfully");
            loadShipments();
            setEditingShipment(null);
            setShowModal(false);
        } catch (error) {
            console.log(error);
            alert("Update Failed");
        }
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

    // --- Helper for Page Numbers Window ---
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
                    <h2>Assigned Shipments</h2>
                    <span className="count-badge">{filteredShipments.length} total</span>
                </div>
            </div>

            <AddShipmentModal
                show={showModal}
                shipment={editingShipment}
                onClose={() => {
                    setShowModal(false);
                    setEditingShipment(null);
                }}
                onSave={saveShipment}
            />

            {/* Table */}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tracking ID</th>
                        <th>Customer</th>
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
                            <tr key={shipment.id}>
                                <td>{shipment.id}</td>
                                <td><strong>{shipment.trackingId}</strong></td>
                                <td>{shipment.customerName}</td>
                                <td>{shipment.origin}</td>
                                <td>{shipment.destination}</td>
                                <td>
                                    <span className={`status ${shipment.status?.toLowerCase().replace(/\s+/g, '_')}`}>
                                        {shipment.status}
                                    </span>
                                </td>
                                <td>{shipment.deliveryDate || "N/A"}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setEditingShipment(shipment);
                                            setShowModal(true);
                                        }}
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                                No Shipments Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- Pagination Controls --- */}
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

export default OperatorShipmentTable;