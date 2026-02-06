import { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import ProtectedRoute from '../components/ProtectedRoute';
import ImageUploader from '../components/ImageUploader';

// Improved Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('adminToken');

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadImage(file, token);
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const insertImage = () => {
    if (!imageUrl) {
      alert('Please upload or provide an image URL');
      return;
    }

    const altText = imageAlt || 'Image';
    const markdownImage = `![${altText}](${imageUrl})`;

    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + '\n' + markdownImage + '\n' + value.substring(start);
    onChange(newText);

    setImageUrl('');
    setImageAlt('');
    setShowImageInput(false);

    setTimeout(() => {
      textarea.setSelectionRange(start + markdownImage.length + 2, start + markdownImage.length + 2);
      textarea.focus();
    }, 0);
  };

  const applyFormat = (format) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = value;
    let newSelectionStart = start;
    let newSelectionEnd = end;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = end + 2;
        } else {
          newText = value.substring(0, start) + '**bold text**' + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = start + 11;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = value.substring(0, start) + `_${selectedText}_` + value.substring(end);
          newSelectionStart = start + 1;
          newSelectionEnd = end + 1;
        } else {
          newText = value.substring(0, start) + '_italic text_' + value.substring(end);
          newSelectionStart = start + 1;
          newSelectionEnd = start + 12;
        }
        break;
      case 'h1':
        if (selectedText) {
          newText = value.substring(0, start) + `# ${selectedText}` + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = end + 2;
        } else {
          newText = value.substring(0, start) + '# Heading 1' + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = start + 11;
        }
        break;
      case 'h2':
        if (selectedText) {
          newText = value.substring(0, start) + `## ${selectedText}` + value.substring(end);
          newSelectionStart = start + 3;
          newSelectionEnd = end + 3;
        } else {
          newText = value.substring(0, start) + '## Heading 2' + value.substring(end);
          newSelectionStart = start + 3;
          newSelectionEnd = start + 13;
        }
        break;
      case 'link':
        setLinkText(selectedText);
        setShowLinkInput(true);
        return;
      case 'applyLink':
        if (linkUrl) {
          const displayText = linkText || 'Link';
          newText = value.substring(0, start) + `[${displayText}](${linkUrl})` + value.substring(end);
          newSelectionStart = start + displayText.length + linkUrl.length + 4;
          newSelectionEnd = newSelectionStart;
          setShowLinkInput(false);
          setLinkUrl('');
          setLinkText('');
        }
        break;
      default:
        break;
    }

    onChange(newText);
    
    // Restore selection
    setTimeout(() => {
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      textarea.focus();
    }, 0);
  };

  // Simple markdown preview renderer with better image handling
  const renderMarkdownPreview = (text) => {
    if (!text) return <p className="text-gray-400">Preview will appear here...</p>;
    
    // Split content by image markdown to handle images separately
    const parts = text.split(/(!?\[.*?\]\(.*?\))/);
    
    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (!part) return null;
          
          // Check if it's an image markdown
          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
          if (imageMatch) {
            const [, alt, src] = imageMatch;
            return (
              <img 
                key={idx}
                src={src} 
                alt={alt || 'Image'} 
                className="max-w-full h-auto rounded my-4 border object-cover"
                onError={(e) => {
                  e.target.style.border = '2px solid red';
                  e.target.title = 'Image failed to load';
                }}
              />
            );
          }
          
          // Convert markdown to HTML for non-image content
          const html = part
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\n/g, '<br />');
          
          return (
            <div key={idx} dangerouslySetInnerHTML={{ __html: html }} />
          );
        })}
      </div>
    );
  };

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-2 bg-gray-50">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="px-2 py-1 rounded hover:bg-gray-200 font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="px-2 py-1 rounded hover:bg-gray-200 italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyFormat('h1')}
          className="px-2 py-1 rounded hover:bg-gray-200 text-lg font-bold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => applyFormat('h2')}
          className="px-2 py-1 rounded hover:bg-gray-200 font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => applyFormat('link')}
          className="px-2 py-1 rounded hover:bg-gray-200 text-black"
          title="Add Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => setShowImageInput(!showImageInput)}
          className="px-2 py-1 rounded hover:bg-gray-200 text-lg"
          title="Insert Image"
        >
          🖼️
        </button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="p-2 border-b bg-gray-50 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Link Text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <input
              type="url"
              placeholder="Enter URL (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyFormat('applyLink')}
              className="px-2 py-1 bg-black text-white rounded text-sm"
              disabled={!linkUrl}
            >
              Apply Link
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
                setLinkText('');
              }}
              className="px-2 py-1 bg-gray-300 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Input */}
      {showImageInput && (
        <div className="p-2 border-b bg-gray-50 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileSelect}
              disabled={uploading}
              className="flex-1 text-sm"
            />
            <span className="text-xs text-gray-600 self-center">OR</span>
            <input
              type="url"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Alt text (optional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          {imageUrl && (
            <div className="max-h-32 overflow-hidden">
              <img src={imageUrl} alt="preview" className="max-w-full h-auto rounded" />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insertImage}
              className="px-2 py-1 bg-black text-white rounded text-sm"
              disabled={!imageUrl || uploading}
            >
              {uploading ? 'Uploading...' : 'Insert Image'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
                setImageAlt('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-2 py-1 bg-gray-300 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id="content-textarea"
        rows="10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 resize-y min-h-48"
      />

      {/* Preview */}
      <div className="p-3 border-t bg-gray-50">
        <h4 className="text-sm font-semibold mb-2">Preview:</h4>
        <div className="text-sm text-gray-600 prose max-w-none no-heading-space">
          {renderMarkdownPreview(value)}
        </div>
      </div>
    </div>
  );
}

function DashboardInner() {
  const token = localStorage.getItem('adminToken');
  const [blogs, setBlogs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    tags: '', 
    blogImage: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const blogData = await api.getBlogs();
      setBlogs(blogData);
    } catch (error) {
      alert('Error loading blogs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required');
      return;
    }
    
    // Fix: Properly format tags array
    const tagsArray = form.tags 
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    
    const payload = {
      title: form.title.trim(),
      content: form.content,
      blogImage: form.blogImage || undefined,
      tags: tagsArray, // Use the properly formatted array
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined
    };
    
    try {
      setLoading(true);
      if (editing) {
        await api.updateBlog(editing, payload, token);
      } else {
        await api.createBlog(payload, token);
      }
      setForm({ title: '', content: '', tags: '', blogImage: '', metaTitle: '', metaDescription: '' });
      setEditing(null);
      await load();
    } catch (error) {
      alert('Error saving post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const edit = (b) => {
    setEditing(b._id);
    setForm({
      title: b.title,
      content: b.content,
      tags: (b.tags || []).join(', '),
      blogImage: b.blogImage || '',
      metaTitle: b.metaTitle || '',
      metaDescription: b.metaDescription || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      setLoading(true);
      await api.deleteBlog(id, token);
      await load();
    } catch (error) {
      alert('Error deleting post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <section className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Post' : 'Create Post'}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Enter post title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Write your content here..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., technology, programming, web"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title (SEO)
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Enter meta title for search engines (50-60 characters)"
                value={form.metaTitle}
                onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                disabled={loading}
                maxLength="60"
              />
              <p className="text-xs text-gray-500 mt-1">{form.metaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description (SEO)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 resize-none"
                placeholder="Enter meta description for search engines (150-160 characters)"
                value={form.metaDescription}
                onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                disabled={loading}
                maxLength="160"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-1">{form.metaDescription.length}/160 characters</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <ImageUploader 
                onUploaded={(url) => setForm({ ...form, blogImage: url })} 
                disabled={loading}
              />
              {form.blogImage && (
                <div className="mt-2">
                  <img src={form.blogImage} className="w-full h-48 object-cover rounded border" alt="Preview" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, blogImage: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={submit}
            disabled={loading}
            className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (editing ? 'Update Post' : 'Create Post')}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ title: '', content: '', tags: '', blogImage: '', metaTitle: '', metaDescription: '' });
              }}
              disabled={loading}
              className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">All Posts ({blogs.length})</h2>
        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : (
          <div className="grid gap-4">
            {blogs.map(b => (
              <div key={b._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-start gap-4">
                {b.blogImage && (
                  <img src={b.blogImage} className="w-32 h-24 object-cover rounded" alt={b.title} />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{b.title}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-2">
                    {b.content.replace(/\*\*|\*|_|#|\[|\]|\(|\)/g, '').substring(0, 100)}...
                  </p>
                  {b.tags && b.tags.length > 0 && (
                    <div className="text-sm text-gray-500 mb-2">
                      Tags: {b.tags.join(', ')}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Created: {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(b)}
                    className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => del(b._id)}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
