import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import ImageSlider from '../components/ImageSlider';
import { toast } from 'react-toastify'; // Import toast for notifications

const LoginPage = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:8000/api";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setStatusMessage(''); // Clear previous messages
    setIsError(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      // Handle successful login
      if (response.status === 200) {
        setStatusMessage(response.data.message || "Login successful!");
        setIsError(false);
        toast.success("Login successful! Redirecting to dashboard...", { toastId: "successDir" }); // Use toast

        // --- CRITICAL FIXES FOR LOCAL STORAGE AND REDIRECTION ---
        // 1. Store token using the consistent key 'token' (matching ProtectedRoute)
        localStorage.setItem('token', response.data.access_token);
        // 2. Store user data (which includes the 'role') as a string
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Determine destination based on logged-in user's role
        const userRole = response.data.user.role; // Get the actual role from the response
        let redirectToPath = '/unauthorized'; // Default to unauthorized if role not recognized

        // Route based on role
        if (userRole === 'patient') {
            redirectToPath = '/patient-dashboard';
        } else if (userRole === 'admin') {
            redirectToPath = '/admin-dashboard';
        } else if (userRole === 'health_officer') {
            redirectToPath = '/ho-dashboard';
        } else if (userRole === 'service_provider') {
            redirectToPath = '/provider-dashboard';
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectToPath); // Use the determined path
        }, 1500);
        // --- END CRITICAL FIXES ---
      }
    } catch (error) {
      // Handle errors (e.g., unauthorized, validation errors)
      setIsError(true);
      if (error.response) {
        console.error("Login error response:", error.response.data);
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          let errorMessage = "Login failed: \n";
          for (const key in errors) {
            errorMessage += `${errors[key].join(", ")}\n`;
          }
          setStatusMessage(errorMessage);
          toast.error(errorMessage); // Use toast for error messages
        } else {
          setStatusMessage(error.response.data.error || error.response.data.message || "An unknown error occurred during login.");
          toast.error(error.response.data.error || error.response.data.message || "An unknown error occurred during login.");
        }
      } else if (error.request) {
        console.error("Login error request:", error.request);
        setStatusMessage("No response from server. Please check your network or API_BASE_URL.");
        toast.error("Network error: No response from server.");
      } else {
        console.error("Login error message:", error.message);
        setStatusMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected client-side error occurred.");
      }
    } finally {
      setLoading(false); // Re-enable button after request
    }
  };

  return (
    <>
      <div className='bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 p-5'>
          {/* image */}
          <div className="hidden md:block">
            <ImageSlider />
          </div>

          {/* Login form */}
          <div className='flex flex-col items-center justify-center'>
            <h2 className='pb-3 text-center'>
              Don't have an Account?{" "}
              <Link to="/register" className='text-cyan-300 text-xl'>
                Register
              </Link>{" "}
            </h2>
            <h1 className='mb-3 text-2xl font-bold'>Login</h1>
            <form className='flex flex-col gap-3 w-full max-w-md' onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder='Email'
                className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder='Password'
                className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className='bg-gray-500 text-white p-2 rounded-md hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={loading}
              >
                {loading ? "Logging In..." : "Login"}
              </button>

              {/* Display status messages */}
              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {statusMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;