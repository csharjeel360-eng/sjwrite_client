 import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(username, password);
      
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('authChange'));
        
        navigate('/admin/dashboard');
      } else if (response.error) {
        setError(response.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input 
          className="w-full border rounded px-3 py-2" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          className="w-full border rounded px-3 py-2" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}