import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import UpdateUser from '../../components/UpdateUser'; // Re-use the UpdateUser component

const API_BASE_URL = "http://localhost:8000/api";

const ManageAllUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // For edit/delete modal

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all users (including service providers)
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Assuming a route like /api/system-admin/users that returns all users
      const res = await axios.get(`${API_BASE_URL}/system-admin/users`, { headers });
      setUsers(res.data);
      toast.success("All users loaded successfully.");
    } catch (err) {
      console.error("Failed to load all users:", err.response?.data || err.message);
      setError("Failed to load all users. Please try again.");
      toast.error("Failed to load all users.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [navigate]);

  const handleUserActionSuccess = () => {
    fetchAllUsers(); // Refresh list after update/delete
    setSelectedUserId(null); // Close the modal
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading users...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Manage All Users & Service Providers</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{user.fname} {user.lname}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'health_officer' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'service_provider' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`
                    }>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-4">{user.phone || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => setSelectedUserId(user.id)}
                      className="text-blue-600 hover:underline mr-2 text-sm"
                    >
                      Edit/Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <UpdateUser
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
              onUserUpdated={handleUserActionSuccess}
              onUserDeleted={handleUserActionSuccess}
            />
            <button
              onClick={() => setSelectedUserId(null)}
              className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAllUsersPage;