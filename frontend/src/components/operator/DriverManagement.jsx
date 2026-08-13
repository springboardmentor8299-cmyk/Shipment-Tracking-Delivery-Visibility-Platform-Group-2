import { useEffect, useMemo, useState } from "react";
import {
  FaUserTie,
  FaPhoneAlt,
  FaTruck,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaExchangeAlt,
  FaBoxOpen,
  FaArrowRight,
  FaIdCard,
} from "react-icons/fa";

import StatCard from "../StatCard";
import AddDriverModal from "./AddDriverModal";
import AssignShipmentModal from "./AssignShipmentModal";

import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getUnassignedShipments,
  assignShipmentToDriver,
  unassignShipmentFromDriver,
} from "../../services/driverService";

import "../../styles/StatCard.css";
import "../../styles/DriverManagement.css";

const MOCK_DRIVERS = [
  {
    id: 1,
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicleType: "TRUCK",
    vehicleNumber: "KA-01-AB-1234",
    status: "ON_DELIVERY",
    shipmentCapacity: 50,
    activeShipmentCount: 2,
    activeShipments: [
      {
        id: 101,
        trackingId: "SHP-10231",
        origin: "Bengaluru",
        destination: "Chennai",
        status: "OUT_FOR_DELIVERY",
      },
      {
        id: 102,
        trackingId: "SHP-10233",
        origin: "Bengaluru",
        destination: "Hosur",
        status: "IN_TRANSIT",
      },
    ],
    totalDelivered: 128,
  },
  {
    id: 2,
    name: "Suresh Patil",
    phone: "+91 90123 45678",
    vehicleType: "VAN",
    vehicleNumber: "KA-05-CD-5566",
    status: "AVAILABLE",
    shipmentCapacity: 20,
    activeShipmentCount: 0,
    activeShipments: [],
    totalDelivered: 94,
  },
  {
    id: 3,
    name: "Arjun Nair",
    phone: "+91 91234 56780",
    vehicleType: "MINI_TRUCK",
    vehicleNumber: "KA-03-XY-7788",
    status: "OFFLINE",
    shipmentCapacity: 30,
    activeShipmentCount: 0,
    activeShipments: [],
    totalDelivered: 51,
  },
];

const MOCK_UNASSIGNED_SHIPMENTS = [
  {
    id: 201,
    trackingId: "SHP-10245",
    origin: "Mysuru",
    destination: "Bengaluru",
  },
  {
    id: 202,
    trackingId: "SHP-10248",
    origin: "Hubli",
    destination: "Belagavi",
  },
];

const STATUS_META = {
  AVAILABLE: { label: "Available", className: "status-available" },
  ON_DELIVERY: { label: "On Delivery", className: "status-on-delivery" },
  OFFLINE: { label: "Offline", className: "status-offline" },
};

