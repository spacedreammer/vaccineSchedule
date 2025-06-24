import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api"; // IMPORTANT: Match your Laravel API base URL

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();

  const [appointmentForm, setAppointmentForm] = useState({
    child_name: '',       
    vaccine_type: '',     
    preferred_date: '',   
    preferred_time: '',  
    notes: '',
    schedule_id: '',      
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [availableVaccineTypes, setAvailableVaccineTypes] = useState([]); // To fetch and list available vaccines
  const [availableSchedules, setAvailableSchedules] = useState([]); // To fetch and list available schedules

  // Helper to get auth header (token)
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Effect to fetch available vaccine types and schedules
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeader(); // Get headers for authenticated calls

        // --- Fetch Vaccine Categories (Public Endpoint) ---
        // This endpoint should be accessible without authentication
        const vaccineCategoriesRes = await axios.get(`${API_BASE_URL}/vaccine-categories`);
        setAvailableVaccineTypes(vaccineCategoriesRes.data);
        // --- End Fetch Vaccine Categories ---

        // --- Fetch Available Schedules (Requires Authentication) ---
        // This endpoint needs an authenticated user.
        // Make sure your Laravel backend has `/api/user/available-schedules` route defined
        // and returns only schedules relevant/available to patients.
        if (!headers.Authorization) {
            // If no token, user cannot fetch authenticated schedules
            toast.warn("Login required to view and select specific schedules.");
            setLoading(false); // Stop loading if authentication is missing for schedules
            return;
        }
        const schedulesRes = await axios.get(`${API_BASE_URL}/user/available-schedules`, { headers });
        setAvailableSchedules(schedulesRes.data);
        // --- End Fetch Available Schedules ---


      } catch (err) {
        console.error("Failed to fetch dropdown data:", err.response?.data || err.message);
        toast.error("Failed to load scheduling options.", { toastId: "errorSchedule" });
        if (err.response?.status === 401 || err.response?.status === 403) {
            toast.error("Session expired or unauthorized. Please login.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, [navigate]); // navigate is a dependency, ensure it's stable

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      const headers = getAuthHeader(); // <--- CORRECTLY GET HEADERS HERE
      if (!headers.Authorization) {
        setStatusMessage("You are not logged in. Redirecting to login...");
        setIsError(true);
        setTimeout(() => navigate('/login'), 1500);
        return; // Stop execution if no token
      }

      // API call to schedule appointment
      // The backend expects child_name, vaccine_type, preferred_date, preferred_time, notes, schedule_id
      const response = await axios.post(`${API_BASE_URL}/user/appointments`, appointmentForm, {
        headers: headers, // <--- CORRECTLY USE THE HEADERS OBJECT HERE
      });

      setStatusMessage(response.data.message || "Appointment scheduled successfully! Awaiting approval.");
      setIsError(false);
      toast.success("Appointment scheduled successfully!", { toastId: "successfulAppo" });
      setAppointmentForm({ // Reset form to initial empty state
        child_name: '',
        vaccine_type: '',
        preferred_date: '',
        preferred_time: '',
        notes: '',
        schedule_id: '',
      });

    } catch (error) {
      console.error("Error scheduling appointment:", error.response?.data || error.message);
      setIsError(true);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Scheduling failed: \n";
        for (const key in errors) {
          errorMessage += `${errors[key].join(", ")}\n`;
        }
        setStatusMessage(errorMessage);
        toast.error(errorMessage);
      } else {
        setStatusMessage(error.response?.data?.message || "An error occurred during scheduling.");
        toast.error(error.response?.data?.message || "An error occurred during scheduling.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Schedule Vaccination Appointment</h2>

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

      {loading && <p className="text-center">Loading scheduling options...</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="child_name" className="block text-sm font-medium text-gray-700">Child's Name (for whom the vaccine is)</label>
            <input
              type="text"
              name="child_name"
              id="child_name"
              value={appointmentForm.child_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="vaccine_type" className="block text-sm font-medium text-gray-700">Vaccine Type</label>
            <select
              name="vaccine_type"
              id="vaccine_type"
              value={appointmentForm.vaccine_type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Vaccine Type</option>
              {/* Populate from fetched availableVaccineTypes */}
              {availableVaccineTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700">Choose a Schedule (Optional)</label>
            <select
              name="schedule_id"
              id="schedule_id"
              value={appointmentForm.schedule_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Specific Schedule (Admin will assign)</option>
              {/* Populate from fetched availableSchedules */}
              {availableSchedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                      {schedule.title} - {schedule.date} {schedule.time} at {schedule.location} (Capacity: {schedule.capacity - schedule.booked_slots} left)
                  </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700">Preferred Date</label>
            <input
              type="date"
              name="preferred_date"
              id="preferred_date"
              value={appointmentForm.preferred_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="preferred_time" className="block text-sm font-medium text-gray-700">Preferred Time</label>
            <input
              type="time"
              name="preferred_time"
              id="preferred_time"
              value={appointmentForm.preferred_time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              id="notes"
              value={appointmentForm.notes}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Any specific requests or conditions?"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ScheduleAppointmentPage;
