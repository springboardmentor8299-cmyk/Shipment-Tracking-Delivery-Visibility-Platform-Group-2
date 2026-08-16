import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PodVerificationPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

function PodVerificationPage() {
  const [pendingProofs, setPendingProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getStoredToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken")
    );
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

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

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
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

  const fetchPendingProofs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = getStoredToken();

      const response = await fetch(
        `${API_BASE_URL}/api/pod/pending`,
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
          "Your session has expired or you do not have permission to review proof of delivery records."
        );
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            "Unable to load pending proof of delivery records."
        );
      }

      const proofList = Array.isArray(responseData)
        ? responseData
        : responseData?.content ||
          responseData?.proofs ||
          responseData?.data ||
          [];

      setPendingProofs(proofList);
    } catch (error) {
      console.error(
        "Unable to load pending POD records:",
        error
      );

      setPendingProofs([]);

      setErrorMessage(
        error.message ||
          "Something went wrong while loading pending proof of delivery records."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const updateVerification = async (
    proofId,
    action
  ) => {
    const actionLabel =
      action === "verify" ? "approve" : "reject";

    const confirmationMessage =
      action === "verify"
        ? "Approve this proof of delivery?"
        : "Reject this proof of delivery?";

    const confirmed = window.confirm(
      confirmationMessage
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(proofId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = getStoredToken();

      const response = await fetch(
        `${API_BASE_URL}/api/pod/${proofId}/${action}`,
        {
          method: "PUT",
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
          "Your session has expired or you do not have permission to update this proof of delivery."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "The proof of delivery record could not be found."
        );
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            `Unable to ${actionLabel} proof of delivery.`
        );
      }

      setPendingProofs((previousProofs) =>
        previousProofs.filter(
          (proof) => proof.id !== proofId
        )
      );

      setSuccessMessage(
        action === "verify"
          ? "Proof of delivery approved successfully."
          : "Proof of delivery rejected successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        `Unable to ${actionLabel} POD:`,
        error
      );

      setErrorMessage(
        error.message ||
          `Something went wrong while trying to ${actionLabel} the proof of delivery.`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="pod-verification-page">
      <header className="pod-verification-header">
        <div>
          <span className="pod-verification-label">
            ADMINISTRATOR WORKSPACE
          </span>

          <h1>Proof of Delivery Verification</h1>

          <p>
            Review submitted delivery photos, receiver
            signatures, delivery notes and final shipment
            information.
          </p>
        </div>

        <div className="pod-verification-header-actions">
          <button
            type="button"
            className="pod-refresh-button"
            onClick={fetchPendingProofs}
            disabled={isLoading}
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh Proofs"}
          </button>

          <Link
            to="/admin"
            className="pod-back-button"
          >
            Back to Dashboard
          </Link>
        </div>
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

      <section className="pod-verification-summary">
        <div>
          <span>Pending Proofs</span>
          <strong>
            {isLoading ? "—" : pendingProofs.length}
          </strong>
          <small>
            Delivery proofs awaiting administrator review
          </small>
        </div>
      </section>

      {isLoading ? (
        <div className="pod-verification-state">
          <div className="pod-loading-spinner"></div>

          <h2>Loading pending proofs</h2>

          <p>
            Please wait while proof of delivery records are
            retrieved.
          </p>
        </div>
      ) : pendingProofs.length === 0 ? (
        <div className="pod-verification-state">
          <div className="pod-empty-icon">✓</div>

          <h2>No pending proofs</h2>

          <p>
            All submitted proof of delivery records have
            already been reviewed.
          </p>
        </div>
      ) : (
        <div className="pod-list">
          {pendingProofs.map((pod) => {
            const isProcessing =
              processingId === pod.id;

            return (
              <article
                key={pod.id}
                className="pod-card"
              >
                <div className="pod-card-header">
                  <div>
                    <span className="pod-card-label">
                      TRACKING NUMBER
                    </span>

                    <h2>
                      {pod.trackingNumber ||
                        "Not available"}
                    </h2>
                  </div>

                  <span className="pod-status">
                    {formatStatus(
                      pod.verificationStatus
                    )}
                  </span>
                </div>

                <div className="pod-grid">
                  <div>
                    <label>Receiver</label>

                    <strong>
                      {pod.receiverName ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <label>Shipment ID</label>

                    <strong>
                      {pod.shipmentId ??
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <label>Delivered At</label>

                    <strong>
                      {formatDateTime(
                        pod.deliveredAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Verification Status</label>

                    <strong>
                      {formatStatus(
                        pod.verificationStatus
                      )}
                    </strong>
                  </div>
                </div>

                <div className="pod-proof-media-grid">
                  <section className="pod-section">
                    <div className="pod-section-header">
                      <div>
                        <span>DELIVERY EVIDENCE</span>
                        <h3>Delivery Photo</h3>
                      </div>

                      <span className="pod-section-icon">
                        📷
                      </span>
                    </div>

                    {pod.deliveryPhoto ? (
                      <div className="pod-image-wrapper">
                        <img
                          src={pod.deliveryPhoto}
                          alt={`Delivery proof for ${
                            pod.trackingNumber ||
                            "shipment"
                          }`}
                          className="pod-image pod-delivery-photo"
                        />
                      </div>
                    ) : (
                      <div className="pod-media-empty">
                        <span>📷</span>
                        <p>
                          Delivery photo was not provided.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="pod-section">
                    <div className="pod-section-header">
                      <div>
                        <span>RECEIVER CONFIRMATION</span>
                        <h3>Receiver Signature</h3>
                      </div>

                      <span className="pod-section-icon">
                        ✍
                      </span>
                    </div>

                    {pod.signatureData ? (
                      <div className="pod-image-wrapper pod-signature-image-wrapper">
                        <img
                          src={pod.signatureData}
                          alt={`Receiver signature for ${
                            pod.trackingNumber ||
                            "shipment"
                          }`}
                          className="pod-image pod-signature-image"
                        />
                      </div>
                    ) : (
                      <div className="pod-media-empty">
                        <span>✍</span>
                        <p>
                          Receiver signature was not
                          provided.
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                <section className="pod-section">
                  <div className="pod-section-header">
                    <div>
                      <span>DELIVERY INFORMATION</span>
                      <h3>Delivery Notes</h3>
                    </div>

                    <span className="pod-section-icon">
                      📝
                    </span>
                  </div>

                  <p className="pod-delivery-notes">
                    {pod.deliveryNotes ||
                      "No delivery notes were provided."}
                  </p>
                </section>

                <section className="pod-section">
                  <div className="pod-section-header">
                    <div>
                      <span>LOCATION VERIFICATION</span>
                      <h3>Delivery Position</h3>
                    </div>

                    <span className="pod-section-icon">
                      📍
                    </span>
                  </div>

                  <div className="pod-location-grid">
                    <div>
                      <span>Latitude</span>
                      <strong>
                        {pod.latitude ??
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Longitude</span>
                      <strong>
                        {pod.longitude ??
                          "Not available"}
                      </strong>
                    </div>
                  </div>
                </section>

                <div className="pod-actions">
                  <button
                    type="button"
                    className="reject-button"
                    disabled={isProcessing}
                    onClick={() =>
                      updateVerification(
                        pod.id,
                        "reject"
                      )
                    }
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Reject Proof"}
                  </button>

                  <button
                    type="button"
                    className="approve-button"
                    disabled={isProcessing}
                    onClick={() =>
                      updateVerification(
                        pod.id,
                        "verify"
                      )
                    }
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Approve Proof"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PodVerificationPage;