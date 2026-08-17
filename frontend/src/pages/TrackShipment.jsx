import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
    FaTruck,
    FaRoute,
    FaClock,
    FaArrowLeft,
    FaSyncAlt,
    FaMapMarkerAlt,
    FaBoxOpen
} from "react-icons/fa";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "../assets/marker-shadow.png";

import blueMarker from "../assets/marker-icon-blue.png";
import redMarker from "../assets/marker-icon-red.png";
import truckImage from "../assets/truck.png";

import "../styles/trackShipment.css";

import { getShipmentById } from "../services/shipmentService";
import { getRouteHistory } from "../services/routeHistoryService";
import { getRoute } from "../services/routingService";


/* ==========================================
        LEAFLET DEFAULT ICON
========================================== */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

    iconRetinaUrl: markerIcon2x,

    iconUrl: markerIcon,

    shadowUrl: markerShadow

});

/* ==========================================
        PICKUP ICON
========================================== */

const pickupIcon = L.icon({

    iconUrl: blueMarker,

    shadowUrl: markerShadow,

    iconSize: [32, 48],

    iconAnchor: [16, 48],

    popupAnchor: [0, -42]

});

/* ==========================================
        DESTINATION ICON
========================================== */

const destinationIcon = L.icon({

    iconUrl: redMarker,

    shadowUrl: markerShadow,

    iconSize: [32, 48],

    iconAnchor: [16, 48],

    popupAnchor: [0, -42]

});

/* ==========================================
        TRUCK ICON
========================================== */

const truckIcon = L.icon({

    iconUrl: truckImage,

    iconSize: [46,46],

    iconAnchor: [23,23],

    popupAnchor: [0,-18]

});

/* ==========================================
        CALCULATE DISTANCE
========================================== */

const calculateDistance = (point1, point2) => {

    if (!point1 || !point2) {
        return 0;
    }

    const lat1 = Number(point1[0]);
    const lon1 = Number(point1[1]);

    const lat2 = Number(point2[0]);
    const lon2 = Number(point2[1]);

    if (
        !Number.isFinite(lat1) ||
        !Number.isFinite(lon1) ||
        !Number.isFinite(lat2) ||
        !Number.isFinite(lon2)
    ) {

        console.error(
            "Invalid coordinates:",
            point1,
            point2
        );

        return 0;
    }

    const R = 6371;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
};
/* ==========================================
        AUTO FIT MAP
========================================== */

function FitBounds({

    pickup,

    truck,

    destination

}) {

    const map = useMap();

    useEffect(() => {

        if (
            !pickup ||
            !truck ||
            !destination
        ) {
            return;
        }

        const bounds = L.latLngBounds([]);

        bounds.extend(pickup);
        bounds.extend(truck);
        bounds.extend(destination);

        map.fitBounds(bounds, {

            padding: [80, 80],

            animate: true,

            maxZoom: 9

        });

    }, [

        pickup,

        truck,

        destination,

        map

    ]);

    return null;

}

/* ==========================================
        COMPONENT
========================================== */

