import { useEffect, useState } from "react";

import "../../styles/AddShipmentModal.css";

import {
    createTicket,
    updateTicket
} from "../../services/ticketService";

import {
    getAllShipments,
    getAllUsers
} from "../../services/supportService";

function AddSupportTicketModal({

    show,
    ticket,
    onClose

}) {

    const [shipments, setShipments] = useState([]);

    const [customers, setCustomers] = useState([]);

    const [ticketData, setTicketData] = useState({

        customerId: "",

        shipmentId: "",

        subject: "",

        description: "",

        assignedTo: "",

        status: "OPEN"

    });

    useEffect(() => {

        if (show) {

            loadData();

        }

    }, [show]);

    useEffect(() => {

        if (ticket) {

            setTicketData({

                customerId: ticket.customerId || "",

                shipmentId: ticket.shipmentId || "",

                subject: ticket.subject || "",

                description: ticket.description || "",

                assignedTo: ticket.assignedToId || "",

                status: ticket.status || "OPEN"

            });

        }

        else {

            setTicketData({

                customerId: "",

                shipmentId: "",

                subject: "",

                description: "",

                assignedTo: "",

                status: "OPEN"

            });

        }

    }, [ticket]);

    const loadData = async () => {

        try {

            const shipmentData = await getAllShipments();

            setShipments(shipmentData);

            const userData = await getAllUsers();

            const customerList = userData.filter(

                user => user.role === "CUSTOMER"

            );

            setCustomers(customerList);

        }

        catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setTicketData({

            ...ticketData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const payload = {

            customerId: Number(ticketData.customerId),

            shipmentId: Number(ticketData.shipmentId),

            subject: ticketData.subject,

            description: ticketData.description,

            assignedTo:

                ticketData.assignedTo === ""

                    ? null

                    : Number(ticketData.assignedTo),

            status: ticketData.status

        };

        try {

            if (ticket) {

                await updateTicket(ticket.id, payload);

                alert("Ticket Updated Successfully");

            }

            else {

                await createTicket(payload);

                alert("Ticket Created Successfully");

            }

            onClose();

        }

        catch (error) {

            console.log(error);

            console.log(error.response);

            alert(JSON.stringify(error.response?.data));

        }

    };

    if (!show) return null;

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>

                    {

                        ticket

                            ? "Update Support Ticket"

                            : "Create Support Ticket"

                    }

                </h2>

                <form onSubmit={handleSubmit}>

                    <label>

                        Customer

                    </label>

                    <select

                        name="customerId"

                        value={ticketData.customerId}

                        onChange={handleChange}

                        required

                    >

                        <option value="">

                            Select Customer

                        </option>

                        {

                            customers.map(customer => (

                                <option

                                    key={customer.id}

                                    value={customer.id}

                                >

                                    {customer.name}

                                </option>

                            ))

                        }

                    </select>

                    <label>

                        Shipment

                    </label>

                    <select

                        name="shipmentId"

                        value={ticketData.shipmentId}

                        onChange={handleChange}

                        required

                    >

                        <option value="">

                            Select Shipment

                        </option>

                        {

                            shipments.map(shipment => (

                                <option

                                    key={shipment.id}

                                    value={shipment.id}

                                >

                                    {shipment.trackingId}

                                </option>

                            ))

                        }

                    </select>

                    <input

                        type="text"

                        name="subject"

                        placeholder="Subject"

                        value={ticketData.subject}

                        onChange={handleChange}

                        required

                    />

                    <textarea

                        name="description"

                        placeholder="Description"

                        value={ticketData.description}

                        onChange={handleChange}

                        rows="4"

                        required

                    />

                    <label>

                        Status

                    </label>

                    <select

                        name="status"

                        value={ticketData.status}

                        onChange={handleChange}

                    >

                        <option value="OPEN">

                            OPEN

                        </option>

                        <option value="IN_PROGRESS">

                            IN PROGRESS

                        </option>

                        <option value="RESOLVED">

                            RESOLVED

                        </option>

                        <option value="CLOSED">

                            CLOSED

                        </option>

                    </select>

                    <div className="modal-buttons">

                        <button

                            type="button"

                            className="cancel-btn"

                            onClick={onClose}

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="save-btn"

                        >

                            {

                                ticket

                                    ? "Update Ticket"

                                    : "Create Ticket"

                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddSupportTicketModal;