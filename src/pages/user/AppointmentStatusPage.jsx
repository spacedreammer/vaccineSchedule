import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api"; // IMPORTANT: Match your Laravel API base URL

const AppointmentStatusPage = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // Ensure this key is consistent
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user's appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setStatusMessage('');
      setIsError(false);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          setStatusMessage("You are not logged in. Redirecting to login...");
          setIsError(true);
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        // API call to fetch user's appointments
        // The endpoint should return a direct array of appointments (as per your Postman data)
        const response = await axios.get(`${API_BASE_URL}/user/my-appointments`, { headers });

        // Ensure the response data is an array before setting state
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
          setStatusMessage('Appointments loaded successfully.');
          toast.success("Appointments loaded!", { toastId: "successAppo" });
        } else {
          console.error("Appointments API response was not a direct array:", response.data);
          setAppointments([]);
          setStatusMessage("Received unexpected data format for appointments.");
          setIsError(true);
          toast.error("Failed to load appointments due to data format issue." , { toastId: "errorAppo" });
        }

      } catch (error) {
        console.error("Error fetching appointments:", error.response?.data || error.message);
        setIsError(true);
        if (error.response && error.response.status === 401) {
          setStatusMessage("Session expired or unauthorized. Please login again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setStatusMessage(error.response?.data?.message || "Failed to load appointments. Please try again.");
          toast.error(error.response?.data?.message || "Failed to load appointments.", { toastId: "errorAppo" });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [navigate]); // navigate is a dependency

  // Helper function to determine status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) { // Use toLowerCase for robustness
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6 text-center">Loading appointments...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">My Appointment Status</h2>

      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-md text-center ${
            isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {statusMessage}
        </div>
      )}

      {appointments.length === 0 ? (
        <p className="text-gray-600">You have no scheduled appointments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Child's Name</th>
                <th className="py-2 px-4 border-b">Vaccine Type</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Notes</th> {/* Added Notes column */}
                <th className="py-2 px-4 border-b">Provider</th> {/* Added Provider column */}
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{appt.child_name || 'N/A'}</td> {/* Using snake_case */}
                  <td className="py-2 px-4">{appt.vaccine_type || 'N/A'}</td> {/* Using snake_case */}
                  <td className="py-2 px-4">{appt.preferred_date || 'N/A'}</td> {/* Using snake_case */}
                  <td className="py-2 px-4">{appt.preferred_time || 'N/A'}</td> {/* Using snake_case */}
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm max-w-xs truncate">{appt.notes || 'N/A'}</td> {/* Display notes */}
                  {/* Assuming 'provider' relationship is eager loaded and has a 'fname'/'lname' */}
                  <td className="py-2 px-4">{appt.provider ? `${appt.provider.fname} ${appt.provider.lname}` : 'Not Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusPage;