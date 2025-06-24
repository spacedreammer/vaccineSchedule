import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// =========================================================
// 1. Core Auth Pages
// =========================================================
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage"; // A simple page for unauthorized access

// =========================================================
// 2. Layouts
// =========================================================
import DashboardLayout from "./layout/DashboardLayout";

// =========================================================
// 3. User/Patient Module Pages
// =========================================================
import UserProfilePage from "./pages/user/UserProfilePage";
import ScheduleAppointmentPage from "./pages/user/ScheduleAppointmentPage";
import AppointmentStatusPage from "./pages/user/AppointmentStatusPage";
import FeedbackPage from "./pages/user/FeedbackPage";

// =========================================================
// 4. Admin/Health Officer Module Pages
// =========================================================
// Note: These might be health officer specific, but 'admin' role can also access them
import HealthOfficerDashboardPage from "./pages/admin/HealthOfficerDashboardPage";
import ManageSchedulesPage from "./pages/admin/ManageSchedulesPage";
import ApproveAppointmentsPage from "./pages/admin/ApproveAppointmentsPage";
import ManageContentPage from "./pages/admin/ManageContentPage";
import MonitorTrendsPage from "./pages/admin/MonitorTrendsPage";

// =========================================================
// 5. Service Provider Module Pages
// =========================================================
import ServiceProviderDashboardPage from "./pages/service-provider/ServiceProviderDashboardPage";
import ServiceRequestsPage from "./pages/service-provider/ServiceRequestsPage";
import ManageServiceSchedulePage from "./pages/service-provider/ManageServiceSchedulePage";
import MarkCompletedPage from "./pages/service-provider/MarkCompletedPage";
import ViewFeedbackPage from "./pages/service-provider/ViewFeedbackPage";

// =========================================================
// 6. System Admin Module Pages
// =========================================================
import SystemAdminDashboardPage from "./pages/system-admin/SystemAdminDashboardPage";
import ManageAllUsersPage from "./pages/system-admin/ManageAllUsersPage";
import SystemAnalyticsPage from "./pages/system-admin/SystemAnalyticsPage";
import ManageServiceCategoriesPage from "./pages/system-admin/ManageServiceCategoriesPage";
import HomePage from "./pages/HomePage";

// =========================================================
// 7. Reusable Components (if they are routed directly)
// =========================================================
// import UpdateUser from './components/UpdateUser'; // UpdateUser is likely used as a modal in ManageAllUsersPage, not a direct route

// =========================================================
// ProtectedRoute Component for Authentication & Authorization
// =========================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token"); // Ensure this key matches your login component
  const userString = localStorage.getItem("user"); // User object stored as string

  if (!token || !userString) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    console.error("Failed to parse user data from localStorage:", e);
    // Invalid user data, clear and redirect to login
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const userRole = user ? user.role : null;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Authenticated, but unauthorized role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// =========================================================
// Main App Component
// =========================================================
const App = () => {
  return (
    <Router>
      {/* Toast container for react-toastify notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />{" "}
        {/* Default route */}
        {/* ========================================================= */}
        {/* Protected Routes for each Module/Role */}
        {/* ========================================================= */}
        {/* User (Patient) Module Routes */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient">
                {" "}
                {/* Pass role to layout for sidebar/header logic */}
                <UserProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile" // A dedicated profile page path
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient">
                <UserProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/schedule-appointment"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient">
                <ScheduleAppointmentPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient">
                <AppointmentStatusPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/feedback"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient">
                <FeedbackPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Admin/Health Officer Module Routes */}
        {/* Both 'admin' and 'health_officer' can access these */}
        <Route
          path="/ho-dashboard"
          element={
            <ProtectedRoute allowedRoles={["health_officer", "admin"]}>
              <DashboardLayout role="health_officer">
                <HealthOfficerDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ho/manage-schedules"
          element={
            <ProtectedRoute allowedRoles={["health_officer", "admin"]}>
              <DashboardLayout role="health_officer">
                <ManageSchedulesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ho/approve-appointments"
          element={
            <ProtectedRoute allowedRoles={["health_officer", "admin"]}>
              <DashboardLayout role="health_officer">
                <ApproveAppointmentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ho/manage-content"
          element={
            <ProtectedRoute allowedRoles={["health_officer", "admin"]}>
              <DashboardLayout role="health_officer">
                <ManageContentPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ho/monitor-trends"
          element={
            <ProtectedRoute allowedRoles={["health_officer", "admin"]}>
              <DashboardLayout role="health_officer">
                <MonitorTrendsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Service Provider Module Routes */}
        {/* Both 'service_provider' and 'admin' can access these */}
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <DashboardLayout role="service_provider">
                <ServiceProviderDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/service-requests"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <DashboardLayout role="service_provider">
                <ServiceRequestsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/manage-schedule"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <DashboardLayout role="service_provider">
                <ManageServiceSchedulePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/mark-completed"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <DashboardLayout role="service_provider">
                <MarkCompletedPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/view-feedback"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <DashboardLayout role="service_provider">
                <ViewFeedbackPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* System Admin Module Routes */}
        {/* Only 'admin' role can access these */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <SystemAdminDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <ManageAllUsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <SystemAnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <ManageServiceCategoriesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Fallback route for unmatched paths - can redirect to dashboard based on role or login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
