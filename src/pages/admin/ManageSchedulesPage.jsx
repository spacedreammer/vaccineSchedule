import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ManageSchedulesPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', capacity: '', vaccine_category_id: ''
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [vaccineCategories, setVaccineCategories] = useState([]); // For dropdown

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSchedulesAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Fetch schedules
      const schedulesRes = await axios.get(`${API_BASE_URL}/admin/schedules`, { headers });
      setSchedules(schedulesRes.data);

      // Fetch vaccine categories for dropdown
      const categoriesRes = await axios.get(`${API_BASE_URL}/system-admin/service-categories`, { headers });
      setVaccineCategories(categoriesRes.data);

    } catch (err) {
      console.error("Failed to load data:", err.response?.data || err.message);
      setError("Failed to load schedules or categories. Please try again.");
      toast.error("Failed to load schedules or categories.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulesAndCategories();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;

      if (editingScheduleId) {
        // Update existing schedule
        await axios.put(`${API_BASE_URL}/admin/schedules/${editingScheduleId}`, form, { headers });
        toast.success("Schedule updated successfully!");
      } else {
        // Create new schedule
        await axios.post(`${API_BASE_URL}/admin/schedules`, form, { headers });
        toast.success("Schedule created successfully!");
      }
      setForm({ title: '', description: '', date: '', time: '', location: '', capacity: '', vaccine_category_id: '' });
      setEditingScheduleId(null);
      await fetchSchedulesAndCategories(); // Re-fetch to update list
    } catch (err) {
      console.error("Operation failed:", err.response?.data || err.message);
      setError("Operation failed: " + (err.response?.data?.message || err.message));
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    // Ensure date is formatted correctly for input type="date"
    const formattedDate = schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '';
    setForm({
      ...schedule,
      date: formattedDate,
      time: schedule.time.substring(0, 5) // Format time for input type="time"
    });
    setEditingScheduleId(schedule.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule? This will also remove associated appointments.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.delete(`${API_BASE_URL}/admin/schedules/${id}`, { headers });
      toast.success("Schedule deleted successfully!", { toastId: "sucessDeleted" });
      await fetchSchedulesAndCategories(); // Re-fetch to update list
    } catch (err) {
      console.error("Failed to delete schedule:", err.response?.data || err.message);
      setError("Failed to delete schedule: " + (err.response?.data?.message || err.message));
      toast.error("Failed to delete schedule: " + (err.response?.data?.message || err.message), { toastId: "failedDelete" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading schedules...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">{editingScheduleId ? "Edit Schedule" : "Create New Schedule"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Schedule Title" className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
        <input type="time" name="time" value={form.time} onChange={handleChange} className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500" required />
        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500" min="1" required />
        <select
          name="vaccine_category_id"
          value={form.vaccine_category_id}
          onChange={handleChange}
          className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Vaccine Category (Optional)</option>
          {vaccineCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-full focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
        <div className="col-span-full flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50" disabled={loading}>
            {editingScheduleId ? "Update Schedule" : "Add Schedule"}
          </button>
          {editingScheduleId && (
            <button
              type="button"
              onClick={() => {
                setEditingScheduleId(null);
                setForm({ title: '', description: '', date: '', time: '', location: '', capacity: '', vaccine_category_id: '' });
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">All Schedules</h2>
      {schedules.length === 0 ? (
        <p className="text-gray-600">No schedules created yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Location</th>
                <th className="py-2 px-4 border-b">Capacity</th>
                <th className="py-2 px-4 border-b">Booked</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{schedule.title}</td>
                  <td className="py-2 px-4">{schedule.date}</td>
                  <td className="py-2 px-4">{schedule.time.substring(0, 5)}</td> {/* Format time to HH:MM */}
                  <td className="py-2 px-4">{schedule.location}</td>
                  <td className="py-2 px-4">{schedule.capacity}</td>
                  <td className="py-2 px-4">{schedule.booked_slots}</td>
                  <td className="py-2 px-4">{schedule.vaccine_category?.name || 'N/A'}</td> {/* Access name from eager loaded relation */}
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      schedule.status === 'active' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'full' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleEdit(schedule)} className="text-blue-600 hover:underline mr-2 text-sm">Edit</button>
                    <button onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageSchedulesPage;

