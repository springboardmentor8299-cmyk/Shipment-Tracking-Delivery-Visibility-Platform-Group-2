import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard";
import TicketTable from "../../components/support_agent/TicketTable";

import {
    getAllTickets
} from "../../services/ticketService";

import {
    FaTicketAlt,
    FaClock,
    FaSpinner,
    FaCheckCircle
} from "react-icons/fa";

import "../../styles/StatCard.css";

function SupportTickets() {

    const [tickets, setTickets] = useState([]);

    const [stats, setStats] = useState({

        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0

    });

    useEffect(() => {

        loadTickets();

    }, []);

    const loadTickets = async () => {

        try {

            const data = await getAllTickets();

            setTickets(data);

            setStats({

                total: data.length,

                open: data.filter(
                    t => t.status === "OPEN"
                ).length,

                inProgress: data.filter(
                    t => t.status === "IN_PROGRESS"
                ).length,

                resolved: data.filter(
                    t => t.status === "RESOLVED"
                ).length

            });

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <>

            <h2>

                Support Tickets

            </h2>

            <div className="stats-container">

                <StatCard

                    title="Total Tickets"

                    value={stats.total}

                    icon={<FaTicketAlt />}

                    color="#2563EB"

                />

                <StatCard

                    title="Open"

                    value={stats.open}

                    icon={<FaClock />}

                    color="#EF4444"

                />

                <StatCard

                    title="In Progress"

                    value={stats.inProgress}

                    icon={<FaSpinner />}

                    color="#F59E0B"

                />

                <StatCard

                    title="Resolved"

                    value={stats.resolved}

                    icon={<FaCheckCircle />}

                    color="#22C55E"

                />

            </div>

            <TicketTable />

        </>

    );

}

export default SupportTickets;