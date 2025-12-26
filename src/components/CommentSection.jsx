import { useState } from 'react';
import { api } from '../api/client';

export default function CommentSection({ blogId, comments=[], onAdded }) {
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await api.addComment(blogId, { username: username || 'Guest', text });
    setUsername('');
    setText('');
    setLoading(false);
    onAdded?.();
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>
      <ul className="space-y-3">
        {comments.map((c,i)=>(
          <li key={i} className="border rounded p-3">
            <div className="font-semibold">{c.username} <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString?.() || ''}</span></div>
            <p className="text-gray-700">{c.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2">
        <input className="w-full border rounded px-3 py-2" placeholder="Your name (optional)" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <textarea className="w-full border rounded px-3 py-2" rows="3" placeholder="Write a comment..." value={text} onChange={(e)=>setText(e.target.value)} />
        <button onClick={submit} disabled={loading} className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Posting...' : 'Post comment'}
        </button>
      </div>
    </div>
  );
}
