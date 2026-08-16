import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RouteMap from "../../components/maps/RouteMap";
import "./ShipmentDetailsPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function ShipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const getStoredToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken")
    );
  };
const fetchShipmentDetails = async () => {
  try {
    setIsLoading(true);
    setErrorMessage("");

    const token = getStoredToken();

    const shipmentResponse = await fetch(
      `${API_BASE_URL}/api/shipments/id/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (
      shipmentResponse.status === 401 ||
      shipmentResponse.status === 403
    ) {
      throw new Error(
        "Your login session has expired or you do not have permission to view this shipment."
      );
    }

    if (shipmentResponse.status === 404) {
      throw new Error("The requested shipment could not be found.");
    }

    if (!shipmentResponse.ok) {
      throw new Error("Unable to load shipment details.");
    }

    const shipmentData = await shipmentResponse.json();

    const loadedShipment =
      shipmentData.shipment ||
      shipmentData.data ||
      shipmentData;

    setShipment(loadedShipment);

    await fetchTrackingHistory(
      token,
      loadedShipment.trackingNumber
    );
  } catch (error) {
    console.error("Failed to fetch shipment details:", error);

    setErrorMessage(
      error.message ||
        "Something went wrong while loading shipment details."
    );
  } finally {
    setIsLoading(false);
  }
};

  const fetchTrackingHistory = async (
  token,
  trackingNumberValue
) => {
  try {
    if (!trackingNumberValue) {
      setTrackingEvents([]);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/shipments/${trackingNumberValue}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      setTrackingEvents([]);
      return;
    }

    const responseData = await response.json();

    const eventList = Array.isArray(responseData)
      ? responseData
      : responseData.content ||
        responseData.events ||
        responseData.trackingEvents ||
        responseData.data ||
        [];

    setTrackingEvents(eventList);
  } catch (error) {
    console.warn(
      "Tracking history could not be loaded:",
      error
    );

    setTrackingEvents([]);
  }
};

     

  const getValue = (...values) => {
    return (
      values.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      ) ?? null
    );
  };

  const trackingNumber = useMemo(() => {
    if (!shipment) {
      return "Not available";
    }

    return getValue(
      shipment.trackingNumber,
      shipment.tracking_number,
      shipment.trackingId,
      shipment.shipmentNumber,
      shipment.id ? `SHIP-${shipment.id}` : null
    ) || "Not available";
  }, [shipment]);

  const shipmentStatus = useMemo(() => {
    if (!shipment) {
      return "CREATED";
    }

    return String(
      getValue(shipment.status, shipment.shipmentStatus, "CREATED")
    ).toUpperCase();
  }, [shipment]);

  const senderName = getValue(
    shipment?.senderName,
    shipment?.sender_name,
    shipment?.sender?.name,
    shipment?.sender?.fullName
  );



  const receiverName = getValue(
    shipment?.receiverName,
    shipment?.receiver_name,
    shipment?.receiver?.name,
    shipment?.receiver?.fullName
  );



  const pickupAddress = getValue(
    shipment?.source,
    shipment?.pickupAddress,
    shipment?.senderAddress,
    shipment?.originAddress,
    shipment?.sourceAddress
  );

  const deliveryAddress = getValue(
    shipment?.destination,
    shipment?.deliveryAddress,
    shipment?.delivery_address,
    shipment?.destinationAddress,
    shipment?.receiverAddress
  );


  const estimatedArrival = getValue(
    shipment?.estimatedArrival,
    shipment?.estimatedDeliveryTime,
    shipment?.estimatedDeliveryDate,
    shipment?.eta,
    shipment?.expectedDeliveryDate
  );

  const createdAt = getValue(
    shipment?.createdAt,
    shipment?.created_at,
    shipment?.creationDate
  );

  const predictedDelayMinutes = getValue(
    shipment?.predictedDelayMinutes,
    shipment?.delayMinutes
  );

  const delayReason = getValue(
    shipment?.delayReason,
    shipment?.delayDescription
  );

  const lastLocationUpdate = getValue(
    shipment?.lastLocationUpdate,
    shipment?.locationUpdatedAt
  );




  const latitude = getValue(
    shipment?.currentLatitude,
    shipment?.latitude,
    shipment?.latestTrackingEvent?.latitude
  );

  const longitude = getValue(
    shipment?.currentLongitude,
    shipment?.longitude,
    shipment?.latestTrackingEvent?.longitude
  );

  const destinationLatitude = getValue(
    shipment?.destinationLatitude,
    shipment?.deliveryLatitude,
    shipment?.receiverLatitude
  );

  const destinationLongitude = getValue(
    shipment?.destinationLongitude,
    shipment?.deliveryLongitude,
    shipment?.receiverLongitude
  );

  const formatStatus = (status) => {
    return String(status || "CREATED")
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusClass = (status) => {
    return `shipment-details-status status-${String(status || "CREATED")
      .toLowerCase()
      .replaceAll("_", "-")}`;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(value);
    }

    return parsedDate.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCoordinate = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value);
    }

    return numberValue.toFixed(6);
  };

  const sortedTrackingEvents = useMemo(() => {
    return [...trackingEvents].sort((firstEvent, secondEvent) => {
      const firstDate = new Date(
        getValue(
          firstEvent.recordedAt,
          firstEvent.recorded_at,
          firstEvent.createdAt,
          firstEvent.timestamp
        ) || 0
      );

      const secondDate = new Date(
        getValue(
          secondEvent.recordedAt,
          secondEvent.recorded_at,
          secondEvent.createdAt,
          secondEvent.timestamp
        ) || 0
      );

      return secondDate.getTime() - firstDate.getTime();
    });
  }, [trackingEvents]);

  const handleUpdateShipment = () => {
    navigate(`/operator/shipments/${id}/update`);
  };

  if (isLoading) {
    return (
      <div className="shipment-details-page">
        <div className="shipment-details-state-card">
          <div className="shipment-details-loading-spinner"></div>

          <h2>Loading shipment details</h2>

          <p>
            Please wait while the shipment and tracking information are being
            retrieved.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="shipment-details-page">
        <div className="shipment-details-state-card shipment-details-error-card">
          <div className="shipment-details-state-icon">!</div>

          <h2>Unable to load shipment</h2>

          <p>{errorMessage}</p>

          <div className="shipment-details-state-actions">
            <button type="button" onClick={fetchShipmentDetails}>
              Try Again
            </button>

            <Link to="/operator/shipments">Back to Shipments</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="shipment-details-page">
        <div className="shipment-details-state-card">
          <div className="shipment-details-state-icon">📦</div>

          <h2>Shipment not found</h2>

          <p>No shipment information is available for this record.</p>

          <Link
            className="shipment-details-state-link"
            to="/operator/shipments"
          >
            Back to Shipments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-details-page">
      <div className="shipment-details-glow details-glow-left"></div>
      <div className="shipment-details-glow details-glow-right"></div>

      <header className="shipment-details-header">
        <Link to="/operator" className="shipment-details-brand">
          <div className="shipment-details-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>

            <small>Operator Workspace</small>
          </div>
        </Link>

        <nav className="shipment-details-navigation">
          <Link to="/operator">Dashboard</Link>

          <Link to="/operator/shipments">Shipments</Link>

          <span>Shipment Details</span>
        </nav>

        <Link
          to="/operator/shipments"
          className="shipment-details-back-button"
        >
          <span>←</span>
          Back to Shipments
        </Link>
      </header>

      <main className="shipment-details-main">
        <section className="shipment-details-hero">
          <div>
            <div className="shipment-details-page-badge">
              <span></span>
              SHIPMENT INFORMATION
            </div>

            <div className="shipment-details-title-row">
              <div>
                <span className="shipment-details-tracking-label">
                  TRACKING NUMBER
                </span>

                <h1>{trackingNumber}</h1>
              </div>

              <span className={getStatusClass(shipmentStatus)}>
                {formatStatus(shipmentStatus)}
              </span>
            </div>

            <p>
              Review the shipment data currently stored in the backend, including its route, coordinates, delivery status and tracking history.
            </p>
          </div>

          <div className="shipment-details-hero-actions">
            <button
              type="button"
              className="shipment-details-refresh-button"
              onClick={fetchShipmentDetails}
            >
              <span>↻</span>
              Refresh
            </button>

            <button
              type="button"
              className="shipment-details-update-button"
              onClick={handleUpdateShipment}
            >
              Update Shipment
              <span>→</span>
            </button>
          </div>
        </section>

        <section className="shipment-details-summary-grid">
          <article className="shipment-details-summary-card">
            <div className="shipment-summary-icon summary-blue">📦</div>

            <div>
              <span>Current Status</span>

              <strong>{formatStatus(shipmentStatus)}</strong>

              <small>Latest delivery stage</small>
            </div>
          </article>

          <article className="shipment-details-summary-card">
            <div className="shipment-summary-icon summary-purple">⏳</div>

            <div>
              <span>Predicted Delay</span>

              <strong>
                {predictedDelayMinutes !== null
                  ? `${predictedDelayMinutes} minutes`
                  : "No delay recorded"}
              </strong>

              <small>Latest delay prediction</small>
            </div>
          </article>

          <article className="shipment-details-summary-card">
            <div className="shipment-summary-icon summary-orange">⏱</div>

            <div>
              <span>Estimated Arrival</span>

              <strong>{formatDateTime(estimatedArrival)}</strong>

              <small>Expected delivery time</small>
            </div>
          </article>

          <article className="shipment-details-summary-card">
            <div className="shipment-summary-icon summary-green">✓</div>

            <div>
              <span>Tracking Events</span>

              <strong>{trackingEvents.length}</strong>

              <small>Recorded shipment updates</small>
            </div>
          </article>
        </section>

        <section className="shipment-details-content-grid">
          <div className="shipment-details-left-column">
            <article className="shipment-details-panel">
              <div className="shipment-details-panel-header">
                <div>
                  <span>DELIVERY JOURNEY</span>

                  <h2>Route information</h2>
                </div>

                <div className="shipment-details-live-badge">
                  <span></span>
                  Tracking Active
                </div>
              </div>

              <div className="shipment-details-route-card">
                <div className="shipment-route-location">
                  <div className="shipment-route-marker origin-marker">S</div>

                  <div>
                    <small>Pickup location</small>

                    <strong>
                      {pickupAddress || "Pickup address not available"}
                    </strong>

                    <p>{senderName || "Sender not available"}</p>
                  </div>
                </div>

                <div className="shipment-route-progress">
                  <span></span>

                  <div>🚚</div>

                  <span></span>
                </div>

                <div className="shipment-route-location destination-location">
                  <div className="shipment-route-marker destination-marker">
                    D
                  </div>

                  <div>
                    <small>Delivery location</small>

                    <strong>
                      {deliveryAddress || "Delivery address not available"}
                    </strong>

                    <p>{receiverName || "Receiver not available"}</p>
                  </div>
                </div>
              </div>

              <RouteMap
                trackingNumber={trackingNumber}
                currentLatitude={latitude}
                currentLongitude={longitude}
                destinationLatitude={destinationLatitude}
                destinationLongitude={destinationLongitude}
                currentStatus={shipmentStatus}
                estimatedDeliveryTime={estimatedArrival}
                lastLocationUpdate={lastLocationUpdate}
              />

              <div className="shipment-coordinate-grid">
                <div>
                  <span>Current latitude</span>

                  <strong>{formatCoordinate(latitude)}</strong>
                </div>

                <div>
                  <span>Current longitude</span>

                  <strong>{formatCoordinate(longitude)}</strong>
                </div>

                <div>
                  <span>Destination latitude</span>

                  <strong>{formatCoordinate(destinationLatitude)}</strong>
                </div>

                <div>
                  <span>Destination longitude</span>

                  <strong>{formatCoordinate(destinationLongitude)}</strong>
                </div>
              </div>
            </article>

            <article className="shipment-details-panel">
              <div className="shipment-details-panel-header">
                <div>
                  <span>TRACKING ACTIVITY</span>

                  <h2>Shipment timeline</h2>
                </div>

                <div className="shipment-details-event-count">
                  {trackingEvents.length} events
                </div>
              </div>

              {sortedTrackingEvents.length === 0 ? (
                <div className="shipment-timeline-empty">
                  <div>📭</div>

                  <h3>No tracking history available</h3>

                  <p>
                    Tracking events will appear here after shipment updates are
                    recorded.
                  </p>
                </div>
              ) : (
                <div className="shipment-details-timeline">
                  {sortedTrackingEvents.map((event, index) => {
                    const eventId =
                      event.id ||
                      event.trackingEventId ||
                      `${index}-${event.recordedAt || event.timestamp}`;

                    const eventStatus = getValue(
                      event.status,
                      event.shipmentStatus,
                      "UPDATED"
                    );

                    const eventLocation = getValue(
                      event.location,
                      event.locationName,
                      event.address,
                      event.currentLocation
                    );

                    const eventDescription = getValue(
                      event.description,
                      event.message,
                      event.notes,
                      event.remark
                    );

                    const eventTime = getValue(
                      event.recordedAt,
                      event.recorded_at,
                      event.createdAt,
                      event.timestamp
                    );

                    return (
                      <div
                        className="shipment-timeline-item"
                        key={eventId}
                      >
                        <div className="shipment-timeline-indicator">
                          <span></span>

                          {index < sortedTrackingEvents.length - 1 && (
                            <div></div>
                          )}
                        </div>

                        <div className="shipment-timeline-content">
                          <div className="shipment-timeline-heading">
                            <div>
                              <span>STATUS UPDATE</span>

                              <h3>{formatStatus(eventStatus)}</h3>
                            </div>

                            <time>{formatDateTime(eventTime)}</time>
                          </div>

                          <div className="shipment-timeline-meta">
                            <div>
                              <span>📍</span>

                              <p>
                                {eventLocation || "Location not provided"}
                              </p>
                            </div>

                            {eventDescription && (
                              <div>
                                <span>📝</span>

                                <p>{eventDescription}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </div>

          <aside className="shipment-details-right-column">
            <article className="shipment-details-panel">
              <div className="shipment-details-panel-header">
                <div>
                  <span>SHIPMENT PARTY</span>
                  <h2>Sender information</h2>
                </div>

                <div className="shipment-details-panel-icon">S</div>
              </div>

              <div className="shipment-contact-card">
                <div className="shipment-contact-avatar sender-avatar">
                  {senderName ? senderName.charAt(0).toUpperCase() : "S"}
                </div>

                <div>
                  <span>Sender</span>
                  <h3>{senderName || "Not available"}</h3>
                </div>
              </div>

              <div className="shipment-details-list">
                <div>
                  <span>Source address</span>
                  <strong>{pickupAddress || "Not available"}</strong>
                </div>
              </div>
            </article>

            <article className="shipment-details-panel">
              <div className="shipment-details-panel-header">
                <div>
                  <span>SHIPMENT PARTY</span>
                  <h2>Receiver information</h2>
                </div>

                <div className="shipment-details-panel-icon receiver-panel-icon">
                  R
                </div>
              </div>

              <div className="shipment-contact-card">
                <div className="shipment-contact-avatar receiver-avatar">
                  {receiverName ? receiverName.charAt(0).toUpperCase() : "R"}
                </div>

                <div>
                  <span>Receiver</span>
                  <h3>{receiverName || "Not available"}</h3>
                </div>
              </div>

              <div className="shipment-details-list">
                <div>
                  <span>Destination address</span>
                  <strong>{deliveryAddress || "Not available"}</strong>
                </div>
              </div>
            </article>

            <article className="shipment-details-panel">
              <div className="shipment-details-panel-header">
                <div>
                  <span>SHIPMENT RECORD</span>
                  <h2>Available shipment information</h2>
                </div>

                <div className="shipment-details-panel-icon package-panel-icon">
                  📦
                </div>
              </div>

              <div className="shipment-details-list">
                <div>
                  <span>Shipment ID</span>
                  <strong>
                    {getValue(shipment.id, shipment.shipmentId) || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Tracking number</span>
                  <strong>{trackingNumber}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{formatStatus(shipmentStatus)}</strong>
                </div>

                <div>
                  <span>Created at</span>
                  <strong>{formatDateTime(createdAt)}</strong>
                </div>

                <div>
                  <span>Estimated delivery</span>
                  <strong>{formatDateTime(estimatedArrival)}</strong>
                </div>

                <div>
                  <span>Predicted delay</span>
                  <strong>
                    {predictedDelayMinutes !== null
                      ? `${predictedDelayMinutes} minutes`
                      : "No delay recorded"}
                  </strong>
                </div>

                {delayReason && (
                  <div>
                    <span>Delay reason</span>
                    <strong>{delayReason}</strong>
                  </div>
                )}

                <div>
                  <span>Last location update</span>
                  <strong>{formatDateTime(lastLocationUpdate)}</strong>
                </div>
              </div>
            </article>

            <article className="shipment-details-action-panel">
              <div className="shipment-action-panel-icon">⚡</div>

              <span>OPERATOR ACTION</span>

              <h2>Update delivery progress</h2>

              <p>
                Record a new shipment status, location, ETA or delivery
                exception.
              </p>

              <button
                type="button"
                onClick={handleUpdateShipment}
              >
                Update Shipment
                <span>→</span>
              </button>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default ShipmentDetailsPage;