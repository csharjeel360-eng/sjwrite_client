import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

// Helper function to generate URL-friendly slug
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function BlogCard({ blog, size = 'normal', showExcerpt = true }) {
  const navigate = useNavigate();

  const handleReadMore = async (e) => {
    e.preventDefault();
    await api.incrementView(blog._id);
    const slug = generateSlug(blog.title);
    navigate(`/blog/${slug}?id=${blog._id}`);
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getCategoryDisplay = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    return categories.slice(0, 2).map((cat, idx) => (
      <a 
        key={idx} 
        href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
        className="entry-category entry-category-item"
      >
        {cat}
      </a>
    ));
  };

  const getImageSize = () => {
    switch(size) {
      case 'large':
        return 'h-96';
      case 'medium':
        return 'h-64';
      case 'small':
        return 'h-48';
      default:
        return 'h-56';
    }
  };

  const getTitleSize = () => {
    switch(size) {
      case 'large':
        return 'text-2xl md:text-3xl';
      case 'medium':
        return 'text-xl';
      case 'small':
        return 'text-lg';
      default:
        return 'text-xl';
    }
  };

  const truncateContent = (content, maxLength = 120) => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  return (
    <article className={`entry-tpl-tile ${size === 'large' ? 'entry-tpl-tile-xl' : ''} g1-dark`}>
      {/* Featured Image */}
      <div className="entry-featured-media">
        <Link 
          to={`/blog/${generateSlug(blog.title)}?id=${blog._id}`} 
          className="g1-frame"
          onClick={handleReadMore}
        >
          <div className="g1-frame-inner">
            {blog.blogImage && (
              <img
                src={blog.blogImage}
                alt={blog.title}
                className={`w-full ${getImageSize()} object-cover lazyloaded`}
                loading="lazy"
              />
            )}
            <span className="g1-frame-icon"></span>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="entry-body p-4 bg-white">
        {/* Categories */}
        <header className="entry-header">
          <div className="entry-before-title mb-2">
            <span className="entry-categories">
              <span className="entry-categories-inner">
                <span className="entry-categories-label text-sm text-gray-500">in</span>
                {getCategoryDisplay(blog.tags)}
                {blog.tags && blog.tags.length > 2 && (
                  <span className="text-sm text-gray-500 ml-1">+{blog.tags.length - 2} more</span>
                )}
              </span>
            </span>
          </div>

          {/* Title */}
          <h3 className={`${getTitleSize()} font-bold entry-title mb-3`}>
            <Link 
              to={`/blog/${generateSlug(blog.title)}?id=${blog._id}`}
              className="text-gray-900 hover:text-black"
              onClick={handleReadMore}
            >
              {blog.title}
            </Link>
          </h3>

          {/* Excerpt - Only show for medium/large cards */}
          {showExcerpt && (size === 'large' || size === 'medium') && blog.content && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {truncateContent(blog.content, size === 'large' ? 200 : 150)}
            </p>
          )}

          {/* Author and Date - Only for large cards */}
          {size === 'large' && (
            <div className="flex items-center mb-4">
              {blog.authorImage && (
                <img 
                  src={blog.authorImage} 
                  alt={blog.author}
                  className="w-8 h-8 rounded-full mr-3"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800">{blog.author || 'Admin'}</p>
                <p className="text-xs text-gray-500">{formatDate(blog.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Read More Button - Only for large cards */}
          {size === 'large' && (
            <div className="entry-ctas">
              <Link 
                to={`/blog/${generateSlug(blog.title)}?id=${blog._id}`}
                className="inline-block px-5 py-2.5 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors"
                onClick={handleReadMore}
              >
                Read More
              </Link>
            </div>
          )}

          {/* Small stats for normal/small cards (date only; likes/comments removed) */}
          {(size === 'normal' || size === 'small') && (
            <div className="flex items-center justify-start text-sm text-gray-500 mt-3">
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          )}
        </header>
      </div>
    </article>
  );
}