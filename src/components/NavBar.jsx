import { useState } from "react";
import { FaBars, FaWindowClose, FaTwitter,FaFacebookF,FaPhoneAlt, FaEnvelope, FaInstagram } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const [hideNav, setHideNav] = useState(false);

  const toggleMenu = () => {
    setHideNav(!hideNav);
  };

  return (
    <>
     

      {/* Navigation Bar */}
      <nav className="bg-gray-300 border-b font-poppins border-cyan-100 top-0 sticky z-50 mx-auto max-w-full px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <NavLink className="flex items-center mr-4" to="/">
            <img
              className="h-10 w-auto"
              src="images/logo.png"
              alt="VaS Logo"
            />
            <span className="hidden md:block text-white text-2xl font-bold ml-2">
              VaS
            </span>
          </NavLink>

          {/* Mobile Menu Icon */}
          <button
            onClick={toggleMenu}
            className="text-gray-900 text-2xl lg:hidden focus:outline-none">
            {hideNav ? <FaWindowClose /> : <FaBars />}
          </button>

          {/* Navigation Links */}
          <div
            className={`${
              hideNav ? "block" : "hidden"
            } fixed top-20 left-0 h-full w-64 bg-white shadow-lg lg:static lg:h-auto lg:w-auto lg:bg-transparent lg:flex lg:items-center lg:space-x-4 lg:shadow-none`}>
            <NavLink
              to="/"
              className="block text-gray-800 lg-text-gray-900 hover:bg-gray-400  rounded-md px-3 py-2">
              Home
            </NavLink>
            
            <NavLink
              to="/about"
              className="block text-gray-800 lg-text-black hover:bg-gray-400  rounded-md px-3 py-2">
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              className="block text-gray-800 lg-text-black hover:bg-gray-400  rounded-md px-3 py-2">
              Contact Us
            </NavLink>
            <NavLink
              to="/team"
              className="block text-gray-800 lg-text-black hover:bg-gray-400  rounded-md px-3 py-2">
              Our Team
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;