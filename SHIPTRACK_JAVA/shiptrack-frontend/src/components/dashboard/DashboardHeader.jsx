import React from "react";
import ThemeToggle from "./ThemeToggle";

function DashboardHeader() {

    const today = new Date();

    const formattedDate = today.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );

    return (

        <div className="dashboard-card dashboard-header p-4 mb-4">

            <div className="row align-items-center">

                {}

                <div className="col-lg-8 col-md-7 col-12">

                    <div className="d-flex align-items-center header-content">

                        <div className="header-icon">

                            <i className="bi bi-speedometer2"></i>

                        </div>

                        <div>

                            <h2 className="header-title">
                                Welcome Back, Admin 👋
                            </h2>

                            <p className="header-subtitle">
                                Monitor your logistics operations and manage the entire platform.
                            </p>

                        </div>

                    </div>

                </div>

                {}

                <div className="col-lg-4 col-md-5 col-12 text-lg-end text-md-end text-start mt-4 mt-md-0">

                    <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-3 flex-wrap">

                        <ThemeToggle />

                        <div className="date-box">

                            <span className="date-label">
                                Today
                            </span>

                            <h5 className="date-value">
                                {formattedDate}
                            </h5>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DashboardHeader;