import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ServiceRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchServiceRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Fetch service requests assigned to this provider or pending new ones
      // This endpoint is crucial: It should ideally return requests where provider_id is null OR matches current provider_id AND status is pending
      const res = await axios.get(`${API_BASE_URL}/provider/service-requests`, { headers });
      setRequests(res.data);
      toast.success("Service requests loaded.");
    } catch (err) {
      console.error("Failed to load service requests:", err.response?.data || err.message);
      setError("Failed to load service requests. Please try again.");
      toast.error("Failed to load service requests.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [navigate]);

  const updateRequestStatus = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.put(`${API_BASE_URL}/provider/service-requests/${requestId}/status`, { status }, { headers });
      toast.success(`Request ${status} successfully!`);
      await fetchServiceRequests(); // Re-fetch to update list
    } catch (err) {
      console.error(`Failed to ${status} request:`, err.response?.data || err.message);
      setError(`Failed to ${status} request: ` + (err.response?.data?.message || err.message));
      toast.error(`Failed to ${status} request: ` + (err.response?.data?.message || err.message));
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


  if (loading) return <div className="p-6 text-center text-xl">Loading service requests...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Service Requests (Pending Assignment/Review)</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600">No new service requests to review or accept.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Child's Name</th>
                <th className="py-2 px-4 border-b">Vaccine Type</th>
                <th className="py-2 px-4 border-b">Req. Date/Time</th>
                <th className="py-2 px-4 border-b">Notes</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{req.user ? `${req.user.fname} ${req.user.lname}` : 'N/A'}</td>
                  <td className="py-2 px-4">{req.child_name || 'N/A'}</td>
                  <td className="py-2 px-4">{req.vaccine_type || 'N/A'}</td>
                  <td className="py-2 px-4">{req.preferred_date} @ {req.preferred_time.substring(0, 5)}</td>
                  <td className="py-2 px-4 text-sm max-w-xs truncate">{req.notes || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {/* Only show Accept/Decline if status is 'pending' AND provider_id is null or matches current provider */}
                    {req.status === 'pending' && (!req.provider_id || req.provider_id === JSON.parse(localStorage.getItem('user'))?.id) && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'approved')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2 disabled:opacity-50"
                          disabled={loading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'rejected')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && req.provider_id === JSON.parse(localStorage.getItem('user'))?.id && (
                        <span className="text-green-600 font-medium">Assigned</span>
                    )}
                    {req.status === 'rejected' && (
                        <span className="text-red-600 font-medium">Declined</span>
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

export default ServiceRequestsPage;