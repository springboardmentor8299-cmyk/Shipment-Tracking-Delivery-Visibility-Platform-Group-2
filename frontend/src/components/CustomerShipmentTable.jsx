import { useEffect, useState, useMemo } from "react";
import {
  getCustomerShipments,
  getCustomerBill,
} from "../services/customerService";
import "../styles/ShipmentTable.css";

const ITEMS_PER_PAGE = 5;

function CustomerShipmentTable({ searchTerm = "", onTrack }) {
  const [shipments, setShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Bill popup — shows everything the admin's "Generate Bill" PDF
  // contains, just rendered inline instead of downloaded as a PDF.
  const [billTrackingId, setBillTrackingId] = useState(null);
  const [billData, setBillData] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState("");

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

  const handleViewBill = async (trackingId) => {
    setBillTrackingId(trackingId);
    setBillData(null);
    setBillError("");
    setBillLoading(true);
    try {
      const data = await getCustomerBill(trackingId);
      setBillData(data);
    } catch (error) {
      console.error("Failed to fetch bill:", error);
      setBillError(
        error?.response?.status === 404
          ? "No delivery bill is available yet for this shipment. It's generated once the shipment has been delivered."
          : error?.response?.data?.message ||
              "Could not load the bill for this shipment. Try again.",
      );
    } finally {
      setBillLoading(false);
    }
  };

  const closeBill = () => {
    setBillTrackingId(null);
    setBillData(null);
    setBillError("");
    setBillLoading(false);
  };

  // --- Helper to format status CSS dynamically ---
  const getStatusClass = (status) => {
    if (!status) return "";
    return String(status)
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-");
  };

  // --- Memoized Filtering ---
  const filteredShipments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return shipments;
    return shipments.filter((shipment) =>
      shipment.trackingId?.toLowerCase().includes(query),
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

  const startEntry =
    filteredShipments.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredShipments.length,
  );

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
                <td>
                  <strong>{shipment.trackingId}</strong>
                </td>
                <td>
                  <strong>
                    {shipment.customerName || shipment.sender || "—"}
                  </strong>
                </td>
                <td>{shipment.receiver || "—"}</td>
                <td>{shipment.items || shipment.itemCount || 1}</td>
                <td>{shipment.weight ? `${shipment.weight} kg` : "—"}</td>
                <td>{shipment.cost ? `${shipment.cost}` : "—"}</td>
                <td>{shipment.origin || "—"}</td>
                <td>{shipment.destination || "—"}</td>
                <td>
                  <span
                    className={`status-pill ${getStatusClass(shipment.status)}`}
                  >
                    {String(shipment.status || "UNKNOWN").replace(/_/g, " ")}
                  </span>
                </td>
                <td>{shipment.deliveryDate || "—"}</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      className="track-btn"
                      onClick={() => onTrack && onTrack(shipment.trackingId)}
                    >
                      Track
                    </button>

                    <button
                      className="track-btn"
                      onClick={() => handleViewBill(shipment.trackingId)}
                    >
                      Bill
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="11"
                style={{
                  textAlign: "center",
                  padding: "28px",
                  color: "#64748b",
                }}
              >
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
            Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong>{" "}
            of <strong>{filteredShipments.length}</strong> entries
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
                ),
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {billTrackingId && (
        <div className="modal-overlay" onClick={closeBill}>
          <div
            className="modal-content"
            style={{ maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Delivery Bill</h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#64748b",
                    fontSize: "0.85rem",
                  }}
                >
                  {billTrackingId}
                </p>
              </div>
              <button
                className="btn-cancel"
                style={{ padding: "6px 12px" }}
                onClick={closeBill}
              >
                Close
              </button>
            </div>

            {billLoading && <p className="text-muted">Loading bill…</p>}

            {!billLoading && billError && (
              <p style={{ color: "#b91c1c" }}>{billError}</p>
            )}

            {!billLoading && !billError && billData && (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["Sender", billData.customerName],
                      ["Receiver", billData.receiverName],
                      ["Origin", billData.origin],
                      ["Destination", billData.destination],
                      ["No. of Items", billData.noOfItems],
                      ["Total Weight", billData.totalWeightOfItems],
                      ["Shipment Cost", billData.shipmentCost],
                      ["Verification Method", billData.verificationMethod],
                      [
                        "Delivered At",
                        billData.deliveredAt
                          ? new Date(billData.deliveredAt).toLocaleString()
                          : null,
                      ],
                      ["Delivered By", billData.deliveredBy],
                      ...(billData.deliveryNotes
                        ? [["Delivery Notes", billData.deliveryNotes]]
                        : []),
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td
                          style={{
                            padding: "6px 8px",
                            fontWeight: 700,
                            color: "#64748b",
                            width: "40%",
                            verticalAlign: "top",
                            border: "none",
                          }}
                        >
                          {label}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            color: "#0f172a",
                            border: "none",
                          }}
                        >
                          {value || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {billData.signatureUrl && (
                  <div style={{ marginTop: 16 }}>
                    <label
                      className="form-group label"
                      style={{ fontWeight: 700, color: "#334155" }}
                    >
                      Receiver Signature
                    </label>
                    <div style={{ marginTop: 6 }}>
                      <img
                        src={billData.signatureUrl}
                        alt="Receiver signature"
                        style={{
                          maxWidth: 240,
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>
                )}

                {billData.photoUrls?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontWeight: 700, color: "#334155" }}>
                      Proof of Delivery Photos
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      {billData.photoUrls.map((url, i) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: "cover",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerShipmentTable;
