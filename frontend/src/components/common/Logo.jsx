// import { Link } from "react-router-dom";

// function Logo() {
//     return (
//         <Link
//             to="/"
//             className="navbar-brand fw-bold fs-2 d-flex align-items-center"
//             style={{
//                 color: "white",
//                 textDecoration: "none"
//             }}
//         >
//             <i
//                 className="bi bi-box-seam-fill me-2"
//                 style={{ color: "#F59E0B" }}
//             ></i>

//             ShipTrack-Pro
//         </Link>
//     );
// }

// export default Logo;

import { Link } from "react-router-dom";

function Logo() {
    return (
        <Link
            to="/"
            className="navbar-brand fw-bold d-flex align-items-center"
            style={{
                textDecoration: "none",
                color: "white",
                fontSize: "2.1rem",
            }}
        >
            <i
                className="bi bi-box-seam-fill me-3"
                style={{
                    color: "#F59E0B",
                    fontSize: "2rem",
                }}
            ></i>

            ShipTrack-Pro
        </Link>
    );
}

export default Logo;