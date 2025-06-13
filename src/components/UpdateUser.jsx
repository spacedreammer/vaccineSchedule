import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api"; // Ensure this matches your Laravel API base URL

const UpdateUser = ({ userId, onClose, onUserUpdated, onUserDeleted }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '', // For password update
    password_confirmation: '', // For password confirmation
    role: '', // For updating user role
    profile_picture: '', // Assuming URL, if handled
    license_number: '', // If applicable
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button disable

  // Get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login');
          return;
        }
        // Fetch specific user by ID
        const res = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, { headers });
        const userData = res.data;
        setUser(userData);
        // Populate form with existing user data
        setFormData({
          fname: userData.fname || '',
          lname: userData.lname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || '',
          profile_picture: userData.profile_picture || '',
          license_number: userData.license_number || '',
          password: '', // Never pre-fill passwords
          password_confirmation: '',
        });
      } catch (err) {
        console.error("Failed to fetch user data for update:", err.response?.data || err.message);
        setError("Failed to load user data. " + (err.response?.data?.message || err.message));
        toast.error("Failed to load user data.");
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
        onClose(); // Close modal on error
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId, navigate, onClose]); // userId, navigate, onClose are dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;

      const payload = {
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        profile_picture: formData.profile_picture,
        license_number: formData.license_number,
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      await axios.put(`${API_BASE_URL}/auth/updateUser/${userId}`, payload, { headers });
      toast.success("User updated successfully!");
      if (onUserUpdated) {
        onUserUpdated(); // Notify parent to refresh list
      }
    } catch (err) {
      console.error("Failed to update user:", err.response?.data || err.message);
      setError("Update failed: " + (err.response?.data?.message || err.message));
      toast.error("User update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.delete(`${API_BASE_URL}/auth/deleteUser/${userId}`, { headers });
      toast.success("User deleted successfully!");
      if (onUserDeleted) {
        onUserDeleted(); // Notify parent to refresh list
      }
    } catch (err) {
      console.error("Failed to delete user:", err.response?.data || err.message);
      setError("Delete failed: " + (err.response?.data?.message || err.message));
      toast.error("User deletion failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading user details...</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
  if (!user) return <div className="text-center py-4 text-gray-600">User not found.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fname" className="block text-sm font-medium text-gray-700">First Name</label>
        <input type="text" name="fname" id="fname" value={formData.fname} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
      </div>
      <div>
        <label htmlFor="lname" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input type="text" name="lname" id="lname" value={formData.lname} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded bg-gray-100" readOnly /> {/* Email often read-only */}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required>
          <option value="patient">Patient</option>
          <option value="health_officer">Health Officer</option>
          <option value="service_provider">Service Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
        <input type="text" name="profile_picture" id="profile_picture" value={formData.profile_picture} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">License Number</label>
        <input type="text" name="license_number" id="license_number" value={formData.license_number} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" placeholder="Leave blank to keep current" />
      </div>
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
        <input type="password" name="password_confirmation" id="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? 'Deleting...' : 'Delete User'}
        </button>
        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
          Close
        </button>
      </div>
    </form>
  );
};

export default UpdateUser;
