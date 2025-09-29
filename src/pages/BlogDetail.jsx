 import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import CommentSection from '../components/CommentSection';
import BlogCard from '../components/BlogCard'; // Import your BlogCard component
 
// Helper function to safely handle tags and split multi-word tags
const getSafeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .filter(tag => tag && tag.trim() !== '')
      .flatMap(tag => tag.split(/\s+/)) // Split on any whitespace
      .filter(tag => tag !== '');
  }
  if (typeof tags === 'string') {
    // Handle case where tags might be stored as comma-separated string
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '')
      .flatMap(tag => tag.split(/\s+/)) // Split on any whitespace
      .filter(tag => tag !== '');
  }
  return [];
};

// Markdown renderer component
function MarkdownRenderer({ content }) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = (text) => {
      if (!text) return '';
      
      return text
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-bold my-4 md:my-6">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl md:text-2xl font-bold my-3 md:my-5">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg md:text-xl font-bold my-2 md:my-4">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed">$1</p>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    };

    setHtmlContent(renderMarkdown(content));
  }, [content]);

  return (
    <article 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: `<div>${htmlContent}</div>` }} 
    />
  );
}

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Check if user has already liked this blog
  const checkIfLiked = () => {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
    return likedBlogs[id] === true;
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      const blogData = await api.getBlog(id);
      setBlog(blogData);
      setHasLiked(checkIfLiked());
    } catch (error) {
      console.error('Error loading blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedBlogs = async () => {
    if (!blog) return;
    
    try {
      setRelatedLoading(true);
      // Get blogs with similar tags
      const tags = getSafeTags(blog.tags);
      if (tags.length > 0) {
        // Try to get blogs by the first tag
        const relatedByTag = await api.blogsByTag(tags[0]);
        // Filter out the current blog and limit to 5
        const filtered = relatedByTag
          .filter(b => b._id !== id)
          .slice(0, 5);
        setRelatedBlogs(filtered);
      } else {
        // If no tags, get latest blogs instead
        const allBlogs = await api.getBlogs();
        const filtered = allBlogs
          .filter(b => b._id !== id)
          .slice(0, 5);
        setRelatedBlogs(filtered);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
      // Fallback to getting all blogs if tag search fails
      try {
        const allBlogs = await api.getBlogs();
        const filtered = allBlogs
          .filter(b => b._id !== id)
          .slice(0, 5);
        setRelatedBlogs(filtered);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => { 
    loadBlog(); 
  }, [id]);

  useEffect(() => {
    if (blog) {
      loadRelatedBlogs();
    }
  }, [blog]);

  const like = async () => {
    // Check if user has already liked
    if (hasLiked) {
      alert('You have already liked this blog!');
      return;
    }

    try {
      setLiking(true);
      const { likes } = await api.likeBlog(id);
      
      // Update local storage to mark this blog as liked
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
      likedBlogs[id] = true;
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
      
      setBlog(prev => ({ ...prev, likes }));
      setHasLiked(true);
    } catch (error) {
      console.error('Error liking blog:', error);
    } finally {
      setLiking(false);
    }
  };

  // Safely get tags from blog object and split multi-word tags
  const tags = blog ? getSafeTags(blog.tags) : [];

  if (loading) {
    return (
      
      
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-48 md:h-72 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
        <Link to="/blogs" className="text-blue-600 hover:underline">
          ← Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <>
     <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="max-w-3xl mx-auto mb-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blogs" className="hover:text-blue-600">Blogs</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 line-clamp-1">{blog.title}</span>
        </nav>

        {/* Featured Image with Tags and Like Count */}
        {blog.blogImage && (
          <div className="relative overflow-hidden rounded-lg mb-6 shadow-md">
            <img 
              src={blog.blogImage} 
              className="w-full h-48 md:h-72 object-cover" 
              alt={blog.title} 
            />
            
            {/* Tags displayed at the bottom of the image */}
            {tags.length > 0 && (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm cursor-pointer hover:bg-black/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to tag page or filter by tag
                      console.log('Tag clicked:', tag);
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                    +{tags.length - 4} more
                  </span>
                )}
              </div>
            )}
            
            {/* Like count overlay at top right */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 text-white backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{blog.likes || 0}</span>
            </div>
          </div>
        )}

        {/* Title and Metadata */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{blog.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{Math.ceil(blog.content.split(' ').length / 200)} min read</span>
          </div>

          <div className="flex items-center gap-2">
            
            
          </div>
        </div>

        {/* Author Info */}
        {blog.author?.name && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-8">
            {blog.author.image && (
              <img 
                src={blog.author.image} 
                className="w-12 h-12 rounded-full object-cover" 
                alt={blog.author.name} 
              />
            )}
            <div>
              <Link 
                to={`/author/${blog.author._id}`} 
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {blog.author.name}
              </Link>
              {blog.author.bio && (
                <p className="text-sm text-gray-600 mt-1">{blog.author.bio}</p>
              )}
            </div>
          </div>
        )}

      
        {/* Content */}
        <div className="border-t pt-6 mb-8">
          <MarkdownRenderer content={blog.content} />
        </div>

        {/* Like Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={like} 
            disabled={liking || hasLiked}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 ${
              hasLiked 
                ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {liking ? 'Liking...' : hasLiked ? 'Liked' : `Like (${blog.likes || 0})`}
            </span>
          </button>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {blog.comments?.length || 0} comments
            </span>
          </div>
        </div>

        {/* Comment Section */}
        <CommentSection blogId={id} comments={blog.comments || []} onAdded={loadBlog} />

        {/* Back to Blogs Link */}
        <div className="mt-12 text-center">
          <Link 
            to="/blogs" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all blogs
          </Link>
        </div>
      </main>

      {/* Related Blogs Section */}
      {relatedBlogs.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            You might also like
          </h2>
          
          {relatedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
          
          {relatedBlogs.length >= 5 && (
            <div className="text-center mt-8">
              <Link 
                to="/blogs" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                View all blogs
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
    </>
  );
}