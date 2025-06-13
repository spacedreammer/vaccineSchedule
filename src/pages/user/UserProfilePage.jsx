import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const API_BASE_URL = "http://localhost:8000/api"; // IMPORTANT: Ensure this matches your Laravel API base URL

const UserProfilePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [profile, setProfile] = useState({
    id: null, // User ID, fetched from backend
    fname: '',
    lname: '',
    email: '',
    phone: '',
    // profile_picture: '', // If you add this field to User model and migration
    // bio: '',             // If you add this field
    role: '',            // Will be populated from fetched data
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // For user feedback
  const [isError, setIsError] = useState(false); // To style status message

  // Helper to get auth header
  const getAuthHeader = () => {
    // IMPORTANT: Ensure this key matches what you store during login (e.g., 'token' or 'access_token')
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
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

        // Use the userProfile endpoint, which gets the profile of the authenticated user
        const res = await axios.get(`${API_BASE_URL}/auth/userProfile`, { headers });

        // Assuming res.data directly contains the user profile fields:
        const userData = res.data;
        setProfile(userData);

        // Populate form for editing (password is not fetched)
        setForm({
          fname: userData.fname || '',
          lname: userData.lname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '', // Password is not fetched and should not be pre-filled
        });
        setStatusMessage('Profile loaded.');
        toast.success("Profile loaded successfully!"); // Use toast for notifications

      } catch (err) {
        console.error("Error fetching user profile:", err.response?.data || err.message);
        setIsError(true);
        if (err.response && err.response.status === 401) {
          setStatusMessage("Session expired or unauthorized. Please login again.");
          localStorage.removeItem('token'); // Clear invalid token
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setStatusMessage("Failed to load user profile.");
          toast.error("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // No dependencies here because it runs once on mount for the currently logged-in user
  }, [navigate]); // navigate is a stable function, but good to include for ESLint

  // State for the form inputs when in edit mode
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '', // For password update
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      const headers = getAuthHeader();
      if (!headers.Authorization || !profile.id) { // Use profile.id, not userProfile.id
        setStatusMessage("Authentication error or user ID missing. Redirecting to login...");
        setIsError(true);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const updatePayload = {
          fname: form.fname,
          lname: form.lname,
          email: form.email,
          phone: form.phone,
      };
      if (form.password) { // Only send password if it's not empty
          updatePayload.password = form.password;
          updatePayload.password_confirmation = form.password; // Laravel's 'confirmed' rule
      }
      // Keep current role if not explicitly changing
      updatePayload.role = profile.role;


      // Use profile.id for the PUT request
      const response = await axios.put(`${API_BASE_URL}/auth/updateUser/${profile.id}`, updatePayload, { headers });

      // Update the main profile state with the fresh user data from response
      setProfile(response.data.user); // Assuming Laravel returns 'user' object on update
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Update local storage

      setStatusMessage(response.data.message || "Profile updated successfully!");
      setIsError(false);
      toast.success("Profile updated successfully!");
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      setIsError(true);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Profile update failed: \n";
        for (const key in errors) {
          errorMessage += `${errors[key].join(", ")}\n`;
        }
        setStatusMessage(errorMessage);
        toast.error(errorMessage);
      } else {
        setStatusMessage(error.response.data.message || "An error occurred during profile update.");
        toast.error(error.response?.data?.message || "An error occurred during profile update.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;

  if (!profile.id && !loading) { // If profile failed to load or user isn't logged in
    return (
      <div className="p-6 text-center text-red-600">
        {statusMessage || "Could not load profile. Please ensure you are logged in."}
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
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

      {!isEditing ? (
        // View Mode
        <div>
          {/* You might add profile picture here if you implement it */}
          {/* <img src={profile.profile_picture || "https://via.placeholder.com/100"} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4" /> */}
          <div className="mb-4 space-y-2">
            <p className="text-lg"><span className="font-semibold">Name:</span> {profile.fname} {profile.lname}</p>
            <p className="text-lg"><span className="font-semibold">Email:</span> {profile.email}</p>
            <p className="text-lg"><span className="font-semibold">Phone:</span> {profile.phone || 'N/A'}</p>
            <p className="text-lg"><span className="font-semibold">Role:</span> {profile.role || 'N/A'}</p>
            {profile.license_number && <p className="text-lg"><span className="font-semibold">License No:</span> {profile.license_number}</p>}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            name="fname"
            placeholder="First Name"
            value={form.fname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            name="lname"
            placeholder="Last Name"
            value={form.lname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
            readOnly // Email often not editable directly once registered
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {/* New Password field (optional) */}
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {/* Confirm Password field, if you implement Laravel's 'confirmed' rule */}
          {/* <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm New Password"
            value={form.password_confirmation} // Assuming you add this to form state
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          /> */}
          {/* If you allow role change for admin or specific users */}
          {/* <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="patient">Patient</option>
            <option value="health_officer">Health Officer</option>
            <option value="service_provider">Service Provider</option>
            <option value="admin">Admin</option>
          </select> */}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form data to current profile on cancel
                setForm({
                  fname: profile.fname || '',
                  lname: profile.lname || '',
                  email: profile.email || '',
                  phone: profile.phone || '',
                  password: '',
                });
                setStatusMessage(''); // Clear any messages on cancel
                setIsError(false);
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfilePage;