import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import TopBar from "../components/common/TopBar";
import BackButton from "../components/common/BackButton";

function AdminLayout() {
  const sidebarWidth = 260;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: sidebarWidth, padding: "16px 32px", paddingTop: 8 }}>
        <TopBar />
        <div className="app-container" style={{ paddingTop: 16 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
