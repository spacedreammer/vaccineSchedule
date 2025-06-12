import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import ImageSlider from '../components/ImageSlider';

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

        
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user details

        
        setTimeout(() => {
          navigate("/patientDash"); 
        }, 1500); 
      }
    } catch (error) {
      // Handle errors (e.g., unauthorized, validation errors)
      setIsError(true);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Login error response:", error.response.data);
        if (error.response.data.errors) {
          // Laravel validation errors
          const errors = error.response.data.errors;
          let errorMessage = "Login failed: \n";
          for (const key in errors) {
            errorMessage += `${errors[key].join(", ")}\n`;
          }
          setStatusMessage(errorMessage);
        } else {
          // Other server-side errors (e.g., 'Unauthorized' for wrong credentials)
          setStatusMessage(error.response.data.error || error.response.data.message || "An unknown error occurred during login.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Login error request:", error.request);
        setStatusMessage("No response from server. Please check your network or API_BASE_URL.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Login error message:", error.message);
        setStatusMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Re-enable button after request
    }
  };

  return (
    <>
      <div className='bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 p-5'> {/* Added md:grid-cols-2 for responsiveness */}
          {/* image */}
          <div className="hidden md:block"> {/* Hide on small screens, show on medium and up */}
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
            <h1 className='mb-3 text-2xl font-bold'>Login</h1> {/* Added text styling */}
            <form className='flex flex-col gap-3 w-full max-w-md' onSubmit={handleSubmit}> {/* Added w-full max-w-md */}
              {/* Removed unnecessary grid div */}
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
                disabled={loading} // Disable button when loading
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





// import React from 'react'
// import ImageSlider from '../components/ImageSlider'
// import { Link } from 'react-router-dom'
// import RegisterPage from './RegisterPage'
// const LoginPage = () => {
//   return (
//     <>
//      <div className='bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10'>

// <div className='grid grid-cols-2 gap-3 p-5 '>
//     {/* image */}
//     <div>
//         <ImageSlider />
//         {/* <img src={bb} alt="register" className='w-[10cm] h-[10cm] rounded-md object-cover' /> */}
//     </div>

//     {/* create account */}
//     <div className=''>
//         <div className='flex flex-col items-center justify-center'>
//             <h2 className='pb-3'>Don't have an Account? <Link to="/register" className='text-cyan-300 text-xl'>Register</Link> </h2>
//         <h1 className='mb-3'>Login </h1>
//         <form className='flex flex-col gap-3 mt-8'>
//             <div className='grid grid-cols-2 gap-3'>
           
//             </div>
//             <input type="email" placeholder='Email' className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none' />
//             <input type="password" placeholder='Password' className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none' />
//            <button type="submit" className='bg-gray-500 text-white  p-2 rounded-md hover:bg-cyan-300'>Login</button>
//         </form>
//         </div>
//     </div>
// </div>
// </div>
//     </>
//   )
// }

// export default LoginPage