import { useEffect, useState } from "react";

import "../../styles/AddShipmentModal.css";

function UpdateTicketModal({

    show,
    ticket,
    onClose,
    onSave

}) {

    const [ticketData, setTicketData] = useState({

        subject: "",
        description: "",
        status: "OPEN",
        assignedTo: ""

    });

    useEffect(() => {

        if (ticket) {

        setTicketData({

            subject: ticket.subject || "",
            description: ticket.description || "",
            status: ticket.status || "OPEN",
            assignedTo: ticket.assignedToId || ""

        });

    } else {

        setTicketData({

            subject: "",
            description: "",
            status: "OPEN",
            assignedTo: ""

        });

    }

    }, [ticket]);

    if (!show) return null;

    const handleChange = (e) => {

        setTicketData({

            ...ticketData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        await onSave(ticketData);

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>

                    {ticket ? "Update Ticket" : "Create Ticket"}

                </h2>

                <form onSubmit={handleSubmit}>

                    <label>

                        Subject

                    </label>

                    <input

                        name="subject"

                        value={ticketData.subject}

                        onChange={handleChange}

                        required

                    />

                    <label>

                        Description

                    </label>

                    <textarea

                        rows="5"

                        name="description"

                        value={ticketData.description}

                        onChange={handleChange}

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

                    <label>

                        Assign To (User ID)

                    </label>

                    <input

                        type="number"

                        name="assignedTo"

                        value={ticketData.assignedTo}

                        onChange={handleChange}

                    />

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

                            Update Ticket

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default UpdateTicketModal;