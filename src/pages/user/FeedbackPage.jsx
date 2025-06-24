import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api"; // IMPORTANT: Match your Laravel API base URL

const FeedbackPage = () => {
  const navigate = useNavigate();

  const [feedbackForm, setFeedbackForm] = useState({
    appointment_id: '', // To link feedback to a specific appointment
    rating: 0,          // 1-5 rating
    comment: '',
  });
  const [completedAppointments, setCompletedAppointments] = useState([]); // List of user's completed appointments
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // Ensure this key is consistent
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user's completed appointments on component mount
  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      setLoading(true);
      setStatusMessage('');
      setIsError(false);
      try {
        const toastId = 'fetch-appointments-feedback-status'; // Unique ID for fetch toasts
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          setStatusMessage("You are not logged in. Redirecting to login...");
          setIsError(true);
          toast.error("You are not logged in. Redirecting to login...", { toastId });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/user/my-appointments`, { headers });

        if (Array.isArray(response.data)) {
          const completedWithoutFeedback = response.data.filter(
            appt => appt.status === 'completed'
          );
          setCompletedAppointments(completedWithoutFeedback);
          setStatusMessage('Completed appointments loaded.');
          toast.success("Completed appointments loaded.", { toastId });
        } else {
          console.error("Completed appointments API response was not a direct array:", response.data);
          setCompletedAppointments([]);
          setStatusMessage("Received unexpected data format for completed appointments.");
          setIsError(true);
          toast.error("Failed to load completed appointments due to data format issue.", { toastId });
        }

      } catch (error) {
        console.error("Error fetching completed appointments:", error.response?.data || error.message);
        setIsError(true);
        const toastId = 'fetch-appointments-feedback-error'; // Unique ID for fetch error toasts
        if (error.response && error.response.status === 401) {
          setStatusMessage("Session expired or unauthorized. Please login again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error("Session expired or unauthorized. Please login again.", { toastId });
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setStatusMessage(error.response?.data?.message || "Failed to load completed appointments.");
          toast.error(error.response?.data?.message || "Failed to load completed appointments.", { toastId });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedAppointments();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setFeedbackForm(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      const toastId = 'feedback-submit-status'; // Consistent ID for submit toasts
      const headers = getAuthHeader(); // Correctly get headers here
      if (!headers.Authorization) {
        setStatusMessage("You are not logged in. Redirecting to login...");
        setIsError(true);
        toast.error("You are not logged in. Redirecting to login...", { toastId });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      if (feedbackForm.rating === 0) {
        setStatusMessage("Please select a rating (1-5 stars).");
        setIsError(true);
        setLoading(false);
        toast.error("Please select a rating (1-5 stars).", { toastId });
        return;
      }

      // API call to submit feedback
      const response = await axios.post(`${API_BASE_URL}/user/feedback`, feedbackForm, {
        headers: headers, // Correctly use the headers object here
      });

      setStatusMessage(response.data.message || "Feedback submitted successfully! Thank you.");
      setIsError(false);
      toast.success("Feedback submitted successfully!", { toastId });
      setFeedbackForm({ appointment_id: '', rating: 0, comment: '' }); // Reset form
      // Optional: Re-fetch completed appointments to remove the one just given feedback
      setCompletedAppointments(prev => prev.filter(app => app.id !== feedbackForm.appointment_id));

    } catch (error) {
      console.error("Error submitting feedback:", error.response?.data || error.message);
      setIsError(true);
      const toastId = 'feedback-submit-error'; // Unique ID for submit error toasts
      if (error.response && error.response.status === 422) { // Validation errors
        const errors = error.response.data.errors;
        let errorMessage = "Submission failed: \n";
        for (const key in errors) {
          errorMessage += `- ${errors[key].join(", ")}\n`;
        }
        setStatusMessage(errorMessage);
        toast.error(errorMessage, { toastId });
      } else {
        setStatusMessage(error.response?.data?.message || "An error occurred during feedback submission.");
        toast.error(error.response?.data?.message || "An error occurred during feedback submission.", { toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading feedback options...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Submit Feedback & Rate Service</h2>

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

      {completedAppointments.length === 0 && !loading ? (
        <p className="text-gray-600">No completed appointments found that are awaiting your feedback.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="appointment_id" className="block text-sm font-medium text-gray-700">Select Completed Appointment</label>
            <select
              name="appointment_id"
              id="appointment_id"
              value={feedbackForm.appointment_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select an appointment</option>
              {completedAppointments.map(appt => (
                <option key={appt.id} value={appt.id}>
                  {appt.child_name || 'N/A'} - {appt.vaccine_type} on {appt.preferred_date} at {appt.preferred_time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`text-2xl ${
                    star <= feedbackForm.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-gray-600">{feedbackForm.rating} / 5</span>
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              name="comment"
              id="comment"
              value={feedbackForm.comment}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Share your experience..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackPage;
