import { useEffect, useState } from "react";

import {
  getAllSupportRequests,
  getMySupportRequests,
  getSupportRequestById,
  getSupportAgents,
  assignSupportRequest,
  updateSupportRequestStatus,
  resolveSupportRequest,
} from "../../services/supportService";

import "../../styles/SupportRequestTable.css";

function SupportRequestTable({ showAssign = true }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [supportAgents, setSupportAgents] = useState([]);

  const [assigningRequestId, setAssigningRequestId] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadRequests();
    loadSupportAgents();
  }, []);

  const loadRequests = async () => {
    try {
      const data = showAssign
        ? await getAllSupportRequests()
        : await getMySupportRequests();

      console.log("Support Requests:", data);

      setRequests(data);
    } catch (error) {
      console.error("Failed to load support requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportAgents = async () => {
    try {
      const data = await getSupportAgents();

      console.log("Support Agents:", data);

      setSupportAgents(data || []);
    } catch (error) {
      console.error("Failed to load support agents:", error);

      alert(error.response?.data?.message || "Failed to load support agents.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setDetailsLoading(true);

      const data = await getSupportRequestById(id);

      console.log("Support Request Details:", data);

      setSelectedRequest(data);
    } catch (error) {
      console.error("Failed to load request details:", error);

      alert(error.response?.data?.message || "Failed to load request details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const handleOpenAssignModal = (requestId) => {
    console.log("Opening assignment modal for request:", requestId);

    setAssigningRequestId(requestId);
    setSelectedAgentId("");
  };

  const handleCloseAssignModal = () => {
    if (assigning) {
      return;
    }

    setAssigningRequestId(null);
    setSelectedAgentId("");
  };

  const handleAssign = async () => {
    if (!assigningRequestId) {
      alert("Invalid support request.");
      return;
    }

    if (!selectedAgentId) {
      alert("Please select a support agent.");
      return;
    }

    try {
      setAssigning(true);

      console.log(
        "Assigning request:",
        assigningRequestId,
        "to agent:",
        selectedAgentId,
      );

      const response = await assignSupportRequest(
        assigningRequestId,
        selectedAgentId,
      );

      console.log("Assignment response:", response);

      alert("Support Request Assigned Successfully");

      setAssigningRequestId(null);
      setSelectedAgentId("");

      await loadRequests();
    } catch (error) {
      console.error("Assignment Failed");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("URL:", error.config?.url);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Assignment Failed";

      alert(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateSupportRequestStatus(id, status);

      await loadRequests();
    } catch (error) {
      console.error("Status update failed:", error);

      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveSupportRequest(id);

      alert("Request Resolved Successfully");

      await loadRequests();
    } catch (error) {
      console.error("Resolve failed:", error);

      alert(error.response?.data?.message || "Failed to resolve request");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "OPEN":
        return "status-open";

      case "IN_PROGRESS":
        return "status-progress";

      case "RESOLVED":
        return "status-resolved";

      case "REJECTED":
        return "status-rejected";

      default:
        return "status-default";
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRequests = requests.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(requests.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="support-request-table">
        <div className="support-loading">Loading Support Requests...</div>
      </div>
    );
  }

  return (
    <div className="support-request-table">
      <div className="support-table-header">
        <div>
          <h2>Customer Support Requests</h2>

          <p>View and monitor all customer shipment requests and issues.</p>
        </div>

        <div className="request-count">{requests.length} Requests</div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>CUSTOMER</th>
              <th>TYPE</th>
              <th>SUBJECT</th>
              <th>STATUS</th>
              <th>ASSIGNED TO</th>
              <th>CREATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map((request) => (
                <tr key={request.id}>
                  <td className="request-id">#{request.id}</td>

                  <td className="customer-name">
                    {request.customerName || "-"}
                  </td>

                  <td>
                    <span
                      className={
                        request.requestType === "SHIPMENT_REQUEST"
                          ? "type-shipment"
                          : "type-issue"
                      }
                    >
                      {request.requestType || "-"}
                    </span>
                  </td>

                  <td className="subject-cell">{request.subject || "-"}</td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        request.status,
                      )}`}
                    >
                      {request.status || "-"}
                    </span>
                  </td>

                  <td className="assigned-agent-cell">
                    {request.assignedTo || (
                      <span className="not-assigned">Not Assigned</span>
                    )}
                  </td>

                  <td>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="support-actions">
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      View
                    </button>

                    {showAssign && (
                      <button
                        className="assign-btn"
                        onClick={() => handleOpenAssignModal(request.id)}
                      >
                        Assign
                      </button>
                    )}
                    <select
                      className="status-select"
                      value={request.status || ""}
                      onChange={(e) =>
                        handleStatusChange(request.id, e.target.value)
                      }
                    >
                      <option value="PENDING">PENDING</option>

                      <option value="OPEN">OPEN</option>

                      <option value="IN_PROGRESS">IN_PROGRESS</option>

                      <option value="RESOLVED">RESOLVED</option>

                      <option value="REJECTED">REJECTED</option>
                    </select>

                    <button
                      className="resolve-btn"
                      onClick={() => handleResolve(request.id)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-requests">
                  No Requests Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`pagination-number ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {assigningRequestId && (
        <div className="assign-overlay" onClick={handleCloseAssignModal}>
          <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assign-modal-header">
              <div>
                <h2>Assign Support Request</h2>

                <p>Request ID: #{assigningRequestId}</p>
              </div>

              <button
                className="assign-close-btn"
                onClick={handleCloseAssignModal}
                disabled={assigning}
              >
                ×
              </button>
            </div>

            <div className="assign-modal-body">
              <label htmlFor="supportAgent">Select Support Agent</label>

              <select
                id="supportAgent"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                disabled={assigning}
                className="agent-select"
              >
                <option value="">-- Select Support Agent --</option>

                {supportAgents.length > 0 ? (
                  supportAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      ID: {agent.id} - {agent.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No Support Agents Found
                  </option>
                )}
              </select>

              {selectedAgentId && (
                <div className="selected-agent-info">
                  <span>Selected Agent</span>

                  <strong>
                    {(() => {
                      const selectedAgent = supportAgents.find(
                        (agent) => String(agent.id) === String(selectedAgentId),
                      );

                      return selectedAgent
                        ? `ID: ${selectedAgent.id} - ${selectedAgent.name}`
                        : "-";
                    })()}
                  </strong>
                </div>
              )}
            </div>

            <div className="assign-modal-footer">
              <button
                className="cancel-assign-btn"
                onClick={handleCloseAssignModal}
                disabled={assigning}
              >
                Cancel
              </button>

              <button
                className="confirm-assign-btn"
                onClick={handleAssign}
                disabled={assigning || !selectedAgentId}
              >
                {assigning ? "Assigning..." : "Assign Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="details-overlay">
          <div className="details-loading">Loading request details...</div>
        </div>
      )}

      {selectedRequest && (
        <div className="details-overlay" onClick={handleCloseDetails}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <div>
                <h2>Request Details</h2>

                <p>Request ID: #{selectedRequest.id}</p>
              </div>

              <button
                className="close-details-btn"
                onClick={handleCloseDetails}
              >
                ×
              </button>
            </div>

            <div className="details-section">
              <h3>Request Information</h3>

              <div className="details-grid">
                <div className="detail-item">
                  <span>Customer</span>

                  <strong>{selectedRequest.customerName || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Request Type</span>

                  <strong>{selectedRequest.requestType || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>

                  <strong>{selectedRequest.status || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Assigned To</span>

                  <strong>
                    {selectedRequest.assignedTo || "Not Assigned"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Created</span>

                  <strong>
                    {selectedRequest.createdAt
                      ? new Date(selectedRequest.createdAt).toLocaleString()
                      : "-"}
                  </strong>
                </div>
              </div>
            </div>

            {selectedRequest.requestType === "SHIPMENT_REQUEST" && (
              <div className="details-section">
                <h3>Shipment Details</h3>

                <div className="details-grid">
                  <div className="detail-item">
                    <span>Sender Name</span>

                    <strong>{selectedRequest.senderName || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Receiver Name</span>

                    <strong>{selectedRequest.receiverName || "-"}</strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Pickup Address</span>

                    <strong>{selectedRequest.pickupAddress || "-"}</strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Delivery Address</span>

                    <strong>{selectedRequest.deliveryAddress || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Package Type</span>

                    <strong>{selectedRequest.packageType || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Weight</span>

                    <strong>
                      {selectedRequest.weight
                        ? `${selectedRequest.weight} Kg`
                        : "-"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Pickup Date</span>

                    <strong>{selectedRequest.pickupDate || "-"}</strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Special Instructions</span>

                    <strong>
                      {selectedRequest.specialInstructions || "-"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {selectedRequest.requestType === "ISSUE" && (
              <div className="details-section">
                <h3>Issue Details</h3>

                <div className="details-grid">
                  <div className="detail-item">
                    <span>Tracking ID</span>

                    <strong>{selectedRequest.trackingId || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Issue Type</span>

                    <strong>{selectedRequest.issueType || "-"}</strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Subject</span>

                    <strong>{selectedRequest.subject || "-"}</strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Description</span>

                    <strong className="description-text">
                      {selectedRequest.description || "-"}
                    </strong>
                  </div>

                  <div className="detail-item full-width">
                    <span>Attachment</span>

                    <strong>
                      {selectedRequest.attachment || "No attachment"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="details-footer">
              <button className="close-modal-btn" onClick={handleCloseDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportRequestTable;
