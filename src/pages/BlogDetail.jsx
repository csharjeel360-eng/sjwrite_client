import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import CommentSection from '../components/CommentSection';
import BlogCard from '../components/BlogCard';
import ShareModal from '../components/ShareModal';
import TableOfContents from '../components/TableOfContents';
import { Helmet } from 'react-helmet-async';

// Add this import at the top
import profileImage from '../assets/1.png'; // Adjust the path as needed

// Helper function to safely handle tags and split multi-word tags
const getSafeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .filter(tag => tag && tag.trim() !== '')
      .flatMap(tag => tag.split(/\s+/))
      .filter(tag => tag !== '');
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '')
      .flatMap(tag => tag.split(/\s+/))
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
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
    .trim();
};

// Helper function to convert markdown to plain text
const markdownToPlainText = (markdown) => {
  if (!markdown) return '';
  return markdown
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/_(.*?)_/g, '$1') // Remove italic
    .replace(/#{1,6}\s?(.*?)(\n|$)/g, '$1') // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markup
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .substring(0, 160);
};

// Markdown Renderer Component with proper image handling
function MarkdownRenderer({ content, onHeadingsUpdate }) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = (text) => {
      if (!text) return '';
      
      // Extract headings for table of contents
      const headings = [];
      let headingIndex = 0;
      
      // Cache for images to prevent them from being broken by paragraph processing
      const imageCache = {};
      let imageIndex = 0;

      // First, extract and cache all images (use CSS class + lazy loading)
      let processedText = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        const placeholder = `XIMG${imageIndex}X`;
        imageCache[placeholder] = `<img src="${src}" alt="${alt}" class="no-css-override markdown-body-img" loading="lazy" />`;
        imageIndex++;
        return placeholder;
      });

      // Convert code blocks BEFORE other processing to preserve content
      processedText = processedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `XCODE${imageIndex}X`;
        imageCache[placeholder] = `<pre style="background-color:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow-x:auto;margin-top:1rem;margin-bottom:1rem;border:1px solid #d1d5db"><code style="display:block;white-space:pre;font-family:monospace">${code.trim()}</code></pre>`;
        imageIndex++;
        return placeholder;
      });

        processedText = processedText.replace(
        /(<\/h[1-3]>)\s*(<p)/g, 
        '$1<p class="after-heading"'
      );
      // Convert block-level elements (headings, blockquotes) first, preserving them from paragraph wrapping
      let blockCache = {};
      let blockIndex = 0;

      processedText = processedText
        .replace(/^\s*#\s+(.*$)/gim, (match, title) => {
  const id = `heading-${headingIndex++}`;
  headings.push({ id, title, level: 1 });
  const placeholder = `XBLOCK${blockIndex}X`;
  blockCache[placeholder] = `<h1 id="${id}" class="no-css-override" style="font-size:1.875rem;font-weight:bold;scroll-margin-top:5rem;margin-top:0.5rem;margin-bottom:0.1rem;line-height:1.2">${title}</h1>`;
  blockIndex++;
  return placeholder;
})
        // In MarkdownRenderer, add a unique class
        .replace(/^\s*##\s+(.*$)/gim, (match, title) => {
          const id = `heading-${headingIndex++}`;
          headings.push({ id, title, level: 2 });
          const placeholder = `XBLOCK${blockIndex}X`;
          blockCache[placeholder] = `<h2 id="${id}" class="no-css-override" style="font-size:1.5rem;font-weight:bold;scroll-margin-top:5rem;margin-top:0.5rem;margin-bottom:0.1rem;line-height:1.2">${title}</h2>`;
          blockIndex++;
          return placeholder;
        })
        .replace(/^\s*###\s+(.*$)/gim, (match, title) => {
  const id = `heading-${headingIndex++}`;
  headings.push({ id, title, level: 3 });
  const placeholder = `XBLOCK${blockIndex}X`;
  blockCache[placeholder] = `<h3 id="${id}" class="no-css-override" style="font-size:1.125rem;font-weight:bold;scroll-margin-top:5rem;margin-top:0.5rem;margin-bottom:0.1rem;line-height:1.2">${title}</h3>`;
  blockIndex++;
  return placeholder;
})
        .replace(/^>\s*(.*$)/gim, (match, quote) => {
          const placeholder = `XBLOCK${blockIndex}X`;
          blockCache[placeholder] = `<blockquote style="border-left:4px solid #d1d5db;padding-left:1rem;padding-top:0.5rem;padding-bottom:0.5rem;margin-top:1rem;margin-bottom:1rem;background-color:#f9fafb;font-style:italic">${quote}</blockquote>`;
          blockIndex++;
          return placeholder;
        });

      // Now apply inline formatting
      processedText = processedText
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="font-style:italic">$1</em>')
        .replace(/_(.*?)_/g, '<em style="font-style:italic">$1</em>')
        .replace(/~~(.*?)~~/g, '<del style="text-decoration:line-through">$1</del>')
        .replace(/\[(.*?)\]\((.*?)\)\{rel:(follow|nofollow|sponsored)\}/g, '<a href="$2" style="color:#000;text-decoration:underline" target="_blank" rel="$3 noopener noreferrer">$1</a>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#000;text-decoration:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/`([^`]+)`/g, '<code style="background-color:#f3f4f6;padding:0.125rem 0.375rem;border-radius:0.25rem;font-size:0.875rem;font-family:monospace;border:1px solid #d1d5db">$1</code>');

      // Handle newlines: convert \n\n to paragraph breaks, \n to <br /> within paragraphs
      const lines = processedText.split(/\n\n+/);
      processedText = lines.map(line => {
        // Skip empty lines and block placeholders
        if (!line.trim() || /^XBLOCK|^XCODE|^XIMG/.test(line.trim())) {
          return line;
        }
        // Replace single newlines with <br /> within text
        const withBreaks = line.replace(/\n/g, '<br />');
        // Wrap in paragraph tag with inline styles (add explicit margins)
        return `<p style="line-height:1.5;color:#374151;margin-top:0.5rem;margin-bottom:1rem">${withBreaks}</p>`;
      }).join('');

      // Restore all cached block elements, images, and code blocks
      Object.entries(blockCache).forEach(([placeholder, blockHtml]) => {
        processedText = processedText.replace(placeholder, blockHtml);
      });
      
      Object.entries(imageCache).forEach(([placeholder, html]) => {
        processedText = processedText.replace(placeholder, html);
      });

      // Clean up any errant paragraph wrapping around block elements
      processedText = processedText
        .replace(/<p>\s*(<h[1-6]|<pre|<blockquote|<img)/g, '$1')
        .replace(/(<\/h[1-6]>|<\/pre>|<\/blockquote>|)\s*<\/p>/g, '$1');

      // Notify parent component about headings
      if (onHeadingsUpdate) {
        onHeadingsUpdate(headings);
      }

      return processedText;
    };

    setHtmlContent(renderMarkdown(content));
  }, [content, onHeadingsUpdate]);

  return (
    <article 
      className="max-w-none"
      dangerouslySetInnerHTML={{ __html: `<div>${htmlContent}</div>` }} 
    />
  );
}

