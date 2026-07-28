import "../styles/ShipmentTable.css";
import { useEffect, useState, useMemo } from "react";
import AddShipmentModal from "./AddShipmentModal";
import {
  getAllShipments,
  addShipment,
  updateShipment,
  deleteShipment,
} from "../services/shipmentService";

const STATUS_MAP = {
  CREATED: { key: "pending", label: "Created" },
  PICKED_UP: { key: "in_transit", label: "Picked Up" },
  IN_TRANSIT: { key: "in_transit", label: "In Transit" },
  OUT_FOR_DELIVERY: { key: "in_transit", label: "Out For Delivery" },
  DELIVERED: { key: "delivered", label: "Delivered" },
  FAILED_DELIVERY: { key: "cancelled", label: "Failed Delivery" },
  CANCELLED: { key: "cancelled", label: "Cancelled" },
};

const renderStatusBadge = (status) => {
  if (!status) return null;

  // Standardizes strings like "IN_TRANSIT" or "Out For Delivery" -> "in-transit", "out-for-delivery"
  const statusClass = String(status)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");

  // Standardizes text display (e.g. "IN_TRANSIT" -> "IN TRANSIT")
  const displayLabel = String(status).replace(/_/g, " ");

  return <span className={`status ${statusClass}`}>{displayLabel}</span>;
};

function ShipmentTable({ searchTerm = "" }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await getAllShipments();
      setShipments(data || []);
    } catch (error) {
      console.error("Failed to load shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveShipment = async (shipment) => {
    try {
      if (editingShipment) {
        await updateShipment(editingShipment.id, shipment);
        alert("Shipment Updated Successfully");
      } else {
        await addShipment(shipment);
        alert("Shipment Added Successfully");
      }

      loadShipments();
      window.dispatchEvent(new Event("analytics:update"));
      window.dispatchEvent(new Event("activities:update"));
      setEditingShipment(null);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Operation Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipment?"))
      return;

    try {
      await deleteShipment(id);
      alert("Shipment Deleted Successfully");
      loadShipments();
      window.dispatchEvent(new Event("analytics:update"));
      window.dispatchEvent(new Event("activities:update"));
    } catch (error) {
      console.error(error);
      alert("Failed to delete shipment");
    }
  };

  const filteredShipments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return shipments;

    return shipments.filter(
      (s) =>
        s.trackingId?.toLowerCase().includes(query) ||
        s.customerName?.toLowerCase().includes(query) ||
        s.receiverName?.toLowerCase().includes(query) ||
        s.origin?.toLowerCase().includes(query) ||
        s.destination?.toLowerCase().includes(query) ||
        String(s.id).includes(query),
    );
  }, [shipments, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentShipments = filteredShipments.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <div className="table-title-group">
            <h2>Recent Shipments</h2>
            <span className="count-badge">{filteredShipments.length}</span>
          </div>
          <p className="table-subtitle">
            Monitor and update active order tracking statuses
          </p>
        </div>

        <button className="add-shipment-btn" onClick={() => setShowModal(true)}>
          + Add Shipment
        </button>
      </div>

      <AddShipmentModal
        show={showModal}
        shipment={editingShipment}
        onClose={() => {
          setShowModal(false);
          setEditingShipment(null);
        }}
        onSave={saveShipment}
      />

      <div className="table-wrapper">
        <table>
          <colgroup>
            <col className="col-id" />
            <col className="col-tracking" />
            <col className="col-customer" />
            <col className="col-receiver" />
            <col className="col-items" />
            <col className="col-weight" />
            <col className="col-cost" />
            <col className="col-origin" />
            <col className="col-destination" />
            <col className="col-status" />
            <col className="col-date" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-tracking">TRACKING ID</th>
              <th className="col-customer">CUSTOMER</th>
              <th>RECEIVER</th>
              <th>ITEMS</th>
              <th>WEIGHT</th>
              <th>COST</th>
              <th className="col-origin">ORIGIN</th>
              <th className="col-destination">DESTINATION</th>
              <th className="col-status">STATUS</th>
              <th className="col-date">DELIVERY DATE</th>
              <th className="col-actions">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="table-state-cell">
                  Loading shipments...
                </td>
              </tr>
            ) : currentShipments.length > 0 ? (
              currentShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="col-id font-mono">#{shipment.id}</td>
                  <td className="col-tracking font-mono font-medium highlight-text">
                    {shipment.trackingId}
                  </td>
                  <td className="col-customer font-medium">
                    {shipment.customerName}
                  </td>
                  <td>{shipment.receiverName || "-"}</td>
                  <td>{shipment.noOfItems || "-"}</td>
                  <td>{shipment.totalWeightOfItems || "-"}</td>
                  <td>{shipment.shipmentCost || "-"}</td>
                  <td className="col-origin" title={shipment.origin}>
                    {shipment.origin}
                  </td>
                  <td className="col-destination" title={shipment.destination}>
                    {shipment.destination}
                  </td>
                  <td className="col-status">
                    {renderStatusBadge(shipment.status)}
                  </td>
                  <td className="col-date text-muted">
                    {shipment.deliveryDate || "In Transit"}
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons-group">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditingShipment(shipment);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(shipment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="table-state-cell">
                  No shipments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="pagination-container">
        <span className="pagination-info">
          Showing{" "}
          <strong>{filteredShipments.length > 0 ? indexOfFirst + 1 : 0}</strong>{" "}
          to <strong>{Math.min(indexOfLast, filteredShipments.length)}</strong>{" "}
          of <strong>{filteredShipments.length}</strong> entries
        </span>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShipmentTable;
