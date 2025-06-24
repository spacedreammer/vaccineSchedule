import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

const SystemAdmin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalAppointments: 0,
    activeServiceCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // API call to fetch system admin dashboard statistics
        const res = await axios.get(
          `${API_BASE_URL}/api/system-admin/dashboard-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
      } catch (err) {
        console.error(
          "Failed to fetch dashboard stats:",
          err.response?.data || err.message
        );
        toast.error("Failed to load dashboard statistics.", { toastId: "errorDash" });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Admin Dashboard</h1>

      {loading ? (
        <p>Loading dashboard stats...</p>
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
              <p className="text-2xl font-bold">
                {stats.totalServiceProviders}
              </p>
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
              <p className="text-2xl font-bold">
                {stats.activeServiceCategories}
              </p>
            </div>
            <span className="text-yellow-500 text-3xl">📋</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">System Management Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         

          <Link to={'#'}>
           
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage All Users
          </button>
         </Link>

          <Link to={'/sysemAnalytic'}>
           
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              View System Analytics
            </button>
          </Link>

          <Link to={"/manageService"}>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Manage Service Categories
          </button>
          </Link>


          <Link to={"#"}>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Audit Logs (Future)
          </button>
          </Link>
        
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
