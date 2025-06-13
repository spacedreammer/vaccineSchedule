import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const MarkCompletedPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]); // Appointments pending completion
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAppointmentsReadyToComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Fetch approved/upcoming appointments assigned to this provider, ready to be marked as completed
      const res = await axios.get(`${API_BASE_URL}/provider/appointments-ready-to-complete`, { headers });
      setAppointments(res.data);
      toast.success("Appointments ready for completion loaded.");
    } catch (err) {
      console.error("Failed to load appointments for completion:", err.response?.data || err.message);
      setError("Failed to load appointments for completion. Please try again.");
      toast.error("Failed to load appointments for completion.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsReadyToComplete();
  }, [navigate]);

  const markAsCompleted = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to mark this service as completed? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.put(`${API_BASE_URL}/provider/appointments/${appointmentId}/complete`, {}, { headers });
      toast.success("Service marked as completed!");
      await fetchAppointmentsReadyToComplete(); // Re-fetch to update list
    } catch (err) {
      console.error("Failed to mark service as completed:", err.response?.data || err.message);
      setError("Failed to mark service as completed: " + (err.response?.data?.message || err.message));
      toast.error("Failed to mark service as completed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading appointments...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Mark Services as Completed</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments ready to be marked as completed.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Patient</th>
                <th className="py-2 px-4 border-b">Child's Name</th>
                <th className="py-2 px-4 border-b">Vaccine Type</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{app.user ? `${app.user.fname} ${app.user.lname}` : 'N/A'}</td>
                  <td className="py-2 px-4">{app.child_name || 'N/A'}</td>
                  <td className="py-2 px-4">{app.vaccine_type || 'N/A'}</td>
                  <td className="py-2 px-4">{app.preferred_date}</td>
                  <td className="py-2 px-4">{app.preferred_time.substring(0, 5)}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => markAsCompleted(app.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      disabled={loading}
                    >
                      Mark Completed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarkCompletedPage;