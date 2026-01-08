import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import CommentSection from '../components/CommentSection';
import BlogCard from '../components/BlogCard';
import ShareModal from '../components/ShareModal';
import TableOfContents from '../components/TableOfContents';
import { Helmet } from 'react-helmet-async';

// Add this import at the top
import profileImage from '../assets/3.png'; // Adjust the path as needed

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

// Markdown Renderer Component
function MarkdownRenderer({ content, onHeadingsUpdate }) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = (text) => {
      if (!text) return '';
      
      // Extract headings for table of contents
      const headings = [];
      let headingIndex = 0;

      const processedText = text
        .replace(/^# (.*$)/gim, (match, title) => {
          const id = `heading-${headingIndex++}`;
          headings.push({ id, title, level: 1 });
          return `<h1 id="${id}" class="text-2xl md:text-3xl font-bold my-4 md:my-6 scroll-mt-20">${title}</h1>`;
        })
        .replace(/^## (.*$)/gim, (match, title) => {
          const id = `heading-${headingIndex++}`;
          headings.push({ id, title, level: 2 });
          return `<h2 id="${id}" class="text-xl md:text-2xl font-bold my-3 md:my-5 scroll-mt-20">${title}</h2>`;
        })
        .replace(/^### (.*$)/gim, (match, title) => {
          const id = `heading-${headingIndex++}`;
          headings.push({ id, title, level: 3 });
          return `<h3 id="${id}" class="text-lg md:text-xl font-bold my-2 md:my-4 scroll-mt-20">${title}</h3>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
        .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 border"><code class="block whitespace-pre">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono border">$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 bg-gray-50 italic">$1</blockquote>');

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
      className="prose max-w-none"
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
        className="h-full bg-black transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
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

  // Check if user has already liked this blog
  const checkIfLiked = () => {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
    return likedBlogs[blogId] === true;
  };

  // Check if blog is bookmarked
  const checkIfBookmarked = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBlogs') || '{}');
    return bookmarks[blogId] === true;
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      const blogData = await api.getBlog(blogId);
      setBlog(blogData);
      setHasLiked(checkIfLiked());
      setIsBookmarked(checkIfBookmarked());
      
      // Track view using your existing incrementView method
      try {
        await api.incrementView(blogId);
        // If your API returns view count, use it. Otherwise use the existing views + 1
        setViews(prev => (blogData.views || 0) + 1);
      } catch (error) {
        console.error('Error tracking view:', error);
        setViews(blogData.views || 0);
      }
      
      // Update document title and meta description
      document.title = `${blogData.title} - SJWrites`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          blogData.excerpt || blogData.content.substring(0, 160) + '...'
        );
      }
      
      // Update URL to ensure proper slug
      const expectedSlug = generateSlug(blogData.title);
      if (slug !== expectedSlug) {
        window.history.replaceState(null, '', `/blog/${expectedSlug}?id=${blogId}`);
      }
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
            // Continue with other tags if one fails
            continue;
          }
        }
      }

      // If we don't have enough related blogs, get latest blogs as fallback
      if (related.length < 3) {
        try {
          const allBlogs = await api.getBlogs();
          related = [...related, ...allBlogs];
        } catch (error) {
          console.error('Error loading fallback blogs:', error);
        }
      }

      // Filter, deduplicate and limit results
      const filtered = related
        .filter(b => b._id !== blogId)
        .filter((blog, index, self) => 
          index === self.findIndex(b => b._id === blog._id)
        )
        .slice(0, 6);

      setRelatedBlogs(filtered);
    } catch (error) {
      console.error('Error loading related blogs:', error);
      // Ultimate fallback - try to get any blogs
      try {
        const allBlogs = await api.getBlogs();
        const filtered = allBlogs
          .filter(b => b._id !== blogId)
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
    if (blogId) {
      loadBlog(); 
    }
  }, [blogId]);

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
      const { likes } = await api.likeBlog(blogId);
      
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '{}');
      likedBlogs[blogId] = true;
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
    
    if (isBookmarked) {
      delete bookmarks[blogId];
      setIsBookmarked(false);
    } else {
      bookmarks[blogId] = {
        id: blogId,
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

  const navigateToTag = (tag) => {
    navigate(`/blogs?tag=${encodeURIComponent(tag)}`);
  };

  // Safely get tags from blog object
  const tags = blog ? getSafeTags(blog.tags) : [];

  if (loading) {
    return (
      <>
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
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
        <Link to="/blogs" className="text-black hover:underline">
          ← Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        {/* 🚀 SEO: Add Canonical Tag */}
        <link rel="canonical" href={`https://sjwrites.com/blog/${generateSlug(blog.title)}?id=${blogId}`} />
        
        {/* 🚀 SEO: Add Social Meta Tags for better sharing */}
        <meta property="og:title" content={`${blog.title} - SJWrites`} />
        <meta property="og:description" content={blog.excerpt || blog.content.substring(0, 160) + '...'} />
        <meta property="og:image" content={blog.blogImage} />
        <meta property="og:url" content={`https://sjwrites.com/blog/${generateSlug(blog.title)}?id=${blogId}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt || blog.content.substring(0, 160) + '...'} />
        <meta name="twitter:image" content={blog.blogImage} />
        
        {/* 🚀 SEO: Add Schema Markup for blog post */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.excerpt || blog.content.substring(0, 160) + '...',
            "image": blog.blogImage,
            "datePublished": blog.createdAt,
            "dateModified": blog.updatedAt || blog.createdAt,
            "author": {
              "@type": "Person",
              "name": blog.author?.name || "Sharjeel",
              "url": "https://sjwrites.com/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SJWrites",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sjwrites.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://sjwrites.com/blog/${generateSlug(blog.title)}?id=${blogId}`
            },
            "inLanguage": "en-US"
          })}
        </script>
        
        {/* Page Title */}
        <title>{blog.title} - SJWrites</title>
        <meta name="description" content={blog.excerpt || blog.content.substring(0, 160) + '...'} />
      </Helmet>
      
      <ReadingProgress />
      
      {/* Simple Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share this post</h3>
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                  className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                  className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                  className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          {headings.length > 0 && (
            <aside className="lg:w-64 flex-shrink-0">
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
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/blogs" className="hover:text-black">Blogs</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 line-clamp-1">{blog.title}</span>
            </nav>

            {/* Featured Image with Tags and Like Count */}
            {blog.blogImage && (
              <div className="relative overflow-hidden rounded-lg mb-6 shadow-lg w-full">
                <img 
                  src={blog.blogImage} 
                  className="w-full h-auto object-cover"
                  alt={blog.title}
                  loading="lazy"
                />
                
                {/* Tags displayed at the bottom of the image */}
                {tags.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm cursor-pointer hover:bg-black/80 transition-colors"
                        onClick={() => navigateToTag(tag)}
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            
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

              {views > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>{views} views</span>
                </div>
              )}
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
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {blog.author.name}
                  </div>
                  {blog.author.bio && (
                    <p className="text-sm text-gray-600 mt-1">{blog.author.bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b">
              <button 
                onClick={like} 
                disabled={liking || hasLiked}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  hasLiked 
                    ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  {liking ? 'Liking...' : hasLiked ? 'Liked' : 'Like'}
                </span>
              </button>

              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                onClick={shareBlog}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>Share</span>
              </button>

              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <span>Copy Link</span>
              </button>

              <button
                onClick={printBlog}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span>Print</span>
              </button>
            </div>

            {/* Content */}
            <div className="mb-8">
              <MarkdownRenderer 
                content={blog.content} 
                onHeadingsUpdate={setHeadings}
              />
            </div>

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="mb-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToTag(tag)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Section */}
            <CommentSection blogId={blogId} comments={blog.comments || []} onAdded={loadBlog} />

            {/* 🚀 MOVED: Who I Am Section placed after comments */}
            <section className="mt-8 mb-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={profileImage}
                    alt="Sharjeel"
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hi, I'm Sharjeel</h2>
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    Welcome to SJWrites! I create entertaining and trending stories, fun videos,
                    celebrity news and photos. This is your one-stop shop for all entertainment news
                    and insightful articles across business, tech, and lifestyle.
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>

                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      aria-label="X (Twitter)"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>

                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                      aria-label="WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                      </svg>
                    </a>

                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation between blogs */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t">
              <Link 
                to="/blogs" 
                className="inline-flex items-center gap-2 text-black hover:text-gray-800 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all blogs
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
                to="/blogs" 
                className="inline-flex items-center gap-2 text-black hover:text-gray-800 font-medium transition-colors group"
              >
                View all blogs
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
                {relatedBlogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
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