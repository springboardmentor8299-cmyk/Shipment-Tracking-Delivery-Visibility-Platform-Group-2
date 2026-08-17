import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaHome,
    FaBoxOpen,
    FaSearch,
    FaCog,
    FaEye
} from "react-icons/fa";

import { getAllShipments } from "../services/shipmentService";
import CustomerSettingsSection from "../components/CustomerSettingsSection";

function CustomerDashboard() {

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

            console.log("Shipments:", response.data);

            setShipments(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const logout = () => {

        localStorage.clear();

        navigate("/");

    };

    const filteredShipments = shipments.filter((shipment) =>

        shipment.trackingNumber
            .toLowerCase()
            .includes(search.toLowerCase())

        ||

        shipment.senderName
            .toLowerCase()
            .includes(search.toLowerCase())

        ||

        shipment.receiverName
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    return (

        <div className="dashboard">

            <aside className="sidebar">

                <h2>📦 CargoFlow</h2>

                <p>CUSTOMER</p>

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
                        My Shipments
                    </li>

                    <li
                        className={activeMenu === "track" ? "active" : ""}
                        onClick={() => setActiveMenu("track")}
                    >
                        <FaSearch />
                        Track Shipment
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

                        <h1>Customer Dashboard</h1>

                        <p
                            style={{
                                color: "#64748b",
                                marginTop: "5px"
                            }}
                        >
                            Welcome, {name} 👋
                        </p>

                    </div>

                    <button onClick={logout}>
                        Logout
                    </button>

                </div>
                                {/* ================= Dashboard ================= */}

                {activeMenu === "dashboard" && (

                    <>

                        <div className="cards">

                            <div className="card">

                                <h3>My Shipments</h3>

                                <h1>{shipments.length}</h1>

                            </div>

                            <div className="card">

                                <h3>Delivered</h3>

                                <h1>

                                    {

                                        shipments.filter(

                                            s => s.status === "Delivered"

                                        ).length

                                    }

                                </h1>

                            </div>

                            <div className="card">

                                <h3>In Transit</h3>

                                <h1>

                                    {

                                        shipments.filter(

                                            s => s.status === "In Transit"

                                        ).length

                                    }

                                </h1>

                            </div>

                            <div className="card">

                                <h3>Pending</h3>

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

                            <h2>Customer Overview</h2>

                            <p
                                style={{
                                    color: "#64748b",
                                    marginTop: "10px",
                                    fontSize: "16px"
                                }}
                            >

                                Welcome back,

                                <strong> {name}</strong> 👋

                            </p>

                            <p
                                style={{
                                    color: "#64748b",
                                    marginTop: "10px",
                                    lineHeight: "28px"
                                }}
                            >

                                You currently have

                                <strong> {shipments.length}</strong>

                                shipment(s).

                                <br />

                                Use the sidebar to manage your shipments,

                                track deliveries and update your settings.

                            </p>

                        </div>

                    </>

                )}
                                {/* ================= My Shipments ================= */}

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

                            <h2>My Shipments</h2>

                            <input
                                type="text"
                                className="search-box"
                                placeholder="Search Shipment..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: "350px",
                                    marginBottom: 0
                                }}
                            />

                        </div>

                        <table>

                            <thead>

                                <tr>

                                    <th>Tracking No</th>

                                    <th>Receiver</th>

                                    <th>Status</th>

                                    <th>Destination</th>

                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredShipments.length > 0 ?

                                    filteredShipments.map((shipment) => (

                                        <tr key={shipment.id}>

                                            <td>

                                                {shipment.trackingNumber}

                                            </td>

                                            <td>

                                                {shipment.receiverName}

                                            </td>

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

                                            <td>

                                                {shipment.deliveryAddress}

                                            </td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(`/view-shipment/${shipment.id}`)
                                                    }
                                                >

                                                    <FaEye />

                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                    :

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "30px"
                                            }}
                                        >

                                            No Shipments Found

                                        </td>

                                    </tr>

                                }

                            </tbody>

                        </table>

                    </div>

                )}
                                {/* ================= Track Shipment ================= */}

                {activeMenu === "track" && (

                    <div className="table-section">

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px"
                            }}
                        >

                            <h2>Track Shipment</h2>

                            <input
                                type="text"
                                className="search-box"
                                placeholder="Search Tracking Number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: "350px",
                                    marginBottom: 0
                                }}
                            />

                        </div>

                        <table>

                            <thead>

                                <tr>

                                    <th>Tracking No</th>

                                    <th>Receiver</th>

                                    <th>Status</th>

                                    <th>Destination</th>

                                    <th>Track</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredShipments.length > 0 ?

                                    filteredShipments.map((shipment) => (

                                        <tr key={shipment.id}>

                                            <td>

                                                {shipment.trackingNumber}

                                            </td>

                                            <td>

                                                {shipment.receiverName}

                                            </td>

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

                                            <td>

                                                {shipment.deliveryAddress}

                                            </td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(`/track-shipment/${shipment.id}`)
                                                    }
                                                >

                                                    📍

                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                    :

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "30px"
                                            }}
                                        >

                                            No Shipments Found

                                        </td>

                                    </tr>

                                }

                            </tbody>

                        </table>

                    </div>

                )}
                                {/* ================= Settings ================= */}

                {activeMenu === "settings" && (

                    <CustomerSettingsSection />

                )}

            </main>

        </div>

    );

}

export default CustomerDashboard;