import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./UpdateShipmentPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const SHIPMENT_STATUSES = [
  {
    value: "CREATED",
    label: "Created",
    description: "Shipment record has been created.",
  },
  {
    value: "PICKED_UP",
    label: "Picked Up",
    description: "Shipment has been collected from the sender.",
  },
  {
    value: "IN_TRANSIT",
    label: "In Transit",
    description: "Shipment is currently moving toward its destination.",
  },
  {
    value: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Shipment is on the final delivery route.",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    description: "Shipment has been successfully delivered.",
  },
  {
    value: "FAILED_DELIVERY",
    label: "Failed Delivery",
    description: "Delivery could not be completed.",
  },
  {
    value: "DELAYED",
    label: "Delayed",
    description: "Shipment delivery has been delayed.",
  },
];

const FAILED_DELIVERY_REASONS = [
  "Receiver unavailable",
  "Incorrect delivery address",
  "Delivery address inaccessible",
  "Receiver refused delivery",
  "Payment issue",
  "Weather disruption",
  "Vehicle breakdown",
  "Package damaged",
  "Security restriction",
  "Other",
];

function UpdateShipmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    status: "CREATED",
    currentLocation: "",
    latitude: "",
    longitude: "",
    estimatedArrival: "",
    delayMinutes: "",
    delayReason: "",
    failedDeliveryReason: "",
    deliveryNotes: "",
    notifyCustomer: true,
  });

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

  const toDateTimeLocalValue = (value) => {
    if (!value) {
      return "";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const offset = parsedDate.getTimezoneOffset();
    const localDate = new Date(parsedDate.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const fetchShipmentDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = getStoredToken();

      const response = await fetch(`${API_BASE_URL}/api/shipments/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your login session has expired or you do not have permission to update this shipment."
        );
      }

      if (response.status === 404) {
        throw new Error("The requested shipment could not be found.");
      }

      if (!response.ok) {
        throw new Error("Unable to load shipment information.");
      }

      const responseData = await response.json();

      const shipmentData =
        responseData.shipment || responseData.data || responseData;

      setShipment(shipmentData);

      setFormData({
        status: String(
          getValue(
            shipmentData.status,
            shipmentData.shipmentStatus,
            "CREATED"
          )
        ).toUpperCase(),
        currentLocation:
          getValue(
            shipmentData.currentLocation,
            shipmentData.lastLocation,
            shipmentData.locationName,
            shipmentData.currentAddress,
            shipmentData.latestTrackingEvent?.location
          ) || "",
        latitude:
          getValue(
            shipmentData.currentLatitude,
            shipmentData.latitude,
            shipmentData.latestTrackingEvent?.latitude
          ) ?? "",
        longitude:
          getValue(
            shipmentData.currentLongitude,
            shipmentData.longitude,
            shipmentData.latestTrackingEvent?.longitude
          ) ?? "",
        estimatedArrival: toDateTimeLocalValue(
          getValue(
            shipmentData.estimatedArrival,
            shipmentData.estimatedDeliveryTime,
            shipmentData.estimatedDeliveryDate,
            shipmentData.eta,
            shipmentData.expectedDeliveryDate
          )
        ),
        delayMinutes:
          getValue(
            shipmentData.delayMinutes,
            shipmentData.predictedDelayMinutes,
            shipmentData.delayDuration
          ) ?? "",
        delayReason:
          getValue(
            shipmentData.delayReason,
            shipmentData.delayDescription
          ) || "",
        failedDeliveryReason:
          getValue(
            shipmentData.failedDeliveryReason,
            shipmentData.failureReason
          ) || "",
        deliveryNotes:
          getValue(
            shipmentData.deliveryNotes,
            shipmentData.notes,
            shipmentData.operatorNotes
          ) || "",
        notifyCustomer: true,
      });

      await fetchTrackingHistory(token);
    } catch (error) {
      console.error("Failed to load shipment update page:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong while loading shipment information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrackingHistory = async (token) => {
    try {
      const possibleEndpoints = [
        `${API_BASE_URL}/api/shipments/${id}/tracking-events`,
        `${API_BASE_URL}/api/shipments/${id}/tracking`,
        `${API_BASE_URL}/api/tracking/shipment/${id}`,
      ];

      for (const endpoint of possibleEndpoints) {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const responseData = await response.json();

          const eventList = Array.isArray(responseData)
            ? responseData
            : responseData.content ||
              responseData.events ||
              responseData.trackingEvents ||
              responseData.data ||
              [];

          setTrackingEvents(eventList);
          return;
        }
      }

      setTrackingEvents([]);
    } catch (error) {
      console.warn("Tracking history could not be loaded:", error);
      setTrackingEvents([]);
    }
  };

  const trackingNumber = useMemo(() => {
    if (!shipment) {
      return "Not available";
    }

    return (
      getValue(
        shipment.trackingNumber,
        shipment.tracking_number,
        shipment.trackingId,
        shipment.shipmentNumber,
        shipment.id ? `SHIP-${shipment.id}` : null
      ) || "Not available"
    );
  }, [shipment]);

  const currentStatus = useMemo(() => {
    return String(
      getValue(
        shipment?.status,
        shipment?.shipmentStatus,
        "CREATED"
      )
    ).toUpperCase();
  }, [shipment]);

  const selectedStatusInformation = useMemo(() => {
    return (
      SHIPMENT_STATUSES.find(
        (status) => status.value === formData.status
      ) || SHIPMENT_STATUSES[0]
    );
  }, [formData.status]);

  const sortedTrackingEvents = useMemo(() => {
    return [...trackingEvents]
      .sort((firstEvent, secondEvent) => {
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
      })
      .slice(0, 5);
  }, [trackingEvents]);

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
    shipment?.pickupAddress,
    shipment?.senderAddress,
    shipment?.originAddress,
    shipment?.sourceAddress
  );

  const deliveryAddress = getValue(
    shipment?.deliveryAddress,
    shipment?.delivery_address,
    shipment?.destinationAddress,
    shipment?.receiverAddress
  );

  const formatStatus = (status) => {
    return String(status || "CREATED")
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusClass = (status) => {
    return `update-shipment-status status-${String(status || "CREATED")
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

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setValidationErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setSuccessMessage("");
  };

  const handleStatusSelection = (status) => {
    setFormData((previousData) => ({
      ...previousData,
      status,
      failedDeliveryReason:
        status === "FAILED_DELIVERY"
          ? previousData.failedDeliveryReason
          : "",
      delayMinutes:
        status === "DELAYED"
          ? previousData.delayMinutes
          : previousData.delayMinutes,
      delayReason:
        status === "DELAYED"
          ? previousData.delayReason
          : previousData.delayReason,
    }));

    setValidationErrors((previousErrors) => ({
      ...previousErrors,
      status: "",
    }));

    setSuccessMessage("");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(
        "Location access is not supported by this browser."
      );
      return;
    }

    setIsLocating(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((previousData) => ({
          ...previousData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));

        setValidationErrors((previousErrors) => ({
          ...previousErrors,
          latitude: "",
          longitude: "",
        }));

        setIsLocating(false);
      },
      (error) => {
        console.error("Unable to access current location:", error);

        let locationError =
          "Unable to access your current location.";

        if (error.code === error.PERMISSION_DENIED) {
          locationError =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          locationError =
            "Your current location is temporarily unavailable.";
        }

        if (error.code === error.TIMEOUT) {
          locationError =
            "Location request timed out. Please try again.";
        }

        setErrorMessage(locationError);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.status) {
      errors.status = "Please select a shipment status.";
    }

    if (
      formData.latitude !== "" &&
      (Number.isNaN(Number(formData.latitude)) ||
        Number(formData.latitude) < -90 ||
        Number(formData.latitude) > 90)
    ) {
      errors.latitude =
        "Latitude must be a valid number between -90 and 90.";
    }

    if (
      formData.longitude !== "" &&
      (Number.isNaN(Number(formData.longitude)) ||
        Number(formData.longitude) < -180 ||
        Number(formData.longitude) > 180)
    ) {
      errors.longitude =
        "Longitude must be a valid number between -180 and 180.";
    }

    if (
      (formData.latitude === "" && formData.longitude !== "") ||
      (formData.latitude !== "" && formData.longitude === "")
    ) {
      errors.latitude =
        "Latitude and longitude must be provided together.";
      errors.longitude =
        "Latitude and longitude must be provided together.";
    }

    if (
      formData.status === "FAILED_DELIVERY" &&
      !formData.failedDeliveryReason.trim()
    ) {
      errors.failedDeliveryReason =
        "Please select or enter the failed delivery reason.";
    }

    if (
      formData.status === "DELAYED" &&
      !formData.delayReason.trim()
    ) {
      errors.delayReason =
        "Please provide a reason for the shipment delay.";
    }

    if (
      formData.delayMinutes !== "" &&
      (Number.isNaN(Number(formData.delayMinutes)) ||
        Number(formData.delayMinutes) < 0)
    ) {
      errors.delayMinutes =
        "Delay duration must be zero or a positive number.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const buildUpdatePayload = () => {
    return {
      status: formData.status,
      currentLocation: formData.currentLocation.trim() || null,
      latitude:
        formData.latitude !== ""
          ? Number(formData.latitude)
          : null,
      longitude:
        formData.longitude !== ""
          ? Number(formData.longitude)
          : null,
      estimatedArrival: formData.estimatedArrival
        ? new Date(formData.estimatedArrival).toISOString()
        : null,
      delayMinutes:
        formData.delayMinutes !== ""
          ? Number(formData.delayMinutes)
          : null,
      delayReason:
        formData.status === "DELAYED"
          ? formData.delayReason.trim() || null
          : formData.delayReason.trim() || null,
      failedDeliveryReason:
        formData.status === "FAILED_DELIVERY"
          ? formData.failedDeliveryReason.trim()
          : null,
      deliveryNotes: formData.deliveryNotes.trim() || null,
      notifyCustomer: formData.notifyCustomer,
    };
  };

  const submitUpdateRequest = async (payload) => {
    const token = getStoredToken();

    const possibleRequests = [
      {
        endpoint: `${API_BASE_URL}/api/shipments/${id}/operator-update`,
        method: "PUT",
      },
      {
        endpoint: `${API_BASE_URL}/api/shipments/${id}/status`,
        method: "PUT",
      },
      {
        endpoint: `${API_BASE_URL}/api/shipments/${id}`,
        method: "PUT",
      },
    ];

    let lastErrorMessage = "Unable to update shipment.";

    for (const request of possibleRequests) {
      const response = await fetch(request.endpoint, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your login session has expired or you do not have permission to update this shipment."
        );
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          return response.json();
        }

        return null;
      }

      if (response.status !== 404 && response.status !== 405) {
        try {
          const errorData = await response.json();

          lastErrorMessage =
            errorData.message ||
            errorData.error ||
            "Unable to update shipment.";
        } catch {
          lastErrorMessage = "Unable to update shipment.";
        }
      }
    }

    throw new Error(lastErrorMessage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setErrorMessage(
        "Please correct the highlighted fields before submitting."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = buildUpdatePayload();

      await submitUpdateRequest(payload);

      setSuccessMessage(
        `Shipment ${trackingNumber} was updated successfully.`
      );

      await fetchShipmentDetails();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to update shipment:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong while updating the shipment."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!shipment) {
      return;
    }

    setFormData({
      status: currentStatus,
      currentLocation:
        getValue(
          shipment.currentLocation,
          shipment.lastLocation,
          shipment.locationName,
          shipment.currentAddress,
          shipment.latestTrackingEvent?.location
        ) || "",
      latitude:
        getValue(
          shipment.currentLatitude,
          shipment.latitude,
          shipment.latestTrackingEvent?.latitude
        ) ?? "",
      longitude:
        getValue(
          shipment.currentLongitude,
          shipment.longitude,
          shipment.latestTrackingEvent?.longitude
        ) ?? "",
      estimatedArrival: toDateTimeLocalValue(
        getValue(
          shipment.estimatedArrival,
          shipment.estimatedDeliveryTime,
          shipment.estimatedDeliveryDate,
          shipment.eta,
          shipment.expectedDeliveryDate
        )
      ),
      delayMinutes:
        getValue(
          shipment.delayMinutes,
          shipment.predictedDelayMinutes,
          shipment.delayDuration
        ) ?? "",
      delayReason:
        getValue(
          shipment.delayReason,
          shipment.delayDescription
        ) || "",
      failedDeliveryReason:
        getValue(
          shipment.failedDeliveryReason,
          shipment.failureReason
        ) || "",
      deliveryNotes:
        getValue(
          shipment.deliveryNotes,
          shipment.notes,
          shipment.operatorNotes
        ) || "",
      notifyCustomer: true,
    });

    setValidationErrors({});
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (isLoading) {
    return (
      <div className="update-shipment-page">
        <div className="update-shipment-state-card">
          <div className="update-shipment-loading-spinner"></div>

          <h2>Loading shipment workspace</h2>

          <p>
            Please wait while the shipment information and recent tracking
            history are being prepared.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage && !shipment) {
    return (
      <div className="update-shipment-page">
        <div className="update-shipment-state-card update-shipment-error-state">
          <div className="update-shipment-state-icon">!</div>

          <h2>Unable to open shipment</h2>

          <p>{errorMessage}</p>

          <div className="update-shipment-state-actions">
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
      <div className="update-shipment-page">
        <div className="update-shipment-state-card">
          <div className="update-shipment-state-icon">📦</div>

          <h2>Shipment not found</h2>

          <p>No shipment record is available for this identifier.</p>

          <Link
            className="update-shipment-state-link"
            to="/operator/shipments"
          >
            Back to Shipments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="update-shipment-page">
      <div className="update-shipment-glow update-glow-left"></div>
      <div className="update-shipment-glow update-glow-right"></div>

      <header className="update-shipment-header">
        <Link to="/operator" className="update-shipment-brand">
          <div className="update-shipment-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>

            <small>Operator Workspace</small>
          </div>
        </Link>

        <nav className="update-shipment-navigation">
          <Link to="/operator">Dashboard</Link>

          <Link to="/operator/shipments">Shipments</Link>

          <Link to={`/operator/shipments/${id}`}>Details</Link>

          <span>Update Shipment</span>
        </nav>

        <Link
          to={`/operator/shipments/${id}`}
          className="update-shipment-back-button"
        >
          <span>←</span>
          Back to Details
        </Link>
      </header>

      <main className="update-shipment-main">
        <section className="update-shipment-hero">
          <div className="update-shipment-hero-content">
            <div className="update-shipment-page-badge">
              <span></span>
              OPERATOR DELIVERY CONTROL
            </div>

            <div className="update-shipment-title-row">
              <div>
                <span className="update-shipment-tracking-label">
                  TRACKING NUMBER
                </span>

                <h1>Update {trackingNumber}</h1>
              </div>

              <span className={getStatusClass(currentStatus)}>
                {formatStatus(currentStatus)}
              </span>
            </div>

            <p>
              Record shipment progress, current location, estimated arrival,
              delivery delays and delivery exceptions from one secure operator
              workspace.
            </p>
          </div>

          <div className="update-shipment-hero-summary">
            <div>
              <span>Current stage</span>
              <strong>{formatStatus(currentStatus)}</strong>
            </div>

            <div>
              <span>Recent events</span>
              <strong>{trackingEvents.length}</strong>
            </div>

            <div>
              <span>Receiver</span>
              <strong>{receiverName || "Not available"}</strong>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="update-shipment-alert update-alert-error">
            <div className="update-alert-icon">!</div>

            <div>
              <strong>Update could not be completed</strong>
              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              aria-label="Dismiss error message"
              onClick={() => setErrorMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="update-shipment-alert update-alert-success">
            <div className="update-alert-icon">✓</div>

            <div>
              <strong>Shipment updated successfully</strong>
              <p>{successMessage}</p>
            </div>

            <button
              type="button"
              aria-label="Dismiss success message"
              onClick={() => setSuccessMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="update-shipment-layout">
          <form
            className="update-shipment-form-column"
            onSubmit={handleSubmit}
          >
            <article className="update-shipment-panel">
              <div className="update-shipment-panel-header">
                <div>
                  <span>DELIVERY STATUS</span>
                  <h2>Select the current shipment stage</h2>
                </div>

                <div className="update-shipment-panel-icon">01</div>
              </div>

              <div className="update-shipment-status-grid">
                {SHIPMENT_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    className={`update-status-option ${
                      formData.status === status.value
                        ? "update-status-option-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusSelection(status.value)
                    }
                  >
                    <span
                      className={`update-status-dot status-dot-${status.value
                        .toLowerCase()
                        .replaceAll("_", "-")}`}
                    ></span>

                    <div>
                      <strong>{status.label}</strong>
                      <small>{status.description}</small>
                    </div>

                    <span className="update-status-check">
                      {formData.status === status.value ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>

              {validationErrors.status && (
                <p className="update-field-error">
                  {validationErrors.status}
                </p>
              )}

              <div className="update-selected-status">
                <div
                  className={`update-selected-status-icon status-background-${formData.status
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  ●
                </div>

                <div>
                  <span>Selected update</span>
                  <strong>{selectedStatusInformation.label}</strong>
                  <p>{selectedStatusInformation.description}</p>
                </div>
              </div>
            </article>

            <article className="update-shipment-panel">
              <div className="update-shipment-panel-header">
                <div>
                  <span>LIVE LOCATION</span>
                  <h2>Update the shipment position</h2>
                </div>

                <div className="update-shipment-panel-icon">02</div>
              </div>

              <div className="update-form-group">
                <label htmlFor="currentLocation">
                  Current location
                  <span>Optional</span>
                </label>

                <div className="update-input-icon-wrapper">
                  <span>📍</span>

                  <input
                    id="currentLocation"
                    name="currentLocation"
                    type="text"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    placeholder="Example: Bhopal Distribution Center"
                    autoComplete="off"
                  />
                </div>

                <small>
                  Enter a hub, city, landmark or current delivery area.
                </small>
              </div>

              <div className="update-coordinate-section">
                <div className="update-coordinate-heading">
                  <div>
                    <span>GPS COORDINATES</span>
                    <strong>Current operator position</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                  >
                    <span>{isLocating ? "◌" : "⌖"}</span>
                    {isLocating
                      ? "Detecting Location"
                      : "Use Current Location"}
                  </button>
                </div>

                <div className="update-form-grid">
                  <div className="update-form-group">
                    <label htmlFor="latitude">Latitude</label>

                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="23.259933"
                      className={
                        validationErrors.latitude
                          ? "update-input-invalid"
                          : ""
                      }
                    />

                    {validationErrors.latitude && (
                      <p className="update-field-error">
                        {validationErrors.latitude}
                      </p>
                    )}
                  </div>

                  <div className="update-form-group">
                    <label htmlFor="longitude">Longitude</label>

                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="77.412613"
                      className={
                        validationErrors.longitude
                          ? "update-input-invalid"
                          : ""
                      }
                    />

                    {validationErrors.longitude && (
                      <p className="update-field-error">
                        {validationErrors.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <article className="update-shipment-panel">
              <div className="update-shipment-panel-header">
                <div>
                  <span>DELIVERY FORECAST</span>
                  <h2>ETA and delay information</h2>
                </div>

                <div className="update-shipment-panel-icon">03</div>
              </div>

              <div className="update-form-grid">
                <div className="update-form-group">
                  <label htmlFor="estimatedArrival">
                    Estimated arrival
                    <span>Optional</span>
                  </label>

                  <input
                    id="estimatedArrival"
                    name="estimatedArrival"
                    type="datetime-local"
                    value={formData.estimatedArrival}
                    onChange={handleInputChange}
                  />

                  <small>
                    Updated expected delivery date and time.
                  </small>
                </div>

                <div className="update-form-group">
                  <label htmlFor="delayMinutes">
                    Delay duration
                    <span>Minutes</span>
                  </label>

                  <input
                    id="delayMinutes"
                    name="delayMinutes"
                    type="number"
                    min="0"
                    value={formData.delayMinutes}
                    onChange={handleInputChange}
                    placeholder="Example: 45"
                    className={
                      validationErrors.delayMinutes
                        ? "update-input-invalid"
                        : ""
                    }
                  />

                  {validationErrors.delayMinutes && (
                    <p className="update-field-error">
                      {validationErrors.delayMinutes}
                    </p>
                  )}
                </div>
              </div>

              <div className="update-form-group">
                <label htmlFor="delayReason">
                  Delay reason
                  <span>
                    {formData.status === "DELAYED"
                      ? "Required"
                      : "Optional"}
                  </span>
                </label>

                <textarea
                  id="delayReason"
                  name="delayReason"
                  value={formData.delayReason}
                  onChange={handleInputChange}
                  placeholder="Describe traffic, weather, route disruption or operational delay."
                  rows="4"
                  className={
                    validationErrors.delayReason
                      ? "update-input-invalid"
                      : ""
                  }
                ></textarea>

                {validationErrors.delayReason && (
                  <p className="update-field-error">
                    {validationErrors.delayReason}
                  </p>
                )}
              </div>
            </article>

            {formData.status === "FAILED_DELIVERY" && (
              <article className="update-shipment-panel update-failure-panel">
                <div className="update-shipment-panel-header">
                  <div>
                    <span>DELIVERY EXCEPTION</span>
                    <h2>Failed delivery information</h2>
                  </div>

                  <div className="update-shipment-panel-icon update-failure-icon">
                    !
                  </div>
                </div>

                <div className="update-form-group">
                  <label htmlFor="failedDeliveryReason">
                    Failure reason
                    <span>Required</span>
                  </label>

                  <select
                    id="failedDeliveryReason"
                    name="failedDeliveryReason"
                    value={formData.failedDeliveryReason}
                    onChange={handleInputChange}
                    className={
                      validationErrors.failedDeliveryReason
                        ? "update-input-invalid"
                        : ""
                    }
                  >
                    <option value="">
                      Select failed delivery reason
                    </option>

                    {FAILED_DELIVERY_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>

                  {validationErrors.failedDeliveryReason && (
                    <p className="update-field-error">
                      {validationErrors.failedDeliveryReason}
                    </p>
                  )}
                </div>

                <div className="update-failure-notice">
                  <span>!</span>

                  <div>
                    <strong>
                      This will create a failed delivery tracking event
                    </strong>

                    <p>
                      The shipment will remain active and can be scheduled for
                      another delivery attempt later.
                    </p>
                  </div>
                </div>
              </article>
            )}

            <article className="update-shipment-panel">
              <div className="update-shipment-panel-header">
                <div>
                  <span>OPERATOR NOTES</span>
                  <h2>Add delivery remarks</h2>
                </div>

                <div className="update-shipment-panel-icon">04</div>
              </div>

              <div className="update-form-group">
                <label htmlFor="deliveryNotes">
                  Delivery notes
                  <span>Optional</span>
                </label>

                <textarea
                  id="deliveryNotes"
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  placeholder="Add remarks for the customer, support team or next operator."
                  rows="5"
                ></textarea>
              </div>

              <label className="update-notification-toggle">
                <input
                  type="checkbox"
                  name="notifyCustomer"
                  checked={formData.notifyCustomer}
                  onChange={handleInputChange}
                />

                <span className="update-toggle-control">
                  <span></span>
                </span>

                <div>
                  <strong>Notify the customer</strong>

                  <small>
                    Send a notification after this shipment update is recorded.
                  </small>
                </div>
              </label>
            </article>

            <div className="update-shipment-form-actions">
              <button
                type="button"
                className="update-reset-button"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Changes
              </button>

              <button
                type="submit"
                className="update-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="update-button-spinner"></span>
                    Updating Shipment
                  </>
                ) : (
                  <>
                    Save Shipment Update
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="update-shipment-sidebar">
            <article className="update-shipment-sidebar-card">
              <div className="update-sidebar-header">
                <div>
                  <span>SHIPMENT SUMMARY</span>
                  <h2>Delivery overview</h2>
                </div>

                <div>📦</div>
              </div>

              <div className="update-summary-route">
                <div>
                  <span className="update-route-dot update-origin-dot"></span>

                  <div>
                    <small>Pickup</small>
                    <strong>
                      {pickupAddress || "Pickup address not available"}
                    </strong>
                    <p>{senderName || "Sender not available"}</p>
                  </div>
                </div>

                <span className="update-route-line"></span>

                <div>
                  <span className="update-route-dot update-destination-dot"></span>

                  <div>
                    <small>Delivery</small>
                    <strong>
                      {deliveryAddress ||
                        "Delivery address not available"}
                    </strong>
                    <p>{receiverName || "Receiver not available"}</p>
                  </div>
                </div>
              </div>

              <div className="update-sidebar-details">
                <div>
                  <span>Tracking number</span>
                  <strong>{trackingNumber}</strong>
                </div>

                <div>
                  <span>Current status</span>
                  <strong>{formatStatus(currentStatus)}</strong>
                </div>

                <div>
                  <span>Selected status</span>
                  <strong>{formatStatus(formData.status)}</strong>
                </div>
              </div>

              <Link
                to={`/operator/shipments/${id}`}
                className="update-view-details-link"
              >
                View Complete Shipment
                <span>→</span>
              </Link>
            </article>

            <article className="update-shipment-sidebar-card">
              <div className="update-sidebar-header">
                <div>
                  <span>RECENT ACTIVITY</span>
                  <h2>Latest tracking events</h2>
                </div>

                <div>↻</div>
              </div>

              {sortedTrackingEvents.length === 0 ? (
                <div className="update-activity-empty">
                  <div>📭</div>
                  <strong>No tracking activity</strong>
                  <p>
                    New shipment updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="update-activity-list">
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

                    const eventTime = getValue(
                      event.recordedAt,
                      event.recorded_at,
                      event.createdAt,
                      event.timestamp
                    );

                    return (
                      <div
                        className="update-activity-item"
                        key={eventId}
                      >
                        <span></span>

                        <div>
                          <strong>{formatStatus(eventStatus)}</strong>

                          <p>
                            {eventLocation || "Location not provided"}
                          </p>

                          <small>{formatDateTime(eventTime)}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="update-shipment-guidance-card">
              <div className="update-guidance-icon">⚡</div>

              <span>OPERATOR GUIDANCE</span>

              <h2>Keep tracking information accurate</h2>

              <p>
                Update the shipment status whenever the package enters a new
                delivery stage. Add GPS coordinates whenever live tracking is
                available.
              </p>

              <ul>
                <li>
                  <span>✓</span>
                  Confirm the correct shipment status.
                </li>

                <li>
                  <span>✓</span>
                  Add the latest known location.
                </li>

                <li>
                  <span>✓</span>
                  Record delay or failure reasons.
                </li>
              </ul>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default UpdateShipmentPage;