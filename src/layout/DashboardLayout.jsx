import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdDashboard, MdAccountCircle, MdEventNote, MdHistory, MdFeedback, MdManageAccounts, MdSchedule, MdCheckCircle, MdUploadFile, MdAnalytics, MdCategory, MdLogout, MdSupportAgent, MdViewAgenda } from 'react-icons/md';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8000/api"; // Ensure this matches your Laravel API base URL

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState(''); // To display user's first name
  const [loadingUser, setLoadingUser] = useState(true);

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user profile to display name in header/sidebar
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          // This case should ideally be caught by ProtectedRoute, but a fallback is good
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/auth/userProfile`, { headers });
        setUserFirstName(response.data.fname || 'User');
      } catch (error) {
        console.error("Error fetching user first name for layout:", error);
        // If profile fetch fails, it might mean token expired, force logout
        toast.error("Failed to load user info for dashboard. Please log in again.");
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const headers = getAuthHeader();
      if (headers.Authorization) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers });
      }
      localStorage.clear();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed, but you have been signed out from the client.");
      localStorage.clear();
      navigate('/login');
    }
  };

  // Define sidebar navigation links based on role
  const getNavLinks = (userRole) => {
    switch (userRole) {
      case 'patient':
        return [
          { path: '/patient-dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
          { path: '/patient/profile', icon: <MdAccountCircle size={20} />, label: 'My Profile' },
          { path: '/patient/schedule-appointment', icon: <MdEventNote size={20} />, label: 'Schedule Appointment' },
          { path: '/patient/my-appointments', icon: <MdHistory size={20} />, label: 'My Appointments' },
          { path: '/patient/feedback', icon: <MdFeedback size={20} />, label: 'Submit Feedback' },
        ];
      case 'health_officer':
        return [
          { path: '/ho-dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
          { path: '/ho/manage-schedules', icon: <MdSchedule size={20} />, label: 'Manage Schedules' },
          { path: '/ho/approve-appointments', icon: <MdCheckCircle size={20} />, label: 'Approve Appointments' },
          { path: '/ho/manage-content', icon: <MdUploadFile size={20} />, label: 'Manage Content' },
          { path: '/ho/monitor-trends', icon: <MdAnalytics size={20} />, label: 'Monitor Trends' },
        ];
      case 'service_provider':
        return [
          { path: '/provider-dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
          { path: '/provider/service-requests', icon: <MdViewAgenda size={20} />, label: 'Service Requests' },
          { path: '/provider/manage-schedule', icon: <MdSchedule size={20} />, label: 'My Schedule' },
          { path: '/provider/mark-completed', icon: <MdCheckCircle size={20} />, label: 'Mark Completed' },
          { path: '/provider/view-feedback', icon: <MdFeedback size={20} />, label: 'View Feedback' },
        ];
      case 'admin':
        return [
          { path: '/admin-dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
          { path: '/admin/manage-users', icon: <MdManageAccounts size={20} />, label: 'Manage Users' },
          { path: '/admin/system-analytics', icon: <MdAnalytics size={20} />, label: 'System Analytics' },
          { path: '/admin/manage-categories', icon: <MdCategory size={20} />, label: 'Manage Categories' },
          // Admin can also access HO/Provider dashboards
          { path: '/ho-dashboard', icon: <MdSupportAgent size={20} />, label: 'HO Dashboard (Admin)' },
          { path: '/provider-dashboard', icon: <MdSupportAgent size={20} />, label: 'Provider Dashboard (Admin)' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks(role);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="md:w-64 bg-gray-800 text-white flex flex-col p-5 shadow-lg">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {role ? role.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Dashboard'}
          </h2>
          {loadingUser ? (
            <p className="text-center text-gray-400">Loading user...</p>
          ) : (
            <div className="text-center mb-6">
              <p className="text-lg font-semibold">Welcome, {userFirstName}!</p>
              <p className="text-sm text-gray-400 capitalize">{role}</p>
            </div>
          )}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 p-3 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-3 rounded-md flex items-center justify-center gap-2 hover:bg-red-700 transition duration-200 disabled:opacity-50"
            disabled={loadingUser} // Disable if user data is still loading
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children} {/* This is where the actual page content will be rendered */}
      </main>
    </div>
  );
};

export default DashboardLayout;
