import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateShipmentForm from "../shared/CreateShipmentForm";

function QuickActions({ onShipmentCreated }) {

    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);

    const handleCreated = (shipment) => {
        setShowForm(false);
        if (onShipmentCreated) {
            onShipmentCreated(shipment);
        }
    };

    return (
        <div className="quick-card">
            <h4>Quick Actions</h4>

            <button
                className="btn btn-primary w-100 mb-3"
                onClick={() => setShowForm((prev) => !prev)}
            >
                {showForm ? "Close Form" : "+ Create Shipment"}
            </button>

            {showForm && (
                <CreateShipmentForm
                    onCreated={handleCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <button
                className="btn btn-outline-primary w-100 mb-3"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
            >
                Live Tracking
            </button>

            <button
                className="btn btn-outline-primary w-100 mb-3"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
            >
                Analytics
            </button>

            <button
                className="btn btn-outline-primary w-100"
                onClick={() => alert("Inventory feature coming soon.")}
            >
                Inventory
            </button>
        </div>
    );
}

export default QuickActions;
