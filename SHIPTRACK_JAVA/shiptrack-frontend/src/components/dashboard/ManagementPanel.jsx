import { useNavigate } from "react-router-dom";

function ManagementPanel() {

    const navigate = useNavigate();

    const managementCards = [

        {
            title: "Manage Users",
            description: "View, update roles and manage system users.",
            icon: "bi-people-fill",
            color: "primary",
            route: "/manage-users"
        },

        {
            title: "Manage Shipments",
            description: "Monitor and manage all shipments.",
            icon: "bi-box-seam",
            color: "success",
            route: "/shipments"
        },

        {
            title: "Manage Support",
            description: "Monitor tickets, staff and complaints.",
            icon: "bi-headset",
            color: "warning",
            route: "/admin/support"
        },

        {
            title: "Manage Drivers",
            description: "Manage drivers, assignments, performance and live tracking.",
            icon: "bi-truck",
            color: "info",
            route: "/admin/drivers"
        },

        {
            title: "Reports",
            description: "Generate shipment reports.",
            icon: "bi-bar-chart-fill",
            color: "secondary",
            route: "/reports"
        },

        {
            title: "System Settings",
            description: "Configure platform settings.",
            icon: "bi-gear-fill",
            color: "dark",
            route: "/settings"
        }

    ];

    const handleNavigation = (route) => {

        navigate(route);

    };

    return (

        <div className="mt-5 mb-5">

            <h4 className="dashboard-section-title mb-4">
                Management Panel
            </h4>

            <div className="row g-4">

                {managementCards.map((card) => (

                    <div
                        className="col-lg-4 col-md-6"
                        key={card.title}
                    >

                        <div
                            className="management-card h-100"
                            role="button"
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                                handleNavigation(card.route)
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" ||
                                    e.key === " "
                                ) {

                                    e.preventDefault();

                                    handleNavigation(card.route);

                                }

                            }}
                        >

                            <div className="card-body p-4">

                                <div className="d-flex justify-content-between align-items-center mb-3">

                                    <div className="d-flex align-items-center">

                                        <i
                                            className={`bi ${card.icon} text-${card.color} management-icon`}
                                        ></i>

                                        <h5 className="ms-3 mb-0 card-title">

                                            {card.title}

                                        </h5>

                                    </div>

                                    <i className="bi bi-arrow-right-circle-fill text-secondary"></i>

                                </div>

                                <p className="text-muted mb-0">

                                    {card.description}

                                </p>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default ManagementPanel;
