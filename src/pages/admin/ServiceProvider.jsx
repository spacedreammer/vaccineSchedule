import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://127.0.0.1:8000";

const ServiceProvider = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedServicesToday: 0,
    upcomingAppointments: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // API call to fetch service provider dashboard statistics
        const res = await axios.get(`${API_BASE_URL}/api/provider/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.response?.data || err.message);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Service Provider Dashboard</h1>

      {loading ? (
        <p>Loading dashboard stats...</p>
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

      {/* Quick Actions / Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Daily Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Review Service Requests</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Mark Service Completed</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Manage My Schedule</button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">View Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProvider;