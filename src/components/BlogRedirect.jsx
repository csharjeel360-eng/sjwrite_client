 // components/BlogRedirect.jsx
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '../api/client';

const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function BlogRedirect() {
  const { id } = useParams();
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findSlug = async () => {
      try {
        const blogData = await api.getBlog(id);
        if (blogData) {
          setSlug(generateSlug(blogData.title));
        }
      } catch (error) {
        console.error('Error finding blog:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      findSlug();
    }
  }, [id]);

  if (loading) return <div>Redirecting...</div>;
  
  if (slug) {
    return <Navigate to={`/${slug}`} replace />;
  }

  return <Navigate to="/blogs" replace />;
}