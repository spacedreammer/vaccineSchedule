import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import ImageSlider from "../components/ImageSlider";
import { toast } from "react-toastify";

const RegisterPage = () => {
  // State for form inputs
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role] = useState("patient"); // Hardcoded to patient for this registration page

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:8000/api";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setStatusMessage(""); // Clear previous messages
    setIsError(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        fname,
        lname,
        email,
        password,
        phone,
        role, // Send the role
      });

      // Handle successful registration
      if (response.status === 201) { // Laravel typically returns 201 Created for successful resource creation
        setStatusMessage(response.data.message || "Registration successful!");
        setIsError(false);

        // Store token and user data in local storage
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user object as string

        // Use a more descriptive toast
        toast.success("Registration successful! Redirecting to dashboard...");

        // Determine destination based on registered role (though currently always patient)
        const userRole = response.data.user.role; // Get the actual role from the response
        let redirectToPath = '/login'; // Default fallback

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
        }, 2000);
      }
    } catch (error) {
      // Handle errors (e.g., validation errors from Laravel)
      setIsError(true);
      if (error.response) {
        console.error("Registration error response:", error.response.data);
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          let errorMessage = "Registration failed: \n";
          for (const key in errors) {
            errorMessage += `${errors[key].join(", ")}\n`;
          }
          setStatusMessage(errorMessage);
          toast.error(errorMessage); // Use toast for error messages
        } else {
          setStatusMessage(error.response.data.message || "An unknown error occurred during registration.");
          toast.error(error.response.data.message || "An unknown error occurred during registration.");
        }
      } else if (error.request) {
        console.error("Registration error request:", error.request);
        setStatusMessage("No response from server. Please check your network or API_BASE_URL.");
        toast.error("Network error: No response from server.");
      } else {
        console.error("Registration error message:", error.message);
        setStatusMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected client-side error occurred.");
      }
    } finally {
      setLoading(false); // Re-enable button after request
    }
  };

  return (
    <>
      <div className="bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
          {/* image */}
          <div className="hidden md:block">
            <ImageSlider />
          </div>

          {/* create account */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="pb-3 text-center">
              Already have an Account?{" "}
              <Link to="/login" className="text-cyan-300 text-xl">
                Login
              </Link>{" "}
            </h2>
            <h1 className="mb-3 text-2xl font-bold">Create an account</h1>
            <form className="flex flex-col gap-3 w-full max-w-md" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="border focus:border-blue-300 focus:ring-gray-300 outline-none border-gray-300 p-2 rounded-md"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border border-gray-300 p-2 focus:border-blue-300 focus:ring-gray-300 outline-none rounded-md"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone number"
                className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {/* Note: Role is hardcoded to 'patient' in state, but could be a dropdown if multiple roles can register */}
              <button
                type="submit"
                className="bg-gray-500 text-white p-2 rounded-md hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
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

export default RegisterPage;