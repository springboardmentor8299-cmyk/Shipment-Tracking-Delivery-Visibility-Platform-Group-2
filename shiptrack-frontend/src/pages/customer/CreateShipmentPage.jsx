import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createShipment } from "../../api/shipmentService";
import AddressSearch from "../../components/AddressSearch";
import RouteMap from "../../components/maps/RouteMap";
import "../../styles/CreateShipment.css";

const createInitialShipment = () => ({
  senderName: "",
  receiverName: "",
  source: "",
  destination: "",
  sourceLatitude: "",
  sourceLongitude: "",
  destinationLatitude: "",
  destinationLongitude: "",
  sourceSelected: false,
  destinationSelected: false,
});

function CreateShipmentPage() {
  const [shipment, setShipment] = useState(createInitialShipment);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
    trackingNumber: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const clearMessage = () => {
    if (message.text) {
      setMessage({
        type: "",
        text: "",
        trackingNumber: "",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setShipment((previousShipment) => ({
      ...previousShipment,
      [name]: value,
    }));

    clearMessage();
  };

  const handleSourceSelect = (location) => {
    setShipment((previousShipment) => ({
      ...previousShipment,
      source: location.address,
      sourceLatitude: location.latitude,
      sourceLongitude: location.longitude,
      sourceSelected: location.selected,
    }));

    clearMessage();
  };

  const handleDestinationSelect = (location) => {
    setShipment((previousShipment) => ({
      ...previousShipment,
      destination: location.address,
      destinationLatitude: location.latitude,
      destinationLongitude: location.longitude,
      destinationSelected: location.selected,
    }));

    clearMessage();
  };

  const coordinatesAreValid = (latitude, longitude) => {
    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);

    return (
      latitude !== "" &&
      longitude !== "" &&
      Number.isFinite(numericLatitude) &&
      Number.isFinite(numericLongitude) &&
      numericLatitude >= -90 &&
      numericLatitude <= 90 &&
      numericLongitude >= -180 &&
      numericLongitude <= 180
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!shipment.sourceSelected) {
      setMessage({
        type: "error",
        text: "Please select the source address from the suggestions.",
        trackingNumber: "",
      });
      return;
    }

    if (!shipment.destinationSelected) {
      setMessage({
        type: "error",
        text: "Please select the destination address from the suggestions.",
        trackingNumber: "",
      });
      return;
    }

    if (
      !coordinatesAreValid(
        shipment.sourceLatitude,
        shipment.sourceLongitude
      ) ||
      !coordinatesAreValid(
        shipment.destinationLatitude,
        shipment.destinationLongitude
      )
    ) {
      setMessage({
        type: "error",
        text: "The selected source or destination has invalid coordinates.",
        trackingNumber: "",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({
        type: "",
        text: "",
        trackingNumber: "",
      });

      const shipmentData = {
        senderName: shipment.senderName.trim(),
        receiverName: shipment.receiverName.trim(),
        source: shipment.source.trim(),
        destination: shipment.destination.trim(),
        sourceLatitude: Number(shipment.sourceLatitude),
        sourceLongitude: Number(shipment.sourceLongitude),
        destinationLatitude: Number(shipment.destinationLatitude),
        destinationLongitude: Number(shipment.destinationLongitude),
      };

      const response = await createShipment(shipmentData);

      setMessage({
        type: "success",
        text: "Shipment created successfully.",
        trackingNumber: response.data.trackingNumber,
      });

      setShipment(createInitialShipment());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Unable to create shipment:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to create shipment. Please try again.",
        trackingNumber: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCoordinate = (coordinate) => {
    if (coordinate === "" || coordinate === null || coordinate === undefined) {
      return "Waiting for address selection";
    }

    const numericCoordinate = Number(coordinate);

    return Number.isFinite(numericCoordinate)
      ? numericCoordinate.toFixed(6)
      : "Not available";
  };

  return (
    <div className="create-shipment-page">
      <div className="create-shipment-glow shipment-glow-left"></div>
      <div className="create-shipment-glow shipment-glow-right"></div>

      <header className="create-shipment-topbar">
        <Link to="/customer/dashboard" className="create-shipment-brand">
          <div className="create-shipment-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Customer Portal</small>
          </div>
        </Link>

        <Link to="/customer" className="create-shipment-back-button">
          <span>←</span>
          Dashboard
        </Link>
      </header>

      <main className="create-shipment-main">
        <section className="create-shipment-heading">
          <div>
            <div className="create-shipment-badge">
              <span></span>
              SHIPMENT CREATION
            </div>

            <h1>Create a new shipment</h1>

            <p>
              Enter the customer details and select the source and destination
              addresses. Coordinates are captured automatically.
            </p>
          </div>

          <div className="create-shipment-secure">
            <div className="create-shipment-secure-icon">✓</div>

            <div>
              <strong>Automatic location lookup</strong>
              <small>No manual latitude or longitude required</small>
            </div>
          </div>
        </section>

        <section className="create-shipment-layout">
          <div className="create-shipment-form-card">
            <div className="create-shipment-card-header">
              <div>
                <span className="create-shipment-section-label">
                  DELIVERY INFORMATION
                </span>

                <h2>Shipment details</h2>

                <p>
                  Complete all required fields and select both addresses from
                  the suggestions.
                </p>
              </div>

              <div className="create-shipment-card-icon">📦</div>
            </div>

            {message.text && (
              <div className={`create-shipment-message ${message.type}`}>
                <div className="create-shipment-message-icon">
                  {message.type === "success" ? "✓" : "!"}
                </div>

                <div>
                  <strong>
                    {message.type === "success"
                      ? "Shipment created"
                      : "Creation failed"}
                  </strong>

                  <p>{message.text}</p>

                  {message.trackingNumber && (
                    <div className="create-shipment-tracking-result">
                      <span>Tracking Number</span>
                      <strong>{message.trackingNumber}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form className="create-shipment-form" onSubmit={handleSubmit}>
              <div className="create-shipment-form-section">
                <div className="create-shipment-form-section-heading">
                  <span className="create-shipment-step-number">01</span>

                  <div>
                    <h3>Customer information</h3>
                    <p>Enter the sender and receiver names.</p>
                  </div>
                </div>

                <div className="create-shipment-form-grid">
                  <div className="create-shipment-field">
                    <label htmlFor="senderName">
                      Sender Name
                      <span>*</span>
                    </label>

                    <div className="create-shipment-input-wrapper">
                      <span className="create-shipment-input-icon">◉</span>

                      <input
                        id="senderName"
                        type="text"
                        name="senderName"
                        placeholder="Enter sender name"
                        value={shipment.senderName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <small>Person sending the shipment</small>
                  </div>

                  <div className="create-shipment-field">
                    <label htmlFor="receiverName">
                      Receiver Name
                      <span>*</span>
                    </label>

                    <div className="create-shipment-input-wrapper">
                      <span className="create-shipment-input-icon">◉</span>

                      <input
                        id="receiverName"
                        type="text"
                        name="receiverName"
                        placeholder="Enter receiver name"
                        value={shipment.receiverName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <small>Person receiving the shipment</small>
                  </div>
                </div>
              </div>

              <div className="create-shipment-divider"></div>

              <div className="create-shipment-form-section">
                <div className="create-shipment-form-section-heading">
                  <span className="create-shipment-step-number">02</span>

                  <div>
                    <h3>Route information</h3>
                    <p>
                      Search and select the shipment origin and destination.
                    </p>
                  </div>
                </div>

                <div className="create-shipment-form-grid">
                  <AddressSearch
                    id="source"
                    label="Source Address"
                    placeholder="Search pickup address"
                    value={shipment.source}
                    onLocationSelect={handleSourceSelect}
                    icon="●"
                  />

                  <AddressSearch
                    id="destination"
                    label="Destination Address"
                    placeholder="Search delivery address"
                    value={shipment.destination}
                    onLocationSelect={handleDestinationSelect}
                    icon="●"
                  />
                </div>
              </div>

              <div className="create-shipment-divider"></div>

              <div className="create-shipment-form-section">
                <div className="create-shipment-form-section-heading">
                  <span className="create-shipment-step-number">03</span>

                  <div>
                    <h3>Location confirmation</h3>
                    <p>
                      Coordinates are generated automatically after you select
                      an address.
                    </p>
                  </div>
                </div>

                <div className="create-shipment-form-grid">
                  <article className="create-shipment-process-card">
                    <span className="create-shipment-section-label">
                      SOURCE LOCATION
                    </span>
                    <h3>
                      {shipment.sourceSelected
                        ? "Address selected"
                        : "Select a source address"}
                    </h3>
                    <p>{shipment.source || "No source selected"}</p>
                    <p>
                      Latitude: {formatCoordinate(shipment.sourceLatitude)}
                    </p>
                    <p>
                      Longitude: {formatCoordinate(shipment.sourceLongitude)}
                    </p>
                  </article>

                  <article className="create-shipment-process-card">
                    <span className="create-shipment-section-label">
                      DESTINATION LOCATION
                    </span>
                    <h3>
                      {shipment.destinationSelected
                        ? "Address selected"
                        : "Select a destination address"}
                    </h3>
                    <p>{shipment.destination || "No destination selected"}</p>
                    <p>
                      Latitude: {formatCoordinate(shipment.destinationLatitude)}
                    </p>
                    <p>
                      Longitude:{" "}
                      {formatCoordinate(shipment.destinationLongitude)}
                    </p>
                  </article>
                </div>
              </div>

              <input
                type="hidden"
                name="sourceLatitude"
                value={shipment.sourceLatitude}
                readOnly
              />
              <input
                type="hidden"
                name="sourceLongitude"
                value={shipment.sourceLongitude}
                readOnly
              />
              <input
                type="hidden"
                name="destinationLatitude"
                value={shipment.destinationLatitude}
                readOnly
              />
              <input
                type="hidden"
                name="destinationLongitude"
                value={shipment.destinationLongitude}
                readOnly
              />

              <div className="create-shipment-form-footer">
                <div className="create-shipment-required-note">
                  <span>*</span>
                  Select both addresses from the search suggestions
                </div>

                <button
                  type="submit"
                  className="create-shipment-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="create-shipment-loader"></span>
                      Creating Shipment...
                    </>
                  ) : (
                    <>
                      Create Shipment
                      <span className="create-shipment-submit-arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="create-shipment-sidebar">
            <div className="create-shipment-route-card">
              <div className="create-shipment-route-header">
                <div>
                  <span>ROUTE PREVIEW</span>
                  <h3>Shipment journey</h3>
                </div>

                <div className="create-shipment-route-icon">⌖</div>
              </div>

              {shipment.sourceSelected && shipment.destinationSelected ? (
                <div style={{ width: "100%", minHeight: "360px" }}>
                  <RouteMap
                    trackingNumber="New Shipment Route"
                    currentLatitude={Number(shipment.sourceLatitude)}
                    currentLongitude={Number(shipment.sourceLongitude)}
                    destinationLatitude={Number(shipment.destinationLatitude)}
                    destinationLongitude={Number(shipment.destinationLongitude)}
                    currentStatus="ROUTE_PREVIEW"
                    estimatedDeliveryTime={null}
                    lastLocationUpdate={null}
                  />
                </div>
              ) : (
                <div className="create-shipment-route-preview">
                  <div className="create-shipment-route-grid"></div>
                  <div className="create-shipment-route-path"></div>

                  <div className="create-shipment-route-location">
                    <span className="create-shipment-route-dot source"></span>

                    <div>
                      <small>Source</small>
                      <strong>
                        {shipment.source || "Search and select origin"}
                      </strong>
                    </div>
                  </div>

                  <div className="create-shipment-route-truck">🚚</div>

                  <div className="create-shipment-route-location destination">
                    <span className="create-shipment-route-dot destination"></span>

                    <div>
                      <small>Destination</small>
                      <strong>
                        {shipment.destination || "Search and select destination"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="create-shipment-process-card">
              <span className="create-shipment-section-label">
                HOW ADDRESS SELECTION WORKS
              </span>

              <h3>Automatic coordinates</h3>

              <div className="create-shipment-process-list">
                <div className="create-shipment-process-item">
                  <span>1</span>
                  <div>
                    <strong>Search an address</strong>
                    <p>Type at least three characters.</p>
                  </div>
                </div>

                <div className="create-shipment-process-item">
                  <span>2</span>
                  <div>
                    <strong>Select a suggestion</strong>
                    <p>Choose the correct address from the dropdown.</p>
                  </div>
                </div>

                <div className="create-shipment-process-item">
                  <span>3</span>
                  <div>
                    <strong>Coordinates are saved</strong>
                    <p>Latitude and longitude are added automatically.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="create-shipment-support-card">
              <div className="create-shipment-support-icon">?</div>

              <div>
                <span>Address not accepted?</span>
                <p>
                  Do not only type the address. Click one result from the
                  suggestion list before creating the shipment.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default CreateShipmentPage;