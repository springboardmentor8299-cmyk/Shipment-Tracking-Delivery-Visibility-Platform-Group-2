import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyShipments } from "../../api/shipmentService";
import "./MyShipments.css";

function MyShipmentsPage() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyShipments();

      setShipments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Unable to load shipments:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your shipments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "Calculating...";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        shipment.trackingNumber
          ?.toLowerCase()
          .includes(query) ||
        shipment.senderName?.toLowerCase().includes(query) ||
        shipment.receiverName
          ?.toLowerCase()
          .includes(query) ||
        shipment.source?.toLowerCase().includes(query) ||
        shipment.destination?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        shipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

  const shipmentStats = useMemo(() => {
    const activeStatuses = [
      "CREATED",
      "PENDING",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
    ];

    return {
      total: shipments.length,

      active: shipments.filter((shipment) =>
        activeStatuses.includes(shipment.status)
      ).length,

      delivered: shipments.filter(
        (shipment) => shipment.status === "DELIVERED"
      ).length,

      cancelled: shipments.filter((shipment) =>
        ["CANCELLED", "FAILED_DELIVERY"].includes(
          shipment.status
        )
      ).length,
    };
  }, [shipments]);

  return (
    <div className="my-shipments-page">
      <div className="my-shipments-glow my-shipments-glow-one"></div>
      <div className="my-shipments-glow my-shipments-glow-two"></div>

      <header className="my-shipments-topbar">
        <Link
          to="/customer"
          className="my-shipments-brand"
        >
          <div className="my-shipments-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>

            <small>Customer Portal</small>
          </div>
        </Link>

        <div className="my-shipments-topbar-actions">
          <Link
            to="/customer/create-shipment"
            className="my-shipments-create-button"
          >
            <span>＋</span>
            New Shipment
          </Link>

          <Link
            to="/customer"
            className="my-shipments-back-button"
          >
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="my-shipments-main">
        <section className="my-shipments-hero">
          <div className="my-shipments-hero-content">
            <div className="my-shipments-badge">
              <span></span>
              SHIPMENT WORKSPACE
            </div>

            <h1>My Shipments</h1>

            <p>
              View all your shipments, monitor delivery
              progress, check estimated delivery times and open
              detailed tracking information from one place.
            </p>
          </div>

          <div className="my-shipments-hero-actions">
            <button
              type="button"
              className="my-shipments-refresh-button"
              onClick={loadShipments}
              disabled={loading}
            >
              <span className={loading ? "refreshing" : ""}>
                ↻
              </span>

              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </section>

        <section className="my-shipments-stats">
          <article className="my-shipments-stat-card">
            <div className="my-shipments-stat-icon total">
              ▦
            </div>

            <div>
              <span>Total Shipments</span>
              <strong>{shipmentStats.total}</strong>
              <small>All shipment records</small>
            </div>
          </article>

          <article className="my-shipments-stat-card">
            <div className="my-shipments-stat-icon active">
              ⌖
            </div>

            <div>
              <span>Active Shipments</span>
              <strong>{shipmentStats.active}</strong>
              <small>Currently in progress</small>
            </div>
          </article>

          <article className="my-shipments-stat-card">
            <div className="my-shipments-stat-icon delivered">
              ✓
            </div>

            <div>
              <span>Delivered</span>
              <strong>{shipmentStats.delivered}</strong>
              <small>Completed successfully</small>
            </div>
          </article>

          <article className="my-shipments-stat-card">
            <div className="my-shipments-stat-icon cancelled">
              ×
            </div>

            <div>
              <span>Cancelled or Failed</span>
              <strong>{shipmentStats.cancelled}</strong>
              <small>Unsuccessful shipments</small>
            </div>
          </article>
        </section>

        <section className="my-shipments-content-card">
          <div className="my-shipments-content-header">
            <div>
              <span className="my-shipments-section-label">
                SHIPMENT DIRECTORY
              </span>

              <h2>Your shipment records</h2>

              <p>
                Search, filter and open any shipment to view its
                complete tracking journey.
              </p>
            </div>

            <div className="my-shipments-record-count">
              <span>Showing</span>
              <strong>{filteredShipments.length}</strong>
              <small>records</small>
            </div>
          </div>

          <div className="my-shipments-toolbar">
            <div className="my-shipments-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tracking number, sender, receiver or location"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="my-shipments-filter">
              <label htmlFor="shipment-status-filter">
                Status
              </label>

              <select
                id="shipment-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>

                <option value="OUT_FOR_DELIVERY">
                  Out for Delivery
                </option>

                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>

                <option value="FAILED_DELIVERY">
                  Failed Delivery
                </option>
              </select>
            </div>
          </div>

          {error && (
            <div className="my-shipments-error">
              <div className="my-shipments-error-icon">
                !
              </div>

              <div>
                <strong>Unable to load shipments</strong>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={loadShipments}
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="my-shipments-loading">
              <div className="my-shipments-loader"></div>

              <h3>Loading your shipments</h3>

              <p>
                Please wait while we retrieve your shipment
                records.
              </p>
            </div>
          ) : filteredShipments.length > 0 ? (
            <>
              <div className="my-shipments-table-wrapper">
                <table className="shipments-table">
                  <thead>
                    <tr>
                      <th>Tracking Number</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>ETA</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.trackingNumber}>
                        <td>
                          <div className="my-shipments-tracking-cell">
                            <div className="my-shipments-package-icon">
                              ▣
                            </div>

                            <div>
                              <span>Tracking ID</span>

                              <strong>
                                {shipment.trackingNumber}
                              </strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="my-shipments-person-cell">
                            <div className="my-shipments-avatar">
                              {shipment.senderName
                                ?.charAt(0)
                                .toUpperCase() || "S"}
                            </div>

                            <div>
                              <span>Sender</span>

                              <strong>
                                {shipment.senderName ||
                                  "Not available"}
                              </strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="my-shipments-person-cell">
                            <div className="my-shipments-avatar receiver">
                              {shipment.receiverName
                                ?.charAt(0)
                                .toUpperCase() || "R"}
                            </div>

                            <div>
                              <span>Receiver</span>

                              <strong>
                                {shipment.receiverName ||
                                  "Not available"}
                              </strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="my-shipments-route-cell">
                            <div className="my-shipments-route-point source">
                              <span></span>

                              <div>
                                <small>From</small>

                                <strong>
                                  {shipment.source ||
                                    "Not available"}
                                </strong>
                              </div>
                            </div>

                            <div className="my-shipments-route-line"></div>

                            <div className="my-shipments-route-point destination">
                              <span></span>

                              <div>
                                <small>To</small>

                                <strong>
                                  {shipment.destination ||
                                    "Not available"}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`my-shipments-status ${
                              shipment.status || "UNKNOWN"
                            }`}
                          >
                            <span></span>

                            {formatStatus(shipment.status)}
                          </span>
                        </td>

                        <td>
                          <div className="my-shipments-eta-cell">
                            <small>
                              Estimated Delivery
                            </small>

                            <strong>
                              {formatDateTime(
                                shipment.estimatedDeliveryTime
                              )}
                            </strong>

                            {shipment.predictedDelayMinutes >
                              0 && (
                              <p className="my-shipments-delay-text">
                                Delay:{" "}
                                {
                                  shipment.predictedDelayMinutes
                                }{" "}
                                minutes
                              </p>
                            )}

                            {shipment.delayReason && (
                              <small className="my-shipments-delay-reason">
                                {shipment.delayReason}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="my-shipments-view-button"
                            onClick={() =>
                              navigate(
                                `/customer/track/${shipment.trackingNumber}`
                              )
                            }
                          >
                            View Tracking
                            <span>→</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="my-shipments-mobile-list">
                {filteredShipments.map((shipment) => (
                  <article
                    className="my-shipments-mobile-card"
                    key={shipment.trackingNumber}
                  >
                    <div className="my-shipments-mobile-header">
                      <div>
                        <span>Tracking Number</span>

                        <strong>
                          {shipment.trackingNumber}
                        </strong>
                      </div>

                      <span
                        className={`my-shipments-status ${
                          shipment.status || "UNKNOWN"
                        }`}
                      >
                        <span></span>

                        {formatStatus(shipment.status)}
                      </span>
                    </div>

                    <div className="my-shipments-mobile-people">
                      <div>
                        <span>Sender</span>

                        <strong>
                          {shipment.senderName ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Receiver</span>

                        <strong>
                          {shipment.receiverName ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>

                    <div className="my-shipments-mobile-route">
                      <div>
                        <span className="source"></span>

                        <div>
                          <small>Source</small>

                          <strong>
                            {shipment.source ||
                              "Not available"}
                          </strong>
                        </div>
                      </div>

                      <div className="my-shipments-mobile-route-line"></div>

                      <div>
                        <span className="destination"></span>

                        <div>
                          <small>Destination</small>

                          <strong>
                            {shipment.destination ||
                              "Not available"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-shipments-mobile-eta">
                      <div>
                        <span>Estimated Delivery</span>

                        <strong>
                          {formatDateTime(
                            shipment.estimatedDeliveryTime
                          )}
                        </strong>
                      </div>

                      {shipment.predictedDelayMinutes > 0 && (
                        <div className="my-shipments-mobile-delay">
                          <span>Predicted Delay</span>

                          <strong>
                            {shipment.predictedDelayMinutes}{" "}
                            minutes
                          </strong>

                          {shipment.delayReason && (
                            <small>
                              {shipment.delayReason}
                            </small>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="my-shipments-mobile-view-button"
                      onClick={() =>
                        navigate(
                          `/customer/track/${shipment.trackingNumber}`
                        )
                      }
                    >
                      View Shipment Tracking
                      <span>→</span>
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="my-shipments-empty">
              <div className="my-shipments-empty-icon">
                📦
              </div>

              <span className="my-shipments-section-label">
                NO SHIPMENTS FOUND
              </span>

              <h3>
                {shipments.length === 0
                  ? "You have not created any shipments yet"
                  : "No shipments match your search"}
              </h3>

              <p>
                {shipments.length === 0
                  ? "Create your first shipment and start tracking its delivery progress."
                  : "Try changing the search text or selecting a different status filter."}
              </p>

              {shipments.length === 0 ? (
                <Link
                  to="/customer/create-shipment"
                  className="my-shipments-empty-button"
                >
                  Create First Shipment
                  <span>→</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="my-shipments-empty-button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                  <span>↻</span>
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyShipmentsPage;