import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getCustomerById,
    updateCustomer
} from "../services/customerService";

import "../styles/driverForm.css";

function EditCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        loadCustomer();
    }, []);

    const loadCustomer = async () => {

        try {

            const response = await getCustomerById(id);

            setCustomer(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const handleChange = (e) => {

        setCustomer({
            ...customer,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateCustomer(id, customer);

            alert("Customer Updated Successfully!");

            navigate("/admin-dashboard");

        } catch (error) {

            console.error(error);

            alert("Failed to Update Customer");

        }

    };

    return (

        <div className="form-container">

            <form
                className="shipment-form"
                onSubmit={handleSubmit}
            >

                <h2>✏️ Edit Customer</h2>

                <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleChange}
                    placeholder="Customer Name"
                    required
                />

                <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                />

                <input
                    type="text"
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                />

                <textarea
                    name="address"
                    rows="4"
                    value={customer.address}
                    onChange={handleChange}
                    placeholder="Customer Address"
                    required
                />

                <div className="form-buttons">

                    <button
                        type="submit"
                        className="save-btn"
                    >
                        ✏️ Update Customer
                    </button>

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        ↩ Cancel
                    </button>

                </div>

            </form>

        </div>

    );

}

export default EditCustomer;