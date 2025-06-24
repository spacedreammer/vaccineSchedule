import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// Import charting libraries here if used, e.g., Recharts
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = "http://127.0.0.1:8000";

const SystemAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // API call to fetch comprehensive system analytics
        const res = await axios.get(`${API_BASE_URL}/api/system-admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyticsData(res.data); // Assuming data like { userGrowth: [...], serviceUsage: [...] }
      } catch (err) {
        console.error("Failed to fetch analytics data:", err.response?.data || err.message);
        toast.error("Failed to load system analytics.", { toastId: "errorAnalytic" });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading analytics...</div>;
  if (!analyticsData) return <div className="p-6 text-center text-gray-600">No analytics data available.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">System Analytics Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Chart Placeholder: User Registration Growth */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">User Registration Growth</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
            [Chart Placeholder: User Registrations Over Time]
          </div>
          <p className="text-sm text-gray-600 mt-2">Monthly new user registrations across all roles.</p>
        </div>

        {/* Example Chart Placeholder: Service Usage by Category */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Service Usage Breakdown</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
            [Chart Placeholder: Service Usage by Category]
          </div>
          <p className="text-sm text-gray-600 mt-2">Distribution of appointments across different service types.</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-3">Key Performance Indicators</h3>
        <p className="text-gray-600">Total active users: {analyticsData.totalActiveUsers}</p>
        <p className="text-gray-600">Completion rate: {analyticsData.completionRate}%</p>
        {/* More KPIs can be displayed here */}
      </div>
    </div>
  );
};

export default SystemAnalyticsPage;