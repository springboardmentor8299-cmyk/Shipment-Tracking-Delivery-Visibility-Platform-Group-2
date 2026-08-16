import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import "./ProofOfDeliveryPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function ProofOfDeliveryPage() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  const photoInputRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [deliveryPhoto, setDeliveryPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [deliveryLatitude, setDeliveryLatitude] =
    useState(null);

  const [deliveryLongitude, setDeliveryLongitude] =
    useState(null);

  const [isLoadingShipment, setIsLoadingShipment] =
    useState(true);

  const [isGettingLocation, setIsGettingLocation] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const getStoredToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken")
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Not available";
    }

    return String(status)
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const fetchShipmentDetails = async () => {
    try {
      setIsLoadingShipment(true);
      setErrorMessage("");

      const token = getStoredToken();

      const response = await fetch(
        `${API_BASE_URL}/api/shipments/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      let responseData = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Your session has expired or you do not have permission to view this shipment."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "The requested shipment could not be found."
        );
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            "Unable to load shipment details."
        );
      }

      const shipmentData =
        responseData?.shipment ||
        responseData?.data ||
        responseData;

      setShipment(shipmentData);

      setReceiverName(
        shipmentData?.receiverName || ""
      );
    } catch (error) {
      console.error(
        "Unable to load shipment details:",
        error
      );

      setShipment(null);

      setErrorMessage(
        error.message ||
          "Unable to load shipment details."
      );
    } finally {
      setIsLoadingShipment(false);
    }
  };

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setIsGettingLocation(true);

    setLocationMessage(
      "Getting the current delivery location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLatitude(
          position.coords.latitude
        );

        setDeliveryLongitude(
          position.coords.longitude
        );

        setLocationMessage(
          "Delivery location captured successfully."
        );

        setIsGettingLocation(false);
      },
      (error) => {
        console.error(
          "Unable to capture delivery location:",
          error
        );

        setDeliveryLatitude(null);
        setDeliveryLongitude(null);

        setLocationMessage(
          "The current location could not be detected. The shipment's latest saved position will be used."
        );

        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (trackingNumber) {
      fetchShipmentDetails();
    }
  }, [trackingNumber]);

  useEffect(() => {
    captureCurrentLocation();
  }, []);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setErrorMessage("");
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setErrorMessage(
        "The delivery photo must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setDeliveryPhoto(imageData);
      setPhotoPreview(imageData);
    };

    reader.onerror = () => {
      setErrorMessage(
        "The selected photo could not be read."
      );
    };

    reader.readAsDataURL(file);
  };

  const removeDeliveryPhoto = () => {
    setDeliveryPhoto(null);
    setPhotoPreview("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!shipment) {
      setErrorMessage(
        "Shipment details are not available."
      );
      return;
    }

    if (!receiverName.trim()) {
      setErrorMessage(
        "Receiver name is required."
      );
      return;
    }

    if (
      !signatureRef.current ||
      signatureRef.current.isEmpty()
    ) {
      setErrorMessage(
        "Receiver signature is required."
      );
      return;
    }

    if (!deliveryPhoto) {
      setErrorMessage(
        "Delivery photo is required."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

     const signatureData =
      signatureRef.current.toDataURL("image/png");
      const token = getStoredToken();

      const response = await fetch(
        `${API_BASE_URL}/api/pod/${trackingNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            receiverName: receiverName.trim(),
            signatureData,
            deliveryPhoto,
            deliveryNotes:
              deliveryNotes.trim() || null,

            latitude:
              deliveryLatitude ??
              shipment.currentLatitude ??
              null,

            longitude:
              deliveryLongitude ??
              shipment.currentLongitude ??
              null,
          }),
        }
      );

      let responseData = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Your session has expired or you do not have permission to submit proof of delivery."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "The shipment could not be found."
        );
      }

      if (response.status === 409) {
        throw new Error(
          "Proof of delivery already exists for this shipment."
        );
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            "Unable to submit proof of delivery."
        );
      }

      setSuccessMessage(
        "Proof of delivery submitted successfully."
      );

      window.setTimeout(() => {
        navigate("/operator/shipments");
      }, 1500);
    } catch (error) {
      console.error(
        "POD submission failed:",
        error
      );

      setErrorMessage(
        error.message ||
          "Something went wrong while submitting proof of delivery."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingShipment) {
    return (
      <div className="pod-page">
        <div className="pod-loading-state">
          <div className="pod-loading-spinner"></div>

          <h2>Loading shipment details</h2>

          <p>
            Please wait while the shipment information
            is retrieved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      <header className="pod-header">
        <div>
          <span>PROOF OF DELIVERY</span>

          <h1>Confirm Shipment Delivery</h1>

          <p>
            Capture the receiver’s signature, delivery
            photo and final delivery confirmation.
          </p>
        </div>

        <Link to="/operator/shipments">
          Back to Shipments
        </Link>
      </header>

      {errorMessage && (
        <div
          className="pod-alert pod-alert-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="pod-alert pod-alert-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {shipment && (
        <section className="pod-shipment-summary">
          <div>
            <span>Tracking Number</span>

            <strong>
              {shipment.trackingNumber ||
                trackingNumber}
            </strong>
          </div>

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

          <div>
            <span>Source</span>

            <strong>
              {shipment.source ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>Destination</span>

            <strong>
              {shipment.destination ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {formatStatus(shipment.status)}
            </strong>
          </div>
        </section>
      )}

      <form
        className="pod-form"
        onSubmit={handleSubmit}
      >
        <div className="pod-field">
          <label htmlFor="receiverName">
            Receiver Name
          </label>

          <input
            id="receiverName"
            type="text"
            value={receiverName}
            readOnly
            placeholder="Receiver name"
          />
        </div>

        <div className="pod-field">
          <label>Delivery Location</label>

          <div className="pod-location-status">
            <span>
              {locationMessage ||
                "Delivery location has not been captured."}
            </span>

            <button
              type="button"
              onClick={captureCurrentLocation}
              disabled={isGettingLocation}
              className="pod-location-button"
            >
              {isGettingLocation
                ? "Getting Location..."
                : "Capture Location Again"}
            </button>
          </div>
        </div>

        <div className="pod-field">
          <label htmlFor="deliveryPhoto">
            Delivery Photo
          </label>

          <input
            ref={photoInputRef}
            id="deliveryPhoto"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handlePhotoUpload}
          />

          <small>
            Upload a clear image of the delivered
            package. Maximum size: 5 MB.
          </small>

          {photoPreview && (
            <div className="pod-photo-preview">
              <img
                src={photoPreview}
                alt="Delivery proof preview"
              />

              <button
                type="button"
                onClick={removeDeliveryPhoto}
                className="pod-remove-photo-button"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>

        <div className="pod-field">
          <label>Receiver Signature</label>

          <div className="pod-signature-wrapper">
            <SignatureCanvas
              ref={signatureRef}
              penColor="#111827"
              canvasProps={{
                width: 700,
                height: 240,
                className:
                  "pod-signature-canvas",
              }}
            />
          </div>

          <button
            type="button"
            onClick={clearSignature}
            className="pod-clear-button"
          >
            Clear Signature
          </button>
        </div>

        <div className="pod-field">
          <label htmlFor="deliveryNotes">
            Delivery Notes
          </label>

          <textarea
            id="deliveryNotes"
            value={deliveryNotes}
            onChange={(event) =>
              setDeliveryNotes(
                event.target.value
              )
            }
            placeholder="Add optional delivery notes"
            rows={5}
            maxLength={500}
          />

          <small>
            {deliveryNotes.length}/500 characters
          </small>
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            isLoadingShipment ||
            isGettingLocation ||
            !shipment
          }
          className="pod-submit-button"
        >
          {isSubmitting
            ? "Submitting Proof..."
            : "Submit Proof of Delivery"}
        </button>
      </form>
    </div>
  );
}

export default ProofOfDeliveryPage;