import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllShipments } from "../../api/adminService";
import { updateShipmentStatus } from "../../api/shipmentService";
import "./ManageShipments.css";

function ManageShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingTrackingNumber, setUpdatingTrackingNumber] = useState("");
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setMessage({
        type: "",
        text: "",
      });

      const response = await getAllShipments();
      setShipments(response.data || []);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Unable to load shipments.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (trackingNumber, status) => {
    setShipments((previousShipments) =>
      previousShipments.map((shipment) =>
        shipment.trackingNumber === trackingNumber
          ? { ...shipment, status }
          : shipment
      )
    );
  };

  const handleUpdate = async (trackingNumber, status) => {
    try {
      setUpdatingTrackingNumber(trackingNumber);
      setMessage({
        type: "",
        text: "",
      });

      await updateShipmentStatus(trackingNumber, status);

      setMessage({
        type: "success",
        text: `Shipment ${trackingNumber} updated successfully.`,
      });

      await loadShipments();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update shipment status.",
      });
    } finally {
      setUpdatingTrackingNumber("");
    }
  };

  const filteredShipments = useMemo(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    return shipments.filter((shipment) => {
      const matchesSearch =
        !searchValue ||
        shipment.trackingNumber?.toLowerCase().includes(searchValue) ||
        shipment.senderName?.toLowerCase().includes(searchValue) ||
        shipment.receiverName?.toLowerCase().includes(searchValue) ||
        shipment.source?.toLowerCase().includes(searchValue) ||
        shipment.destination?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || shipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

  const shipmentStatistics = useMemo(() => {
    return {
      total: shipments.length,
      pending: shipments.filter(
        (shipment) => shipment.status === "PENDING"
      ).length,
      active: shipments.filter((shipment) =>
        ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
          shipment.status
        )
      ).length,
      delivered: shipments.filter(
        (shipment) => shipment.status === "DELIVERED"
      ).length,
    };
  }, [shipments]);

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: "◷",
      PICKED_UP: "↥",
      IN_TRANSIT: "➜",
      OUT_FOR_DELIVERY: "🚚",
      DELIVERED: "✓",
      CANCELLED: "×",
    };

    return icons[status] || "•";
  };

  return (
    <div className="manage-shipments-page">
      <div className="shipment-glow shipment-glow-one"></div>
      <div className="shipment-glow shipment-glow-two"></div>

      <header className="shipment-topbar">
        <Link to="/admin" className="shipment-brand">
          <div className="shipment-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Administration Portal</small>
          </div>
        </Link>

        <div className="shipment-topbar-actions">
          <button
            type="button"
            className="shipment-refresh-button"
            onClick={loadShipments}
            disabled={loading}
          >
            <span className={loading ? "shipment-refreshing" : ""}>
              ↻
            </span>
            Refresh
          </button>

          <Link
            to="/admin"
            className="shipment-dashboard-button"
          >
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="manage-shipments-main">
        <section className="shipment-page-header">
          <div>
            <div className="shipment-page-badge">
              <span></span>
              SHIPMENT OPERATIONS
            </div>

            <h1>Manage Shipments</h1>

            <p>
              Monitor shipment routes, review delivery information and update
              shipment progress from one centralized workspace.
            </p>
          </div>

          <div className="shipment-live-status">
            <span></span>

            <div>
              <strong>Operations Online</strong>
              <small>Shipment data is active</small>
            </div>
          </div>
        </section>

        <section className="shipment-statistics-grid">
          <article className="shipment-stat-card shipment-total-card">
            <div className="shipment-stat-icon">📦</div>

            <div>
              <span>Total Shipments</span>
              <strong>{shipmentStatistics.total}</strong>
              <small>All registered shipments</small>
            </div>
          </article>

          <article className="shipment-stat-card shipment-pending-card">
            <div className="shipment-stat-icon">◷</div>

            <div>
              <span>Pending</span>
              <strong>{shipmentStatistics.pending}</strong>
              <small>Awaiting pickup</small>
            </div>
          </article>

          <article className="shipment-stat-card shipment-active-card">
            <div className="shipment-stat-icon">➜</div>

            <div>
              <span>Active Delivery</span>
              <strong>{shipmentStatistics.active}</strong>
              <small>Currently moving</small>
            </div>
          </article>

          <article className="shipment-stat-card shipment-delivered-card">
            <div className="shipment-stat-icon">✓</div>

            <div>
              <span>Delivered</span>
              <strong>{shipmentStatistics.delivered}</strong>
              <small>Successfully completed</small>
            </div>
          </article>
        </section>

        <section className="shipment-content-card">
          <div className="shipment-content-header">
            <div>
              <span className="shipment-section-label">
                SHIPMENT DIRECTORY
              </span>

              <h2>Shipment Records</h2>

              <p>
                Showing {filteredShipments.length} of {shipments.length}{" "}
                shipments
              </p>
            </div>

            <div className="shipment-record-count">
              <span>📦</span>

              <div>
                <strong>{filteredShipments.length}</strong>
                <small>Visible records</small>
              </div>
            </div>
          </div>

          <div className="shipment-toolbar">
            <div className="shipment-search-box">
              <span className="shipment-search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search tracking number, sender, receiver or location..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="shipment-clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="shipment-filter-box">
              <span>Status</span>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">
                  Out for Delivery
                </option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`shipment-message ${message.type}`}>
              <span>{message.type === "success" ? "✓" : "!"}</span>
              <p>{message.text}</p>
            </div>
          )}

          {loading ? (
            <div className="shipment-loading-state">
              <div className="shipment-loader"></div>
              <h3>Loading shipments</h3>
              <p>Please wait while shipment records are retrieved.</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="shipment-empty-state">
              <div className="shipment-empty-icon">📦</div>

              <h3>No shipments found</h3>

              <p>
                No shipment matches your current search and filter settings.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="shipment-table-wrapper">
              <table className="shipments-table">
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Sender & Receiver</th>
                    <th>Route</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.trackingNumber}>
                      <td>
                        <div className="shipment-tracking-cell">
                          <div className="shipment-package-icon">📦</div>

                          <div>
                            <strong>{shipment.trackingNumber}</strong>
                            <span>Tracking number</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="shipment-people-cell">
                          <div>
                            <span className="shipment-person-label">
                              FROM
                            </span>
                            <strong>
                              {shipment.senderName || "Not available"}
                            </strong>
                          </div>

                          <span className="shipment-person-arrow">→</span>

                          <div>
                            <span className="shipment-person-label">
                              TO
                            </span>
                            <strong>
                              {shipment.receiverName || "Not available"}
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="shipment-route-cell">
                          <div>
                            <span className="shipment-route-dot source"></span>
                            <span>
                              {shipment.source || "Not available"}
                            </span>
                          </div>

                          <span className="shipment-route-line"></span>

                          <div>
                            <span className="shipment-route-dot destination"></span>
                            <span>
                              {shipment.destination || "Not available"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`shipment-status-badge shipment-status-${shipment.status?.toLowerCase()}`}
                        >
                          <span>{getStatusIcon(shipment.status)}</span>
                          {formatStatus(shipment.status)}
                        </span>
                      </td>

                      <td>
                        <div className="shipment-status-select-wrapper">
                          <select
                            value={shipment.status}
                            onChange={(event) =>
                              handleStatusChange(
                                shipment.trackingNumber,
                                event.target.value
                              )
                            }
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PICKED_UP">Picked Up</option>
                            <option value="IN_TRANSIT">In Transit</option>
                            <option value="OUT_FOR_DELIVERY">
                              Out for Delivery
                            </option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="shipment-update-button"
                          onClick={() =>
                            handleUpdate(
                              shipment.trackingNumber,
                              shipment.status
                            )
                          }
                          disabled={
                            updatingTrackingNumber ===
                            shipment.trackingNumber
                          }
                        >
                          {updatingTrackingNumber ===
                          shipment.trackingNumber ? (
                            <>
                              <span className="shipment-button-loader"></span>
                              Updating
                            </>
                          ) : (
                            <>
                              <span>↻</span>
                              Update
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredShipments.length > 0 && (
            <div className="shipment-table-footer">
              <p>
                Showing <strong>{filteredShipments.length}</strong>{" "}
                shipment
                {filteredShipments.length !== 1 ? "s" : ""}
              </p>

              <span>ShipTrack-Pro Operations Center</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageShipmentsPage;