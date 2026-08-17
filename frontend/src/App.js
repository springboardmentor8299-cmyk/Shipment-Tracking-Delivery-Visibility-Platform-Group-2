import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProofOfDelivery from "./pages/ProofOfDelivery";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import DriverDashboard from "./pages/DriverDashboard";

import CreateShipment from "./pages/CreateShipment";
import EditShipment from "./pages/EditShipment";
import ViewShipment from "./pages/ViewShipment";
import TrackShipment from "./pages/TrackShipment";

import AddDriver from "./pages/AddDriver";
import EditDriver from "./pages/EditDriver";

import ProtectedRoute from "./components/ProtectedRoute";

import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer Dashboard */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute role="CUSTOMER">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Driver Dashboard */}
        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shipment Routes */}
        <Route
          path="/create-shipment"
          element={
            <ProtectedRoute role="ADMIN">
              <CreateShipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-shipment/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <EditShipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-shipment/:id"
          element={
            <ProtectedRoute>
              <ViewShipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-shipment/:id"
          element={
            <ProtectedRoute>
              <TrackShipment />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/add-driver"
          element={
            <ProtectedRoute role="ADMIN">
              <AddDriver />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-driver/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <EditDriver />
            </ProtectedRoute>
          }
        />
<Route
    path="/add-customer"
    element={
        <ProtectedRoute role="ADMIN">
            <AddCustomer />
        </ProtectedRoute>
    }
/>

<Route
    path="/edit-customer/:id"
    element={
        <ProtectedRoute role="ADMIN">
            <EditCustomer />
        </ProtectedRoute>
    }
/>
{/* Proof Of Delivery */}
<Route
    path="/proof-of-delivery/:id"
    element={
        <ProtectedRoute role="DRIVER">
            <ProofOfDelivery />
        </ProtectedRoute>
    }
/>

        {/* Redirect Invalid URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;