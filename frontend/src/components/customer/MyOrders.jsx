import { useEffect, useState } from "react";
import { fetchMyShipments } from "../../services/shipmentService";
import { getStatusLabel, getStatusBadgeClass } from "../../utils/constants";
import CreateShipmentForm from "../shared/CreateShipmentForm";

function MyOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const loadOrders = async () => {

        try {

            const data = await fetchMyShipments();
            setOrders(data);

        } catch {

            setError("Could not load your orders.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadOrders();
    }, []);

    const handleCreated = (shipment) => {
        setOrders((prev) => [shipment, ...prev]);
        setShowForm(false);
    };

    return (
        <div
            className="card shadow-sm border-0 rounded-4 mt-4"
            style={{ overflow: "hidden" }}
        >
            <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <h4
                        className="fw-bold mb-0"
                        style={{ color: "var(--brand-primary)" }}
                    >
                        My Orders
                    </h4>

                    <button
                        className="btn bluebtn"
                        onClick={() => setShowForm((prev) => !prev)}
                    >
                        {showForm ? "Close" : "+ New Order"}
                    </button>

                </div>

                {showForm && (
                    <CreateShipmentForm
                        onCreated={handleCreated}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {loading && (
                    <p className="text-muted">Loading your orders...</p>
                )}

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <p className="text-muted mb-0">
                        You haven't created any shipments yet.
                    </p>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="table-responsive">

                        <table className="table align-middle">

                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Sender Name</th>
                                    <th>Sender Address</th>
                                    <th>Receiver Name</th>
                                    <th>Receiver Address</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-semibold">{order.trackingNumber}</td>
                                        <td>{order.senderName}</td>
                                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.senderAddress}</td>
                                        <td>{order.receiverName}</td>
                                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.deliveryAddress}</td>
                                        <td>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(order.status)}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>
                )}

            </div>
        </div>
    );
}

export default MyOrders;
