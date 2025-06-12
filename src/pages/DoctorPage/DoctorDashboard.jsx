import React from "react";
import {
  FaUserMd,
  FaCalendarCheck,
  FaChartLine,
  FaBell,
  FaComments,
  FaPills,
  FaFileAlt,
  FaDollarSign,
  FaCog,
  FaSignOutAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";

const DoctorDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100 mt-6">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Doctor App</h2>
        <nav className="space-y-4">
          <button className="flex items-center gap-3 hover:text-blue-300"><FaChartLine /> Dashboard</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaCalendarCheck /> Appointment</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaUserMd /> Patients</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaComments /> Messages</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaPills /> Medications</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaCog /> Settings</button>
          <button className="flex items-center gap-3 hover:text-blue-300"><FaSignOutAlt /> Logout</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search anything..."
            className="px-4 py-2 border rounded w-1/2"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Make Appointment</button>
        </div>

        {/* Greeting */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-500 text-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold">Hello Dr. Jackson Santos</h3>
          <p>Here are your important tasks and reports. Please check the next appointment.</p>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h4 className="text-lg font-bold mb-4">Activity</h4>
          <div className="h-48 bg-gray-100 flex items-center justify-center rounded">
            {/* Placeholder for chart */}
            <span className="text-gray-400">[Activity Chart Here]</span>
          </div>
        </div>

        {/* Appointments and Profile */}
        <div className="grid grid-cols-3 gap-6">
          {/* Appointment Request */}
          <div className="bg-white p-6 rounded-xl shadow col-span-1">
            <h4 className="text-lg font-bold mb-4">Appointment Request</h4>
            <ul className="space-y-4">
              {[
                { name: "Daniel Smith", date: "04/03/2020 - 10AM", condition: "Diabetes" },
                { name: "Dora Herrera", date: "10/03/2020 - 8AM", condition: "Flu" },
                { name: "Albert Diaz", date: "12/03/2020 - 3PM", condition: "Cancer" },
                { name: "Edith Lyons", date: "24/03/2020 - 7AM", condition: "Liver" }
              ].map((req, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{req.name}</p>
                    <p className="text-sm text-gray-500">{req.condition} - {req.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-green-500">✓</button>
                    <button className="text-red-500">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Appointment Today */}
          <div className="bg-white p-6 rounded-xl shadow col-span-1">
            <h4 className="text-lg font-bold mb-4">Appointment</h4>
            <ul className="space-y-4">
              {[
                { name: "Mable Clarke", time: "12:00", status: "Finished" },
                { name: "Rhyy Clayton", time: "14:00", status: "Pending" },
                { name: "Cornelia Holland", time: "16:00", status: "Pending" },
                { name: "Brett Gibson", time: "18:00", status: "Pending" },
              ].map((appt, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{appt.name}</p>
                    <p className="text-sm text-gray-500">{appt.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${appt.status === 'Finished' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{appt.status}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctor Profile */}
          <div className="bg-white p-6 rounded-xl shadow col-span-1 flex flex-col items-center text-center">
            <img src="https://via.placeholder.com/100" alt="Dr. Jackson Santos" className="w-24 h-24 rounded-full mb-4" />
            <h4 className="text-lg font-semibold">Dr. Jackson Santos</h4>
            <p className="text-sm text-gray-500">Dermatologists - Texas Hospital</p>
            <div className="my-4 w-full">
              <p className="text-sm font-medium">150 People</p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">150/300</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm w-full">
              <div>
                <p className="font-bold">2,543</p>
                <p className="text-gray-500">Appointments</p>
              </div>
              <div>
                <p className="font-bold">3,567</p>
                <p className="text-gray-500">Total Patients</p>
              </div>
              <div>
                <p className="font-bold">13,078</p>
                <p className="text-gray-500">Consultations</p>
              </div>
              <div>
                <p className="font-bold">2,736</p>
                <p className="text-gray-500">Return Patients</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
              <button className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-2 py-1 rounded"><FaPhone /> 18</button>
              <button className="flex items-center justify-center gap-2 bg-blue-100 text-blue-600 px-2 py-1 rounded"><FaEnvelope /> 9</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
