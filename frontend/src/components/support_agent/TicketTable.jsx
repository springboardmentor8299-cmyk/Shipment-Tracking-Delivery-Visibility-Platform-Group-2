import "../../styles/ShipmentTable.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import AddSupportTicketModal from "./AddSupportTicketModal";
import { getAllTickets, deleteTicket } from "../../services/ticketService";

const ITEMS_PER_PAGE = 5;

function TicketTable({ searchTerm = "" }) {
    const [tickets, setTickets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // --- Fetch Data ---
    const loadTickets = useCallback(async () => {
        try {
            const data = await getAllTickets();
            setTickets(data || []);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    // --- Delete Handler ---
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Delete this Ticket?")) return;

        try {
            await deleteTicket(id);
            alert("Ticket Deleted Successfully");
            loadTickets();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete Failed");
        }
    }, [loadTickets]);

    // --- Filter Tickets by Search ---
    const filteredTickets = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return tickets;

        return tickets.filter((ticket) =>
            ticket.trackingId?.toLowerCase().includes(query) ||
            ticket.subject?.toLowerCase().includes(query) ||
            ticket.customerName?.toLowerCase().includes(query)
        );
    }, [tickets, searchTerm]);

    // Reset pagination to page 1 on search or data change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, tickets.length]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE) || 1;

    const currentTickets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTickets.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTickets, currentPage]);

    const startEntry = filteredTickets.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length);

    // Dynamic Page Numbers generator
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
            {/* Header */}
            <div className="table-header">
                <h2>Support Tickets</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        setEditingTicket(null);
                        setShowModal(true);
                    }}
                >
                    + Add Ticket
                </button>
            </div>

            {/* Modal */}
            <AddSupportTicketModal
                show={showModal}
                ticket={editingTicket}
                onClose={() => {
                    setShowModal(false);
                    setEditingTicket(null);
                    loadTickets();
                }}
            />

            {/* Table */}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Tracking ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTickets.length > 0 ? (
                        currentTickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.customerName || "-"}</td>
                                <td>{ticket.trackingId || "-"}</td>
                                <td>{ticket.subject || "-"}</td>
                                <td>{ticket.status || "PENDING"}</td>
                                <td>{ticket.assignedToName || "-"}</td>
                                <td>{ticket.createdAt?.substring(0, 10) || "-"}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setEditingTicket(ticket);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(ticket.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                                No Support Tickets Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredTickets.length > 0 && (
                <div className="pagination-container">
                    <span className="pagination-info">
                        Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{filteredTickets.length}</strong> entries
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

export default TicketTable;