import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import SupportDashboard from "./pages/support/Dashboard";
import CustomerDashboard from "./pages/customer/Dashboard";
import LiveTrackingPage from "./pages/customer/LiveTrackingPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/live-tracking/:trackingNumber" element={<LiveTrackingPage />} />
            <Route path="/admin" element={
                <ProtectedRoute allowedRole="ADMIN">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/support" element={
                <ProtectedRoute allowedRole="SUPPORT_ASSISTANT">
                    <SupportDashboard />
                </ProtectedRoute>
            } />
            <Route path="/customer" element={
                <ProtectedRoute allowedRole="USER">
                    <CustomerDashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
