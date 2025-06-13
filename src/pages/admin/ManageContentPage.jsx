import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000/api";

const ManageContentPage = () => {
  const navigate = useNavigate();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'article', image: null, video_url: '' });
  const [editingContentId, setEditingContentId] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error("Authentication required. Redirecting to login.");
        navigate('/login');
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/admin/content`, { headers });
      setContentItems(res.data);
      toast.success("Content loaded successfully.");
    } catch (err) {
      console.error("Failed to load content:", err.response?.data || err.message);
      setError("Failed to load content. Please try again.");
      toast.error("Failed to load content.");
      if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('type', form.type);
      if (form.image) {
        formData.append('image', form.image);
      }
      if (form.video_url) {
        formData.append('video_url', form.video_url);
      }

      // If updating, Laravel needs _method: 'PUT' for FormData
      if (editingContentId) {
        formData.append('_method', 'PUT'); // Simulate PUT request for Laravel
        await axios.post(`${API_BASE_URL}/admin/content/${editingContentId}`, formData, { headers });
        toast.success("Content updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/admin/content`, formData, { headers });
        toast.success("Content uploaded successfully!");
      }

      setForm({ title: '', content: '', type: 'article', image: null, video_url: '' });
      setEditingContentId(null);
      await fetchContent(); // Re-fetch content
    } catch (err) {
      console.error("Operation failed:", err.response?.data || err.message);
      setError("Operation failed: " + (err.response?.data?.message || err.message));
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ ...item, image: null, video_url: item.video_url || '' }); // Don't pre-fill file input
    setEditingContentId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) return;
      await axios.delete(`${API_BASE_URL}/admin/content/${id}`, { headers });
      toast.success("Content deleted successfully!");
      await fetchContent(); // Re-fetch content
    } catch (err) {
      console.error("Failed to delete content:", err.response?.data || err.message);
      setError("Failed to delete content: " + (err.response?.data?.message || err.message));
      toast.error("Failed to delete content: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-xl">Loading content...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">{editingContentId ? "Edit Health Content" : "Upload New Health Content"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500" required />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content Body" className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500" rows="5" required></textarea>
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500">
          <option value="article">Article</option>
          <option value="video">Video Link</option>
          <option value="infographic">Infographic</option>
        </select>
        {form.type === 'video' && (
          <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="Video URL (e.g., YouTube link)" className="w-full border px-3 py-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" />
        )}
        {(form.type === 'article' || form.type === 'infographic') && (
          <div className="flex items-center space-x-2">
            <label htmlFor="image-upload" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded cursor-pointer">
              Upload Image
            </label>
            <input type="file" id="image-upload" name="image" onChange={handleFileChange} className="hidden" accept="image/*" />
            {form.image && <span className="text-sm text-gray-600">{form.image.name}</span>}
            {!form.image && editingContentId && contentItems.find(item => item.id === editingContentId)?.image_url && (
                <span className="text-sm text-gray-600">Existing image present</span>
            )}
          </div>
        )}
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {editingContentId ? "Update Content" : "Upload Content"}
          </button>
          {editingContentId && (
            <button
              type="button"
              onClick={() => {
                setEditingContentId(null);
                setForm({ title: '', content: '', type: 'article', image: null, video_url: '' });
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">All Health Content</h2>
      {contentItems.length === 0 ? (
        <p className="text-gray-600">No content uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentItems.map(item => (
            <div key={item.id} className="bg-white border rounded-lg shadow-sm p-4">
              {item.image_url && <img src={`http://localhost:8000${item.image_url}`} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />}
              {item.type === 'video' && item.video_url && (
                  <div className="mb-2 w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500">Video Placeholder</span>
                  </div>
              )}
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-2 max-h-24 overflow-hidden text-ellipsis">{item.content}</p>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full capitalize">{item.type}</span>
              <div className="mt-3 flex space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-sm">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageContentPage;