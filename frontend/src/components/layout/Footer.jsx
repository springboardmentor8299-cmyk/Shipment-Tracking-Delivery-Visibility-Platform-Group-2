// function Footer() {
//     return (
//         <footer
//             className="text-white py-5"
//             style={{ backgroundColor: "#123C5A" }}
//         >
//             <div className="container text-center">

//                 <h2 className="fw-bold mb-3">
//                     <i className="bi bi-truck me-2 text-warning"></i>
//                     ShipTrack-Pro
//                 </h2>

//                 <p className="mb-4 text-light">
//                     Smart logistics management platform for tracking shipments,
//                     managing deliveries, and improving supply chain efficiency.
//                 </p>

//                 <hr className="border-light" />

//                 <p className="mb-0">
//                     © {new Date().getFullYear()} ShipTrack-Pro. All Rights Reserved.
//                 </p>

//             </div>
//         </footer>
//     );
// }

// export default Footer;
function Footer() {
    return (
        <footer
            className="text-white py-5"
            style={{
                background: "#313131",
                marginTop: "60px",
            }}
        >
            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-lg-8 text-center">

                        <h2
                            className="fw-bold mb-3"
                            style={{
                                letterSpacing: "1px",
                            }}
                        >
                            📦 ShipTrack-Pro
                        </h2>

                        <p
                            className="mb-4"
                            style={{
                                color: "#D6E4F0",
                                fontSize: "17px",
                                lineHeight: "1.8",
                            }}
                        >
                            Smart logistics platform for tracking shipments,
                            managing deliveries, and improving supply chain
                            efficiency.
                        </p>

                        <div
                            style={{
                                width: "80px",
                                height: "3px",
                                background: "#F59E0B",
                                margin: "0 auto 25px",
                                borderRadius: "10px",
                            }}
                        ></div>

                        <small
                            style={{
                                color: "#C7D5E0",
                                fontSize: "15px",
                            }}
                        >
                            © {new Date().getFullYear()} ShipTrack-Pro • Built by
                            Raju Shaw
                        </small>

                    </div>

                </div>

            </div>
        </footer>
    );
}

export default Footer;