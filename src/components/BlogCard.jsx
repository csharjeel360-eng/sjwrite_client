// components/BlogCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog, size = 'normal', showExcerpt = false, cleanUrl = false }) => {
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 🟢 Clean URL generation (root path slug, no /blog prefix)
  const blogUrl = cleanUrl
    ? `/${generateSlug(blog.title)}`
    : `/${generateSlug(blog.title)}?id=${blog._id}`;

  const markdownToPlainText = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/#{1,6}\s?(.*?)(\n|$)/g, '$1')
      // Remove markdown links and optional {rel:...} attributes (e.g. [text](url){rel:nofollow})
      .replace(/\[(.*?)\]\(.*?\)(?:\{rel:[^}]+\})?/g, '$1')
      // Also strip any stray {rel:...} that might remain
      .replace(/\{rel:[^}]+\}/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Always sanitize excerpt (whether provided by backend or generated from content)
  const excerpt = markdownToPlainText(blog.excerpt || blog.content).substring(0, 150);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link to={blogUrl} className="block">
        <img
          src={blog.blogImage}
          alt={blog.blogImageAlt || `${blog.title} - Featured image`}
          className="w-full h-48 object-cover"
          loading="lazy"
          width="400"
          height="225"
        />
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Categories/Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500">
              {blog.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx}>
                  <Link 
                    to={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-gray-700"
                  >
                    {tag}
                  </Link>
                  {idx === 0 && blog.tags.length > 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className={`font-bold mb-2 ${size === 'large' ? 'text-xl' : 'text-lg'}`}>
          <Link to={blogUrl} className="text-gray-900 hover:text-black">
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {showExcerpt && excerpt && (
          <p className="text-gray-600 mb-3 text-sm">
            {excerpt}...
          </p>
        )}

        {/* Date and Read More */}
        <div className="flex items-center justify-between text-sm">
          <time dateTime={blog.createdAt} className="text-gray-500">
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </time>
          <Link 
            to={blogUrl}
            className="text-blue-600 hover:text-blue-800 font-medium"
            aria-label={`Read ${blog.title}`}
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;