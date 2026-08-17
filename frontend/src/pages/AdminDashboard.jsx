import "../styles/dashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DriversSection from "../components/DriversSection";
import CustomersSection from "../components/CustomersSection";
import ReportsSection from "../components/ReportsSection";
import {
    FaHome,
    FaBoxOpen,
    FaTruck,
    FaUsers,
    FaChartBar,
    FaCog,
    FaEye,
    FaEdit,
    FaTrash,
    FaPlus,
    FaCheckCircle,
    FaClock
} from "react-icons/fa";

import {
    getAllShipments,
    deleteShipment
} from "../services/shipmentService";


import SettingsSection from "../components/SettingsSection";

function AdminDashboard() {

    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");
    const [activeMenu, setActiveMenu] = useState("dashboard");

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

        if (!window.confirm("Delete this shipment?")) return;

        try {

            await deleteShipment(id);

            loadShipments();

        } catch (error) {

            console.error(error);

            alert("Failed to delete shipment");

        }

    };

    const logout = () => {

        localStorage.clear();

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
            .includes(search.toLowerCase()) ||

        shipment.driverName
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    return (

        <div className="dashboard">

            <aside className="sidebar">

                <h2>📦 CargoFlow</h2>

                <p>Administrator</p>

                <ul>

    <li
        className={activeMenu === "dashboard" ? "active" : ""}
        onClick={() => setActiveMenu("dashboard")}
    >
        <FaHome />
        Dashboard
    </li>

    <li
        className={activeMenu === "shipments" ? "active" : ""}
        onClick={() => setActiveMenu("shipments")}
    >
        <FaBoxOpen />
        Shipments
    </li>

    <li
        className={activeMenu === "drivers" ? "active" : ""}
        onClick={() => setActiveMenu("drivers")}
    >
        <FaTruck />
        Drivers
    </li>

    <li
        className={activeMenu === "customers" ? "active" : ""}
        onClick={() => setActiveMenu("customers")}
    >
        <FaUsers />
        Customers
    </li>

    <li
        className={activeMenu === "reports" ? "active" : ""}
        onClick={() => setActiveMenu("reports")}
    >
        <FaChartBar />
        Reports
    </li>

    <li
        className={activeMenu === "settings" ? "active" : ""}
        onClick={() => setActiveMenu("settings")}
    >
        <FaCog />
        Settings
    </li>

</ul>

            </aside>

            <main className="main-content">

                <div className="topbar">

                    <div>

                        <h1>Admin Dashboard</h1>

                        <p>
                            Welcome, {name} 👋
                        </p>

                    </div>

                    <div>

                        <button
    className="create-btn"
    onClick={() =>
        navigate("/create-shipment")
    }
>
                            <FaPlus />
                            {" "}Create Shipment
                        </button>

      <button
    className="logout-btn"
    onClick={logout}
>
                        
                            Logout
                        </button>

                    </div>

                </div>
                {activeMenu === "dashboard" && (

                <div className="cards">

    <div className="card">

        <FaBoxOpen className="card-icon" />

        <h3>Total Shipments</h3>

        <h1>{shipments.length}</h1>

    </div>

    <div className="card">

        <FaCheckCircle className="card-icon" />

        <h3>Delivered</h3>

        <h1>
            {shipments.filter(
                s => s.status === "Delivered"
            ).length}
        </h1>

    </div>

    <div className="card">

        <FaTruck className="card-icon" />

        <h3>In Transit</h3>

        <h1>
            {shipments.filter(
                s => s.status === "In Transit"
            ).length}
        </h1>

    </div>

    <div className="card">

        <FaClock className="card-icon" />

        <h3>Pending</h3>

        <h1>
            {shipments.filter(
                s => s.status === "Pending"
            ).length}
        </h1>

    </div>

</div>


)}

                    
{activeMenu === "shipments" && (
                <div className="table-section">

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <h2>Shipment Management</h2>

                        <input
                            type="text"
                            className="search-box"
                            placeholder="🔍 Search Shipment..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>
                    

                    <table>

                        <thead>

    <tr>

        <th>Tracking No</th>
        <th>Sender</th>
        <th>Receiver</th>
        <th>Driver</th>
        <th>Status</th>
        <th>Destination</th>
        <th>Location</th>
        <th>Last Updated</th>
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

    <td>{shipment.driverName}</td>

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
    {shipment.status === "Delivered" && "✅ "}
    {shipment.status === "In Transit" && "🚚 "}
    {shipment.status === "Pending" && "⏳ "}

    {shipment.status}
</span>
    </td>

    <td>{shipment.deliveryAddress}</td>

    <td>

    {shipment.currentLatitude &&
    shipment.currentLongitude ? (

        <>

            {shipment.currentLatitude.toFixed(5)}

            <br />

            {shipment.currentLongitude.toFixed(5)}

        </>

    ) : (

        <span style={{ color:"#94a3b8" }}>
            Not Available
        </span>

    )}

</td>

    <td>
        {shipment.lastLocationUpdate
            ? new Date(shipment.lastLocationUpdate).toLocaleString()
            : "-"}
    </td>

    <td>

    <div className="actions">

        <button
            title="View Shipment"
            className="view-btn"
            onClick={() => navigate(`/view-shipment/${shipment.id}`)}
        >
            <FaEye />
        </button>

        <button
            title="Track Shipment"
            className="track-btn"
            onClick={() => navigate(`/track-shipment/${shipment.id}`)}
        >
            📍
        </button>

        <button
            title="Edit Shipment"
            className="edit-btn"
            onClick={() => navigate(`/edit-shipment/${shipment.id}`)}
        >
            <FaEdit />
        </button>

        <button
            title="Delete Shipment"
            className="delete-btn"
            onClick={() => handleDelete(shipment.id)}
        >
            <FaTrash />
        </button>

    </div>

</td>

</tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="9"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}
                                    >

                                       <div className="empty-state">

    <h1>📦</h1>

    <h3>No Shipments Found</h3>

    <p>
        Create your first shipment to get started.
    </p>

</div>

                                    </td>

                                </tr>

                            }

                        </tbody>

                    </table>

                </div>
)}
                {activeMenu === "drivers" && (

    <DriversSection />

)}

{activeMenu === "customers" && (
    <CustomersSection />
)}

    

{activeMenu === "reports" && (

    <ReportsSection />

)}

{activeMenu === "settings" && <SettingsSection />}



            </main>

        </div>

    );

}

export default AdminDashboard;
