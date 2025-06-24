import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ApproveAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]); // State for service providers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState({}); // To store selected provider for each appt

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }

      // 1. Fetch pending appointments
      const appointmentsRes = await axios.get(`${API_BASE_URL}/admin/pending-appointments`, { headers });
      setAppointments(appointmentsRes.data);
      toast.success("Pending appointments loaded.");

      // 2. Fetch list of Service Providers
      // Assuming you have an endpoint like /admin/service-providers or /system-admin/users?role=service_provider
      // For now, let's use /system-admin/users and filter on frontend for simplicity if no specific backend endpoint
      const usersRes = await axios.get(`${API_BASE_URL}/system-admin/users`, { headers });
      const providers = usersRes.data.filter(user => user.role === 'service_provider');
      setServiceProviders(providers);

    } catch (err) {
      console.error("Failed to load initial data:", err.response?.data || err.message);
      setError("Failed to load initial data. Please try again.");
      toast.error("Failed to load initial data.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [navigate]);

  const handleProviderSelect = (appointmentId, providerId) => {
    setSelectedProvider(prev => ({
      ...prev,
      [appointmentId]: providerId,
    }));
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    const providerToAssign = selectedProvider[appointmentId];

    // If approving, and a provider is needed, ensure one is selected
    if (status === 'approved' && !providerToAssign) {
        toast.error("Please select a Service Provider before approving this appointment.");
        return;
    }

    if (!window.confirm(`Are you sure you want to ${status} this appointment?`)) {
      return;
    }
    setLoading(true); // Re-enable loading while updating
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;

      const payload = { status: status };
      if (status === 'approved' && providerToAssign) {
          payload.provider_id = providerToAssign; // Add provider_id to payload for approved status
      } else if (status === 'rejected' || status === 'cancelled') {
          // If rejected or cancelled, ensure provider_id is null in DB
          payload.provider_id = null;
      }

      await axios.put(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, payload, { headers });
      toast.success(`Appointment ${status} successfully!`);
      await fetchInitialData(); // Re-fetch to update list and clear selected provider
      setSelectedProvider(prev => { // Clear selected provider for the updated appointment
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });

    } catch (err) {
      console.error(`Failed to ${status} appointment:`, err.response?.data || err.message);
      setError(`Failed to ${status} appointment: ` + (err.response?.data?.message || err.message));
      toast.error(`Failed to ${status} appointment: ` + (err.response?.data?.message || err.message));
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

  if (loading) return <div className="p-6 text-center text-xl">Loading appointments...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Manage Appointments for Approval</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No pending appointments to review.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Child's Name</th>
                <th className="py-2 px-4 border-b">Vaccine Type</th>
                <th className="py-2 px-4 border-b">Preferred Date</th>
                <th className="py-2 px-4 border-b">Preferred Time</th>
                <th className="py-2 px-4 border-b">Notes</th>
                <th className="py-2 px-4 border-b">Current Status</th>
                <th className="py-2 px-4 border-b">Assign Provider</th> {/* New Column */}
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
                  <td className="py-2 px-4 text-sm max-w-xs truncate">{app.notes || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <select
                      value={selectedProvider[app.id] || ''}
                      onChange={(e) => handleProviderSelect(app.id, e.target.value)}
                      className="border p-1 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={app.status !== 'pending'} // Only allow selection for pending apps
                    >
                      <option value="">Select Provider</option>
                      {serviceProviders.map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.fname} {provider.lname}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'approved')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2 disabled:opacity-50"
                      disabled={loading || app.status !== 'pending'} // Disable if not pending
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'rejected')}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      disabled={loading || app.status !== 'pending'} // Disable if not pending
                    >
                      Reject
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

export default ApproveAppointmentsPage;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = "http://localhost:8000/api";

// const ApproveAppointmentsPage = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getAuthHeader = () => {
//     const token = localStorage.getItem('token');
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   const fetchPendingAppointments = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const headers = getAuthHeader();
//       if (!headers.Authorization) {
//         toast.error("Authentication required. Redirecting to login.");
//         navigate('/login');
//         return;
//       }
//       // Fetch pending appointments
//       const res = await axios.get(`${API_BASE_URL}/admin/pending-appointments`, { headers });
//       setAppointments(res.data);
//       toast.success("Pending appointments loaded.");
//     } catch (err) {
//       console.error("Failed to load appointments for approval:", err.response?.data || err.message);
//       setError("Failed to load appointments for approval. Please try again.");
//       toast.error("Failed to load appointments for approval.", { toastId: "errorAppo" });
//       if (err.response?.status === 401 || err.response?.status === 403) {
//           navigate('/login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingAppointments();
//   }, [navigate]);

//   const updateAppointmentStatus = async (appointmentId, status) => {
//     if (!window.confirm(`Are you sure you want to ${status} this appointment?`)) {
//       return;
//     }
//     setLoading(true); // Re-enable loading while updating
//     setError(null);
//     try {
//       const headers = getAuthHeader();
//       if (!headers.Authorization) return;

//       await axios.put(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, { status }, { headers });
//       toast.success(`Appointment ${status} successfully!`, { toastId: "successAppo" });
//       await fetchPendingAppointments(); // Re-fetch to update list

//     } catch (err) {
//       console.error(`Failed to ${status} appointment:`, err.response?.data || err.message);
//       setError(`Failed to ${status} appointment: ` + (err.response?.data?.message || err.message));
//       toast.error(`Failed to ${status} appointment: ` + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'approved': return 'bg-green-100 text-green-800';
//       case 'rejected': return 'bg-red-100 text-red-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       case 'cancelled': return 'bg-gray-100 text-gray-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) return <div className="p-6 text-center text-xl">Loading appointments...</div>;
//   if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
//       <h2 className="text-2xl font-bold mb-4">Manage Appointments for Approval</h2>
//       {appointments.length === 0 ? (
//         <p className="text-gray-600">No pending appointments to review.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-md">
//             <thead>
//               <tr className="bg-gray-100 text-left text-sm text-gray-600">
//                 <th className="py-2 px-4 border-b">User</th>
//                 <th className="py-2 px-4 border-b">Child's Name</th>
//                 <th className="py-2 px-4 border-b">Vaccine Type</th>
//                 <th className="py-2 px-4 border-b">Preferred Date</th>
//                 <th className="py-2 px-4 border-b">Preferred Time</th>
//                 <th className="py-2 px-4 border-b">Notes</th>
//                 <th className="py-2 px-4 border-b">Status</th>
//                 <th className="py-2 px-4 border-b">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map(app => (
//                 <tr key={app.id} className="border-b hover:bg-gray-50">
//                   {/* Assuming user relationship is eager loaded in backend */}
//                   <td className="py-2 px-4">{app.user ? `${app.user.fname} ${app.user.lname}` : 'N/A'}</td>
//                   <td className="py-2 px-4">{app.child_name || 'N/A'}</td>
//                   <td className="py-2 px-4">{app.vaccine_type || 'N/A'}</td>
//                   <td className="py-2 px-4">{app.preferred_date}</td>
//                   <td className="py-2 px-4">{app.preferred_time.substring(0, 5)}</td>
//                   <td className="py-2 px-4 text-sm max-w-xs truncate">{app.notes || 'N/A'}</td>
//                   <td className="py-2 px-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
//                       {app.status}
//                     </span>
//                   </td>
//                   <td className="py-2 px-4">
//                     <button
//                       onClick={() => updateAppointmentStatus(app.id, 'approved')}
//                       className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2 disabled:opacity-50"
//                       disabled={loading}
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => updateAppointmentStatus(app.id, 'rejected')}
//                       className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
//                       disabled={loading}
//                     >
//                       Reject
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApproveAppointmentsPage;
