import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const SystemAdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalAppointments: 0,
    activeServiceCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.", { toastId: "errorAuthReq" });
          navigate('/login');
          return;
        }
        // API call to fetch system admin dashboard statistics
        const res = await axios.get(`${API_BASE_URL}/system-admin/dashboard-stats`, { headers });
        setStats(res.data);
        toast.success("System Admin dashboard loaded!", { toastId: "success" });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.response?.data || err.message);
        setError("Failed to load dashboard statistics. Please try again.");
        toast.error("Failed to load dashboard statistics.", { toastId: "erroDash" });
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Administrator Dashboard</h1>

      {loading ? (
        <p className="text-center text-xl">Loading dashboard stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <span className="text-blue-500 text-3xl">👥</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Providers</p>
              <p className="text-2xl font-bold">{stats.totalServiceProviders}</p>
            </div>
            <span className="text-green-500 text-3xl">👩‍⚕️</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Appointments</p>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            </div>
            <span className="text-purple-500 text-3xl">📅</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Categories</p>
              <p className="text-2xl font-bold">{stats.activeServiceCategories}</p>
            </div>
            <span className="text-yellow-500 text-3xl">📋</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4">System Management Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => navigate('/admin/manage-users')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200">Manage All Users</button>
          <button onClick={() => navigate('/admin/system-analytics')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200">View System Analytics</button>
          <button onClick={() => navigate('/admin/manage-categories')} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-200">Manage Service Categories</button>
          <button onClick={() => toast.info("Audit logs feature coming soon!")} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200">Audit Logs (Future)</button>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminDashboardPage;