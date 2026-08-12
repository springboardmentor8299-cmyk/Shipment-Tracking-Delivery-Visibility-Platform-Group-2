import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

function ShipmentList() {

    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const role = localStorage.getItem("role");

    const fetchShipments = useCallback(async () => {

        try {

            const token = localStorage.getItem("token");

            const endpoint =
                role === "ROLE_CUSTOMER"
                    ? "/shipments/my"
                    : "/shipments";

            const response = await api.get(
                endpoint,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setShipments(response.data);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load shipments"
            );

        } finally {

            setLoading(false);

        }
    }, [role]);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    const getBadgeColor = (status) => {

        switch (status) {

            case "CREATED":
                return "primary";

            case "PENDING":
                return "secondary";

            case "PICKED_UP":
                return "primary";

            case "IN_TRANSIT":
                return "warning";

            case "OUT_FOR_DELIVERY":
                return "info";

            case "DELIVERY_FAILED":
                return "danger";

            case "DELIVERED":
                return "success";

            case "CANCELLED":
                return "danger";

            default:
                return "dark";
        }
    };

    const filteredShipments = useMemo(() => {

        return shipments.filter((shipment) => {

            const keyword = search.toLowerCase();

            const matchesSearch =

                shipment.trackingNumber?.toLowerCase().includes(keyword)

                ||

                shipment.senderName?.toLowerCase().includes(keyword)

                ||

                shipment.receiverName?.toLowerCase().includes(keyword)

                ||

                shipment.receiverAddress?.toLowerCase().includes(keyword)

                ||

                shipment.shipmentStatus?.toLowerCase().includes(keyword);

            const matchesStatus =

                statusFilter === "ALL"

                ||

                shipment.shipmentStatus === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [shipments, search, statusFilter]);

    const totalPages = Math.ceil(
        filteredShipments.length / rowsPerPage
    );

    const paginatedShipments = filteredShipments.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const updateStatus = async (shipmentId, shipment, status) => {

        try {

            const token = localStorage.getItem("token");

            await api.put(

                `/shipments/${shipmentId}`,

                {
                    ...shipment,
                    shipmentStatus: status
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            toast.success(
                "Shipment status updated successfully"
            );

            fetchShipments();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update shipment"
            );

        }

    };

    const deleteShipment = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this shipment?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await api.delete(

                `/shipments/${id}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            toast.success(
                "Shipment deleted successfully"
            );

            fetchShipments();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete shipment"
            );

        }

    };

    const fixStatusTypos = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.post(
                "/shipments/fix-status-typos",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success("Shipment status typos fixed.");
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fix shipment statuses");
        }
    };

    const deleteAllShipments = async () => {
        const confirmDelete = window.confirm(
            "Delete all shipments and tracking history? This cannot be undone."
        );
        if (!confirmDelete) return;
        try {
            const token = localStorage.getItem("token");
            await api.delete(
                "/shipments/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success("All shipments deleted successfully");
            setShipments([]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete all shipments");
        }
    };

    return (

        <div className="container-fluid px-4 mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

                <h2 className="fw-bold">
                    Shipment Management
                </h2>

                <div className="d-flex align-items-center gap-2">
                    {role === "ROLE_ADMIN" && (
                        <>
                            <button className="btn btn-outline-warning btn-sm" onClick={fixStatusTypos}>
                                Fix Status Typos
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={deleteAllShipments}>
                                Delete All
                            </button>
                        </>
                    )}
                    <span className="badge bg-primary fs-6">
                        Total Shipments : {filteredShipments.length}
                    </span>
                </div>

            </div>

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-lg-8">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Tracking Number, Sender, Receiver, Address or Status"
                                value={search}
                                onChange={(e) => {

                                    setSearch(e.target.value);
                                    setCurrentPage(1);

                                }}
                            />

                        </div>

                        <div className="col-lg-4">

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => {

                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);

                                }}
                            >

                                <option value="ALL">
                                    All Status
                                </option>

                                <option value="CREATED">
                                    Created
                                </option>

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="PICKED_UP">
                                    Picked Up
                                </option>

                                <option value="IN_TRANSIT">
                                    In Transit
                                </option>

                                <option value="OUT_FOR_DELIVERY">
                                    Out For Delivery
                                </option>

                                <option value="DELIVERY_FAILED">
                                    Delivery Failed
                                </option>

                                <option value="DELIVERED">
                                    Delivered
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>

                       {loading ? (

                           <div className="text-center py-5">

                               <div
                                   className="spinner-border text-primary"
                                   role="status"
                               ></div>

                               <p className="mt-3">
                                   Loading Shipments...
                               </p>

                           </div>

                       ) : (

                           <div className="table-responsive">

                               <table className="table table-hover table-bordered align-middle">

                                   <thead className="table-dark">

                                   <tr>

                                       <th>ID</th>

                                       <th>Tracking No.</th>

                                       <th>Sender</th>

                                       <th>Receiver</th>

                                       <th>Source</th>

                                       <th>Destination</th>

                                       <th>Weight</th>

                                       <th>Status</th>

                                       {role === "ROLE_CUSTOMER" && (

                                           <>

                                               <th>Delivered At</th>

                                               <th>Received By</th>

                                               <th>Delivery Remarks</th>

                                           </>

                                       )}

                                       {role === "ROLE_ADMIN" && (

                                           <th>Update Status</th>

                                       )}

                                       {role === "ROLE_ADMIN" && (

                                           <th>Delete</th>

                                       )}

                                   </tr>

                                   </thead>

                                   <tbody>

                                   {paginatedShipments.length === 0 ? (

                                       <tr>

                                           <td
                                               colSpan={
                                                   role === "ROLE_ADMIN"
                                                       ? 10
                                                       : 11
                                               }
                                               className="text-center py-4"
                                           >

                                               No Shipments Found

                                           </td>

                                       </tr>

                                   ) : (

                                       paginatedShipments.map((shipment) => (

                                           <tr key={shipment.id}>

                                               <td>{shipment.id}</td>

                                               <td>{shipment.trackingNumber}</td>

                                               <td>{shipment.senderName}</td>

                                               <td>{shipment.receiverName}</td>

                                               <td>{shipment.sourceAddress || shipment.receiverAddress}</td>

                                               <td>{shipment.destinationAddress || shipment.receiverAddress}</td>

                                               <td>{shipment.packageWeight} kg</td>

                                               <td>

                                                   <span
                                                       className={`badge bg-${getBadgeColor(
                                                           shipment.shipmentStatus
                                                       )}`}
                                                   >

                                                       {shipment.shipmentStatus}

                                                   </span>

                                               </td>

                                               {role === "ROLE_CUSTOMER" && (

                                                   <>

                                                       <td>
                                                           {shipment.deliveryTime
                                                               ? new Date(shipment.deliveryTime).toLocaleString()
                                                               : "--"}
                                                       </td>

                                                       <td>
                                                           {shipment.deliveryReceiverName || "--"}
                                                       </td>

                                                       <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                                           {shipment.deliveryRemarks || "--"}
                                                       </td>

                                                   </>

                                               )}

                                               {role === "ROLE_ADMIN" && (

                                                   <td>

                                                       <select
                                                           className="form-select form-select-sm"
                                                           value={shipment.shipmentStatus}
                                                           onChange={(e) =>
                                                               updateStatus(
                                                                   shipment.id,
                                                                   shipment,
                                                                   e.target.value
                                                               )
                                                           }
                                                       >

                                                           <option value="CREATED">
                                                               Created
                                                           </option>

                                                           <option value="PENDING">
                                                               Pending
                                                           </option>

                                                           <option value="PICKED_UP">
                                                               Picked Up
                                                           </option>

                                                           <option value="IN_TRANSIT">
                                                               In Transit
                                                           </option>

                                                           <option value="OUT_FOR_DELIVERY">
                                                               Out For Delivery
                                                           </option>

                                                           <option value="DELIVERY_FAILED">
                                                               Delivery Failed
                                                           </option>

                                                           <option value="DELIVERED">
                                                               Delivered
                                                           </option>

                                                           <option value="CANCELLED">
                                                               Cancelled
                                                           </option>

                                                       </select>

                                                   </td>

                                               )}

                                               {role === "ROLE_ADMIN" && (

                                                   <td>

                                                       <button
                                                           className="btn btn-danger btn-sm"
                                                           onClick={() =>
                                                               deleteShipment(
                                                                   shipment.id
                                                               )
                                                           }
                                                       >

                                                           <i className="bi bi-trash-fill me-1"></i>

                                                           Delete

                                                       </button>

                                                   </td>

                                               )}

                                           </tr>

                                       ))

                                   )}

                                   </tbody>

                               </table>

                           </div>

                       )}


                               {totalPages > 1 && (

                                   <nav className="mt-4">

                                       <ul className="pagination justify-content-center">

                                           <li
                                               className={`page-item ${
                                                   currentPage === 1
                                                       ? "disabled"
                                                       : ""
                                               }`}
                                           >

                                               <button
                                                   className="page-link"
                                                   onClick={() =>
                                                       setCurrentPage(currentPage - 1)
                                                   }
                                               >
                                                   Previous
                                               </button>

                                           </li>

                                           {Array.from(
                                               { length: totalPages },
                                               (_, index) => (

                                                   <li
                                                       key={index}
                                                       className={`page-item ${
                                                           currentPage === index + 1
                                                               ? "active"
                                                               : ""
                                                       }`}
                                                   >

                                                       <button
                                                           className="page-link"
                                                           onClick={() =>
                                                               setCurrentPage(index + 1)
                                                           }
                                                       >
                                                           {index + 1}
                                                       </button>

                                                   </li>

                                               )
                                           )}

                                           <li
                                               className={`page-item ${
                                                   currentPage === totalPages
                                                       ? "disabled"
                                                       : ""
                                               }`}
                                           >

                                               <button
                                                   className="page-link"
                                                   onClick={() =>
                                                       setCurrentPage(currentPage + 1)
                                                   }
                                               >
                                                   Next
                                               </button>

                                           </li>

                                       </ul>

                                   </nav>

                               )}

                           </div>

                       );

                   }

                   export default ShipmentList;
