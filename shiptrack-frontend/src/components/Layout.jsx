import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import "../styles/Layout.css";

function Layout({ children }) {
    return (
        <div className="layout">

            <Sidebar />

            <div className="main-content">

                <DashboardNavbar />

                <div className="page-content">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default Layout;