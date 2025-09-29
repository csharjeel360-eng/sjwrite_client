 const API_BASE = import.meta.env.VITE_API_BASE || 'https://sjwrites-backend.vercel.app/api/';
const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Helper function for handling responses
const handleResponse = async (response) => {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};

export const api = {
  // Auth
  async register(username, password) {
    const res = await fetch(`${API_BASE}admin/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}admin/login`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  // Blogs (public)
  async getBlogs(tag = null) {
    const url = tag ? `${API_BASE}blogs?tag=${encodeURIComponent(tag)}` : `${API_BASE}blogs`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getBlog(id) {
    const res = await fetch(`${API_BASE}blogs/${id}`);
    return handleResponse(res);
  },

  async searchBlogs(q) {
    const res = await fetch(`${API_BASE}blogs/search?q=${encodeURIComponent(q)}`);
    return handleResponse(res);
  },

  async sortBlogs(by) {
    const res = await fetch(`${API_BASE}blogs/sort?by=${encodeURIComponent(by)}`);
    return handleResponse(res);
  },

  async blogsByTag(tag) {
    const res = await fetch(`${API_BASE}blogs/tag/${encodeURIComponent(tag)}`);
    return handleResponse(res);
  },

  async getAllTags() {
    const res = await fetch(`${API_BASE}blogs/tags/all`);
    return handleResponse(res);
  },

  async getPopularTags() {
    const res = await fetch(`${API_BASE}blogs/tags/popular`);
    return handleResponse(res);
  },

  async likeBlog(id) {
    const res = await fetch(`${API_BASE}blogs/${id}/like`, { 
      method: 'POST' 
    });
    return handleResponse(res);
  },

  async addComment(id, payload) {
    const res = await fetch(`${API_BASE}blogs/${id}/comment`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Blogs (admin protected)
  async createBlog(payload, token) {
    const res = await fetch(`${API_BASE}blogs`, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateBlog(id, payload, token) {
    const res = await fetch(`${API_BASE}blogs/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteBlog(id, token) {
    const res = await fetch(`${API_BASE}blogs/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders(token),
    });
    return handleResponse(res);
  },

  // Upload (admin protected)
  async uploadImage(file, token) {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE}blogs/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(res);
  },

  async incrementView(id) {
    const res = await fetch(`${API_BASE}blogs/${id}/view`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};