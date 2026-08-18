import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./landing/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRedirect from "./routes/RoleBasedRedirect";

// Layouts
import AdminLayout from "./layout/AdminLayout";
import CustomerLayout from "./layout/CustomerLayout";
import BusinessLayout from "./layout/BusinessLayout";
import OperatorLayout from "./layout/OperatorLayout";
import SupportLayout from "./layout/SupportLayout";

// Dashboards & Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import ShipmentOverview from "./pages/business/ShipmentOverview";
import DelayAnalytics from "./pages/business/DelayAnalytics";
import BusinessReports from "./pages/business/BusinessReports";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import SupportDashboard from "./pages/support/SupportDashboard";
import DisputeQueue from "./pages/support/DisputeQueue";
import GlobalLookup from "./pages/support/GlobalLookup";

import PodDisputeOverrideQueue from "./components/admin/PodDisputeOverrideQueue";
import Users from "./pages/admin/Users";
import Shipments from "./pages/admin/Shipments";
import Trackings from "./pages/admin/Tracking";
import SingleShipmentTracking from "./pages/admin/SingleShipmentTracking";
import Deliveries from "./pages/admin/Deliveries";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import Profile from "./pages/Profile";
import NotificationsPage from "./pages/NotificationsPage";
import AssignedRuns from "./pages/operator/AssignedRuns";
import PodCapture from "./pages/operator/PodCapture";
import Support from "./pages/customer/Support";
import CustomerShipments from "./pages/customer/CustomerShipments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<RoleBasedRedirect />} />

      {/* 1. ADMINISTRATOR ROLE (/admin and /dashboard/admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMINISTRATOR", "ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="disputes" element={<PodDisputeOverrideQueue />} />
        <Route path="customers" element={<Users />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="tracking" element={<Trackings />} />
        <Route path="tracking/:trackingId" element={<SingleShipmentTracking />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/dashboard/admin/*"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* 2. CUSTOMER ROLE (/customer and /dashboard/customer) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRole="CUSTOMER">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="shipments" element={<CustomerShipments />} />
        <Route path="track" element={<Trackings />} />
        <Route path="track/:trackingId" element={<SingleShipmentTracking />} />
        <Route path="support" element={<Support />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/dashboard/customer/*"
        element={<Navigate to="/customer/dashboard" replace />}
      />

      {/* 3. BUSINESS CLIENT ROLE (/business and /dashboard/business) */}
      <Route
        path="/business"
        element={
          <ProtectedRoute allowedRoles={["BUSINESS_CLIENT", "BUSINESS"]}>
            <BusinessLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BusinessDashboard />} />
        <Route path="shipments" element={<ShipmentOverview />} />
        <Route path="analytics" element={<DelayAnalytics />} />
        <Route path="reports" element={<BusinessReports />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/dashboard/business/*"
        element={<Navigate to="/business/dashboard" replace />}
      />

      {/* 4. LOGISTICS OPERATOR ROLE (/operator and /dashboard/operator) */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={["LOGISTICS_OPERATOR", "OPERATOR"]}>
            <OperatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="runs" element={<AssignedRuns />} />
        <Route path="pod" element={<PodCapture />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/dashboard/operator/*"
        element={<Navigate to="/operator/dashboard" replace />}
      />

      {/* 5. SUPPORT AGENT ROLE (/support and /dashboard/support) */}
      <Route
        path="/support"
        element={
          <ProtectedRoute allowedRoles={["SUPPORT_AGENT", "SUPPORT"]}>
            <SupportLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SupportDashboard />} />
        <Route path="disputes" element={<DisputeQueue />} />
        <Route path="lookup" element={<GlobalLookup />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/dashboard/support/*"
        element={<Navigate to="/support/dashboard" replace />}
      />

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
