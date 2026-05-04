import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* =======================
   Auth Pages
======================= */
import Register from "./pages/Register";
import Login from "./pages/Login";

/* =======================
  Home
======================= */
import HomePage from "./pages/HomePage";

/* =======================
   Citizen
======================= */
import CitizenLayout from "./layouts/CitizenLayout.jsx";
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyReports from "./pages/citizen/MyReports";
import RecyclingCenters from "./pages/citizen/RecyclingCenters";
import Profile from "./pages/citizen/Profile";
import MapView from "./pages/citizen/MapView";
import ReportDetails from "./pages/citizen/ReportDetails";
import EditProfile from "./pages/citizen/EditProfile";

/* =======================
   Supervisor
======================= */
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorReports from "./pages/supervisor/Reports";
import SupervisorDrivers from "./pages/supervisor/Drivers";
import ReportDetail from "./pages/supervisor/ReportDetail";

/* =======================
   Recycler
======================= */
import RecyclerLayout from "./layouts/RecyclerLayout";
import RecyclerDashboard from "./pages/recycler/Dashboard";
import Pickups from "./pages/recycler/Pickups";
import PickupDetails from "./pages/recycler/PickupDetails";
import RecyclerProfile from "./pages/recycler/Profile";

/* =======================
  Driver
======================= */
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverHistory from "./pages/driver/History";
import DriverProfile from "./pages/driver/Profile";

/* =======================
   🔒 ROLE GUARD (IMPORTANT)
======================= */
function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <>
      {/* 🔥 GLOBAL TOAST SYSTEM */}
      <Toaster position="top-right" />

      <Routes>
        {/* =======================
            Landing Page
        ======================= */}
        <Route path="/" element={<HomePage />} />

        {/* =======================
            Auth
        ======================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =======================
            Citizen Routes
        ======================= */}
        <Route element={<CitizenLayout />}>
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/recycling-centers" element={<RecyclingCenters />} />
          <Route path="/map-view" element={<MapView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>

        {/* =======================
            Recycler Routes
        ======================= */}
        <Route path="/recycler" element={<RecyclerLayout />}>
          <Route path="dashboard" element={<RecyclerDashboard />} />
          <Route path="pickups" element={<Pickups />} />
          <Route path="pickup/:id" element={<PickupDetails />} />
          <Route path="profile" element={<RecyclerProfile />} />
        </Route>

        <Route
          path="/recycler-dashboard"
          element={
            <ProtectedRoute role="recycler">
              <RecyclerDashboard />
            </ProtectedRoute>
          }
        />

        {/* =======================
            Driver Routes
        ======================= */}
        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute role="driver">
              <Navigate to="/driver" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="history" element={<DriverHistory />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>

        <Route
          path="/driver/tasks"
          element={<Navigate to="/driver" replace />}
        />

        {/* =======================
            🔥 Supervisor (PROTECTED)
        ======================= */}
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute role="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/reports"
          element={
            <ProtectedRoute role="supervisor">
              <SupervisorReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/drivers"
          element={
            <ProtectedRoute role="supervisor">
              <SupervisorDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/reports/:id"
          element={
            <ProtectedRoute role="supervisor">
              <ReportDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;