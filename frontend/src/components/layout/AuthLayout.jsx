// function AuthLayout({ title, children }) {
//     return (
//         <div className="container-fluid vh-100 bg-light">
//             <div className="row h-100 justify-content-center align-items-center">

//                 <div className="col-md-6 col-lg-4">

//                     <div className="card shadow-lg border-0 rounded-4">

//                         <div className="card-body p-5">

//                             <h2 className="text-center mb-4">
//                                 ShipTrack Pro
//                             </h2>

//                             <h5 className="text-center text-secondary mb-4">
//                                 {title}
//                             </h5>

//                             {children}

//                         </div>

//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// }

// export default AuthLayout;

function AuthLayout({ title, children }) {
    return (
        <div
            className="container-fluid vh-100 d-flex justify-content-center align-items-center"
            style={{
                background: "linear-gradient(135deg,var(--brand-bg-light),#EDF4FC)",
            }}
        >
            <div className="row justify-content-center w-100">

                <div className="col-md-8 col-lg-6 col-xl-5">

                    <div
                        className="card border-0 shadow-lg rounded-4"
                        style={{
                            overflow: "hidden",
                        }}
                    >

                        <div className="card-body p-5">

                            {/* Logo */}

                            <h1
                                className="text-center fw-bold mb-2"
                                style={{
                                    color: "var(--brand-primary)",
                                    fontSize: "3rem",
                                    letterSpacing: "1px",
                                }}
                            >
                                <span style={{ color: "#F59E0B" }}>📦</span>{" "}
                                ShipTrack-Pro
                                {/* <span style={{ color: "#F59E0B" }}>Track</span>{" "}
                                Pro */}
                            </h1>

                            {/* <p
                                className="text-center text-secondary mb-4"
                                style={{
                                    fontSize: "17px",
                                }}
                            >
                                Smart Shipment Tracking Platform
                            </p> */}

                            {/* <h4
                                className="text-center fw-semibold mb-4"
                                style={{
                                    color: "#495057",
                                }}
                            >
                                {title}
                            </h4> */}
                            <h4
                                className="text-center fw-semibold mb-4"
                                style={{
                                    color: "var(--brand-text-muted)",
                                    fontSize: "1rem",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                {title}
                            </h4>

                            {children}

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default AuthLayout;