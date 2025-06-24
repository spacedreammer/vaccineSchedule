import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://127.0.0.1:8000";

const ManageServiceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // Fetch service categories
        const res = await axios.get(`${API_BASE_URL}/api/system-admin/service-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        toast.error("Failed to load service categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (editingCategoryId) {
        // Update existing category
        await axios.put(`${API_BASE_URL}/api/system-admin/service-categories/${editingCategoryId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await axios.post(`${API_BASE_URL}/api/system-admin/service-categories`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category created successfully!", { toastId: "successCategory" });
      }
      setForm({ name: '', description: '' });
      setEditingCategoryId(null);
      // Re-fetch categories
      const res = await axios.get(`${API_BASE_URL}/api/system-admin/service-categories`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch (err) {
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (category) => {
    setForm(category);
    setEditingCategoryId(category.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await axios.delete(`${API_BASE_URL}/api/system-admin/service-categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category deleted successfully!");
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        toast.error("Failed to delete category.", { toastId: "errorDelete" });
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading categories...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">{editingCategoryId ? "Edit Service Category" : "Create New Service Category"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Category Name" className="border p-2 rounded w-full" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full" rows="3"></textarea>
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingCategoryId ? "Update Category" : "Add Category"}
          </button>
          {editingCategoryId && (
            <button type="button" onClick={() => { setEditingCategoryId(null); setForm({ name: '', description: '' }); }} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
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
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{cat.name}</td>
                  <td className="py-2 px-4 text-sm max-w-xs truncate">{cat.description}</td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">Delete</button>
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