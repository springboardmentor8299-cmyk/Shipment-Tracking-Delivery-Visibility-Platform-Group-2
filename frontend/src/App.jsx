import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Logout from "./pages/auth/Logout";

import ProtectedRoute from "./routes/ProtectedRoute";

import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import CustomerDashboard from "./pages/dashboard/customer/CustomerDashboard";
import BusinessDashboard from "./pages/dashboard/business_client/BusinessDashboard";
import LogisticsDashboard from "./pages/dashboard/logistics_operator/LogisticsDashboard";
import SupportDashboard from "./pages/dashboard/support_agent/SupportDashboard";

import Tracking from "./pages/tracking/Tracking";
import Delivery from "./pages/delivery/Delivery";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<LandingPage />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                {/* Admin Dashboard */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Customer Dashboard */}

                <Route
                    path="/customer"
                    element={
                        <ProtectedRoute>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Business Client */}

                <Route
                    path="/business_client"
                    element={
                        <ProtectedRoute>
                            <BusinessDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Logistics Operator */}

                <Route
                    path="/logistics_operator"
                    element={
                        <ProtectedRoute>
                            <LogisticsDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Support Agent */}

                <Route
                    path="/support_agent"
                    element={
                        <ProtectedRoute>
                            <SupportDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Tracking */}

                <Route
                    path="/tracking"
                    element={
                        <ProtectedRoute>
                            <Tracking />
                        </ProtectedRoute>
                    }
                />

                {/* Delivery */}

                <Route
                    path="/delivery"
                    element={
                        <ProtectedRoute>
                            <Delivery />
                        </ProtectedRoute>
                    }
                />

                {/* Logout */}

                <Route
                    path="/logout"
                    element={<Logout />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;