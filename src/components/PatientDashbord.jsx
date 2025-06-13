import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdAccountCircle, MdEventNote, MdHistory, MdLogout } from 'react-icons/md';

const API_BASE_URL = "http://localhost:8000/api"; // Your Laravel API base URL

const PatientDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '',
  });

  const [appointments, setAppointments] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    childName: '', // This is for frontend form input
    vaccineType: '', // This is for frontend form input
    appointmentDate: '', // This is for frontend form input
    appointmentTime: '', // This is for frontend form input
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token'); // Ensure this key is correct ('token' or 'access_token')
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
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

        const response = await axios.get(`${API_BASE_URL}/auth/userProfile`, { headers });
        setUserProfile(response.data);
        setFormData({
          fname: response.data.fname || '',
          lname: response.data.lname || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          password: '',
        });
        setStatusMessage('Profile loaded.');
        setIsError(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsError(true);
        if (error.response && error.response.status === 401) {
          setStatusMessage("Session expired or unauthorized. Please login again.");
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setStatusMessage("Failed to load user profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'myAppointments') {
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

          const response = await axios.get(`${API_BASE_URL}/appointments/my`, { headers });

          // API response is a direct array, so no .data.data needed
          if (Array.isArray(response.data)) {
              setAppointments(response.data); // This is correct
              console.log("Fetched appointments:", response.data); // Debugging line
          } else {
              console.error("Appointments API response was not a direct array:", response.data);
              setAppointments([]);
              setStatusMessage("Received unexpected data format for appointments.");
              setIsError(true);
          }


          setStatusMessage('Appointments loaded.');
          setIsError(false);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setIsError(true);
          if (error.response) {
              setStatusMessage(`Failed to load appointments: ${error.response.status} - ${error.response.data.message || 'Server error'}`);
          } else if (error.request) {
              setStatusMessage("Failed to load appointments: No response from server. Check network or API URL.");
          } else {
              setStatusMessage(`Failed to load appointments: ${error.message}`);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchAppointments();
    }
  }, [activeTab, navigate]);

  const handleProfileFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      const headers = getAuthHeader();
      if (!headers.Authorization || !userProfile || !userProfile.id) {
        setStatusMessage("Authentication error or user ID missing. Redirecting to login...");
        setIsError(true);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const updatePayload = {};
      if (formData.fname) updatePayload.fname = formData.fname;
      if (formData.lname) updatePayload.lname = formData.lname;
      if (formData.email) updatePayload.email = formData.email;
      if (formData.phone) updatePayload.phone = formData.phone;
      if (formData.password) updatePayload.password = formData.password;
      updatePayload.role = userProfile.role; // Keep current role

      const response = await axios.put(`${API_BASE_URL}/auth/updateUser/${userProfile.id}`, updatePayload, { headers });

      setUserProfile(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Assuming Laravel returns 'user' object on update

      setStatusMessage(response.data.message || "Profile updated successfully!");
      setIsError(false);
      setEditMode(false);
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
      } else {
        setStatusMessage(error.response.data.message || "An error occurred during profile update.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFormChange = (e) => {
    setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
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

      // Ensure data sent matches Laravel's expected snake_case if your backend expects it
      // For example, if Laravel expects 'child_name', send:
      const payload = {
          child_name: scheduleForm.childName,
          vaccine_type: scheduleForm.vaccineType,
          appointment_date: scheduleForm.appointmentDate,
          appointment_time: scheduleForm.appointmentTime,
          // Add any other necessary fields like user_id if not handled by backend auth
      };

      const response = await axios.post(`${API_BASE_URL}/appointments/schedule`, payload, { headers });

      setStatusMessage(response.data.message || "Appointment scheduled successfully!");
      setIsError(false);
      setScheduleForm({ childName: '', vaccineType: '', appointmentDate: '', appointmentTime: '' });

      // After successful scheduling, refetch appointments to update the list
      const updatedAppointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/my`, { headers });
      // Ensure this also handles nested data if that's the response type for this endpoint
      setAppointments(Array.isArray(updatedAppointmentsResponse.data) ? updatedAppointmentsResponse.data : updatedAppointmentsResponse.data.data);


    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setIsError(true);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Scheduling failed: \n";
        for (const key in errors) {
          errorMessage += `${errors[key].join(", ")}\n`;
        }
        setStatusMessage(errorMessage);
      } else {
        setStatusMessage(error.response.data.message || "An error occurred during scheduling.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setStatusMessage('');
    setIsError(false);
    try {
      const headers = getAuthHeader();
      if (headers.Authorization) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers });
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setStatusMessage("Logged out successfully. Redirecting...");
      setIsError(false);
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsError(true);
      setStatusMessage("Logout failed, but you have been signed out from the client.");
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setTimeout(() => navigate('/login'), 1000);
    } finally {
      setLoading(false);
    }
  };


  if (loading && !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (!userProfile && !loading && isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-700 text-lg">
        {statusMessage}
      </div>
    );
  }


  return (
    <div className="font-poppins flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="md:w-64 bg-gray-800 text-white p-5 space-y-4 shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Patient Dashboard</h2>
          <nav>
            <ul>
              <li className={`p-3 rounded-md cursor-pointer flex items-center gap-2 ${activeTab === 'profile' ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setActiveTab('profile')}>
                <MdAccountCircle size={20} />
                <span>My Profile</span>
              </li>
              <li className={`p-3 rounded-md cursor-pointer flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setActiveTab('schedule')}>
                <MdEventNote size={20} />
                <span>Schedule Appointment</span>
              </li>
              <li className={`p-3 rounded-md cursor-pointer flex items-center gap-2 ${activeTab === 'myAppointments' ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setActiveTab('myAppointments')}>
                <MdHistory size={20} />
                <span>My Appointments</span>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-3 rounded-md flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <MdLogout size={20} />
            {loading && statusMessage.includes("Logging out") ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'schedule' && 'Schedule New Appointment'}
            {activeTab === 'myAppointments' && 'My Vaccination Appointments'}
          </h1>

          {/* Status Message Display */}
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

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div>
              {userProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name:</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={handleProfileFormChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{userProfile.fname}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name:</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="lname"
                        value={formData.lname}
                        onChange={handleProfileFormChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{userProfile.lname}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileFormChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{userProfile.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileFormChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{userProfile.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                    <p className="text-gray-900 text-lg capitalize">{userProfile.role}</p>
                  </div>

                  {editMode && (
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">New Password (optional):</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleProfileFormChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleProfileUpdate}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            // Reset form data to current profile on cancel
                            setFormData({
                              fname: userProfile.fname || '',
                              lname: userProfile.lname || '',
                              email: userProfile.email || '',
                              phone: userProfile.phone || '',
                              password: '',
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Appointment Section */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleScheduleAppointment} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="childName">
                  Child's Name:
                </label>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  value={scheduleForm.childName}
                  onChange={handleScheduleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vaccineType">
                  Vaccine Type:
                </label>
                <select
                  id="vaccineType"
                  name="vaccineType"
                  value={scheduleForm.vaccineType}
                  onChange={handleScheduleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Vaccine</option>
                  <option value="MMR">MMR</option>
                  <option value="DPT">DPT</option>
                  <option value="Polio">Polio</option>
                  <option value="Hepatitis B">Hepatitis B</option>
                  <option value="Flu">Flu</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointmentDate">
                  Appointment Date:
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={scheduleForm.appointmentDate}
                  onChange={handleScheduleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointmentTime">
                  Appointment Time:
                </label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={scheduleForm.appointmentTime}
                  onChange={handleScheduleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Appointment"}
              </button>
            </form>
          )}

          {/* My Appointments Section */}
          {activeTab === 'myAppointments' && (
            <div className="overflow-x-auto">
              {appointments.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-300 rounded-md">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left text-gray-700">Child's Name</th>
                      <th className="py-2 px-4 border-b text-left text-gray-700">Vaccine Type</th>
                      <th className="py-2 px-4 border-b text-left text-gray-700">Date</th>
                      <th className="py-2 px-4 border-b text-left text-gray-700">Time</th>
                      <th className="py-2 px-4 border-b text-left text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50">
                        {/* FIX IS HERE: Use snake_case property names from API response */}
                        <td className="py-2 px-4 border-b">{appt.child_name}</td>
                        <td className="py-2 px-4 border-b">{appt.vaccine_type}</td>
                        <td className="py-2 px-4 border-b">{appt.appointment_date}</td>
                        <td className="py-2 px-4 border-b">{appt.appointment_time}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            appt.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                            appt.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-600">No appointments scheduled yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;