const VEHICLE_CAPACITY = {
  BIKE: 10,
  VAN: 20,
  MINI_TRUCK: 30,
  TRUCK: 50,
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [unassignedShipments, setUnassignedShipments] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [driverData, shipmentData] = await Promise.all([
        getAllDrivers(),
        getUnassignedShipments(),
      ]);
      setDrivers(driverData || []);
      setUnassignedShipments(shipmentData || []);
      setUsingMockData(false);
    } catch (error) {
      console.warn("Driver API not available yet, showing sample data.", error);
      setDrivers(MOCK_DRIVERS);
      setUnassignedShipments(MOCK_UNASSIGNED_SHIPMENTS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: drivers.length,
      available: drivers.filter((d) => d.status === "AVAILABLE").length,
      onDelivery: drivers.filter((d) => d.status === "ON_DELIVERY").length,
      offline: drivers.filter((d) => d.status === "OFFLINE").length,
    };
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchesQuery =
        !query ||
        d.name?.toLowerCase().includes(query) ||
        d.vehicleNumber?.toLowerCase().includes(query) ||
        d.phone?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // --- Driver CRUD ---

  const handleSaveDriver = async (driverData) => {
    try {
      if (editingDriver) {
        if (usingMockData) {
          setDrivers((prev) =>
            prev.map((d) =>
              d.id === editingDriver.id ? { ...d, ...driverData } : d,
            ),
          );
        } else {
          await updateDriver(editingDriver.id, driverData);
          await loadData();
        }
      } else {
        if (usingMockData) {
          setDrivers((prev) => [
            ...prev,
            {
              id: Date.now(),
              status: "AVAILABLE",
              shipmentCapacity: VEHICLE_CAPACITY[driverData.vehicleType] ?? 0,
              activeShipmentCount: 0,
              activeShipments: [],
              totalDelivered: 0,
              ...driverData,
            },
          ]);
        } else {
          const created = await createDriver(driverData);
          await loadData();
          if (created?.temporaryPassword) {
            alert(
              `Driver added. Share these login details with them:\n\n` +
                `Email: ${created.email}\n` +
                `Temporary password: ${created.temporaryPassword}\n\n` +
                `They should change this password after first login.`,
            );
          }
        }
      }
      setShowAddModal(false);
      setEditingDriver(null);
    } catch (error) {
      console.error("Failed to save driver", error);
      alert(
        error.friendlyMessage || "Could not save driver. Please try again.",
      );
    }
  };

  const handleDeleteDriver = async (driver) => {
    if (!window.confirm(`Remove ${driver.name} from your driver list?`)) return;
    try {
      if (usingMockData) {
        setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      } else {
        await deleteDriver(driver.id);
        await loadData();
      }
    } catch (error) {
      console.error("Failed to delete driver", error);
      alert("Could not remove driver. Please try again.");
    }
  };

  // --- Assignment ---

  const openAssignModal = (driver = null) => {
    setAssigningDriver(driver);
    setShowAssignModal(true);
  };

  const handleAssign = async (shipmentId, driverId) => {
    try {
      if (usingMockData) {
        const shipment = unassignedShipments.find((s) => s.id === shipmentId);
        setDrivers((prev) =>
          prev.map((d) => {
            if (d.id !== driverId) return d;
            const newActive = shipment
              ? [
                  ...(d.activeShipments || []),
                  { ...shipment, status: "OUT_FOR_DELIVERY" },
                ]
              : d.activeShipments || [];
            return {
              ...d,
              status: "ON_DELIVERY",
              activeShipments: newActive,
              activeShipmentCount: newActive.length,
            };
          }),
        );
        setUnassignedShipments((prev) =>
          prev.filter((s) => s.id !== shipmentId),
        );
      } else {
        await assignShipmentToDriver(shipmentId, driverId);
        await loadData();
      }
      setShowAssignModal(false);
      setAssigningDriver(null);
    } catch (error) {
      console.error("Failed to assign shipment", error);
      alert(
        error?.response?.data?.message ||
          "Could not assign shipment to driver. Please try again.",
      );
    }
  };

  const handleUnassign = async (driver, shipment) => {
    if (!shipment) return;
    if (!window.confirm(`Unassign ${shipment.trackingId} from ${driver.name}?`))
      return;
    try {
      if (usingMockData) {
        setDrivers((prev) =>
          prev.map((d) => {
            if (d.id !== driver.id) return d;
            const remaining = (d.activeShipments || []).filter(
              (s) => s.id !== shipment.id,
            );
            return {
              ...d,
              status: remaining.length > 0 ? "ON_DELIVERY" : "AVAILABLE",
              activeShipments: remaining,
              activeShipmentCount: remaining.length,
            };
          }),
        );
      } else {
        await unassignShipmentFromDriver(shipment.id);
        await loadData();
      }
    } catch (error) {
      console.error("Failed to unassign shipment", error);
      alert("Could not unassign shipment. Please try again.");
    }
  };

  return (
    <div className="driver-management">
      <div className="dm-page-header">
        <div>
          <h1>Drivers</h1>
          <p>Assign shipments to drivers and track who's on the road.</p>
        </div>
      </div>

      {usingMockData && (
        <div className="dm-notice">
          Showing sample data — connect the <code>/operator/drivers</code>{" "}
          backend endpoints to see live drivers.
        </div>
      )}

      <div className="stats-container dm-stats">
        <StatCard
          title="Total Drivers"
          value={stats.total}
          icon={<FaUserTie />}
          color="#2563EB"
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={<FaTruck />}
          color="#22C55E"
        />
        <StatCard
          title="On Delivery"
          value={stats.onDelivery}
          icon={<FaExchangeAlt />}
          color="#F59E0B"
        />
        <StatCard
          title="Offline"
          value={stats.offline}
          icon={<FaIdCard />}
          color="#94A3B8"
        />
      </div>

      <div className="table-card dm-card">
        <div className="table-header dm-toolbar">
          <div className="table-title-group">
            <h2>Driver List</h2>
            <span className="count-badge">{filteredDrivers.length} shown</span>
          </div>

          <div className="dm-toolbar-actions">
            <div className="dm-search">
              <FaSearch />
              <input
                placeholder="Search by name, phone or vehicle no."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="dm-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_DELIVERY">On Delivery</option>
              <option value="OFFLINE">Offline</option>
            </select>

            <button
              className="dm-btn dm-btn-outline"
              onClick={() => openAssignModal(null)}
            >
              <FaExchangeAlt /> Assign Shipment
            </button>

            <button
              className="dm-btn dm-btn-primary"
              onClick={() => {
                setEditingDriver(null);
                setShowAddModal(true);
              }}
            >
              <FaPlus /> Add Driver
            </button>
          </div>
        </div>

        <div className="dm-grid">
          {loading ? (
            <p className="dm-empty">Loading drivers...</p>
          ) : filteredDrivers.length === 0 ? (
            <p className="dm-empty">No drivers found.</p>
          ) : (
            filteredDrivers.map((driver) => {
              const meta = STATUS_META[driver.status] || STATUS_META.OFFLINE;
              const capacity = driver.shipmentCapacity ?? 0;
              const activeCount =
                driver.activeShipmentCount ??
                driver.activeShipments?.length ??
                0;
              const hasRoom = activeCount < capacity;
              return (
                <div className="driver-card" key={driver.id}>
                  <div className="driver-card-top">
                    <div className="driver-avatar">{initials(driver.name)}</div>

                    <div className="driver-basic">
                      <h3>{driver.name}</h3>
                      <span className="driver-phone">
                        <FaPhoneAlt /> {driver.phone}
                      </span>
                    </div>

                    <span className={`driver-status-pill ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="driver-vehicle">
                    <FaTruck />
                    <span>
                      {driver.vehicleType?.replace("_", " ")} ·{" "}
                      {driver.vehicleNumber}
                    </span>
                    <span className="driver-capacity-badge">
                      {activeCount}/{capacity} shipments
                    </span>
                  </div>

                  <div className="driver-shipment">
                    {driver.activeShipments?.length > 0 ? (
                      driver.activeShipments.map((shipment) => (
                        <div className="driver-shipment-item" key={shipment.id}>
                          <div className="driver-shipment-row">
                            <FaBoxOpen />
                            <strong>{shipment.trackingId}</strong>
                          </div>
                          <div className="driver-shipment-route">
                            <span>{shipment.origin}</span>
                            <FaArrowRight />
                            <span>{shipment.destination}</span>
                          </div>
                          <button
                            className="dm-icon-btn"
                            title="Unassign this shipment"
                            onClick={() => handleUnassign(driver, shipment)}
                          >
                            <FaExchangeAlt />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="driver-no-shipment">
                        No active shipments
                      </span>
                    )}
                  </div>

                  <div className="driver-card-footer">
                    <span className="driver-delivered-count">
                      {driver.totalDelivered ?? 0} delivered
                    </span>

                    <div className="driver-actions">
                      {driver.status !== "OFFLINE" && hasRoom && (
                        <button
                          className="dm-icon-btn dm-icon-btn-assign"
                          title="Assign shipment"
                          onClick={() => openAssignModal(driver)}
                        >
                          <FaExchangeAlt /> Assign
                        </button>
                      )}

                      <button
                        className="dm-icon-btn"
                        title="Edit driver"
                        onClick={() => {
                          setEditingDriver(driver);
                          setShowAddModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="dm-icon-btn dm-icon-btn-danger"
                        title="Remove driver"
                        onClick={() => handleDeleteDriver(driver)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddDriverModal
        show={showAddModal}
        driver={editingDriver}
        onClose={() => {
          setShowAddModal(false);
          setEditingDriver(null);
        }}
        onSave={handleSaveDriver}
      />

      <AssignShipmentModal
        show={showAssignModal}
        driver={assigningDriver}
        drivers={drivers}
        unassignedShipments={unassignedShipments}
        onClose={() => {
          setShowAssignModal(false);
          setAssigningDriver(null);
        }}
        onAssign={handleAssign}
      />
    </div>
  );
}

export default DriverManagement;
