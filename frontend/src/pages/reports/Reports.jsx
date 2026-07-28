import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getAllShipments } from "../../services/shipmentService";
import "../../styles/Reports.css";

const renderStatusBadge = (status) => {
  if (!status) return null;

  // Formats "PICKED_UP" or "Picked Up" -> "picked-up"
  const statusClass = String(status)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");

  // Display label: "PICKED_UP" -> "PICKED UP"
  const label = String(status).replace(/_/g, " ");

  return <span className={`status-pill ${statusClass}`}>{label}</span>;
};

function Reports() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllShipments();
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load shipments for reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  // Combined Search and Date Filtering
  const filteredShipments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      // 1. Text Search Filter
      const matchesSearch =
        !term ||
        [
          shipment.id,
          shipment.trackingId,
          shipment.customerName,
          shipment.origin,
          shipment.destination,
          shipment.status,
        ].some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(term),
        );

      if (!matchesSearch) return false;

      // 2. Date Range Filter
      if (shipment.shipmentDate) {
        const shipmentDate = new Date(shipment.shipmentDate);

        if (fromDate && shipmentDate < new Date(fromDate)) {
          return false;
        }

        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (shipmentDate > to) return false;
        }
      }

      return true;
    });
  }, [searchTerm, fromDate, toDate, shipments]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, itemsPerPage]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShipments = filteredShipments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // CSV Export Logic
  const downloadCsv = () => {
    const keys = [
      "id",
      "trackingId",
      "customerName",
      "origin",
      "destination",
      "status",
      "shipmentDate",
      "deliveryDate",
    ];
    const csvRows = [keys.join(",")];

    filteredShipments.forEach((item) => {
      const row = keys.map((key) => {
        const value = item[key] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipment_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="reports-header">
        <div>
          <h1>Shipment Reports</h1>
          <p>
            Browse, filter, and export detailed delivery and logistics records.
          </p>
        </div>
        <button
          className="reports-download-btn"
          onClick={downloadCsv}
          disabled={filteredShipments.length === 0 || loading}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV ({filteredShipments.length})
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="reports-filter-card">
        <div className="reports-search-box">
          <input
            type="text"
            placeholder="Search tracking ID, customer, origin, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="reports-date-filters">
          <label>
            <span>From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label>
            <span>To Date</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          {(searchTerm || fromDate || toDate) && (
            <button className="reports-clear-btn" onClick={handleClearFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {error && <div className="reports-error">{error}</div>}

      {/* Main Table Card */}
      <div className="reports-table-container">
        <div className="reports-table-wrapper">
          <table className="reports-table">
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
              {loading ? (
                <tr>
                  <td colSpan="8" className="reports-state-cell">
                    <div className="reports-spinner" />
                    <span>Fetching shipments...</span>
                  </td>
                </tr>
              ) : currentShipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="reports-state-cell">
                    No matching shipment records found.
                  </td>
                </tr>
              ) : (
                currentShipments.map((shipment) => {
                  return (
                    <tr key={shipment.id || shipment.trackingId}>
                      <td className="fw-bold">#{shipment.id}</td>
                      <td className="tracking-code">{shipment.trackingId}</td>
                      <td>{shipment.customerName}</td>
                      <td>{shipment.origin}</td>
                      <td>{shipment.destination}</td>
                      <td>{renderStatusBadge(shipment.status)}</td>
                      <td>{shipment.shipmentDate || "--"}</td>
                      <td>{shipment.deliveryDate || "--"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        <div className="reports-pagination-bar">
          <div className="pagination-info">
            Showing{" "}
            <strong>
              {filteredShipments.length > 0 ? indexOfFirstItem + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(indexOfLastItem, filteredShipments.length)}
            </strong>{" "}
            of <strong>{filteredShipments.length}</strong> entries
          </div>

          <div className="pagination-actions">
            <div className="rows-per-page">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-buttons">
              <button
                className="pag-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1,
                  )
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="ellipsis">...</span>}
                        <button
                          className={`page-num ${
                            page === currentPage ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                className="pag-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
