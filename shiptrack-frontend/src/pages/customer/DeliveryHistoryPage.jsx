import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDeliveryHistory } from "../../api/shipmentService";
import "./DeliveryHistory.css";

function DeliveryHistoryPage() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDeliveryHistory();
      setShipments(response.data || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load delivery history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      return shipments;
    }

    return shipments.filter((shipment) => {
      return (
        shipment.trackingNumber?.toLowerCase().includes(query) ||
        shipment.senderName?.toLowerCase().includes(query) ||
        shipment.receiverName?.toLowerCase().includes(query) ||
        shipment.source?.toLowerCase().includes(query) ||
        shipment.destination?.toLowerCase().includes(query)
      );
    });
  }, [shipments, searchTerm]);

  const uniqueDestinations = useMemo(() => {
    return new Set(
      shipments
        .map((shipment) => shipment.destination)
        .filter(Boolean)
    ).size;
  }, [shipments]);

  const uniqueReceivers = useMemo(() => {
    return new Set(
      shipments
        .map((shipment) => shipment.receiverName)
        .filter(Boolean)
    ).size;
  }, [shipments]);

  const formatStatus = (status) => {
    if (!status) {
      return "Delivered";
    }

    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="delivery-history-page">
      <div className="delivery-history-glow delivery-glow-one"></div>
      <div className="delivery-history-glow delivery-glow-two"></div>

      <header className="delivery-history-topbar">
        <Link to="/customer/dashboard" className="delivery-history-brand">
          <div className="delivery-history-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Customer Portal</small>
          </div>
        </Link>

        <div className="delivery-history-nav-actions">
          <Link
            to="/customer/shipments"
            className="delivery-history-nav-link"
          >
            My Shipments
          </Link>

          <Link
            to="/customer"
            className="delivery-history-back-button"
          >
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="delivery-history-main">
        <section className="delivery-history-hero">
          <div className="delivery-history-hero-content">
            <div className="delivery-history-badge">
              <span></span>
              COMPLETED DELIVERIES
            </div>

            <h1>
              Delivery <span>History</span>
            </h1>

            <p>
              Review all successfully completed shipments, delivery routes,
              recipients, and tracking details from one organized dashboard.
            </p>
          </div>

          <button
            type="button"
            className="delivery-history-refresh-button"
            onClick={loadHistory}
            disabled={loading}
          >
            <span className={loading ? "delivery-refreshing" : ""}>↻</span>
            Refresh History
          </button>
        </section>

        <section className="delivery-history-stats">
          <article className="delivery-history-stat-card">
            <div className="delivery-stat-icon delivered">✓</div>

            <div>
              <span>Total Deliveries</span>
              <strong>{shipments.length}</strong>
              <small>Successfully completed</small>
            </div>
          </article>

          <article className="delivery-history-stat-card">
            <div className="delivery-stat-icon destination">⌖</div>

            <div>
              <span>Destinations</span>
              <strong>{uniqueDestinations}</strong>
              <small>Unique delivery locations</small>
            </div>
          </article>

          <article className="delivery-history-stat-card">
            <div className="delivery-stat-icon receiver">◉</div>

            <div>
              <span>Receivers</span>
              <strong>{uniqueReceivers}</strong>
              <small>Unique shipment receivers</small>
            </div>
          </article>

          <article className="delivery-history-stat-card">
            <div className="delivery-stat-icon success">100%</div>

            <div>
              <span>Completion Status</span>
              <strong>Success</strong>
              <small>Delivered shipment records</small>
            </div>
          </article>
        </section>

        <section className="delivery-history-content">
          <div className="delivery-history-content-header">
            <div>
              <span className="delivery-history-section-label">
                DELIVERY ARCHIVE
              </span>

              <h2>Completed shipment records</h2>

              <p>
                Search your delivery history and open any shipment for complete
                tracking information.
              </p>
            </div>

            <div className="delivery-history-result-count">
              <strong>{filteredShipments.length}</strong>
              <span>Records</span>
            </div>
          </div>

          <div className="delivery-history-toolbar">
            <div className="delivery-history-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tracking number, sender, receiver or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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

            <div className="delivery-history-filter-badge">
              <span></span>
              Delivered Shipments
            </div>
          </div>

          {error && (
            <div className="delivery-history-error">
              <div className="delivery-history-error-icon">!</div>

              <div>
                <strong>Unable to load delivery history</strong>
                <p>{error}</p>
              </div>

              <button type="button" onClick={loadHistory}>
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="delivery-history-loading">
              <div className="delivery-history-loader"></div>

              <h3>Loading delivery history</h3>

              <p>
                Please wait while we retrieve your completed shipment records.
              </p>
            </div>
          ) : filteredShipments.length > 0 ? (
            <>
              <div className="delivery-history-table-wrapper">
                <table className="delivery-table">
                  <thead>
                    <tr>
                      <th>Tracking Number</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Delivery Route</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.trackingNumber}>
                        <td>
                          <div className="delivery-tracking-cell">
                            <div className="delivery-package-icon">▣</div>

                            <div>
                              <span>Tracking ID</span>
                              <strong>{shipment.trackingNumber}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="delivery-person-cell">
                            <div className="delivery-avatar sender">
                              {shipment.senderName
                                ?.charAt(0)
                                .toUpperCase() || "S"}
                            </div>

                            <div>
                              <span>Sender</span>
                              <strong>{shipment.senderName}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="delivery-person-cell">
                            <div className="delivery-avatar receiver">
                              {shipment.receiverName
                                ?.charAt(0)
                                .toUpperCase() || "R"}
                            </div>

                            <div>
                              <span>Receiver</span>
                              <strong>{shipment.receiverName}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="delivery-route-cell">
                            <div className="delivery-route-point">
                              <span className="delivery-source-dot"></span>

                              <div>
                                <small>From</small>
                                <strong>{shipment.source}</strong>
                              </div>
                            </div>

                            <div className="delivery-route-line"></div>

                            <div className="delivery-route-point">
                              <span className="delivery-destination-dot"></span>

                              <div>
                                <small>To</small>
                                <strong>{shipment.destination}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`delivery-status ${
                              shipment.status || "DELIVERED"
                            }`}
                          >
                            <span></span>
                            {formatStatus(shipment.status)}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delivery-view-button"
                            onClick={() =>
                              navigate(
                                `/customer/track/${shipment.trackingNumber}`
                              )
                            }
                          >
                            View Details
                            <span>→</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="delivery-history-mobile-list">
                {filteredShipments.map((shipment) => (
                  <article
                    className="delivery-history-mobile-card"
                    key={shipment.trackingNumber}
                  >
                    <div className="delivery-mobile-card-header">
                      <div>
                        <span>Tracking Number</span>
                        <strong>{shipment.trackingNumber}</strong>
                      </div>

                      <span className="delivery-status DELIVERED">
                        <span></span>
                        {formatStatus(shipment.status)}
                      </span>
                    </div>

                    <div className="delivery-mobile-people">
                      <div>
                        <span>Sender</span>
                        <strong>{shipment.senderName}</strong>
                      </div>

                      <div>
                        <span>Receiver</span>
                        <strong>{shipment.receiverName}</strong>
                      </div>
                    </div>

                    <div className="delivery-mobile-route">
                      <div className="delivery-mobile-route-point">
                        <span className="delivery-source-dot"></span>

                        <div>
                          <small>Source</small>
                          <strong>{shipment.source}</strong>
                        </div>
                      </div>

                      <div className="delivery-mobile-route-line"></div>

                      <div className="delivery-mobile-route-point">
                        <span className="delivery-destination-dot"></span>

                        <div>
                          <small>Destination</small>
                          <strong>{shipment.destination}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="delivery-mobile-view-button"
                      onClick={() =>
                        navigate(
                          `/customer/track/${shipment.trackingNumber}`
                        )
                      }
                    >
                      View Shipment Details
                      <span>→</span>
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="delivery-history-empty">
              <div className="delivery-history-empty-icon">📦</div>

              <span className="delivery-history-section-label">
                NO DELIVERIES FOUND
              </span>

              <h3>
                {shipments.length === 0
                  ? "No delivered shipments found"
                  : "No records match your search"}
              </h3>

              <p>
                {shipments.length === 0
                  ? "Your successfully completed shipments will appear here."
                  : "Try searching with a different tracking number, person, or location."}
              </p>

              {shipments.length > 0 ? (
                <button
                  type="button"
                  className="delivery-empty-button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                  <span>↻</span>
                </button>
              ) : (
                <Link
                  to="/customer/shipments"
                  className="delivery-empty-button"
                >
                  View My Shipments
                  <span>→</span>
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DeliveryHistoryPage;