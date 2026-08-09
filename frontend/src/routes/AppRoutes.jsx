import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import AddShipment from "../pages/AddShipment";
import EditShipment from "../pages/EditShipment/EditShipment";
import ShipmentDetails from "../pages/ShipmentDetails/ShipmentDetails";
import Tracking from "../pages/Tracking/Tracking";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";



import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Add Shipment */}
        <Route
  path="/shipment"
  element={
    <ProtectedRoute>
      <AddShipment />
    </ProtectedRoute>
  }
/>

        {/* Edit Shipment */}
        <Route
          path="/edit-shipment/:trackingId"
          element={
            <ProtectedRoute>
              <EditShipment />
            </ProtectedRoute>
          }
        />

        {/* Shipment Details */}
        <Route
          path="/shipment-details/:trackingId"
          element={
            <ProtectedRoute>
              <ShipmentDetails />
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

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;