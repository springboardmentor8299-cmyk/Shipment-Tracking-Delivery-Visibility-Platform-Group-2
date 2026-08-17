import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../services/customerService";

import "../styles/driverForm.css";

function AddCustomer() {

    const navigate = useNavigate();

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    const handleChange = (e) => {

        setCustomer({
            ...customer,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await createCustomer(customer);

            alert("Customer Added Successfully!");

            navigate("/admin-dashboard");

        } catch (error) {

            console.error(error);

            alert("Failed to Add Customer");

        }

    };

    return (

        <div className="form-container">

            <form className="shipment-form" onSubmit={handleSubmit}>

                <h2>Add Customer</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Customer Name"
                    value={customer.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={customer.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={customer.phone}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="address"
                    placeholder="Address"
                    rows="4"
                    value={customer.address}
                    onChange={handleChange}
                    required
                />

                <div className="form-buttons">
                
                    <button
    type="submit"
    className="save-btn"
>
                    
                        Save Customer
                    </button>

                    <button
    type="button"
    className="cancel-btn"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        Cancel
                    </button>
                </div>

            </form>

        </div>

    );

}

export default AddCustomer;