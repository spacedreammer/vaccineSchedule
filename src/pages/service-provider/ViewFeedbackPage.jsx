import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ViewFeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeader();
        if (!headers.Authorization) {
          toast.error("Authentication required. Redirecting to login.");
          navigate('/login');
          return;
        }
        // Fetch feedback/ratings for this service provider
        const res = await axios.get(`${API_BASE_URL}/provider/my-feedback`, { headers });
        setFeedbacks(res.data);
        toast.success("Feedback loaded successfully.");
      } catch (err) {
        console.error("Failed to load feedback:", err.response?.data || err.message);
        setError("Failed to load feedback. Please try again.");
        toast.error("Failed to load feedback.");
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-xl">Loading feedback...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Ratings & Feedback Received</h2>
      {feedbacks.length === 0 ? (
        <p className="text-gray-600">No feedback received yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(feedback => (
            <div key={feedback.id} className="border p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="font-semibold text-xl mr-2">{feedback.rating} ★</span>
                <span className="text-gray-600 text-sm">from {feedback.user ? `${feedback.user.fname} ${feedback.user.lname}` : 'Anonymous User'}</span>
              </div>
              <p className="text-gray-800 text-base">{feedback.comment}</p>
              <p className="text-gray-500 text-xs mt-2">
                For Appointment ID: {feedback.appointment_id} on {new Date(feedback.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewFeedbackPage;