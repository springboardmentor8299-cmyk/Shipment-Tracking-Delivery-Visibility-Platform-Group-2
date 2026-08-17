import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaHome,
    FaTruck,
    FaSyncAlt,
    FaCog,
    FaEye,
    FaClipboardCheck
} from "react-icons/fa";

import {
    getDriverShipments,
    updateShipment
} from "../services/shipmentService";

import {
    updateLocation
} from "../services/trackingService";

import DriverSettingsSection from "../components/DriverSettingsSection";

function DriverDashboard() {

    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    const [shipments, setShipments] = useState([]);

    const [search, setSearch] = useState("");

    const [activeMenu, setActiveMenu] = useState("dashboard");

    useEffect(() => {

        loadShipments();

    }, []);

    /* ===============================
       LOAD SHIPMENTS
    =============================== */

    const loadShipments = async () => {

        try {

            const response = await getDriverShipments();

            setShipments(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    /* ===============================
       UPDATE DRIVER LOCATION
    =============================== */

    const simulateLocation = async (shipment) => {

        try {

            const currentLat = shipment.currentLatitude;
            const currentLng = shipment.currentLongitude;

            const destinationLat = shipment.destinationLatitude;
            const destinationLng = shipment.destinationLongitude;

            const step = 0.10;

            const newLat =
                currentLat +
                (destinationLat - currentLat) * step;

            const newLng =
                currentLng +
                (destinationLng - currentLng) * step;

            await updateLocation(

                shipment.id,

                newLat,

                newLng

            );

            alert("Location Updated Successfully");

            loadShipments();

        } catch (error) {

            console.error(error);

            alert("Unable to update location");

        }

    };

    /* ===============================
       UPDATE SHIPMENT STATUS
    =============================== */

    const updateShipmentStatus = async (

        shipment,

        status

    ) => {

        try {

            const updatedShipment = {

                ...shipment,

                status

            };

            await updateShipment(

                shipment.id,

                updatedShipment

            );

            alert("Shipment Updated Successfully");

            await loadShipments();

            if (status === "Delivered") {

                navigate(
                    `/proof-of-delivery/${shipment.id}`
                );

            }

        } catch (error) {

            console.error(error);

            alert("Failed to update shipment");

        }

    };

    /* ===============================
       LOGOUT
    =============================== */

    const logout = () => {

        localStorage.clear();

        navigate("/");

    };

    /* ===============================
       SEARCH
    =============================== */

    const filteredShipments = shipments.filter(

        shipment =>

            shipment.trackingNumber
                .toLowerCase()
                .includes(search.toLowerCase())

            ||

            shipment.receiverName
                .toLowerCase()
                .includes(search.toLowerCase())

    );
    return (

<div className="dashboard">

    {/* ================= SIDEBAR ================= */}

    <aside className="sidebar">

        <h2>📦 CargoFlow</h2>

        <p>Driver</p>

        <ul>

            <li
                className={
                    activeMenu === "dashboard"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveMenu("dashboard")
                }
            >
                <FaHome />
                Dashboard
            </li>

            <li
                className={
                    activeMenu === "shipments"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveMenu("shipments")
                }
            >
                <FaTruck />
                Assigned Shipments
            </li>

            <li
                className={
                    activeMenu === "status"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveMenu("status")
                }
            >
                <FaSyncAlt />
                Update Status
            </li>

            <li
                className={
                    activeMenu === "settings"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveMenu("settings")
                }
            >
                <FaCog />
                Settings
            </li>

        </ul>

    </aside>

    {/* ================= MAIN ================= */}

    <main className="main-content">

        <div className="topbar">

            <div>

                <h1>

                    Driver Dashboard

                </h1>

                <p
                    style={{
                        color:"#64748b",
                        marginTop:"5px"
                    }}
                >

                    Welcome,

                    <b> {name}</b>

                    👋

                </p>

            </div>

            <button
                onClick={logout}
            >

                Logout

            </button>

        </div>

        {/* ================= DASHBOARD ================= */}

        {

            activeMenu === "dashboard"

            &&

            <>

                <div className="cards">

                    <div className="card">

                        <h3>

                            Assigned Shipments

                        </h3>

                        <h1>

                            {shipments.length}

                        </h1>

                    </div>

                    <div className="card">

                        <h3>

                            Delivered

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s=>s.status==="Delivered"

                                ).length

                            }

                        </h1>

                    </div>

                    <div className="card">

                        <h3>

                            In Transit

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s=>s.status==="In Transit"

                                ).length

                            }

                        </h1>

                    </div>

                    <div className="card">

                        <h3>

                            Pending

                        </h3>

                        <h1>

                            {

                                shipments.filter(

                                    s=>s.status==="Pending"

                                ).length

                            }

                        </h1>

                    </div>

                </div>

                <div className="table-section">

                    <h2>

                        Driver Overview

                    </h2>

                    <p
                        style={{

                            color:"#64748b",

                            marginTop:"10px",

                            lineHeight:"28px"

                        }}
                    >

                        Welcome back

                        <b> {name}</b>.

                        <br/>

                        You currently have

                        <b>

                            {" "}

                            {shipments.length}

                        </b>

                        assigned shipments.

                        <br/>

                        Click

                        <b>

                            Assigned Shipments

                        </b>

                        to update live truck location.

                    </p>

                </div>

            </>

        }
                {/* ================= ASSIGNED SHIPMENTS ================= */}

        {

            activeMenu === "shipments"

            &&

            <div className="table-section">

                <div
                    style={{

                        display:"flex",

                        justifyContent:"space-between",

                        alignItems:"center",

                        marginBottom:"20px"

                    }}
                >

                    <h2>

                        Assigned Shipments

                    </h2>

                    <input

                        type="text"

                        className="search-box"

                        placeholder="Search Shipment..."

                        value={search}

                        onChange={(e)=>setSearch(e.target.value)}

                        style={{

                            width:"350px",

                            marginBottom:0

                        }}

                    />

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>

                                Tracking No

                            </th>

                            <th>

                                Receiver

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Destination

                            </th>

                            <th>

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredShipments.length > 0

                            ?

                            filteredShipments.map((shipment)=>(

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

                                                shipment.status==="Delivered"

                                                ?

                                                "status delivered"

                                                :

                                                shipment.status==="In Transit"

                                                ?

                                                "status transit"

                                                :

                                                "status pending"

                                            }

                                        >

                                            {shipment.status}

                                        </span>

                                    </td>

                                    <td>

                                        {shipment.deliveryAddress}

                                    </td>

                                    <td>

                                        <div className="driver-actions">
                                                                                        {/* View Shipment */}

                                            <button
                                                className="view-btn"
                                                title="View Shipment"
                                                onClick={() =>
                                                    navigate(
                                                        `/view-shipment/${shipment.id}`
                                                    )
                                                }
                                            >

                                                <FaEye />

                                            </button>

                                            {/* Update Live Location */}

                                            <button
                                                className="edit-btn"
                                                title="Update Live Location"
                                                onClick={() =>
                                                    simulateLocation(
                                                        shipment
                                                    )
                                                }
                                            >

                                                📍

                                            </button>

                                            {/* Proof of Delivery */}

                                            <button
                                                className="proof-btn"
                                                title="Proof of Delivery"
                                                onClick={() =>
                                                    navigate(
                                                        `/proof-of-delivery/${shipment.id}`
                                                    )
                                                }
                                            >

                                                <FaClipboardCheck />

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                            :

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{

                                        textAlign:"center",

                                        padding:"30px"

                                    }}
                                >

                                    No Assigned Shipments

                                </td>

                            </tr>

                        }

                    </tbody>

                </table>

            </div>

        }
                               {/* ================= UPDATE STATUS ================= */}

        {

            activeMenu === "status"

            &&

            <div className="table-section">

                <div
                    style={{

                        display:"flex",

                        justifyContent:"space-between",

                        alignItems:"center",

                        marginBottom:"20px"

                    }}
                >

                    <h2>

                        Update Shipment Status

                    </h2>

                    <input

                        type="text"

                        className="search-box"

                        placeholder="Search Shipment..."

                        value={search}

                        onChange={(e)=>setSearch(e.target.value)}

                        style={{

                            width:"350px",

                            marginBottom:0

                        }}

                    />

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>Tracking No</th>

                            <th>Receiver</th>

                            <th>Current Status</th>

                            <th>New Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredShipments.length > 0

                            ?

                            filteredShipments.map((shipment)=>(

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

                                                shipment.status==="Delivered"

                                                ?

                                                "status delivered"

                                                :

                                                shipment.status==="In Transit"

                                                ?

                                                "status transit"

                                                :

                                                "status pending"

                                            }

                                        >

                                            {shipment.status}

                                        </span>

                                    </td>

                                    <td>

                                        <select

                                            id={`status-${shipment.id}`}

                                            defaultValue={shipment.status}

                                            className="status-select"

                                        >

                                            <option value="Pending">

                                                Pending

                                            </option>

                                            <option value="In Transit">

                                                In Transit

                                            </option>

                                            <option value="Delivered">

                                                Delivered

                                            </option>

                                        </select>

                                    </td>

                                    <td>

                                        <button

                                            className="update-status-btn"

                                            onClick={()=>{

                                                const selectedStatus =

                                                    document.getElementById(

                                                        `status-${shipment.id}`

                                                    ).value;

                                                updateShipmentStatus(

                                                    shipment,

                                                    selectedStatus

                                                );

                                            }}

                                        >

                                            ✅ Update Status

                                        </button>

                                    </td>

                                </tr>

                            ))

                            :

                            <tr>

                                <td

                                    colSpan="5"

                                    style={{

                                        textAlign:"center",

                                        padding:"30px"

                                    }}

                                >

                                    No Shipments Found

                                </td>

                            </tr>

                        }

                    </tbody>

                </table>

            </div>

        }

        {/* ================= SETTINGS ================= */}

        {

            activeMenu === "settings"

            &&

            <DriverSettingsSection />

        }

    </main>

</div>

);

}

export default DriverDashboard;