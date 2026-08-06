import { useEffect, useState } from "react";
import { getMyRequests } from "../../../../services/supportService";
import "../../../../styles/CustomerSupport.css";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "pending";

      case "OPEN":
        return "open";

      case "IN_PROGRESS":
        return "progress";

      case "RESOLVED":
        return "resolved";

      case "REJECTED":
        return "rejected";

      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="requests-table">
        <h2>My Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="requests-table">
      <h2>My Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Request Type</th>
            <th>Shipment ID</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Created On</th>
          </tr>
        </thead>

        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>

                <td>{req.requestType}</td>

                <td>{req.shipmentId || "-"}</td>

                <td>{req.subject || "-"}</td>

                <td>
                  <span className={`status ${getStatusClass(req.status)}`}>
                    {req.status}
                  </span>
                </td>

                <td>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No Requests Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MyRequests;
