// function Features() {
//     return (
//         <section
//             id="features"
//             className="py-5 bg-white"
//         >
//             <div className="container">

//                 <h2
//                     className="text-center fw-bold mb-5"
//                     style={{ color: "#123C5A" }}
//                 >
//                     Why Choose ShipTrack-Pro
//                 </h2>

//                 <div className="row g-4">

//                     <div className="col-md-4">

//                         <div className="card shadow-sm border-0 h-100 text-center p-4">

//                             <div
//                                 className="display-4 mb-3"
//                             >
//                                 📍
//                             </div>

//                             <h4>Live Tracking</h4>

//                             <p className="text-muted">
//                                 Monitor shipment location in real time with GPS updates.
//                             </p>

//                         </div>

//                     </div>

//                     <div className="col-md-4">

//                         <div className="card shadow-sm border-0 h-100 text-center p-4">

//                             <div
//                                 className="display-4 mb-3"
//                             >
//                                 🚚
//                             </div>

//                             <h4>Shipment Management</h4>

//                             <p className="text-muted">
//                                 Create, update and manage shipments efficiently.
//                             </p>

//                         </div>

//                     </div>

//                     <div className="col-md-4">

//                         <div className="card shadow-sm border-0 h-100 text-center p-4">

//                             <div
//                                 className="display-4 mb-3"
//                             >
//                                 📊
//                             </div>

//                             <h4>Analytics</h4>

//                             <p className="text-muted">
//                                 Analyze delivery performance and shipment reports.
//                             </p>

//                         </div>

//                     </div>

//                 </div>

//             </div>
//         </section>
//     );
// }

// export default Features;

function Features() {
    return (
        <section
            id="features"
            className="py-5"
            style={{ background: "var(--brand-bg-light)" }}
        >
            <div className="container">

                <div className="text-center mb-5">

                    <span
                        className="badge px-3 py-2 mb-3"
                        style={{
                            background: "var(--brand-primary-light)",
                            color: "var(--brand-primary)",
                            borderRadius: "30px"
                        }}
                    >
                        OUR SERVICES
                    </span>

                    <h2
                        className="fw-bold"
                        style={{
                            color: "var(--brand-primary)",
                            fontSize: "3rem"
                        }}
                    >
                        Why Choose ShipTrack-Pro
                    </h2>

                    <p
                        className="text-muted mt-3"
                        style={{ maxWidth: "700px", margin: "auto" }}
                    >
                        Everything you need to efficiently manage shipments,
                        monitor deliveries, and optimize logistics operations.
                    </p>

                </div>

                <div className="row g-4">

                    {/* Card 1 */}

                    <div className="col-lg-4">

                        <div
                            className="card border-0 shadow-sm h-100 p-4 text-center"
                            style={{
                                borderRadius: "18px",
                                transition: "0.3s"
                            }}
                        >

                            <div
                                className="mx-auto mb-4 d-flex justify-content-center align-items-center"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    background: "var(--brand-primary-light)",
                                    borderRadius: "50%"
                                }}
                            >
                                <i
                                    className="bi bi-geo-alt-fill"
                                    style={{
                                        fontSize: "35px",
                                        color: "var(--brand-primary)"
                                    }}
                                ></i>
                            </div>

                            <h4 className="fw-bold">
                                Live Tracking
                            </h4>

                            <p className="text-muted mt-3">
                                Track shipment location in real time with live
                                GPS updates and instant delivery status.
                            </p>

                        </div>

                    </div>

                    {/* Card 2 */}

                    <div className="col-lg-4">

                        <div
                            className="card border-0 shadow-sm h-100 p-4 text-center"
                            style={{
                                borderRadius: "18px",
                                transition: "0.3s"
                            }}
                        >

                            <div
                                className="mx-auto mb-4 d-flex justify-content-center align-items-center"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    background: "var(--brand-icon-bg-2)",
                                    borderRadius: "50%"
                                }}
                            >
                                <i
                                    className="bi bi-box-seam-fill"
                                    style={{
                                        fontSize: "35px",
                                        color: "#F59E0B"
                                    }}
                                ></i>
                            </div>

                            <h4 className="fw-bold">
                                Shipment Management
                            </h4>

                            <p className="text-muted mt-3">
                                Create, update and manage shipments from one
                                centralized dashboard.
                            </p>

                        </div>

                    </div>

                    {/* Card 3 */}

                    <div className="col-lg-4">

                        <div
                            className="card border-0 shadow-sm h-100 p-4 text-center"
                            style={{
                                borderRadius: "18px",
                                transition: "0.3s"
                            }}
                        >

                            <div
                                className="mx-auto mb-4 d-flex justify-content-center align-items-center"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    background: "var(--brand-icon-bg-3)",
                                    borderRadius: "50%"
                                }}
                            >
                                <i
                                    className="bi bi-bar-chart-line-fill"
                                    style={{
                                        fontSize: "35px",
                                        color: "#198754"
                                    }}
                                ></i>
                            </div>

                            <h4 className="fw-bold">
                                Business Analytics
                            </h4>

                            <p className="text-muted mt-3">
                                Generate reports and monitor logistics
                                performance with detailed analytics.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default Features;