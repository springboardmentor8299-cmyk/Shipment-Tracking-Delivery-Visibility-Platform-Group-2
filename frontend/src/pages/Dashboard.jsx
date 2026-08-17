import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    FaEye,
    FaEdit,
    FaTrash,
    FaHome,
    FaBoxOpen,
    FaTruck,
    FaUsers,
    FaChartBar,
    FaCog
} from "react-icons/fa";

import {
    getAllShipments,
    deleteShipment
} from "../services/shipmentService";

function Dashboard() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        try {
            const response = await getAllShipments();
            setShipments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this shipment?")) {
            return;
        }

        try {

            await deleteShipment(id);

            alert("Shipment Deleted Successfully");

            loadShipments();

        } catch (error) {

            alert("Unable to delete shipment");

        }

    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");

        navigate("/");

    };

    const filteredShipments = shipments.filter((shipment) =>

        shipment.trackingNumber
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        shipment.senderName
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        shipment.receiverName
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    return (

        <div className="dashboard">

            <aside className="sidebar">

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >

                    <h2>📦 CargoFlow</h2>

                    <p
                        style={{
                            color: "#94a3b8",
                            marginTop: "8px",
                            fontSize: "14px"
                        }}
                    >
                        {role}
                    </p>

                </div>

                <ul>

                    <li><FaHome /> Dashboard</li>

                    {role === "ADMIN" && (
                        <>
                            <li><FaBoxOpen /> Shipments</li>
                            <li><FaTruck /> Drivers</li>
                            <li><FaUsers /> Customers</li>
                            <li><FaChartBar /> Reports</li>
                            <li><FaCog /> Settings</li>
                        </>
                    )}

                    {role === "CUSTOMER" && (
                        <>
                            <li><FaBoxOpen /> My Shipments</li>
                            <li><FaChartBar /> Track Shipment</li>
                            <li><FaUsers /> Profile</li>
                        </>
                    )}

                    {role === "DRIVER" && (
                        <>
                            <li><FaTruck /> Assigned Shipments</li>
                            <li><FaChartBar /> Update Status</li>
                            <li><FaUsers /> Profile</li>
                        </>
                    )}

                </ul>

            </aside>

            <main className="main-content">

                <div className="topbar">

                    <div>

                        <h1>

                            {role === "ADMIN" && "Admin Dashboard"}

                            {role === "CUSTOMER" && "Customer Dashboard"}

                            {role === "DRIVER" && "Driver Dashboard"}

                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                marginTop: "5px"
                            }}
                        >
                            Welcome, {name} 👋
                        </p>

                    </div>

                    <div>

                        {role === "ADMIN" && (

                            <button
                                onClick={() => navigate("/create-shipment")}
                                style={{ marginRight: "10px" }}
                            >
                                + Create Shipment
                            </button>

                        )}

                        <button onClick={logout}>

                            Logout

                        </button>

                    </div>

                </div>

                <div className="cards">

                    <div className="card">

                        <h3>

                            {role === "ADMIN"
                                ? "Total Shipments"
                                : role === "CUSTOMER"
                                    ? "My Shipments"
                                    : "Assigned Shipments"}

                        </h3>

                        <h1>{shipments.length}</h1>

                    </div>

                    <div className="card">

                        <h3>

                            {role === "DRIVER"
                                ? "Completed Deliveries"
                                : "Delivered"}

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s => s.status === "Delivered"

                                ).length

                            }

                        </h1>

                    </div>
                                        <div className="card">

                        <h3>

                            {role === "DRIVER"
                                ? "Today's Deliveries"
                                : "In Transit"}

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s => s.status === "In Transit"

                                ).length

                            }

                        </h1>

                    </div>

                    <div className="card">

                        <h3>

                            {role === "DRIVER"
                                ? "Pending Deliveries"
                                : "Pending"}

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s => s.status === "Pending"

                                ).length

                            }

                        </h1>

                    </div>

                </div>

                <div className="table-section">

                    <h2>Recent Shipments</h2>

                    <input
                        type="text"
                        placeholder="🔍 Search by Tracking Number, Sender or Receiver"
                        className="search-box"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <table>

                        <thead>

                            <tr>

                                <th>Tracking No</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Status</th>
                                <th>Destination</th>
                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                filteredShipments.length > 0 ?

                                    filteredShipments.map((shipment) => (

                                        <tr key={shipment.id}>

                                            <td>{shipment.trackingNumber}</td>

                                            <td>{shipment.senderName}</td>

                                            <td>{shipment.receiverName}</td>

                                            <td>

                                                <span
                                                    className={
                                                        shipment.status === "Delivered"
                                                            ? "status delivered"
                                                            : shipment.status === "In Transit"
                                                            ? "status transit"
                                                            : "status pending"
                                                    }
                                                >
                                                    {shipment.status}
                                                </span>

                                            </td>

                                            <td>{shipment.deliveryAddress}</td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(`/view-shipment/${shipment.id}`)
                                                    }
                                                >
                                                    <FaEye />
                                                </button>

                                                {role === "ADMIN" && (

                                                    <>

                                                        <button
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                navigate(`/edit-shipment/${shipment.id}`)
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(shipment.id)
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>

                                                    </>

                                                )}

                                                {role === "DRIVER" && (

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            navigate(`/edit-shipment/${shipment.id}`)
                                                        }
                                                    >
                                                        Update
                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                    :

                                    <tr>

                                        <td
                                            colSpan="6"
                                            style={{ textAlign: "center" }}
                                        >
                                            No Shipments Found
                                        </td>

                                    </tr>

                            }

                        </tbody>

                    </table>

                </div>

            </main>

        </div>

    );

}

export default Dashboard;