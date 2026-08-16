import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminDashboard from "./pages/admin/Dashboard";
import BusinessDashboard from "./pages/business/Dashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorShipmentsPage from "./pages/operator/OperatorShipmentsPage";
import ShipmentDetailsPage from "./pages/operator/ShipmentDetailsPage";
import SupportDashboard from "./pages/support/Dashboard";
import ProofOfDeliveryPage from "./pages/operator/ProofOfDeliveryPage";


import CreateShipmentPage from "./pages/customer/CreateShipmentPage";
import MyShipmentsPage from "./pages/customer/MyShipmentsPage";
import TrackShipmentPage from "./pages/customer/TrackShipmentPage";
import DeliveryHistoryPage from "./pages/customer/DeliveryHistoryPage";
import UpdateShipmentPage from "./pages/operator/UpdateShipmentPage";

import CreateStaffPage from "./pages/admin/CreateStaffPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ManageShipmentsPage from "./pages/admin/ManageShipmentsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import PodVerificationPage from "./pages/admin/PodVerificationPage";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* Administrator Routes */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-staff"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
              <CreateStaffPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
              <ManageUsersPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/shipments"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
              <ManageShipmentsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
              <ReportsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
    path="/admin/pod-verification"
    element={
        <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMINISTRATOR"]}>
                <PodVerificationPage />
            </RoleBasedRoute>
        </ProtectedRoute>
    }
/>

      {/* Customer Routes */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/dashboard"
        element={<Navigate to="/customer" replace />}
      />

      <Route
        path="/customer/create-shipment"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["CUSTOMER"]}>
              <CreateShipmentPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/shipments"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["CUSTOMER"]}>
              <MyShipmentsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/track/:trackingNumber"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["CUSTOMER"]}>
              <TrackShipmentPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["CUSTOMER"]}>
              <DeliveryHistoryPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Business Client Route */}

      <Route
        path="/business"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["BUSINESS_CLIENT"]}>
              <BusinessDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Logistics Operator Route */}

      <Route
        path="/operator"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["LOGISTICS_OPERATOR"]}>
              <OperatorDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/dashboard"
        element={<Navigate to="/operator" replace />}
      />

      <Route
  path="/operator/shipments/:trackingNumber/proof-of-delivery"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["LOGISTICS_OPERATOR"]}>
        <ProofOfDeliveryPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>

      <Route
  path="/operator/shipments"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["LOGISTICS_OPERATOR"]}>
        <OperatorShipmentsPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/operator/shipments/:id"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["LOGISTICS_OPERATOR"]}>
        <ShipmentDetailsPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/operator/shipments/:id/update"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["LOGISTICS_OPERATOR"]}>
        <UpdateShipmentPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>

      {/* Support Agent Route */}

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SUPPORT_AGENT"]}>
              <SupportDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Unknown Route */}

    <Route path="*" element={<Navigate to="/" replace />} />
    
    {/* <Route
    path="/operator/shipments"
    element={<OperatorShipmentsPage />}
      />*/}
    </Routes>

  );
}

export default App;