// Reading progress bar component
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setProgress(Number((currentProgress / scrollHeight * 100).toFixed(2)));
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-black transition-transform duration-150 origin-left"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}

// Enhanced ShareModal Component with Image Support
function EnhancedShareModal({ blog, onClose, cleanUrl, description }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const shareOnPlatform = (platform) => {
    const title = encodeURIComponent(blog.title);
    const url = encodeURIComponent(cleanUrl);
    const imageUrl = encodeURIComponent(blog.blogImage || blog.image || '');
    const text = encodeURIComponent(description);
    
    switch(platform) {
      case 'facebook':
        // Facebook supports image preview via Open Graph tags
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        // Twitter will show image if Open Graph tags are set correctly
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${title}%0A%0A${url}`, '_blank', 'width=600,height=400');
        break;
      case 'pinterest':
        // Pinterest supports direct image pinning
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${imageUrl}&description=${title}`, '_blank', 'width=750,height=600');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
        break;
      case 'reddit':
        window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank', 'width=850,height=600');
        break;
      case 'email':
        const subject = encodeURIComponent(blog.title);
        const body = encodeURIComponent(`Check out this blog post:\n\n${blog.title}\n\n${description}\n\nRead more: ${cleanUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        break;
      case 'native':
        // Use Web Share API if available (supports images on mobile)
        if (navigator.share) {
          navigator.share({
            title: blog.title,
            text: description,
            url: cleanUrl,
          }).catch(err => console.log('Error sharing:', err));
        } else {
          alert('Web Share API not supported on this browser.');
        }
        break;
      default:
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cleanUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy link');
      });
  };

  const downloadImage = () => {
    if (blog.blogImage) {
      const link = document.createElement('a');
      link.href = blog.blogImage;
      link.download = `blog-image-${generateSlug(blog.title)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-md mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Share This Post</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
          
          {/* Blog Preview Card with Image */}
          <div className="mb-4 sm:mb-6 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            {blog.blogImage ? (
              <div className="relative">
                <img
                  src={blog.blogImage}
                  alt={blog.title}
                  loading="lazy"
                  className="w-full h-32 sm:h-48 object-cover"
                />
                <button
                  onClick={downloadImage}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                  aria-label="Download image"
                  title="Download image"
                >
                  <i className="fas fa-download text-gray-700 text-sm"></i>
                </button>
              </div>
            ) : (
              <div className="w-full h-32 sm:h-48 bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                <i className="fas fa-image text-2xl sm:text-4xl text-gray-400"></i>
              </div>
            )}
            <div className="p-3 sm:p-4">
              <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">{blog.title}</h4>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{description}</p>
              )}
            </div>
          </div>

          {/* Share Buttons Grid - Responsive */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center">Share on social media:</p>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* Facebook */}
              <button
                onClick={() => shareOnPlatform('facebook')}
                className="flex flex-col items-center p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on Facebook"
                title="Facebook"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-facebook-f text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">Facebook</span>
              </button>
              
              {/* Twitter */}
              <button
                onClick={() => shareOnPlatform('twitter')}
                className="flex flex-col items-center p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on Twitter"
                title="Twitter"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-twitter text-blue-400 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">Twitter</span>
              </button>
              
              {/* LinkedIn */}
              <button
                onClick={() => shareOnPlatform('linkedin')}
                className="flex flex-col items-center p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on LinkedIn"
                title="LinkedIn"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-linkedin-in text-blue-700 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">LinkedIn</span>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => shareOnPlatform('whatsapp')}
                className="flex flex-col items-center p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl hover:bg-green-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on WhatsApp"
                title="WhatsApp"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-whatsapp text-green-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">WhatsApp</span>
              </button>
              
              {/* Pinterest */}
              <button
                onClick={() => shareOnPlatform('pinterest')}
                className="flex flex-col items-center p-2 sm:p-3 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on Pinterest"
                title="Pinterest"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-pinterest-p text-red-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">Pinterest</span>
              </button>
              
              {/* Telegram */}
              <button
                onClick={() => shareOnPlatform('telegram')}
                className="flex flex-col items-center p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share on Telegram"
                title="Telegram"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fab fa-telegram text-blue-500 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">Telegram</span>
              </button>
              
              {/* Email */}
              <button
                onClick={() => shareOnPlatform('email')}
                className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share via Email"
                title="Email"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fas fa-envelope text-gray-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">Email</span>
              </button>
              
              {/* Native Share */}
              <button
                onClick={() => shareOnPlatform('native')}
                className="flex flex-col items-center p-2 sm:p-3 bg-purple-50 rounded-lg sm:rounded-xl hover:bg-purple-100 transition-all duration-300 hover:scale-105 active:scale-95 group"
                aria-label="Share via device"
                title="Device Share"
              >
                <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 mb-1 sm:mb-2 transition-colors">
                  <i className="fas fa-share-alt text-purple-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">More</span>
              </button>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Or copy link:</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={cleanUrl}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 pr-20 sm:pr-24 truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className={`absolute right-1 top-1/2 transform -translate-y-1/2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                  aria-label="Copy link to clipboard"
                >
                  {copySuccess ? (
                    <>
                      <i className="fas fa-check mr-1"></i>
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy mr-1"></i>
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Note about image sharing */}
          <div className="text-xs bg-gray-50 p-2 sm:p-3 rounded-lg">
            <p className="flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0"></i>
              <span className="text-gray-500">
                Images are shared automatically via Open Graph tags on most platforms. 
                Pinterest supports direct image pinning. Ensure your Open Graph tags are properly configured.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const blogId = searchParams.get('id');
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [views, setViews] = useState(0);

  // Snapshot TTL used for session restore
  const SNAP_TTL = 10 * 60 * 1000; // 10 minutes

  // Define these at the top level to avoid hoisting issues
  const tags = blog ? getSafeTags(blog.tags) : [];
  const cleanUrl = blog ? `https://sjwrites.com/${generateSlug(blog.title)}` : '';
  const description = blog ? (blog.excerpt || markdownToPlainText(blog.content)) : '';

  // Use resolvedId internally (either from query param or from loaded blog)
  const resolvedId = blogId || (blog && blog._id);

  // Check if user has already liked this blog
  const checkIfLiked = (id = blogId) => {
    if (!id) return false;
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
    return likedBlogs[id] === true;
  };

  // Check if blog is bookmarked
  const checkIfBookmarked = (id = blogId) => {
    if (!id) return false;
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBlogs') || '{}');
    return bookmarks[id] === true;
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      // Try to restore from session snapshot to avoid reloading when navigating back
      const snapshotKey = `blog_snapshot:${blogId}`;
      const SNAP_TTL = 10 * 60 * 1000; // 10 minutes
      const raw = blogId ? sessionStorage.getItem(snapshotKey) : null;
      let blogData = null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.fetchedAt && (Date.now() - parsed.fetchedAt) < SNAP_TTL) {
            blogData = parsed.data;
          }
        } catch (e) {
          console.warn('Invalid blog snapshot JSON', e);
        }
      }
      if (!blogData) {
        blogData = await api.getBlog(blogId);
      }
      
      // 🔴 CRITICAL: Reject unpublished/deleted blogs
      if (blogData.published === false) {
        setBlog(null);
        return;
      }
      
      setBlog(blogData);
      setHasLiked(checkIfLiked());
      setIsBookmarked(checkIfBookmarked());
      
      // Track view
      // Track view only if we freshly loaded from network (no snapshot)
      if (!raw) {
        try {
          await api.incrementView(blogId);
          setViews(prev => (blogData.views || 0) + 1);
        } catch (error) {
          console.error('Error tracking view:', error);
          setViews(blogData.views || 0);
        }
      } else {
        setViews(blogData.views || 0);
      }
      
      // Generate clean URL
      const cleanUrl = `https://sjwrites.com/${generateSlug(blogData.title)}`;
      
      // Update URL to clean version (without ?id= parameter) and keep root-path slug
      if (searchParams.get('id')) {
        // Replace the URL without causing a reload
        window.history.replaceState(null, '', `/${generateSlug(blogData.title)}`);
      }

      // Save a session snapshot so navigating back restores instantly
      if (blogId) {
        try {
          sessionStorage.setItem(snapshotKey, JSON.stringify({ fetchedAt: Date.now(), data: blogData }));
        } catch (e) {
          console.warn('Failed to write blog snapshot', e);
        }
      }
      
    } catch (error) {
      console.error('Error loading blog:', error);
      setBlog(null); // Treat errors as not found
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedBlogs = async () => {
    if (!blog) return;
    
    try {
      setRelatedLoading(true);
      const tags = getSafeTags(blog.tags);
      let related = [];

      if (tags.length > 0) {
        // Use your existing blogsByTag method for the first tag
        try {
          const relatedByTag = await api.blogsByTag(tags[0]);
          related = [...related, ...relatedByTag];
        } catch (tagError) {
          console.error('Error loading blogs by tag:', tagError);
        }

        // Try to get more blogs by other tags
        for (let i = 1; i < Math.min(tags.length, 3); i++) {
          try {
            const moreBlogs = await api.blogsByTag(tags[i]);
            related = [...related, ...moreBlogs];
          } catch (error) {
            continue;
          }
        }
      }

      // Fallback to latest blogs
      if (related.length < 3) {
        try {
          const allBlogs = await api.getBlogs();
          related = [...related, ...allBlogs];
        } catch (error) {
          console.error('Error loading fallback blogs:', error);
        }
      }

      // Filter, deduplicate and limit results
      // 🔴 CRITICAL: Only show published blogs
      const filtered = related
        .filter(b => b._id !== resolvedId)
        .filter(b => b.published !== false) // Exclude explicitly unpublished
        .filter((blog, index, self) => 
          index === self.findIndex(b => b._id === blog._id)
        )
        .slice(0, 6);

      setRelatedBlogs(filtered);
    } catch (error) {
      console.error('Error loading related blogs:', error);
      // Ultimate fallback
      try {
        const allBlogs = await api.getBlogs();
        const filtered = allBlogs
          .filter(b => b._id !== resolvedId)
          .filter(b => b.published !== false) // Exclude explicitly unpublished
          .slice(0, 6);
        setRelatedBlogs(filtered);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    // resolvedId is the authoritative id we use internally (either from query or from loaded blog)
    const resolvedId = blogId || (blog && blog._id);

    if (blogId) {
      loadBlog();
      return;
    }

    // If there's no id query param, try resolving by slug (keep URL clean)
    const loadBySlug = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        
        // 🚀 OPTIMIZATION: This should use a dedicated API endpoint
        // TODO: Add to api/client.js: api.getBlogBySlug(slug)
        // For now, using getBlogs() - consider refactoring this when scale grows
        // Try snapshot by slug first
        const slugKey = `blog_snapshot_slug:${slug}`;
        const rawSlug = sessionStorage.getItem(slugKey);
        let matched = null;
        if (rawSlug) {
          try {
            const parsed = JSON.parse(rawSlug);
            if (parsed && parsed.fetchedAt && (Date.now() - parsed.fetchedAt) < SNAP_TTL) {
              matched = parsed.data;
            }
          } catch (e) { /* ignore */ }
        }
        const all = matched ? [matched] : await api.getBlogs();
        
        // 🔴 CRITICAL: Filter for published blogs only to prevent indexing deleted content
        matched = matched || all.find(b => 
          generateSlug(b.title) === slug && 
          (b.published !== false) // Include blogs without 'published' field (backward compat), but exclude explicitly unpublished
        );
        
        if (!matched) {
          // Blog not found, unpublished, or deleted
          setBlog(null);
          return;
        }

        setBlog(matched);
        setHasLiked(checkIfLiked(matched._id));
        setIsBookmarked(checkIfBookmarked(matched._id));

        // Track view using resolved id but do NOT change the URL
        // Track view using resolved id but do NOT change the URL
        if (!rawSlug) {
          try {
            await api.incrementView(matched._id);
            setViews(prev => (matched.views || 0) + 1);
          } catch (error) {
            console.error('Error tracking view by slug:', error);
            setViews(matched.views || 0);
          }
        } else {
          setViews(matched.views || 0);
        }

        // Save snapshot by slug
        try {
          sessionStorage.setItem(slugKey, JSON.stringify({ fetchedAt: Date.now(), data: matched }));
        } catch (e) { /* ignore */ }
      } catch (error) {
        console.error('Error resolving blog by slug:', error);
        setBlog(null); // Treat errors as not found
      } finally {
        setLoading(false);
      }
    };

    loadBySlug();
  }, [blogId, slug]);

  useEffect(() => {
    if (blog) {
      loadRelatedBlogs();
    }
  }, [blog]);

  const like = async () => {
    if (hasLiked) {
      alert('You have already liked this blog!');
      return;
    }

    try {
      setLiking(true);
      const idToUse = resolvedId;
      if (!idToUse) throw new Error('Blog id is not available');

      const { likes } = await api.likeBlog(idToUse);

      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
      likedBlogs[idToUse] = true;
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));

      setBlog(prev => ({ ...prev, likes }));
      setHasLiked(true);
    } catch (error) {
      console.error('Error liking blog:', error);
    } finally {
      setLiking(false);
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBlogs') || '{}');
    const idToUse = resolvedId;
    if (!idToUse) return;

    if (isBookmarked) {
      delete bookmarks[idToUse];
      setIsBookmarked(false);
    } else {
      bookmarks[idToUse] = {
        id: idToUse,
        title: blog.title,
        excerpt: blog.excerpt,
        blogImage: blog.blogImage,
        createdAt: blog.createdAt,
        author: blog.author
      };
      setIsBookmarked(true);
    }

    localStorage.setItem('bookmarkedBlogs', JSON.stringify(bookmarks));
  };

  const shareBlog = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const printBlog = () => {
    window.print();
  };

  // Refresh the blog data using resolvedId (works for both query-id and slug-resolved)
  const refreshBlog = async () => {
    const idToUse = resolvedId;
    if (!idToUse) return;
    try {
      const blogData = await api.getBlog(idToUse);
      setBlog(blogData);
      setHasLiked(checkIfLiked(idToUse));
      setIsBookmarked(checkIfBookmarked(idToUse));
    } catch (error) {
      console.error('Error refreshing blog:', error);
    }
  };

  const navigateToTag = (tag) => {
    navigate(`/blogs?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          {/* 🔴 CRITICAL: Do NOT index loading states */}
          {/* Helmet tags intentionally empty - let parent default <title> show temporarily */}
          <meta name="robots" content="noindex, nofollow" />
          {/* Clear any dynamic meta to prevent duplication */}
          <meta name="description" content="" />
        </Helmet>
        <ReadingProgress />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-48 md:h-72 bg-gray-200 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Helmet>
          {/* 🔴 CRITICAL: Block indexing of 404 pages - prevents Soft 404 penalties */}
          <title>Page Not Found - SJWrites</title>
          <meta name="robots" content="noindex, follow" />
          <meta name="description" content="The requested blog post could not be found." />
          {/* Explicitly prevent canonical, OG, and schema for 404 pages */}
          <link rel="canonical" href="" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or may have been removed.</p>
          <Link to="/" className="text-black hover:underline font-medium">
            ← Back to homepage
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        {/* 🟢 CRITICAL: Self-referencing canonical URL (CLEAN VERSION) */}
        <link rel="canonical" href={cleanUrl} />
        
        {/* 🟢 Unique title and description - Uses meta fields if set, otherwise falls back to auto-generated */}
        <title>{blog.metaTitle ? `${blog.metaTitle} - SJWrites` : `${blog.title} - SJWrites`}</title>
        <meta name="description" content={blog.metaDescription || description} />
        
        {/* 🟢 Open Graph tags (CRITICAL FOR IMAGE SHARING) */}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || description} />
        <meta property="og:image" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={blog.title} />
        <meta property="og:url" content={cleanUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="SJWrites" />
        <meta property="og:locale" content="en_US" />
        
        {/* 🟢 Twitter Card (CRITICAL FOR TWITTER SHARING) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.metaTitle || blog.title} />
        <meta name="twitter:description" content={blog.metaDescription || description} />
        <meta name="twitter:image" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        <meta name="twitter:image:alt" content={blog.title} />
        <meta name="twitter:site" content="@sjwrites" />
        <meta name="twitter:creator" content="@sjwrites" />
        
        {/* 🟢 Google-specific image meta tags */}
        <meta name="image" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        <meta name="thumbnail" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        
        {/* 🟢 Article specific OG tags */}
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:modified_time" content={blog.updatedAt || blog.createdAt} />
        <meta property="article:author" content={blog.author?.name || "Sharjeel"} />
        {tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* 🟢 BlogPosting Schema (MOST IMPORTANT FOR INDEXING) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.metaDescription || description,
            "image": {
              "@type": "ImageObject",
              "url": blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png',
              "width": 1200,
              "height": 630,
              "name": blog.title,
              "description": blog.title
            },
                "author": {
                  "@type": "Person",
                  "name": blog.author?.name || "Sharjeel",
                  "url": "https://sjwrites.com/about",
                  "image": "https://sjwrites.com/assets/1.png"
                },
            "publisher": {
              "@type": "Organization",
              "name": "SJWrites",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sjwrites.com/logo.png",
                "width": 600,
                "height": 60
              }
            },
            "datePublished": blog.createdAt,
            "dateModified": blog.updatedAt || blog.createdAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": cleanUrl
            },
            "inLanguage": "en-US",
            "keywords": tags.join(', '),
            "articleBody": markdownToPlainText(blog.content),
            "wordCount": blog.content ? blog.content.split(' ').length : 0,
            "commentCount": blog.comments?.length || 0
          })}
        </script>
        
        {/* 🟢 Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sjwrites.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://sjwrites.com"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": blog.title,
                "item": cleanUrl
              }
            ]
          })}
        </script>
      </Helmet>
      
      <ReadingProgress />
      
      {/* Enhanced Share Modal */}
      {showShareModal && (
        <EnhancedShareModal 
          blog={blog}
          cleanUrl={cleanUrl}
          description={description}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Table of Contents</h4>
                  <nav>
                    {headings.map((heading, index) => (
                      <a
                        key={index}
                        href={`#${heading.id}`}
                        className={`block py-1 text-gray-600 hover:text-black transition-colors text-sm ${
                          heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : ''
                        }`}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={`${headings.length > 0 ? 'lg:flex-1' : 'max-w-3xl mx-auto'} mb-12`}>
            {/* 🟢 H1 Heading (CRITICAL FOR SEO) */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Author, Date, and Share Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b">
              <div className="flex items-center gap-4">
                <img
                  src={profileImage}
                  alt="Sharjeel — Author, SJWrites"
                  loading="lazy"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-sm flex-shrink-0 antialiased transform-gpu"
                />
                <div>
                  <div className="font-medium text-gray-900">by Sharjeel</div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <time dateTime={blog.createdAt}>
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <span>•</span>
                    <span>{views} views</span>
                    <span>•</span>
                    <span>{blog.likes || 0} likes</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={shareBlog}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-300 hover:scale-105 active:scale-95 shadow-md text-sm"
                aria-label="Share this post"
              >
                <i className="fas fa-share-nodes"></i>
                Share 📤
              </button>
            </div>

            {/* Featured Image with alt text */}
            {blog.blogImage && (
              <div className="relative overflow-hidden rounded-xl mb-8 shadow-lg">
                <img
                  src={blog.blogImage}
                  alt={`${blog.title} - Featured image`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  width="1200"
                  height="675"
                />
                
                {/* Tags overlay (non-clickable on detail page) */}
                {tags.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag, index) => (
                      <Link
                        key={index}
                        to={`/tag/${generateSlug(tag)}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-black/80 text-white backdrop-blur-sm"
                        aria-label={`View posts tagged ${tag}`}
                      >
                        #{tag}
                      </Link>
                    ))}
                    {tags.length > 4 && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-black/80 text-white backdrop-blur-sm">
                        +{tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="mb-10">
              <MarkdownRenderer 
                content={blog.content} 
                onHeadingsUpdate={setHeadings}
              />
            </div>

            {/* Tags Section (non-clickable; heading removed) */}
            {tags.length > 0 && (
              <div className="mb-10 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/tag/${generateSlug(tag)}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-700"
                      aria-label={`View posts tagged ${tag}`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={like}
                disabled={liking || hasLiked}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  hasLiked 
                    ? 'bg-blue-100 text-blue-600 cursor-default' 
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`}
                aria-label={hasLiked ? "You already liked this post" : "Like this post"}
                title={hasLiked ? "You already liked this" : "Like this post"}
              >
                <i className={`fas fa-thumbs-up text-lg ${hasLiked ? 'text-blue-600' : ''}`}></i>
                <span>{blog.likes || 0}</span>
              </button>
              
              <button
                onClick={toggleBookmark}
                className={`inline-flex items-center gap-2 px-6 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isBookmarked
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-blue-300'
                    : 'bg-white text-blue-600 border-2 border-blue-500 hover:border-blue-600 hover:bg-blue-50 shadow-lg'
                }`}
                aria-label={isBookmarked ? "Remove from bookmarks" : "Bookmark this post"}
              >
                <i className={`fas fa-bookmark text-xl ${isBookmarked ? 'animate-bounce' : ''}`}></i>
                <span className="hidden sm:inline">
                  {isBookmarked ? '📌 Saved!' : '📌 Save'}
                </span>
              </button>
              
              <button
                onClick={printBlog}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 active:scale-95 bg-white text-purple-600 border-2 border-purple-500 hover:border-purple-600 hover:bg-purple-50 shadow-lg"
                aria-label="Print this post"
              >
                <i className="fas fa-print text-xl"></i>
                <span className="hidden sm:inline">
                  🖨️ Print
                </span>
              </button>
            </div>

            {/* Comment Section */}
            <CommentSection blogId={resolvedId} comments={blog.comments || []} onAdded={refreshBlog} />

            {/* Author Bio Section */}
            <section className="mt-12 mb-10 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={profileImage}
                    alt="Sharjeel - Author of SJWrites"
                    loading="lazy"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg antialiased transform-gpu"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Hi, I'm Sharjeel</h2>
                  <p className="text-gray-600 mb-6 max-w-2xl text-lg leading-relaxed">
                    Welcome to SJWrites! I create entertaining and trending stories, fun videos,
                    celebrity news and photos. This is your one-stop shop for all entertainment news
                    and insightful articles across business, tech, and lifestyle.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {['Facebook', 'Instagram', 'X (Twitter)', 'WhatsApp', 'LinkedIn'].map((platform) => (
                      <a
                        key={platform}
                        href="#"
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Follow on ${platform}`}
                      >
                        <SocialIcon platform={platform} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Back to Home */}
            <div className="flex justify-center mt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                aria-label="Back to homepage"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Homepage
              </Link>
            </div>
          </main>
        </div>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 border-t pt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                You might also like
              </h2>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-black hover:text-gray-800 font-medium transition-colors group"
                aria-label="View all blogs"
              >
                View all blog posts
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
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
                {relatedBlogs.map(relatedBlog => (
                  <BlogCard 
                    key={relatedBlog._id} 
                    blog={relatedBlog} 
                    cleanUrl={true} // Use clean URLs for related posts
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Newsletter Subscription */}
        <section className="mt-16 bg-gradient-to-r from-white to-gray-50 rounded-2xl px-4 py-8 sm:p-8 text-center flex flex-col items-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Stay updated with our latest blogs
          </h3>
          <p className="text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto text-base sm:text-lg">
            Get the latest posts delivered right to your inbox. No spam ever.
          </p>
          <div className="w-full max-w-md bg-black p-4 sm:p-6 rounded-lg shadow-lg flex flex-col items-center">
            <form 
              action="https://formspree.io/f/mjkezqby"
              method="POST"
              className="w-full space-y-3 sm:space-y-4"
            >
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 sm:px-5 sm:py-3 rounded-lg border border-transparent text-base focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 placeholder-gray-300 text-white"
                />
              </div>
              <input type="hidden" name="_subject" value="New newsletter subscription" />
              <button
                type="submit"
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Subscribe to newsletter"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

// Small helper to render social platform icons as images
function SocialIcon({ platform }) {
  const name = (platform || '').toLowerCase();
  let iconClass = '';
  let colorClass = '';

  if (name.includes('facebook')) {
    iconClass = 'fab fa-facebook';
    colorClass = 'text-blue-600';
  } else if (name.includes('instagram')) {
    iconClass = 'fab fa-instagram';
    colorClass = 'text-pink-500';
  } else if (name.includes('x') || name.includes('twitter')) {
    iconClass = 'fab fa-twitter';
    colorClass = 'text-blue-400';
  } else if (name.includes('whatsapp')) {
    iconClass = 'fab fa-whatsapp';
    colorClass = 'text-green-500';
  } else if (name.includes('linkedin')) {
    iconClass = 'fab fa-linkedin';
    colorClass = 'text-blue-700';
  }

  if (iconClass) {
    return <i className={`${iconClass} ${colorClass} text-2xl w-6 h-6 flex items-center justify-center`}></i>;
  }

  // Fallback: simple text
  return <span className="text-sm font-semibold">{platform?.charAt(0) || '?'}</span>;
}
