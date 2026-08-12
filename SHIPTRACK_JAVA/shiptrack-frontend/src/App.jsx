import RoleProtectedRoute from "./components/RoleProtectedRoute";
import ManageUsers from "./pages/ManageUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSupport from "./pages/AdminSupport";
import SupportDashboard from "./pages/SupportDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverManagement from "./pages/DriverManagement";
import PODPage from "./pages/PODPage";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShipmentList from "./pages/ShipmentList";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateShipment from "./pages/CreateShipment";
import TrackShipment from "./pages/TrackShipment";
import PrivateRoute from "./components/PrivateRoute";

function Layout({ children, showNavbar = true,  showFooter = true }) {
    return (
        <div className="app-shell min-vh-100 d-flex flex-column">
            {showNavbar && <Navbar />}
            <main className="app-main flex-grow-1">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
}

function App() {
  return (
    <BrowserRouter>

        <ToastContainer />

      <Routes>

          <Route
              path="/"
              element={
                  <Layout showNavbar={false}  showFooter={false}>
                      <LandingPage />
                  </Layout>
              }
          />

          <Route
              path="/login"
              element={
                  <Layout showNavbar={false}>
                      <Login />
                  </Layout>
              }
          />

         <Route
             path="/register"
             element={
                 <Layout showNavbar={false}>
                     <Register />
                 </Layout>
             }
         />

          <Route
              path="/dashboard"
              element={
                  <PrivateRoute>
                      <Layout>
                          <Dashboard />
                      </Layout>
                  </PrivateRoute>
              }
          />


          <Route
              path="/admin"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_ADMIN"
                          ]}
                      >

                          <Layout>
                              <AdminDashboard />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />

          <Route
              path="/admin/support"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_ADMIN"
                          ]}
                      >

                          <Layout>
                              <AdminSupport />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />


          <Route
              path="/support"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_SUPPORT"
                          ]}
                      >

                          <Layout>
                              <SupportDashboard />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />



          <Route
              path="/customer"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_CUSTOMER"
                          ]}
                      >

                          <Layout>
                              <CustomerDashboard />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />



          <Route
              path="/shipments"
              element={
                  <PrivateRoute
                      allowedRoles={[
                          "ROLE_ADMIN",
                          "ROLE_SUPPORT",
                          "ROLE_CUSTOMER"
                      ]}>
                      <Layout>
                          <ShipmentList />
                      </Layout>
                  </PrivateRoute>
              }
          />

          <Route
              path="/create-shipment"
              element={
                  <PrivateRoute
                      allowedRoles={[
                                      "ROLE_ADMIN"
                                      ]}>
                      <Layout>
                          <CreateShipment />
                      </Layout>
                  </PrivateRoute>
              }
          />

          <Route
              path="/track-shipment"
              element={
                  <PrivateRoute
                      allowedRoles={[
                          "ROLE_ADMIN",
                          "ROLE_SUPPORT",
                          "ROLE_CUSTOMER"
                      ]}>
                      <Layout>
                          <TrackShipment />
                      </Layout>
                  </PrivateRoute>
              }
          />

          <Route
              path="/manage-users"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_ADMIN"
                          ]}
                      >

                          <Layout>
                              <ManageUsers />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />

          <Route
              path="/admin/drivers"
              element={
                  <PrivateRoute>

                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_ADMIN"
                          ]}
                      >

                          <Layout>
                              <DriverManagement />
                          </Layout>

                      </RoleProtectedRoute>

                  </PrivateRoute>
              }
          />

          <Route
              path="/notifications"
              element={<Notifications />}
          />

          <Route path="/reports" element={<Reports />} />

          <Route
              path="/settings"
              element={<Settings />}
          />

          <Route
              path="/driver"
              element={
                  <PrivateRoute>
                      <RoleProtectedRoute
                          allowedRoles={[
                              "ROLE_DRIVER"
                          ]}
                      >
                          <Layout>
                              <DriverDashboard />
                          </Layout>
                      </RoleProtectedRoute>
                  </PrivateRoute>
              }
          />

          <Route
              path="/pod/:reference"
              element={
                  <PrivateRoute
                      allowedRoles={[
                          "ROLE_ADMIN",
                          "ROLE_SUPPORT",
                          "ROLE_CUSTOMER",
                          "ROLE_DRIVER"
                      ]}>
                      <Layout>
                          <PODPage />
                      </Layout>
                  </PrivateRoute>
              }
          />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
