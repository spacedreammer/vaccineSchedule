import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import UpdateUser from '../components/UpdateUser'; // Re-use the UpdateUser component

const API_BASE_URL = "http://127.0.0.1:8000";

const ManageAllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null); // For edit/delete modal

  // Fetch all users (including service providers)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      // Assuming a route like /api/system-admin/users that returns all users
      const res = await axios.get(`${API_BASE_URL}/api/system-admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load all users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleUserActionSuccess = () => {
    fetchAllUsers(); // Refresh list after update/delete
    setSelectedUserId(null); // Close the modal
  };

  if (loading) return <div className="p-6 text-center">Loading users...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Manage All Users & Service Providers</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
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
                  <td className="py-2 px-4">{user.phone}</td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <UpdateUser
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onUserUpdated={handleUserActionSuccess}
            onUserDeleted={handleUserActionSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default ManageAllUsersPage;