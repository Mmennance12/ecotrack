import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* =======================
   Auth Pages
======================= */
import Register from "./pages/Register";
import Login from "./pages/Login";

/* =======================
   Landing
======================= */
import LandingPage from "./pages/LandingPage";

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

/* =======================
   Recycler
======================= */
import RecyclerLayout from "./layouts/RecyclerLayout";
import RecyclerDashboard from "./pages/recycler/Dashboard";
import AssignedPickups from "./pages/recycler/AssignedPickups";
import PickupDetails from "./pages/recycler/PickupDetails";
import RecyclerMapView from "./pages/recycler/MapView";
import RecyclerProfile from "./pages/recycler/Profile";
import AvailablePickups from "./pages/recycler/AvailablePickups";

/* =======================
   🔒 ROLE GUARD (IMPORTANT)
======================= */
function RequireSupervisor({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "supervisor") {
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
        <Route path="/" element={<LandingPage />} />

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
          <Route path="assigned-pickups" element={<AssignedPickups />} />
          <Route path="available-pickups" element={<AvailablePickups />} />
          <Route path="pickup/:id" element={<PickupDetails />} />
          <Route path="map-view" element={<RecyclerMapView />} />
          <Route path="profile" element={<RecyclerProfile />} />
        </Route>

        {/* =======================
            🔥 Supervisor (PROTECTED)
        ======================= */}
        <Route
          path="/supervisor"
          element={
            <RequireSupervisor>
              <SupervisorDashboard />
            </RequireSupervisor>
          }
        />
      </Routes>
    </>
  );
}

export default App;