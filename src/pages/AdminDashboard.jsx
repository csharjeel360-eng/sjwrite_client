import { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import ProtectedRoute from '../components/ProtectedRoute';
import ImageUploader from '../components/ImageUploader';

// Improved Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const textareaRef = useRef(null);

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

  // Simple markdown preview renderer
  const renderMarkdownPreview = (text) => {
    if (!text) return <p className="text-gray-400">Preview will appear here...</p>;
    
    // Convert markdown to HTML
    const html = text
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
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
        <div className="text-sm text-gray-600 prose max-w-none">
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
    blogImage: '' 
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
    };
    
    try {
      setLoading(true);
      if (editing) {
        await api.updateBlog(editing, payload, token);
      } else {
        await api.createBlog(payload, token);
      }
      setForm({ title: '', content: '', tags: '', blogImage: '' });
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
                setForm({ title: '', content: '', tags: '', blogImage: '' });
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
