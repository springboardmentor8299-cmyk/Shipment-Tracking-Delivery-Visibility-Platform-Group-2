import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAllCustomers,
    deleteCustomer
} from "../services/customerService";

import {
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";

function CustomersSection() {

    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {

        try {

            const response = await getAllCustomers();

            setCustomers(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this customer?"))
            return;

        try {

            await deleteCustomer(id);

            loadCustomers();

        } catch (error) {

            console.error(error);

        }

    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="table-section">

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}
            >

                <h2>Customer Management</h2>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center"
                    }}
                >

                    <input
                        className="search-box"
                        placeholder="Search Customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        className="add-driver-btn"
                        onClick={() => navigate("/add-customer")}
                    >
                        Add Customer
                    </button>

                </div>

            </div>

            <table>

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {filteredCustomers.length > 0 ? (

                        filteredCustomers.map(customer => (

                            <tr key={customer.id}>

                                <td>{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.address}</td>

                                <td>

    <div className="actions">

        <button
            className="edit-btn"
            title="Edit Customer"
            onClick={() =>
                navigate(`/edit-customer/${customer.id}`)
            }
        >
            <FaEdit />
        </button>

        <button
            className="delete-btn"
            title="Delete Customer"
            onClick={() =>
                handleDelete(customer.id)
            }
        >
            <FaTrash />
        </button>

    </div>

</td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan="5"
                                style={{
                                    textAlign: "center",
                                    padding: "20px"
                                }}
                            >
                                No Customers Found
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

        </div>

    );

}

export default CustomersSection;