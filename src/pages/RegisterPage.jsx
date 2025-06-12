import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; // Import Axios
import ImageSlider from "../components/ImageSlider";

const RegisterPage = () => {
  // State for form inputs
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role] = useState("patient"); 

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
      if (response.status === 200) {
        setStatusMessage(response.data.message || "Registration successful!");
        setIsError(false);
        // Optionally redirect to login page after a short delay
        setTimeout(() => {
          navigate("/patientDash");
        }, 2000);
      }
    } catch (error) {
      // Handle errors (e.g., validation errors from Laravel)
      setIsError(true);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Registration error response:", error.response.data);
        if (error.response.data.errors) {
          // Laravel validation errors
          const errors = error.response.data.errors;
          let errorMessage = "Registration failed: \n";
          for (const key in errors) {
            errorMessage += `${errors[key].join(", ")}\n`;
          }
          setStatusMessage(errorMessage);
        } else {
          // Other server-side errors
          setStatusMessage(error.response.data.message || "An unknown error occurred during registration.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Registration error request:", error.request);
        setStatusMessage("No response from server. Please check your network or API_BASE_URL.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Registration error message:", error.message);
        setStatusMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Re-enable button after request
    }
  };

  return (
    <>
      <div className="bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5"> {/* Added md:grid-cols-2 for responsiveness */}
          {/* image */}
          <div className="hidden md:block"> {/* Hide on small screens, show on medium and up */}
            <ImageSlider />
          </div>

          {/* create account */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="pb-3 text-center"> {/* Added text-center */}
              Already have an Account?{" "}
              <Link to="/login" className="text-cyan-300 text-xl">
                Login
              </Link>{" "}
            </h2>
            <h1 className="mb-3 text-2xl font-bold">Create an account</h1> {/* Added text styling */}
            <form className="flex flex-col gap-3 w-full max-w-md" onSubmit={handleSubmit}> {/* Added w-full max-w-md */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* Added sm:grid-cols-2 for responsiveness */}
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
              <button
                type="submit"
                className="bg-gray-500 text-white p-2 rounded-md hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading} // Disable button when loading
              >
                {loading ? "Registering..." : "Register"}
              </button>

              {/* Display status messages */}
              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }} // Preserves line breaks for validation messages
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

// import React from "react";
// import { Link } from "react-router-dom";
// import bb from "../assets/images/bb.avif";
// import ImageSlider from "../components/ImageSlider";

// const RegisterPage = () => {
//   return (
//     <>
//       <div className="bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10">
//         <div className="grid grid-cols-2 gap-3 p-5 ">
//           {/* image */}
//           <div>
//             <ImageSlider />
//             {/* <img src={bb} alt="register" className='w-[10cm] h-[10cm] rounded-md object-cover' /> */}
//           </div>

//           {/* create account */}
//           <div className="">
//             <div className="flex flex-col items-center justify-center">
//               <h2 className="pb-3">
//                 Already have an Account?{" "}
//                 <Link to="/login" className="text-cyan-300 text-xl">
//                   Login
//                 </Link>{" "}
//               </h2>
//               <h1 className="mb-3">Create an account</h1>
//               <form className="flex flex-col gap-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <input
//                     type="text"
//                     placeholder="First Name"
//                     className="border focus:border-blue-300 focus:ring-gray-300 outline-none border-gray-300 p-2 rounded-md"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Last Name"
//                     className="border border-gray-300 p-2 focus:border-blue-300 focus:ring-gray-300 outline-none rounded-md"
//                   />
//                 </div>
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
//                 />
//                  <input
//                   type="text"
//                   placeholder="Phone number"
//                   className="border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none"
//                 />
//                 <button
//                   type="submit"
//                   className="bg-gray-500 text-white  p-2 rounded-md hover:bg-cyan-300">
//                   Register
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RegisterPage;
