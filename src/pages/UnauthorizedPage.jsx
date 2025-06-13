import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    // Function to handle logout and redirect to login
    const handleLogout = () => {
        // Clear all items from localStorage (token, user info)
        localStorage.clear();
        // Redirect to the login page
        navigate('/login');
        // Force a full page reload for a clean state in the browser (optional but good for auth issues)
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied!</h1>
            <p className="text-xl text-gray-800 mb-6">
                You do not have the necessary permissions to view this page.
                Please log in with an authorized account.
            </p>
            <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
                Go to Login
            </button>
            <p className="mt-4 text-gray-500 text-sm">
                If you believe this is an error, please contact support.
            </p>
        </div>
    );
};

export default UnauthorizedPage;
