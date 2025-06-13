import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Consider using a charting library like Recharts for real graphs:
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = "http://localhost:8000/api";

const MonitorTrendsPage = () => {
  const navigate = useNavigate();
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login');
          return;
        }
        // API call to fetch trend data
        // This endpoint can be shared with System Admin as it's general analytics
        const res = await axios.get(`${API_BASE_URL}/admin/monitor-trends`, { headers });
        setTrendsData(res.data); // Assuming data like { vaccinationsByMonth: [...], appointmentStatusCounts: {...} }
        toast.success("Analytics loaded successfully.");
      } catch (err) {
        console.error("Failed to fetch trends data:", err.response?.data || err.message);
        setError("Failed to load analytics data. Please try again.");
        toast.error("Failed to load analytics data.");
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-xl">Loading analytics...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;
  if (!trendsData) return <div className="p-6 text-center text-gray-600 text-xl">No analytics data available.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Vaccination Trends & Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Chart Placeholder: Vaccinations by Month */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Vaccinations Over Time</h3>
          {/* Implement with Recharts or similar library */}
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            [Chart Placeholder: Vaccinations by Month]
            <br />
            (Data: {trendsData.vaccinationsByMonth?.length || 0} months)
          </div>
          <p className="text-sm text-gray-600 mt-2">Shows vaccination count per month.</p>
        </div>

        {/* Example Chart Placeholder: Appointment Status Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Appointment Status Breakdown</h3>
          {/* Implement with Recharts or similar library */}
          <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            [Chart Placeholder: Appointment Status]
            <br />
            (Data: {Object.keys(trendsData.appointmentStatusCounts || {}).length} statuses)
          </div>
          <p className="text-sm text-gray-600 mt-2">Distribution of pending, approved, rejected, completed appointments.</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold mb-3">Key Service Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-gray-700">Total appointments recorded: <span className="font-semibold">{trendsData.totalAppointments}</span></p>
          <p className="text-gray-700">Overall completion rate: <span className="font-semibold">{trendsData.completionRate}%</span></p>
          <p className="text-gray-700">Average time to approve appointment: <span className="font-semibold">{trendsData.avgApprovalTime || 'N/A'}</span></p>
          <p className="text-gray-700">Total content items: <span className="font-semibold">{trendsData.totalContentItems}</span></p>
        </div>
      </div>
    </div>
  );
};

export default MonitorTrendsPage;