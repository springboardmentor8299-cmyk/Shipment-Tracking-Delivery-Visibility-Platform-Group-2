import { useNavigate } from "react-router-dom";

function QuickActions() {

    const navigate = useNavigate();

    const actions = [

        {
            title: "Create Shipment",
            description: "Create a new shipment request.",
            icon: "bi-plus-square-fill",
            color: "primary",
            route: "/create-shipment"
        },

        {
            title: "Manage Users",
            description: "View and manage all users.",
            icon: "bi-people-fill",
            color: "success",
            route: "/manage-users"
        },

        {
            title: "Manage Shipments",
            description: "Track and update shipments.",
            icon: "bi-box-seam-fill",
            color: "warning",
            route: "/shipments"
        },

        {
            title: "Reports",
            description: "Generate analytics reports.",
            icon: "bi-bar-chart-fill",
            color: "info",
            route: "/reports"
        },

        {
            title: "Settings",
            description: "Configure platform settings.",
            icon: "bi-gear-fill",
            color: "secondary",
            route: "/settings"
        },

        {
            title: "Notifications",
            description: "View latest notifications.",
            icon: "bi-bell-fill",
            color: "danger",
            route: "/notifications"
        }

    ];

    const handleNavigation = (route) => {

        navigate(route);

    };

    return (

        <div className="chart-card mt-5">

            <h4 className="dashboard-section-title mb-4">
                Quick Actions
            </h4>

            <div className="row g-4">

                {actions.map((action) => (

                    <div
                        className="col-xl-4 col-lg-4 col-md-6 col-12"
                        key={action.title}
                    >

                        <div
                            className="quick-action-card h-100"
                            role="button"
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                                handleNavigation(action.route)
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" ||
                                    e.key === " "
                                ) {

                                    e.preventDefault();

                                    handleNavigation(action.route);

                                }

                            }}
                        >

                            <div
                                className={`quick-action-icon bg-${action.color}-subtle`}
                            >

                                <i
                                    className={`bi ${action.icon} text-${action.color}`}
                                ></i>

                            </div>

                            <h5 className="quick-action-title">

                                {action.title}

                            </h5>

                            <p className="quick-action-description">

                                {action.description}

                            </p>

                            <button
                                className="btn btn-primary dashboard-btn mt-2"
                                onClick={(e) => {

                                    e.stopPropagation();

                                    handleNavigation(action.route);

                                }}
                            >

                                Open

                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default QuickActions;