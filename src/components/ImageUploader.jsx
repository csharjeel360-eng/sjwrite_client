 import { useState } from 'react';
import { api } from '../api/client';

export default function ImageUploader({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setPreview(URL.createObjectURL(selectedFile));
  };

  const upload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get token from localStorage - use 'adminToken' instead of 'token'
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('You must be logged in to upload images.');
        setLoading(false);
        return;
      }

      const result = await api.uploadImage(file, token);
      if (result.imageUrl) {
        onUploaded?.(result.imageUrl);
        setFile(null);
        setPreview('');
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      let errorMsg = 'Upload failed. Please try again.';
      if (err && err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-gray-50 file:text-black
            hover:file:bg-gray-100"
          disabled={loading}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      {preview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <img 
            src={preview} 
            className="w-40 h-40 object-cover rounded border" 
            alt="Preview" 
            onLoad={() => URL.revokeObjectURL(preview)}
          />
        </div>
      )}
      
      <button 
        type="button" 
        onClick={upload} 
        disabled={loading || !file}
        className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}