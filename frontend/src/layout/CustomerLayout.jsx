import { Outlet } from "react-router-dom";
import TopBar from "../components/common/TopBar";
import CustomerSidebar from "../components/customer/CustomerSidebar";
import BackButton from "../components/common/BackButton";

function CustomerLayout() {
    const sidebarWidth = 260;

    return (
        <div style={{ display: "flex", minHeight: '100vh', background: '#f8fafc' }}>
            <CustomerSidebar />
            <main style={{ flex: 1, marginLeft: sidebarWidth, padding: "16px 32px", paddingTop: 8 }}>
                <TopBar />
                <div className="app-container" style={{ paddingTop: 16 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default CustomerLayout;