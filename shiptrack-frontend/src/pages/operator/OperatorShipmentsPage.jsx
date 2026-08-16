import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OperatorShipmentsPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const STATUS_OPTIONS = [
  "ALL",
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELAYED",
  "FAILED_DELIVERY",
];

function OperatorShipmentsPage() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const getStoredToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken")
    );
  };

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const token = getStoredToken();

      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your login session has expired or you do not have permission."
        );
      }

      if (!response.ok) {
        throw new Error("Unable to load shipments from the server.");
      }

      const responseData = await response.json();

      const shipmentList = Array.isArray(responseData)
        ? responseData
        : responseData.content ||
          responseData.shipments ||
          responseData.data ||
          [];

      setShipments(shipmentList);
    } catch (error) {
      console.error("Failed to fetch operator shipments:", error);
      setErrorMessage(
        error.message || "Something went wrong while loading shipments."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeText = (value) => {
    return String(value ?? "").trim().toLowerCase();
  };

  const getTrackingNumber = (shipment) => {
    return (
      shipment.trackingNumber ||
      shipment.tracking_number ||
      shipment.trackingId ||
      `SHIP-${shipment.id ?? "N/A"}`
    );
  };

  const getShipmentStatus = (shipment) => {
    return shipment.status || "CREATED";
  };

  const getSenderName = (shipment) => {
    return (
      shipment.senderName ||
      shipment.sender_name ||
      shipment.sender?.name ||
      "Not available"
    );
  };

  const getReceiverName = (shipment) => {
    return (
      shipment.receiverName ||
      shipment.receiver_name ||
      shipment.receiver?.name ||
      "Not available"
    );
  };

  const getDeliveryAddress = (shipment) => {
    return (
      shipment.deliveryAddress ||
      shipment.delivery_address ||
      shipment.destinationAddress ||
      shipment.receiverAddress ||
      "Delivery address not available"
    );
  };

  const getCurrentLocation = (shipment) => {
    return (
      shipment.currentLocation ||
      shipment.lastLocation ||
      shipment.locationName ||
      shipment.currentAddress ||
      "Location not updated"
    );
  };

  const getEstimatedArrival = (shipment) => {
    return (
      shipment.estimatedArrival ||
      shipment.estimatedDeliveryTime ||
      shipment.eta ||
      shipment.expectedDeliveryDate ||
      "Not calculated"
    );
  };

  const filteredShipments = useMemo(() => {
    const normalizedSearch = normalizeText(searchText);

    return shipments.filter((shipment) => {
      const status = String(getShipmentStatus(shipment)).toUpperCase();

      const matchesStatus =
        selectedStatus === "ALL" || status === selectedStatus;

      const searchableValues = [
        getTrackingNumber(shipment),
        getSenderName(shipment),
        getReceiverName(shipment),
        getDeliveryAddress(shipment),
        getCurrentLocation(shipment),
        status,
      ];

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableValues.some((value) =>
          normalizeText(value).includes(normalizedSearch)
        );

      return matchesStatus && matchesSearch;
    });
  }, [shipments, searchText, selectedStatus]);

  const statistics = useMemo(() => {
    const countStatus = (status) =>
      shipments.filter(
        (shipment) =>
          String(getShipmentStatus(shipment)).toUpperCase() === status
      ).length;

    return {
      total: shipments.length,
      inTransit: countStatus("IN_TRANSIT"),
      outForDelivery: countStatus("OUT_FOR_DELIVERY"),
      delivered: countStatus("DELIVERED"),
    };
  }, [shipments]);

  const formatStatus = (status) => {
    return String(status || "CREATED")
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "CREATED").toLowerCase();

    return `operator-shipment-status status-${normalizedStatus.replaceAll(
      "_",
      "-"
    )}`;
  };

  const formatDateTime = (value) => {
    if (!value || value === "Not calculated") {
      return value || "Not calculated";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleViewShipment = (shipment) => {
    const shipmentId = shipment.id || shipment.shipmentId;

    if (!shipmentId) {
      return;
    }

    navigate(`/operator/shipments/${shipmentId}`);
  };

  const handleUpdateShipment = (shipment) => {
    const shipmentId = shipment.id || shipment.shipmentId;

    if (!shipmentId) {
      return;
    }

    navigate(`/operator/shipments/${shipmentId}/update`);
  };

  return (
    <div className="operator-shipments-page">
      <div className="operator-shipments-background-glow glow-left"></div>
      <div className="operator-shipments-background-glow glow-right"></div>

      <header className="operator-shipments-header">
        <Link to="/operator" className="operator-shipments-brand">
          <div className="operator-shipments-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Operator Workspace</small>
          </div>
        </Link>

        <nav className="operator-shipments-navigation">
          <Link to="/operator">Dashboard</Link>
          <Link
            to="/operator/shipments"
            className="operator-navigation-active"
          >
            Shipments
          </Link>
        </nav>

        <Link to="/operator" className="operator-back-dashboard-button">
          <span>←</span>
          Dashboard
        </Link>
      </header>

      <main className="operator-shipments-main">
        <section className="operator-shipments-hero">
          <div>
            <div className="operator-page-badge">
              <span></span>
              DELIVERY OPERATIONS
            </div>

            <h1>Assigned Shipments</h1>

            <p>
              Review active deliveries, monitor shipment progress and open any
              shipment to update its current status, location and estimated
              delivery time.
            </p>
          </div>

          <button
            type="button"
            className="operator-refresh-button"
            onClick={fetchShipments}
            disabled={isLoading}
          >
            <span className={isLoading ? "refresh-icon spinning" : "refresh-icon"}>
              ↻
            </span>

            {isLoading ? "Refreshing..." : "Refresh Shipments"}
          </button>
        </section>

        <section className="operator-shipment-statistics">
          <article className="operator-shipment-stat-card">
            <div className="operator-shipment-stat-icon stat-total">📦</div>

            <div>
              <span>Total Shipments</span>
              <strong>{statistics.total}</strong>
              <small>Available assignments</small>
            </div>
          </article>

          <article className="operator-shipment-stat-card">
            <div className="operator-shipment-stat-icon stat-transit">↗</div>

            <div>
              <span>In Transit</span>
              <strong>{statistics.inTransit}</strong>
              <small>Currently moving</small>
            </div>
          </article>

          <article className="operator-shipment-stat-card">
            <div className="operator-shipment-stat-icon stat-delivery">⌖</div>

            <div>
              <span>Out for Delivery</span>
              <strong>{statistics.outForDelivery}</strong>
              <small>Final delivery stage</small>
            </div>
          </article>

          <article className="operator-shipment-stat-card">
            <div className="operator-shipment-stat-icon stat-complete">✓</div>

            <div>
              <span>Delivered</span>
              <strong>{statistics.delivered}</strong>
              <small>Completed shipments</small>
            </div>
          </article>
        </section>

        <section className="operator-shipment-control-panel">
          <div className="operator-shipment-search-wrapper">
            <span className="operator-search-icon">⌕</span>

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by tracking number, customer, address or location"
              aria-label="Search shipments"
            />

            {searchText && (
              <button
                type="button"
                className="operator-clear-search-button"
                onClick={() => setSearchText("")}
                aria-label="Clear shipment search"
              >
                ×
              </button>
            )}
          </div>

          <div className="operator-status-filter-wrapper">
            <label htmlFor="operator-status-filter">Shipment status</label>

            <select
              id="operator-status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="operator-shipment-results-section">
          <div className="operator-results-heading">
            <div>
              <span>SHIPMENT DIRECTORY</span>
              <h2>Delivery assignments</h2>
            </div>

            <p>
              Showing <strong>{filteredShipments.length}</strong> of{" "}
              <strong>{shipments.length}</strong> shipments
            </p>
          </div>

          {isLoading && (
            <div className="operator-shipment-state-card">
              <div className="operator-loading-spinner"></div>
              <h3>Loading shipments</h3>
              <p>Please wait while shipment assignments are retrieved.</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="operator-shipment-state-card operator-error-state">
              <div className="operator-state-icon">!</div>
              <h3>Unable to load shipments</h3>
              <p>{errorMessage}</p>

              <button type="button" onClick={fetchShipments}>
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            filteredShipments.length === 0 && (
              <div className="operator-shipment-state-card">
                <div className="operator-state-icon">📭</div>
                <h3>No shipments found</h3>
                <p>
                  No shipments match the current search text and status filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setSelectedStatus("ALL");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!isLoading &&
            !errorMessage &&
            filteredShipments.length > 0 && (
              <div className="operator-shipment-card-grid">
                {filteredShipments.map((shipment) => {
                  const shipmentId =
                    shipment.id ||
                    shipment.shipmentId ||
                    getTrackingNumber(shipment);

                  const shipmentStatus = getShipmentStatus(shipment);

                  return (
                    <article
                      className="operator-shipment-card"
                      key={shipmentId}
                    >
                      <div className="operator-shipment-card-header">
                        <div>
                          <span className="operator-tracking-label">
                            TRACKING NUMBER
                          </span>

                          <h3>{getTrackingNumber(shipment)}</h3>
                        </div>

                        <span className={getStatusClass(shipmentStatus)}>
                          {formatStatus(shipmentStatus)}
                        </span>
                      </div>

                      <div className="operator-shipment-route">
                        <div className="operator-route-person">
                          <span className="operator-route-marker sender-marker">
                            S
                          </span>

                          <div>
                            <small>Sender</small>
                            <strong>{getSenderName(shipment)}</strong>
                          </div>
                        </div>

                        <div className="operator-route-line">
                          <span></span>
                          <div>🚚</div>
                          <span></span>
                        </div>

                        <div className="operator-route-person receiver-person">
                          <span className="operator-route-marker receiver-marker">
                            R
                          </span>

                          <div>
                            <small>Receiver</small>
                            <strong>{getReceiverName(shipment)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="operator-shipment-information-grid">
                        <div className="operator-shipment-information-item">
                          <span className="operator-information-icon">📍</span>

                          <div>
                            <small>Current location</small>
                            <strong>{getCurrentLocation(shipment)}</strong>
                          </div>
                        </div>

                        <div className="operator-shipment-information-item">
                          <span className="operator-information-icon">⏱</span>

                          <div>
                            <small>Estimated arrival</small>
                            <strong>
                              {formatDateTime(getEstimatedArrival(shipment))}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="operator-shipment-address">
                        <span>⌂</span>

                        <div>
                          <small>Delivery address</small>
                          <p>{getDeliveryAddress(shipment)}</p>
                        </div>
                      </div>

                      <div className="operator-shipment-card-actions">
                        <button
                          type="button"
                          className="operator-view-shipment-button"
                          onClick={() => handleViewShipment(shipment)}
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="operator-update-shipment-button"
                          onClick={() => handleUpdateShipment(shipment)}
                        >
                          Update Shipment
                          <span>→</span>
                        </button>

                        {String(shipmentStatus).toUpperCase() ===
                          "OUT_FOR_DELIVERY" && (
                          <Link
                            to={`/operator/shipments/${getTrackingNumber(
                              shipment
                            )}/proof-of-delivery`}
                            className="operator-pod-button"
                          >
                            <span>✍</span>
                            Proof of Delivery
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default OperatorShipmentsPage;