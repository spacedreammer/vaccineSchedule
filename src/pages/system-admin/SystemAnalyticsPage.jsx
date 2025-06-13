import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Consider using a charting library like Recharts for real graphs:
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = "http://localhost:8000/api";

const SystemAnalyticsPage = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login');
          return;
        }
        // API call to fetch comprehensive system analytics
        const res = await axios.get(`${API_BASE_URL}/system-admin/analytics`, { headers });
        setAnalyticsData(res.data);
        toast.success("System analytics loaded successfully.");
      } catch (err) {
        console.error("Failed to fetch analytics data:", err.response?.data || err.message);
        setError("Failed to load system analytics. Please try again.");
        toast.error("Failed to load system analytics.");
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-xl">Loading system analytics...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;
  if (!analyticsData) return <div className="p-6 text-center text-gray-600 text-xl">No analytics data available.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Comprehensive System Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Chart Placeholder: User Registration Growth */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">User Registration Growth</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            [Chart Placeholder: User Registrations Over Time]
            <br />
            (Data: {analyticsData.userGrowth?.length || 0} data points)
          </div>
          <p className="text-sm text-gray-600 mt-2">Monthly new user registrations across all roles.</p>
        </div>

        {/* Example Chart Placeholder: Service Usage by Category */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Service Usage Breakdown</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            [Chart Placeholder: Service Usage by Category]
            <br />
            (Data: {Object.keys(analyticsData.serviceUsage || {}).length} categories)
          </div>
          <p className="text-sm text-gray-600 mt-2">Distribution of appointments across different service types.</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold mb-3">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-gray-700">Total active users: <span className="font-semibold">{analyticsData.totalActiveUsers || 'N/A'}</span></p>
          <p className="text-gray-700">Overall service completion rate: <span className="font-semibold">{analyticsData.overallCompletionRate || 'N/A'}%</span></p>
          <p className="text-gray-700">Average feedback rating: <span className="font-semibold">{analyticsData.averageFeedbackRating || 'N/A'} ★</span></p>
          <p className="text-gray-700">Average content views per month: <span className="font-semibold">{analyticsData.avgContentViews || 'N/A'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsPage;