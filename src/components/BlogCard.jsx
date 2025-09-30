 import { Link } from 'react-router-dom';
import TagChips from './TagChips';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

// Helper function to convert markdown to plain text for preview
const markdownToPlainText = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/_(.*?)_/g, '$1') // Remove italic
    .replace(/#{1,6}\s?(.*?)(\n|$)/g, '$1') // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markup, keep text
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

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

// Helper function to generate URL-friendly slug
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export default function BlogCard({ blog }) {
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    // You can implement tag filtering navigation here
    console.log('Tag clicked:', tag);
    // Example: navigate to tag page or filter by tag
    // navigate(`/blogs?tag=${tag}`);
  };

  const truncateContent = (content, maxLength = 150) => {
    const plainText = markdownToPlainText(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const handleReadMore = async (e) => {
    e.preventDefault();
    await api.incrementView(blog._id);
    const slug = generateSlug(blog.title);
    navigate(`/blog/${slug}?id=${blog._id}`);
  };

  // Safely get tags from blog object and split multi-word tags
  const tags = getSafeTags(blog.tags);

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in">
      {blog.blogImage && (
        <div className="relative overflow-hidden">
          <img 
            src={blog.blogImage} 
            alt={blog.title} 
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" 
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
                    handleTagClick(tag);
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
        </div>
      )}
      
      <div className="p-5">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          {blog.authorImage && (
            <img 
              src={blog.authorImage} 
              alt={blog.author} 
              className="w-8 h-8 rounded-full object-cover" 
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">{blog.author || 'Admin'}</p>
            <p className="text-xs text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Title and content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link to={`/blog/${generateSlug(blog.title)}?id=${blog._id}`}>
            {blog.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {truncateContent(blog.content)}
        </p>

        {/* Tags below content (if no image) */}
        {!blog.blogImage && tags.length > 0 && (
          <TagChips 
            tags={tags} 
            onClick={handleTagClick}
            maxTags={4}
            className="mb-4"
          />
        )}

        {/* Footer with stats and read more */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-red-500">❤️</span>
              {blog.likes || 0} likes
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-500">💬</span>
              {blog.comments?.length || 0} comments
            </span>
          </div>
          
          <Link 
            to={`/blog/${generateSlug(blog.title)}?id=${blog._id}`} 
            onClick={handleReadMore}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors flex items-center gap-1"
          >
            Read more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}