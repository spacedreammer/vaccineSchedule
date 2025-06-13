import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ManageServiceCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      // Fetch service categories
      const res = await axios.get(`${API_BASE_URL}/system-admin/service-categories`, { headers });
      setCategories(res.data);
      toast.success("Service categories loaded.");
    } catch (err) {
      console.error("Failed to load service categories:", err.response?.data || err.message);
      setError("Failed to load service categories. Please try again.");
      toast.error("Failed to load service categories.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;

      if (editingCategoryId) {
        // Update existing category
        await axios.put(`${API_BASE_URL}/system-admin/service-categories/${editingCategoryId}`, form, { headers });
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await axios.post(`${API_BASE_URL}/system-admin/service-categories`, form, { headers });
        toast.success("Category created successfully!");
      }
      setForm({ name: '', description: '', is_active: true });
      setEditingCategoryId(null);
      await fetchCategories(); // Re-fetch categories
    } catch (err) {
      console.error("Operation failed:", err.response?.data || err.message);
      setError("Operation failed: " + (err.response?.data?.message || err.message));
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm(category);
    setEditingCategoryId(category.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.delete(`${API_BASE_URL}/system-admin/service-categories/${id}`, { headers });
      toast.success("Category deleted successfully!");
      await fetchCategories(); // Re-fetch categories
    } catch (err) {
      console.error("Failed to delete category:", err.response?.data || err.message);
      setError("Failed to delete category: " + (err.response?.data?.message || err.message));
      toast.error("Failed to delete category: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading categories...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">{editingCategoryId ? "Edit Service Category" : "Create New Service Category"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Category Name" className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
        <div className="flex items-center space-x-2">
          <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
          <label htmlFor="is_active" className="text-gray-700">Is Active</label>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {editingCategoryId ? "Update Category" : "Add Category"}
          </button>
          {editingCategoryId && (
            <button
              type="button"
              onClick={() => {
                setEditingCategoryId(null);
                setForm({ name: '', description: '', is_active: true });
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">All Service Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-600">No service categories defined yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Active</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{cat.name}</td>
                  <td className="py-2 px-4 text-sm max-w-xs truncate">{cat.description}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cat.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline mr-2 text-sm">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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

export default ManageServiceCategoriesPage;