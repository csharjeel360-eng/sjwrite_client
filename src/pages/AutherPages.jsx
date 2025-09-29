import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import BlogCard from '../components/BlogCard';

export default function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);

  useEffect(()=>{
    api.blogsByAuthor(id).then(data=>{
      setBlogs(data);
      setAuthor(data[0]?.author || null);
    });
  }, [id]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {author && (
        <div className="flex items-center gap-4 mb-8">
          {author.image && <img src={author.image} className="w-16 h-16 rounded-full" alt={author.name} />}
          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            {author.bio && <p className="text-gray-600">{author.bio}</p>}
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Blogs by {author?.name || 'Author'}</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map(b => <BlogCard key={b._id} blog={b} />)}
      </div>
    </main>
  );
}
