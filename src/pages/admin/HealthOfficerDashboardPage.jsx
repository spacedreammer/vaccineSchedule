// src/pages/admin/HealthOfficerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api"; // Ensure this matches your Laravel API base URL

const HealthOfficerDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingAppointments: 0,
    totalVaccinations: 0,
    activeSchedules: 0,
    newFeedbacks: 0,
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
      setError(null); // Clear previous errors
      try {
        const headers = getAuthHeader(); // <--- Correctly get headers here
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login'); // Redirect if no token
          setLoading(false);
          return;
        }

        // API call to fetch dashboard statistics for health officer/admin
        const res = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
          headers: headers, // <--- Use the 'headers' object
        });
        setStats(res.data);
        toast.success("Health Officer dashboard loaded!"); // Specific success message
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.response?.data || err.message);
        setError("Failed to load dashboard statistics. Please try again."); // Set specific error message
        toast.error("Failed to load dashboard statistics.");
        // More robust error handling for unauthorized access
        if (err.response?.status === 401 || err.response?.status === 403) {
            toast.error("Unauthorized access. Please log in with appropriate role.");
            localStorage.removeItem('token'); // Clear invalid token
            localStorage.removeItem('user');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [navigate]); // Add navigate to dependencies array

  if (loading) return <div className="p-6 text-center text-xl">Loading dashboard stats...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Health Officer Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Pending Appointments</p>
            <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
          </div>
          <span className="text-blue-500 text-3xl">🗓️</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Vaccinations</p>
            <p className="text-2xl font-bold">{stats.totalVaccinations}</p>
          </div>
          <span className="text-green-500 text-3xl">💉</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Active Schedules</p>
            <p className="text-2xl font-bold">{stats.activeSchedules}</p>
          </div>
          <span className="text-purple-500 text-3xl">⏰</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">New Feedbacks</p>
            <p className="text-2xl font-bold">{stats.newFeedbacks}</p>
          </div>
          <span className="text-yellow-500 text-3xl">⭐</span>
        </div>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => navigate('/ho/manage-schedules')} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-200">Manage Schedules</button>
          <button onClick={() => navigate('/ho/approve-appointments')} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition duration-200">Review Appointments</button>
          <button onClick={() => navigate('/ho/manage-content')} className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition duration-200">Upload Content</button>
          <button onClick={() => navigate('/ho/monitor-trends')} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition duration-200">View Reports</button>
        </div>
      </div>
    </div>
  );
};

export default HealthOfficerDashboardPage;
