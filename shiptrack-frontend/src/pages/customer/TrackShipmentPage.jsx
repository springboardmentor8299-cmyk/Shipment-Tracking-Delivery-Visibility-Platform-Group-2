import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ShipmentMap from "../../components/ShipmentMap";
import {
  getShipmentDetails,
  getShipmentHistory,
} from "../../api/shipmentService";
import "./TrackShipment.css";

function TrackShipmentPage() {
  const { trackingNumber } = useParams();

  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTrackingData();
  }, [trackingNumber]);

  const loadTrackingData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [shipmentResponse, historyResponse] =
        await Promise.all([
          getShipmentDetails(trackingNumber),
          getShipmentHistory(trackingNumber),
        ]);

      setShipment(shipmentResponse.data);

      setHistory(
        Array.isArray(historyResponse.data)
          ? historyResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load shipment tracking information:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load shipment tracking information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinate = (coordinate) => {
    if (
      coordinate === null ||
      coordinate === undefined ||
      coordinate === ""
    ) {
      return "Not available";
    }

    const numericCoordinate = Number(coordinate);

    if (Number.isNaN(numericCoordinate)) {
      return "Not available";
    }

    return numericCoordinate.toFixed(6);
  };

  const formatCoordinates = (latitude, longitude) => {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return "Coordinates not available";
    }

    return `${formatCoordinate(latitude)}, ${formatCoordinate(
      longitude
    )}`;
  };

  const getHistoryLocation = (event) => {
    if (event.location) {
      return event.location;
    }

    if (
      event.latitude !== null &&
      event.latitude !== undefined &&
      event.longitude !== null &&
      event.longitude !== undefined
    ) {
      return formatCoordinates(
        event.latitude,
        event.longitude
      );
    }

    return "Location not available";
  };

  const statusSteps = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const progressStatus =
    shipment?.status === "PENDING"
      ? "CREATED"
      : shipment?.status;

  const currentStatusIndex =
    statusSteps.indexOf(progressStatus);

  const isShipmentStopped = [
    "CANCELLED",
    "FAILED_DELIVERY",
  ].includes(shipment?.status);

  const getProgressWidth = () => {
    if (isShipmentStopped || currentStatusIndex < 0) {
      return "0%";
    }

    return `${
      (currentStatusIndex / (statusSteps.length - 1)) *
      100
    }%`;
  };

  if (loading) {
    return (
      <div className="track-shipment-page">
        <div className="track-shipment-loading">
          <div className="track-shipment-loader"></div>

          <h2>Loading shipment tracking</h2>

          <p>
            Please wait while we retrieve the latest shipment
            information.
          </p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="track-shipment-page">
        <div className="track-shipment-error-page">
          <div className="track-shipment-error-icon">
            !
          </div>

          <h2>Unable to track shipment</h2>

          <p>
            {error ||
              "Shipment information could not be found."}
          </p>

          <div className="track-shipment-error-actions">
            <button
              type="button"
              onClick={() => loadTrackingData()}
            >
              Try Again
            </button>

            <Link to="/customer/shipments">
              Back to Shipments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="track-shipment-page">
      <div className="track-shipment-glow track-glow-one"></div>
      <div className="track-shipment-glow track-glow-two"></div>

      <header className="track-shipment-topbar">
        <Link
          to="/customer/dashboard"
          className="track-shipment-brand"
        >
          <div className="track-shipment-brand-icon">
            🚚
          </div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>

            <small>Customer Portal</small>
          </div>
        </Link>

        <div className="track-shipment-topbar-actions">
          <button
            type="button"
            className="track-shipment-refresh-button"
            onClick={() => loadTrackingData(true)}
            disabled={refreshing}
          >
            <span className={refreshing ? "refreshing" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/customer/shipments"
            className="track-shipment-back-button"
          >
            <span>←</span>
            My Shipments
          </Link>
        </div>
      </header>

      <main className="track-shipment-main">
        <section className="track-shipment-hero">
          <div className="track-shipment-hero-content">
            <div className="track-shipment-badge">
              <span></span>
              LIVE SHIPMENT TRACKING
            </div>

            <h1>Track Shipment</h1>

            <p>
              Follow your shipment journey, view its live
              location, estimated delivery time and complete
              tracking history.
            </p>
          </div>

          <div className="track-shipment-current-status">
            <span>Current Status</span>

            <strong
              className={`track-current-status ${
                shipment.status || "UNKNOWN"
              }`}
            >
              <span></span>

              {formatStatus(shipment.status)}
            </strong>
          </div>
        </section>

        <section className="track-shipment-overview">
          <div className="track-shipment-main-card">
            <div className="track-shipment-card-header">
              <div>
                <span className="track-shipment-section-label">
                  SHIPMENT OVERVIEW
                </span>

                <h2>{shipment.trackingNumber}</h2>

                <p>
                  Complete shipment and delivery information
                </p>
              </div>

              <div className="track-shipment-package-icon">
                📦
              </div>
            </div>

            <div className="track-shipment-details-grid">
              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon sender">
                   {shipment.senderName?.trim().charAt(0).toUpperCase() }
                </div>

                <div>
                  <span>Sender</span>

                  <strong>
                    {shipment.senderName || "Not available"}
                  </strong>

                  <small>Shipment origin contact</small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon receiver">
                  {shipment.receiverName?.trim().charAt(0).toUpperCase()}
                </div>

                <div>
                  <span>Receiver</span>

                  <strong>
                    {shipment.receiverName ||
                      "Not available"}
                  </strong>

                  <small>Shipment delivery contact</small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon source">
                  ●
                </div>

                <div>
                  <span>Source Location</span>

                  <strong>
                    {shipment.source || "Not available"}
                  </strong>

                  <small>Shipment pickup location</small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon destination">
                  ●
                </div>

                <div>
                  <span>Destination</span>

                  <strong>
                    {shipment.destination ||
                      "Not available"}
                  </strong>

                  <small>Final delivery location</small>
                </div>
              </article>
{/*
              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon source">
                  ⌖
                </div>

                <div>
                  <span>Current Coordinates</span>

                  <strong>
                    {formatCoordinates(
                      shipment.currentLatitude,
                      shipment.currentLongitude
                    )}
                  </strong>

                  <small>
                    Latest recorded shipment position
                  </small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon destination">
                  ⌖
                </div>

                <div>
                  <span>Destination Coordinates</span>

                  <strong>
                    {formatCoordinates(
                      shipment.destinationLatitude,
                      shipment.destinationLongitude
                    )}
                  </strong>

                  <small>
                    Final delivery coordinates
                  </small>
                </div>
              </article>
*/}
              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon sender">
                  ⏱
                </div>

                <div>
                  <span>Estimated Delivery</span>

                  <strong>
                    {shipment.estimatedDeliveryTime
                      ? formatDate(
                          shipment.estimatedDeliveryTime
                        )
                      : "Calculating..."}
                  </strong>

                  <small>
                    Predicted arrival date and time
                  </small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon receiver">
                  ↻
                </div>

                <div>
                  <span>Last Location Update</span>

                  <strong>
                    {formatDate(
                      shipment.lastLocationUpdate
                    )}
                  </strong>

                  <small>
                    Time of the latest position update
                  </small>
                </div>
              </article>
            </div>

            <div className="track-shipment-details-grid">
              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon sender">
                  !
                </div>

                <div>
                  <span>Predicted Delay</span>

                  <strong>
                    {shipment.predictedDelayMinutes > 0
                      ? `${shipment.predictedDelayMinutes} minutes`
                      : "No delay predicted"}
                  </strong>

                  <small>
                    Current estimated delivery delay
                  </small>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon receiver">
                  i
                </div>

                <div>
                  <span>Delay Reason</span>

                  <strong>
                    {shipment.delayReason ||
                      "No delay reason available"}
                  </strong>

                  <small>
                    Explanation for the predicted delay
                  </small>
                </div>
              </article>
            </div>
          </div>

          <aside className="track-shipment-route-card">
            <div className="track-shipment-route-header">
              <div>
                <span className="track-shipment-section-label">
                  ROUTE SUMMARY
                </span>

                <h3>Delivery journey</h3>
              </div>

              <div className="track-shipment-route-icon">
                ⌖
              </div>
            </div>

            <div className="track-shipment-route-content">
              <div className="track-route-grid"></div>
              <div className="track-route-line"></div>

              <div className="track-route-location">
                <span className="track-route-dot source"></span>

                <div>
                  <small>Origin</small>

                  <strong>
                    {shipment.source || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="track-route-truck">
                🚚
              </div>

              <div className="track-route-location destination">
                <span className="track-route-dot destination"></span>

                <div>
                  <small>Destination</small>

                  <strong>
                    {shipment.destination ||
                      "Not available"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="track-shipment-details-grid">
              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon source">
                  ⌖
                </div>

                <div>
                  <span>Current Position</span>

                  <strong>
                    {formatCoordinates(
                      shipment.currentLatitude,
                      shipment.currentLongitude
                    )}
                  </strong>
                </div>
              </article>

              <article className="track-shipment-detail-card">
                <div className="track-shipment-detail-icon destination">
                  ◎
                </div>

                <div>
                  <span>Delivery Position</span>

                  <strong>
                    {formatCoordinates(
                      shipment.destinationLatitude,
                      shipment.destinationLongitude
                    )}
                  </strong>
                </div>
              </article>
            </div>
          </aside>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <ShipmentMap
            trackingNumber={shipment.trackingNumber}
            currentLatitude={shipment.currentLatitude}
            currentLongitude={shipment.currentLongitude}
            destinationLatitude={shipment.destinationLatitude}
            destinationLongitude={shipment.destinationLongitude}
            currentStatus={shipment.status}
            estimatedDeliveryTime={shipment.estimatedDeliveryTime}
            lastLocationUpdate={shipment.lastLocationUpdate}
          />
        </section>

        <section className="track-shipment-progress-card">
          <div className="track-shipment-progress-header">
            <div>
              <span className="track-shipment-section-label">
                DELIVERY PROGRESS
              </span>

              <h2>Shipment journey</h2>

              <p>
                Track each stage of the shipment from creation
                to delivery.
              </p>
            </div>

            <span
              className={`track-progress-status ${
                shipment.status || "UNKNOWN"
              }`}
            >
              {formatStatus(shipment.status)}
            </span>
          </div>

          {shipment.status === "CANCELLED" ? (
            <div className="track-shipment-cancelled">
              <div>×</div>

              <section>
                <h3>Shipment Cancelled</h3>

                <p>
                  This shipment has been cancelled and will not
                  continue through the delivery process.
                </p>
              </section>
            </div>
          ) : shipment.status === "FAILED_DELIVERY" ? (
            <div className="track-shipment-cancelled">
              <div>!</div>

              <section>
                <h3>Delivery Attempt Failed</h3>

                <p>
                  The delivery attempt was unsuccessful. Check
                  the latest tracking event or contact support
                  for further information.
                </p>
              </section>
            </div>
          ) : (
            <div className="track-progress-wrapper">
              <div className="track-progress-line">
                <div
                  className="track-progress-line-active"
                  style={{
                    width: getProgressWidth(),
                  }}
                ></div>
              </div>

              <div className="track-progress-steps">
                {statusSteps.map((status, index) => {
                  const isCompleted =
                    index <= currentStatusIndex;

                  const isCurrent =
                    index === currentStatusIndex;

                  return (
                    <div
                      key={status}
                      className={`track-progress-step ${
                        isCompleted ? "completed" : ""
                      } ${
                        isCurrent ? "current" : ""
                      }`}
                    >
                      <div className="track-progress-circle">
                        {isCompleted ? "✓" : index + 1}
                      </div>

                      <strong>
                        {formatStatus(status)}
                      </strong>

                      <small>
                        {status === "CREATED" &&
                          "Shipment created"}

                        {status === "PICKED_UP" &&
                          "Collected from source"}

                        {status === "IN_TRANSIT" &&
                          "Moving to destination"}

                        {status === "OUT_FOR_DELIVERY" &&
                          "Arriving soon"}

                        {status === "DELIVERED" &&
                          "Delivery completed"}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="track-history-card">
          <div className="track-history-header">
            <div>
              <span className="track-shipment-section-label">
                TRACKING HISTORY
              </span>

              <h2>Shipment activity</h2>

              <p>
                A chronological record of shipment status and
                location updates.
              </p>
            </div>

            <div className="track-history-count">
              <strong>{history.length}</strong>
              <span>Updates</span>
            </div>
          </div>

          {history.length > 0 ? (
            <>
              <div className="track-history-timeline">
                {history.map((event, index) => (
                  <article
                    className="track-history-event"
                    key={
                      event.id ||
                      `${event.eventTime}-${index}`
                    }
                  >
                    <div className="track-history-marker">
                      <span></span>
                    </div>

                    <div className="track-history-event-card">
                      <div className="track-history-event-header">
                        <div>
                          <span
                            className={`track-event-status ${
                              event.status || "UNKNOWN"
                            }`}
                          >
                            {formatStatus(event.status)}
                          </span>

                          <h3>
                            {formatStatus(event.status)}
                          </h3>
                        </div>

                        <time>
                          {formatDate(event.eventTime)}
                        </time>
                      </div>

                      <div className="track-history-location">
                        <span>⌖</span>

                        <div>
                          <small>Location</small>

                          <strong>
                            {getHistoryLocation(event)}
                          </strong>
                        </div>
                      </div>

                      {event.latitude !== null &&
                        event.latitude !== undefined &&
                        event.longitude !== null &&
                        event.longitude !== undefined && (
                          <div className="track-history-location">
                            <span>◎</span>

                            <div>
                              <small>
                                GPS Coordinates
                              </small>

                              <strong>
                                {formatCoordinates(
                                  event.latitude,
                                  event.longitude
                                )}
                              </strong>
                            </div>
                          </div>
                        )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="track-history-table-wrapper">
                <table className="track-history-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Location</th>
                      
                      <th>Date and Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((event, index) => (
                      <tr
                        key={
                          event.id ||
                          `${event.eventTime}-${index}`
                        }
                      >
                        <td>
                          <span
                            className={`track-table-status ${
                              event.status || "UNKNOWN"
                            }`}
                          >
                            <span></span>

                            {formatStatus(event.status)}
                          </span>
                        </td>

                        <td>
                          <div className="track-table-location">
                            <span>⌖</span>

                            {event.location ||
                              "Not available"}
                          </div>
                        </td>

                        

                        <td>
                          {formatDate(event.eventTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="track-history-empty">
              <div>⌛</div>

              <h3>No tracking history available</h3>

              <p>
                Tracking events will appear here after shipment
                processing begins.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TrackShipmentPage;