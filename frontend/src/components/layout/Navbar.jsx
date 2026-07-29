// import { Link } from "react-router-dom";
// import Logo from "../common/Logo";

// function Navbar() {
//     return (
//         <nav
//             className="navbar navbar-expand-lg"
//             style={{ backgroundColor:"#0F4C81" }}
//         >
//             <div className="container">

//                 <Logo />

//                 <button
//                     className="navbar-toggler bg-white"
//                     type="button"
//                     data-bs-toggle="collapse"
//                     data-bs-target="#navbar"
//                 >
//                     <span className="navbar-toggler-icon"></span>
//                 </button>

//                 <div
//                     className="collapse navbar-collapse"
//                     id="navbar"
//                 >

//                     <ul className="navbar-nav mx-auto">

//                         <li className="nav-item">
//                             <Link className="nav-link text-white" to="/">
//                                 Home
//                             </Link>
//                         </li>

//                         <li className="nav-item">
//                             <a className="nav-link text-white" href="#features">
//                                 Services
//                             </a>
//                         </li>

//                         <li className="nav-item">
//                             <a className="nav-link text-white" href="#">
//                                 About
//                             </a>
//                         </li>

//                         <li className="nav-item">
//                             <a className="nav-link text-white" href="#">
//                                 Contact
//                             </a>
//                         </li>

//                     </ul>

//                     <Link
//                         to="/login"
//                         className="btn btn-light fw-semibold"
//                     >
//                         Sign In
//                     </Link>

//                 </div>

//             </div>
//         </nav>
//     );
// }

// export default Navbar;

import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    return (
        <nav
            className="navbar navbar-expand-lg sticky-top"
            style={{
                backgroundColor: "#343a40",
                padding: "18px 0",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            }}
        >
            <div className="container">

                {/* Logo */}

                <Logo />

                {/* Mobile Toggle */}

                <button
                    className="navbar-toggler bg-light"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbar"
                >

                    {/* Center Menu */}

                    <ul className="navbar-nav mx-auto">

                        <li className="nav-item mx-2">
                            <Link className="nav-link nav-custom" to="/" >
                                Home
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <a className="nav-link nav-custom" href="#">
                                About
                            </a>
                        </li>

                        <li className="nav-item mx-2">
                            <a className="nav-link nav-custom" href="#features">
                                Services
                            </a>
                        </li>

                        <li className="nav-item mx-2">
                            <a className="nav-link nav-custom" href="#">
                                Contact
                            </a>
                        </li>

                    </ul>

                    {/* Right Buttons */}

                    <div className="d-flex gap-3">

                        <button
                            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                            onClick={toggleTheme}
                            title={theme === "light" ? "Dark Mode" : "Light Mode"}
                            style={{
                                width: "40px",
                                height: "40px",
                                padding: 0,
                                borderColor: "rgba(255,255,255,0.4)"
                            }}
                        >
                            <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`}></i>
                        </button>

                        <Link
                            to="/login"
                            className="btn btn-outline-light px-4 rounded-pill fw-semibold"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="btn btn-outline-light px-4 rounded-pill fw-semibold"
                        >
                            Sign Up
                        </Link>

                    </div>

                </div>

            </div>
        </nav>
    );
}

export default Navbar;