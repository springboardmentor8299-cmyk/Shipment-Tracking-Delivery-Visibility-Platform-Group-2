import { useEffect, useState } from "react";
import { getAllShipments } from "../api/shipmentService";
import Layout from "../components/Layout";
import "../styles/Dashboard.css";

function Dashboard() {

    const [shipments, setShipments] = useState([]);

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

    const total = shipments.length;

    const created = shipments.filter(
        shipment => shipment.status === "CREATED"
    ).length;

    const transit = shipments.filter(
        shipment => shipment.status === "IN_TRANSIT"
    ).length;

    const delivered = shipments.filter(
        shipment => shipment.status === "DELIVERED"
    ).length;

    return (
        <Layout>

            <div className="dashboard">

                <h1>ShipTrack Dashboard</h1>

                <div className="dashboard-cards">

                    <div className="card">
                        <h2>{total}</h2>
                        <p>Total Shipments</p>
                    </div>

                    <div className="card">
                        <h2>{created}</h2>
                        <p>Created</p>
                    </div>

                    <div className="card">
                        <h2>{transit}</h2>
                        <p>In Transit</p>
                    </div>

                    <div className="card">
                        <h2>{delivered}</h2>
                        <p>Delivered</p>
                    </div>

                </div>

                <div className="table-container">

                    <table>

                        <thead>
                            <tr>
                                <th>Tracking No.</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {shipments.map((shipment) => (

                                <tr key={shipment.id}>

                                    <td>{shipment.trackingNumber}</td>
                                    <td>{shipment.senderName}</td>
                                    <td>{shipment.receiverName}</td>
                                    <td>{shipment.source}</td>
                                    <td>{shipment.destination}</td>
                                    <td>{shipment.status}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </Layout>
    );
}

export default Dashboard;