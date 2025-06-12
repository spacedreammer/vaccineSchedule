import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://127.0.0.1:8000";

const HealthOfficer = () => {
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    totalVaccinations: 0,
    activeSchedules: 0,
    newFeedbacks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Authentication handled by router/middleware

        // API call to fetch dashboard statistics for admin
        const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data); // Assuming data like { pendingAppointments: X, ... }
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading dashboard stats...</p>
      ) : (
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
      )}

      {/* Quick Actions / Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Manage Schedules</button>
          <button className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Review Appointments</button>
          <button className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">Upload Content</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">View Reports</button>
        </div>
      </div>
    </div>
  );
};

export default HealthOfficer;