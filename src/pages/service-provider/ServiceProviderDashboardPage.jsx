import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ServiceProviderDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedServicesToday: 0,
    upcomingAppointments: 0,
    averageRating: 0,
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
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login');
          return;
        }
        // API call to fetch service provider dashboard statistics
        const res = await axios.get(`${API_BASE_URL}/provider/dashboard-stats`, { headers });
        setStats(res.data);
        toast.success("Service Provider dashboard loaded!");
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.response?.data || err.message);
        setError("Failed to load dashboard statistics. Please try again.");
        toast.error("Failed to load dashboard statistics.");
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
      <h1 className="text-3xl font-bold mb-6">Service Provider Dashboard</h1>

      {loading ? (
        <p className="text-center text-xl">Loading dashboard stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
            <span className="text-blue-500 text-3xl">📥</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold">{stats.completedServicesToday}</p>
            </div>
            <span className="text-green-500 text-3xl">✅</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Upcoming Appointments</p>
              <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
            </div>
            <span className="text-purple-500 text-3xl">🔜</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}</p>
            </div>
            <span className="text-yellow-500 text-3xl">🌟</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Daily Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => navigate('/provider/service-requests')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200">Review Service Requests</button>
          <button onClick={() => navigate('/provider/mark-completed')} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-200">Mark Service Completed</button>
          <button onClick={() => navigate('/provider/manage-schedule')} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-200">Manage My Schedule</button>
          <button onClick={() => navigate('/provider/view-feedback')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200">View Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboardPage;