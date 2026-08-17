import { useEffect, useState } from "react";
import {
    getAllDrivers,
    deleteDriver
} from "../services/driverService";

import {
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function DriversSection() {

    const navigate = useNavigate();

    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {

        try {

            const response = await getAllDrivers();

            setDrivers(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this driver?")) return;

        try {

            await deleteDriver(id);

            loadDrivers();

        } catch (error) {

            console.error(error);

        }

    };

    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.vehicleNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="table-section">

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}
            >

                <h2>Driver Management</h2>

                <div className="driver-toolbar">

                    <input
                        className="search-box"
                        placeholder="🔍 Search Driver..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        className="add-driver-btn"
                        onClick={() => navigate("/add-driver")}
                    >
                        <FaPlus />
                        <span>Add Driver</span>
                    </button>

                </div>

            </div>

            <table>

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Vehicle</th>
                        <th>License</th>
                        <th>Status</th>
                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {filteredDrivers.map(driver => (

                        <tr key={driver.id}>

                            <td>{driver.name}</td>

                            <td>{driver.email}</td>

                            <td>{driver.phone}</td>

                            <td>{driver.vehicleNumber}</td>

                            <td>{driver.licenseNumber}</td>

                            <td>

                                <span
                                    className={
                                        driver.status === "Available"
                                            ? "status delivered"
                                            : driver.status === "On Delivery"
                                            ? "status transit"
                                            : "status pending"
                                    }
                                >
                                    {driver.status === "Available" && "🟢 "}
                                    {driver.status === "On Delivery" && "🚚 "}
                                    {driver.status === "Offline" && "🔴 "}
                                    {driver.status}
                                </span>

                            </td>

                            <td>

                                <div className="actions">

                                    <button
                                        className="edit-btn"
                                        title="Edit Driver"
                                        onClick={() =>
                                            navigate(`/edit-driver/${driver.id}`)
                                        }
                                    >
                                        <FaEdit />
                                    </button>

                                    <button
                                        className="delete-btn"
                                        title="Delete Driver"
                                        onClick={() => handleDelete(driver.id)}
                                    >
                                        <FaTrash />
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default DriversSection;