function TrackShipment() {

    const { id } = useParams();

    const navigate = useNavigate();
    /* ==========================================
        STATES
========================================== */

const [shipment, setShipment] = useState(null);

const [loading, setLoading] = useState(true);

const [pickupPosition, setPickupPosition] = useState(null);

const [truckPosition, setTruckPosition] = useState(null);

const [destinationPosition, setDestinationPosition] = useState(null);

const [route, setRoute] = useState([]);
const [travelledRoute, setTravelledRoute] = useState([]);
const [routeHistory, setRouteHistory] = useState([]);

const [distance, setDistance] = useState(0);

const [remainingDistance, setRemainingDistance] = useState(0);

/* ==========================================
        LOAD SHIPMENT
========================================== */

const loadShipment = async () => {

    try {

        const response = await getShipmentById(id);

        const data = response.data;

        console.log("Shipment:", data);

        setShipment(data);

        if (
            data.pickupLatitude != null &&
            data.pickupLongitude != null
        ) {

            setPickupPosition([
                data.pickupLatitude,
                data.pickupLongitude
            ]);

        }

        if (
            data.currentLatitude != null &&
            data.currentLongitude != null
        ) {

            setTruckPosition([
                data.currentLatitude,
                data.currentLongitude
            ]);

        }

        if (
            data.destinationLatitude != null &&
            data.destinationLongitude != null
        ) {

            setDestinationPosition([
                data.destinationLatitude,
                data.destinationLongitude
            ]);

        }

        setLoading(false);

    }

    catch (error) {

        console.error(error);

    }

};

/* ==========================================
        LOAD ROUTE HISTORY
========================================== */

const loadRouteHistory = async () => {

    try {

        const response = await getRouteHistory(id);

        setRouteHistory(response.data);

    }

    catch (error) {

        console.error(error);

    }

};

/* ==========================================
        LOAD ROUTE
========================================== */

const loadRoute = async () => {

    try {

        if (

            !pickupPosition ||
            !truckPosition ||
            !destinationPosition

        ) {

            return;

        }

        // Green route (Pickup -> Truck)
        const travelledRouteCoordinates = await getRoute(

            pickupPosition,

            truckPosition

        );

        // Blue route (Truck -> Destination)
        const remainingRouteCoordinates = await getRoute(

            truckPosition,

            destinationPosition

        );

        setTravelledRoute(travelledRouteCoordinates);

        setRoute(remainingRouteCoordinates);

        // Distance travelled
        const travelledDistance = calculateDistance(

            pickupPosition,

            truckPosition

        );

        setDistance(travelledDistance);

        // Remaining distance
        const remainingDistance = calculateDistance(

            truckPosition,

            destinationPosition

        );

        setRemainingDistance(remainingDistance);

    }

    catch (error) {

        console.error(error);

    }

};
/* ==========================================
        HANDLE BACK
========================================== */

const handleBack = () => {

    navigate(-1);

};

/* ==========================================
        REFRESH
========================================== */

const refreshData = () => {

    loadShipment();

    loadRouteHistory();

    loadRoute();

};
/* ==========================================
        LOAD ROUTE WHEN LOCATIONS CHANGE
========================================== */

useEffect(() => {

    if (

        pickupPosition &&
        truckPosition &&
        destinationPosition

    ) {

        loadRoute();

    }

}, [

    pickupPosition,
    truckPosition,
    destinationPosition

]);

/* ==========================================
        INITIAL LOAD
========================================== */

useEffect(() => {

    loadShipment();

    loadRouteHistory();

}, [id]);

/* ==========================================
        AUTO REFRESH
========================================== */

useEffect(() => {

    const interval = setInterval(() => {

        loadShipment();

        loadRouteHistory();

    }, 2000);

    return () => clearInterval(interval);

}, [id]);

/* ==========================================
        LOADING SCREEN
========================================== */

if (loading) {

    return (

        <div className="loading-container">

            <div className="loading-card">

                <FaTruck className="loading-icon" />

                <h2>

                    Loading Shipment...

                </h2>

                <p>

                    Please wait while we fetch the latest tracking information.

                </p>

            </div>

        </div>

    );

}

if (!shipment) {

    return (

        <div className="loading-container">

            <div className="loading-card">

                <h2>

                    Shipment Not Found

                </h2>

                <button

                    className="back-btn"

                    onClick={handleBack}

                >

                    <FaArrowLeft />

                    Back

                </button>

            </div>

        </div>

    );

}

/* ==========================================
        MAIN PAGE
========================================== */

return (

<div className="track-page">
{/* ==========================================
        HEADER
========================================== */}

<div className="track-header">

    <div>

        <h1>

            🚚 Live Shipment Tracking

        </h1>

        <p>

            Tracking Number : <b>{shipment.trackingNumber}</b>

        </p>

    </div>

    <div>

        <span className={`status ${shipment.status.toLowerCase().replace(" ","-")}`}>

            {shipment.status}

        </span>

    </div>

</div>

{/* ==========================================
        SHIPMENT INFORMATION
========================================== */}

<div className="shipment-info-card">

    <div className="info-item">

        <FaBoxOpen className="info-icon"/>

        <div>

            <label>Sender</label>

            <h3>{shipment.senderName}</h3>

        </div>

    </div>

    <div className="info-item">

        <FaBoxOpen className="info-icon"/>

        <div>

            <label>Receiver</label>

            <h3>{shipment.receiverName}</h3>

        </div>

    </div>

    <div className="info-item">

        <FaTruck className="info-icon"/>

        <div>

            <label>Driver</label>

            <h3>{shipment.driverName}</h3>

        </div>

    </div>

    <div className="info-item">

        <FaTruck className="info-icon"/>

        <div>

            <label>Vehicle</label>

            <h3>{shipment.vehicleNumber}</h3>

        </div>

    </div>

    <div className="info-item">

        <FaMapMarkerAlt className="info-icon"/>

        <div>

            <label>Pickup</label>

            <h3>{shipment.pickupAddress}</h3>

        </div>

    </div>

    <div className="info-item">

        <FaMapMarkerAlt className="info-icon"/>

        <div>

            <label>Destination</label>

            <h3>{shipment.deliveryAddress}</h3>

        </div>

    </div>

</div>

{/* ==========================================
        STATISTICS
========================================== */}

<div className="stats-grid">

    <div className="stat-card">

        <FaRoute className="stat-icon"/>

        <h4>Travelled</h4>

        <h2>

            {distance.toFixed(2)} km

        </h2>

    </div>

    <div className="stat-card">

        <FaRoute className="stat-icon"/>

        <h4>Remaining</h4>

        <h2>

            {remainingDistance.toFixed(2)} km

        </h2>

    </div>

    <div className="stat-card">

        <FaClock className="stat-icon"/>

        <h4>ETA</h4>

        <h2>

            {shipment.estimatedDelivery}

        </h2>

    </div>

    <div className="stat-card">

        <FaTruck className="stat-icon"/>

        <h4>Status</h4>

        <h2>

            {shipment.status}

        </h2>

    </div>

</div>

{/* ==========================================
        MAP CARD
========================================== */}

<div className="map-card">

    <h2>

        📍 Live Route Tracking

    </h2>
    <MapContainer

    center={truckPosition || [20.5937, 78.9629]}

    zoom={6}

    style={{

        height: "600px",

        width: "100%",

        borderRadius: "15px"

    }}

    scrollWheelZoom={true}

    zoomControl={true}

>

    {

        pickupPosition &&

        truckPosition &&

        destinationPosition && (

            <FitBounds

                pickup={pickupPosition}

                truck={truckPosition}

                destination={destinationPosition}

            />

        )

    }

    <TileLayer

        attribution='&copy; OpenStreetMap contributors'

        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    />

   
    {/* ======================================
        TRAVELLED PATH
====================================== */}

{
    travelledRoute.length > 0 && (

        <Polyline

            positions={travelledRoute}

            pathOptions={{

                color: "#16a34a",

                weight: 7,

                opacity: 1

            }}

        />

    )
}
    {/* ======================================
            REMAINING ROUTE
    ====================================== */}

    {

        route.length > 0 && (

            <Polyline

                positions={route}

                pathOptions={{

                    color: "#2563eb",

                    weight: 6,

                    opacity: 0.9

                }}

            />

        )

    }
        {/* ======================================
            PICKUP MARKER
    ====================================== */}

    {

        pickupPosition && (

            <Marker

                position={pickupPosition}

                icon={pickupIcon}

            >

                <Popup>

                    <b>📍 Pickup Location</b>

                    <br />

                    {shipment.pickupAddress}

                </Popup>

            </Marker>

        )

    }

    {/* ======================================
            TRUCK MARKER
    ====================================== */}

    {

        truckPosition && (

            <Marker

                position={truckPosition}

                icon={truckIcon}

            >

                <Popup>

                    <b>🚚 Current Truck Location</b>

                    <br />

                    Driver : {shipment.driverName}

                    <br />

                    Vehicle : {shipment.vehicleNumber}

                    <br />

                    Status : {shipment.status}

                    <br />

                    Last Updated :

                    <br />

                    {

                        shipment.lastLocationUpdate

                            ? new Date(

                                  shipment.lastLocationUpdate

                              ).toLocaleString()

                            : "N/A"

                    }

                </Popup>

            </Marker>

        )

    }

    {/* ======================================
            DESTINATION MARKER
    ====================================== */}

    {

        destinationPosition && (

            <Marker

                position={destinationPosition}

                icon={destinationIcon}

            >

                <Popup>

                    <b>📍 Destination</b>

                    <br />

                    {shipment.deliveryAddress}

                </Popup>

            </Marker>

        )

    }

</MapContainer>

</div>
{/* =======================================
        ROUTE HISTORY
======================================= */}

<div className="history-card">

    <h2>📍 Route History</h2>

    <table className="history-table">

        <thead>

            <tr>

                <th>#</th>

                <th>Latitude</th>

                <th>Longitude</th>

                <th>Updated Time</th>

            </tr>

        </thead>

        <tbody>

            {

                routeHistory.length > 0 ?

                routeHistory.map((item,index)=>(

                    <tr key={item.id}>

                        <td>{index+1}</td>

                        <td>{item.latitude.toFixed(6)}</td>

                        <td>{item.longitude.toFixed(6)}</td>

                        <td>

                            {

                                new Date(

                                    item.updatedAt

                                ).toLocaleString()

                            }

                        </td>

                    </tr>

                ))

                :

                <tr>

                    <td

                        colSpan="4"

                        style={{textAlign:"center"}}

                    >

                        No Route History Available

                    </td>

                </tr>

            }

        </tbody>

    </table>

</div>

{/* =======================================
        MAP LEGEND
======================================= */}

<div className="legend-card">

    <div className="legend-item">

        <img

            src={blueMarker}

            alt="Pickup"

            width="22"

        />

        <span>Pickup</span>

    </div>

    <div className="legend-item">

        <img

            src={truckImage}

            alt="Truck"

            width="34"

        />

        <span>Truck</span>

    </div>

    <div className="legend-item">

        <img

            src={redMarker}

            alt="Destination"

            width="22"

        />

        <span>Destination</span>

    </div>

    <div className="legend-item">

        <div

            style={{

                width:"40px",

                height:"6px",

                background:"#22c55e",

                borderRadius:"20px"

            }}

        />

        <span>Travelled</span>

    </div>

    <div className="legend-item">

        <div

            style={{

                width:"40px",

                height:"6px",

                background:"#2563eb",

                borderRadius:"20px"

            }}

        />

        <span>Remaining</span>

    </div>

</div>

{/* =======================================
        ACTION BUTTONS
======================================= */}

<div className="button-group">

    <button

        className="back-btn"

        onClick={handleBack}

    >

        <FaArrowLeft />

        &nbsp;

        Back

    </button>

    <button

        className="refresh-btn"

        onClick={refreshData}

    >

        <FaSyncAlt />

        &nbsp;

        Refresh

    </button>

</div>

</div>

);

}

export default TrackShipment;