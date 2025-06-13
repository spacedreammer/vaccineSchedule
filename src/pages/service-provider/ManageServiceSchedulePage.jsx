import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ManageServiceSchedulePage = () => {
  const navigate = useNavigate();
  const [mySchedule, setMySchedule] = useState([]); // Appointments/tasks assigned to this provider
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchMySchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Fetch appointments assigned to this service provider that are approved/pending
      // Endpoint: /api/provider/my-schedule should return appointments with provider_id == current user's ID
      const res = await axios.get(`${API_BASE_URL}/provider/my-schedule`, { headers });
      setMySchedule(res.data);
      toast.success("Your schedule loaded.");
    } catch (err) {
      console.error("Failed to load your schedule:", err.response?.data || err.message);
      setError("Failed to load your schedule. Please try again.");
      toast.error("Failed to load your schedule.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchedule();
  }, [navigate]);

  const updateAppointmentStatus = async (appointmentId, status) => {
    // This is typically done via "Mark Completed" page. This might be to cancel an assigned slot.
    if (!window.confirm(`Are you sure you want to change status to ${status} for this appointment?`)) return;
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.put(`${API_BASE_URL}/provider/appointments/${appointmentId}/status`, { status }, { headers }); // Re-use /provider/appointments/{id}/status if it exists
      toast.success(`Appointment status updated to ${status}!`);
      await fetchMySchedule(); // Re-fetch to update list
    } catch (err) {
      console.error(`Failed to update appointment status to ${status}:`, err.response?.data || err.message);
      setError(`Failed to update appointment status: ` + (err.response?.data?.message || err.message));
      toast.error(`Failed to update appointment status: ` + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading your schedule...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">My Daily Service Schedule</h2>
      {mySchedule.length === 0 ? (
        <p className="text-gray-600">Your schedule is currently empty. No approved appointments assigned to you.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Appointment ID</th>
                <th className="py-2 px-4 border-b">Patient</th>
                <th className="py-2 px-4 border-b">Child's Name</th>
                <th className="py-2 px-4 border-b">Vaccine Type</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mySchedule.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.user ? `${item.user.fname} ${item.user.lname}` : 'N/A'}</td>
                  <td className="py-2 px-4">{item.child_name || 'N/A'}</td>
                  <td className="py-2 px-4">{item.vaccine_type || 'N/A'}</td>
                  <td className="py-2 px-4">{item.preferred_date}</td>
                  <td className="py-2 px-4">{item.preferred_time.substring(0, 5)}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {/* Example actions: Mark as completed is usually on a different page. */}
                    {/* This button could be for cancelling an assigned slot if your business logic allows. */}
                    {item.status === 'approved' && (
                        <button
                          onClick={() => updateAppointmentStatus(item.id, 'cancelled')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Cancel Appointment
                        </button>
                    )}
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

export default ManageServiceSchedulePage;