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
      const blogData = await api.getBlog(blogId);
      setBlog(blogData);
      setHasLiked(checkIfLiked());
      setIsBookmarked(checkIfBookmarked());
      
      // Track view
      try {
        await api.incrementView(blogId);
        setViews(prev => (blogData.views || 0) + 1);
      } catch (error) {
        console.error('Error tracking view:', error);
        setViews(blogData.views || 0);
      }
      
      // Generate clean URL
      const cleanUrl = `https://sjwrites.com/${generateSlug(blogData.title)}`;
      
      // Update URL to clean version (without ?id= parameter) and keep root-path slug
      if (searchParams.get('id')) {
        window.history.replaceState(null, '', `/${generateSlug(blogData.title)}`);
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
      const filtered = related
        .filter(b => b._id !== resolvedId)
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
        const all = await api.getBlogs();
        const matched = all.find(b => generateSlug(b.title) === slug);
        if (!matched) {
          setBlog(null);
          return;
        }

        setBlog(matched);
        setHasLiked(checkIfLiked(matched._id));
        setIsBookmarked(checkIfBookmarked(matched._id));

        // Track view using resolved id but do NOT change the URL
        try {
          await api.incrementView(matched._id);
          setViews(prev => (matched.views || 0) + 1);
        } catch (error) {
          console.error('Error tracking view by slug:', error);
          setViews(matched.views || 0);
        }
      } catch (error) {
        console.error('Error resolving blog by slug:', error);
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

  // Safely get tags from blog object
  const tags = blog ? getSafeTags(blog.tags) : [];

  // Generate clean URL for this blog
  const cleanUrl = blog ? `https://sjwrites.com/${generateSlug(blog.title)}` : '';
  const description = blog ? (blog.excerpt || markdownToPlainText(blog.content)) : '';

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... - SJWrites</title>
          <meta name="description" content="Loading blog post..." />
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
          <title>Blog Not Found - SJWrites</title>
          <meta name="description" content="The requested blog post could not be found." />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
          <Link to="/" className="text-black hover:underline">
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
        
        {/* 🟢 Unique title and description */}
        <title>{blog.title} - SJWrites</title>
        <meta name="description" content={description} />
        
        {/* 🟢 Open Graph tags */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content={cleanUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="SJWrites" />
        <meta property="og:locale" content="en_US" />
        
        {/* 🟢 Article specific OG tags */}
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:modified_time" content={blog.updatedAt || blog.createdAt} />
        <meta property="article:author" content={blog.author?.name || "Sharjeel"} />
        {tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* 🟢 Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={blog.blogImage || blog.image || 'https://sjwrites.com/default-og-image.png'} />
        <meta name="twitter:image:alt" content={blog.title} />
        
        {/* 🟢 BlogPosting Schema (MOST IMPORTANT FOR INDEXING) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": description,
            "image": blog.blogImage || blog.image,
            "author": {
              "@type": "Person",
              "name": blog.author?.name || "Sharjeel",
              "url": "https://sjwrites.com/about",
              "image": profileImage
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
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share this post</h3>
              
              {/* Blog Preview Card */}
              {blog.blogImage && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img 
                    src={blog.blogImage} 
                    alt={blog.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{blog.title}</p>
                </div>
              )}
              
              <div className="flex gap-4 justify-center mb-6 flex-wrap">
                <button
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(cleanUrl)}`, '_blank');
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Share on X (Twitter)"
                >
                  <img src="https://img.icons8.com/color/48/twitter.png" alt="Twitter" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`, '_blank');
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Share on Facebook"
                >
                  <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`, '_blank');
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Share on LinkedIn"
                >
                  <img src="https://img.icons8.com/color/48/linkedin.png" alt="LinkedIn" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    const text = `${blog.title}\n${cleanUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Share on WhatsApp"
                >
                  <img src="https://img.icons8.com/color/48/whatsapp.png" alt="WhatsApp" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    alert('Instagram sharing: Open Instagram and share the link in your story or direct message');
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Share on Instagram"
                >
                  <img src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram" className="w-8 h-8" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cleanUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  aria-label="Copy link to clipboard"
                >
                  Copy
                </button>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close share modal"
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
                  alt="SJWrites logo" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-sm flex-shrink-0" 
                  style={{ 
                    imageRendering: 'auto',
                    filter: 'none',
                    WebkitFontSmoothing: 'antialiased',
                    backfaceVisibility: 'hidden',
                    transform: 'translate3d(0, 0, 0)'
                  }}
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                aria-label="Share this post"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </button>
            </div>

            {/* Featured Image with alt text */}
            {blog.blogImage && (
              <div className="relative overflow-hidden rounded-xl mb-8 shadow-lg">
                <img 
                  src={blog.blogImage} 
                  alt={`${blog.title} - Featured image`}
                  className="w-full h-auto object-cover"
                  loading="eager"
                  width="1200"
                  height="675"
                />
                
                {/* Tags overlay */}
                {tags.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => navigateToTag(tag)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-black/80 text-white backdrop-blur-sm hover:bg-black transition-colors"
                        aria-label={`Browse more posts about ${tag}`}
                      >
                        #{tag}
                      </button>
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

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="mb-10 pt-8 border-t">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics in this article:</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToTag(tag)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      aria-label={`Browse more posts about ${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={like}
                disabled={liking || hasLiked}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors ${
                  hasLiked 
                    ? 'bg-red-50 text-red-600 cursor-default' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={hasLiked ? "You already liked this post" : "Like this post"}
              >
                <svg className={`w-5 h-5 ${hasLiked ? 'fill-red-600' : 'fill-current'}`} viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {hasLiked ? 'Liked' : 'Like'} ({blog.likes || 0})
              </button>
              
              <button
                onClick={toggleBookmark}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                aria-label={isBookmarked ? "Remove from bookmarks" : "Bookmark this post"}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d={isBookmarked 
                    ? "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" 
                    : "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                  } />
                </svg>
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              
              <button
                onClick={printBlog}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                aria-label="Print this post"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print
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
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    style={{ 
                      imageRendering: 'crisp-edges',
                      WebkitFontSmoothing: 'antialiased',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Hi, I'm Sharjeel</h2>
                  <p className="text-gray-600 mb-6 max-w-2xl text-lg leading-relaxed">
                    Welcome to SJWrites! I create entertaining and trending stories, fun videos,
                    celebrity news and photos. This is your one-stop shop for all entertainment news
                    and insightful articles across business, tech, and lifestyle.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-5">
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
  let iconUrl = '';

  if (name.includes('facebook')) {
    iconUrl = 'https://img.icons8.com/color/48/facebook-new.png';
  } else if (name.includes('instagram')) {
    iconUrl = 'https://img.icons8.com/color/48/instagram-new.png';
  } else if (name.includes('x') || name.includes('twitter')) {
    iconUrl = 'https://img.icons8.com/color/48/twitter.png';
  } else if (name.includes('whatsapp')) {
    iconUrl = 'https://img.icons8.com/color/48/whatsapp.png';
  } else if (name.includes('linkedin')) {
    iconUrl = 'https://img.icons8.com/color/48/linkedin.png';
  }

  if (iconUrl) {
    return <img src={iconUrl} alt={platform} className="w-8 h-8" />;
  }

  // Fallback: simple text
  return <span className="text-sm font-semibold">{platform?.charAt(0) || '?'}</span>;
}
