import { useEffect, useState } from "react";

import {
  getAllSupportRequests,
  assignSupportRequest,
  updateSupportRequestStatus,
  resolveSupportRequest,
} from "../../services/supportService";

import "../../styles/SupportRequestTable.css";

function SupportRequestTable() {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getAllSupportRequests();
      console.log("Support Requests:", data);
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (id) => {
    try {
      await assignSupportRequest(id);

      alert("Request Assigned Successfully");

      loadRequests();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Assignment Failed");
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await updateSupportRequestStatus(id, status);

      loadRequests();
    } catch (error) {
      console.error(error);
    }
  };
  const handleResolve = async (id) => {
    try {
      await resolveSupportRequest(id);

      alert("Request Resolved");

      loadRequests();
    } catch (error) {
      console.error(error);
    }
  };
  if (loading) {
    return <h3>Loading Support Requests...</h3>;
  }
  return (
    <div className="support-request-table">
      <h2>Customer Support Requests</h2>
      <h2
        style={{
          marginBottom: "8px",
          color: "#1e293b",
        }}
      ></h2>
      <p
        style={{
          color: "#64748b",
          marginBottom: "20px",
        }}
      >
        View and monitor all customer shipment requests and issues.
      </p>

      <table>
        <thead>
          <tr>
            <th>ID</th>

            <th>Customer</th>

            <th>Type</th>

            <th>Subject</th>

            <th>Status</th>

            <th>Assigned To</th>

            <th>Created</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>

                <td>{request.customerName}</td>

                <td>{request.requestType}</td>

                <td>{request.subject || "-"}</td>

                <td>{request.status}</td>

                <td>{request.assignedTo || "-"}</td>

                <td>{new Date(request.createdAt).toLocaleDateString()}</td>

                <td>
                  <button onClick={() => handleAssign(request.id)}>
                    Assign
                  </button>

                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusChange(
                        request.id,

                        e.target.value,
                      )
                    }
                  >
                    <option value="PENDING">PENDING</option>

                    <option value="OPEN">OPEN</option>

                    <option value="IN_PROGRESS">IN_PROGRESS</option>

                    <option value="RESOLVED">RESOLVED</option>

                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <button onClick={() => handleResolve(request.id)}>
                    Resolve
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: "center",

                  padding: "20px",
                }}
              >
                No Requests Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SupportRequestTable;
