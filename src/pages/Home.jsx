import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';

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

// Helper function to convert markdown to plain text for preview
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
    .trim();
};

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 50;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await api.getBlogs();
        setAllPosts(posts);
        
        // Get most recent post for featured
        const sortedByDate = [...posts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        if (sortedByDate.length > 0) {
          setFeaturedPost(sortedByDate[0]);
          setLatestPosts(sortedByDate.slice(1, 3)); // Next 2 posts for side
        }
        
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Listen for search events dispatched from Navbar (or other sources)
  useEffect(() => {
    const handleSiteSearch = (e) => {
      const q = e?.detail || '';
      doSearch(q);
    };

    window.addEventListener('siteSearch', handleSiteSearch);
    return () => window.removeEventListener('siteSearch', handleSiteSearch);
  }, [allPosts]);

  const doSearch = (q) => {
    const term = (q || '').trim();
    setSearchQuery(term);
    if (!term) {
      setSearchResults([]);
      return;
    }

    const filtered = allPosts.filter(post => {
      const lc = (post.title || '') + ' ' + (post.content || '') + ' ' + ((post.tags || []) .join(' '));
      return lc.toLowerCase().includes(term.toLowerCase());
    }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    window.dispatchEvent(new CustomEvent('siteSearch', { detail: '' }));
  };

  // Get next 3 posts after the featured 3
  const getNextThreePosts = () => {
    const sortedByDate = [...allPosts].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedByDate.slice(3, 6);
  };

  // Generate homepage breadcrumb schema
  const generateBreadcrumbSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://sjwrites.com"
        }
      ]
    };
  };

  // Generate lightweight ItemList schema for homepage
  const generateItemListSchema = () => {
    const recentPosts = allPosts.slice(0, 10); // Show first 10 posts
    
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Latest Blog Posts",
      "description": "Recent entertaining and trending stories from SJWrites",
      "url": "https://sjwrites.com",
      "numberOfItems": recentPosts.length,
      "itemListElement": recentPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.title,
          "url": `https://sjwrites.com/${generateSlug(post.title)}`,
          "image": post.blogImage,
          "datePublished": post.createdAt,
          "dateModified": post.updatedAt || post.createdAt,
          "author": {
            "@type": "Person",
            "name": post.author || "SJWrites"
          }
        }
      }))
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>Loading - SJWrites</title>
          <link rel="canonical" href="https://sjwrites.com" />
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Helmet>
        {/* 🟢 CRITICAL: Homepage canonical */}
        <link rel="canonical" href="https://sjwrites.com" />
        
        {/* 🟢 Homepage title & description */}
        <title>SJWrites - Entertaining & Trending Stories and Much More</title>
        <meta name="description" content="Explore the latest tech blogs on SJWrites featuring AI, apps, software, gadgets, and digital innovation." />
        
        {/* 🟢 Open Graph for homepage */}
        <meta property="og:title" content="SJWrites - Entertaining & Trending Stories and Much More" />
        <meta property="og:description" content="Your one-stop shop for entertainment news, stories, videos, and more." />
        <meta property="og:image" content={featuredPost?.blogImage || "https://sjwrites.com/default-og.jpg"} />
        <meta property="og:url" content="https://sjwrites.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SJWrites" />
        <meta property="og:locale" content="en_US" />
        
        {/* 🟢 Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SJWrites - Entertaining & Trending Stories" />
        <meta name="twitter:description" content="Your one-stop shop for entertainment news" />
        <meta name="twitter:image" content={featuredPost?.blogImage || "https://sjwrites.com/default-og.jpg"} />
        
        {/* 🟢 Website Schema - ESSENTIAL for homepage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://sjwrites.com",
            "name": "SJWrites",
            "description": "Entertaining & Trending Stories, Fun Videos, Celebrity News and Photos",
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
            "inLanguage": "en-US",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://sjwrites.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        {/* 🟢 CollectionPage Schema - Lightweight for homepage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Latest Blog Posts - SJWrites",
            "description": "Latest entertaining and trending stories from SJWrites",
            "url": "https://sjwrites.com",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": Math.min(allPosts.length, 10),
              "itemListElement": allPosts.slice(0, 10).map((post, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://sjwrites.com/${generateSlug(post.title)}`
              }))
            }
          })}
        </script>
        
        {/* 🟢 Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema())}
        </script>
        
        {/* 🟢 ItemList Schema for better indexing */}
        <script type="application/ld+json">
          {JSON.stringify(generateItemListSchema())}
        </script>
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {featuredPost && featuredPost.blogImage && (
          <link rel="preload" as="image" href={featuredPost.blogImage} />
        )}
      </Helmet>

      {/* 🟢 H1 for homepage (hidden visually but accessible) */}
      <h1 className="sr-only">Explore the latest tech blogs on SJWrites featuring AI, apps, software, gadgets, and digital innovation</h1>

      {/* Search Results Section */}
      {searchQuery !== '' && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Search Results for "{searchQuery}"</h2>
              <button onClick={clearSearch} className="text-sm text-gray-600 hover:underline">Clear</button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No results found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(post => (
                  <BlogCard 
                    key={post._id} 
                    blog={post} 
                    size="normal" 
                    showExcerpt={true}
                    cleanUrl={true} // Pass prop to use clean URLs
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">FRESH</h2>
          
          {/* Featured layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large featured post */}
            {featuredPost && (
              <div className="lg:col-span-2">
                <article className="entry-tpl-tile entry-tpl-tile-xl g1-dark">
                  {/* Featured Image */}
                  <div className="entry-featured-media">
                    <Link 
                      to={`/${generateSlug(featuredPost.title)}`} // 🟢 CLEAN URL
                      className="g1-frame"
                      aria-label={`Read: ${featuredPost.title}`}
                    >
                      <div className="g1-frame-inner">
                        {featuredPost.blogImage && (
                          <img
                            src={featuredPost.blogImage}
                            alt={`${featuredPost.title} - Featured image on SJWrites`}
                            className="w-full h-96 object-cover lazyloaded rounded-lg"
                            loading="eager"
                            width="1200"
                            height="675"
                            decoding="async"
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="entry-body p-6">
                    <header className="entry-header">
                      {/* Categories */}
                      <div className="entry-before-title mb-4">
                        <span className="entry-categories">
                          <span className="entry-categories-inner">
                            <span className="entry-categories-label text-sm text-gray-500">in</span>
                            {featuredPost.tags && featuredPost.tags.slice(0, 2).map((tag, idx) => (
                              <Link 
                                key={idx}
                                to={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </Link>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl font-bold entry-title mb-4">
                        <Link 
                          to={`/${generateSlug(featuredPost.title)}`} // 🟢 CLEAN URL
                          className="text-gray-900 hover:text-black"
                        >
                          {featuredPost.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {featuredPost.content && (
                        <p className="text-gray-600 mb-6 line-clamp-3 text-lg">
                          {markdownToPlainText(featuredPost.content).substring(0, 200)}...
                        </p>
                      )}

                      {/* Read More Button */}
                      <div className="entry-ctas">
                        <Link 
                          to={`/${generateSlug(featuredPost.title)}`} // 🟢 CLEAN URL
                          className="inline-block px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors"
                          aria-label={`Read more about ${featuredPost.title}`}
                        >
                          Read More
                        </Link>
                      </div>
                    </header>
                  </div>
                </article>
              </div>
            )}
            
            {/* Two smaller posts */}
            <div className="space-y-6">
              {latestPosts.slice(0, 2).map((post, index) => (
                <article key={post._id} className="entry-tpl-tile g1-dark">
                  {/* Featured Image */}
                  <div className="entry-featured-media">
                    <Link 
                      to={`/${generateSlug(post.title)}`} // 🟢 CLEAN URL
                      className="g1-frame"
                      aria-label={`Read: ${post.title}`}
                    >
                      <div className="g1-frame-inner">
                        {post.blogImage && (
                          <img
                            src={post.blogImage}
                            alt={`${post.title} - Image on SJWrites`}
                            className="w-full h-48 object-cover lazyloaded rounded-lg"
                            loading="lazy"
                            width="600"
                            height="320"
                            decoding="async"
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="entry-body p-4">
                    <header className="entry-header">
                      {/* Categories */}
                      <div className="entry-before-title mb-2">
                        <span className="entry-categories">
                          <span className="entry-categories-inner">
                            <span className="entry-categories-label text-sm text-gray-500">in</span>
                            {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
                              <Link 
                                key={idx}
                                to={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1 text-sm"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </Link>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold entry-title">
                        <Link 
                          to={`/${generateSlug(post.title)}`} // 🟢 CLEAN URL
                          className="text-gray-900 hover:text-black"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      {/* Date */}
                      <div className="flex items-center justify-start text-sm text-gray-500 mt-3">
                        <time dateTime={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                    </header>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Next 3 posts in a row */}
      {!searchQuery && getNextThreePosts().length > 0 && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getNextThreePosts().map((post, index) => (
                <article key={post._id} className="entry-tpl-tile g1-dark">
                  {/* Featured Image */}
                  <div className="entry-featured-media">
                    <Link 
                      to={`/${generateSlug(post.title)}`} // 🟢 CLEAN URL
                      className="g1-frame"
                      aria-label={`Read: ${post.title}`}
                    >
                      <div className="g1-frame-inner">
                        {post.blogImage && (
                          <img
                            src={post.blogImage}
                            alt={`${post.title} - Image on SJWrites`}
                            className="w-full h-56 object-cover lazyloaded rounded-lg"
                            loading="lazy"
                            width="800"
                            height="450"
                            decoding="async"
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="entry-body p-4">
                    <header className="entry-header">
                      {/* Categories */}
                      <div className="entry-before-title mb-2">
                        <span className="entry-categories">
                          <span className="entry-categories-inner">
                            <span className="entry-categories-label text-sm text-gray-500">in</span>
                            {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
                              <Link 
                                key={idx}
                                to={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1 text-sm"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </Link>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold entry-title mb-3">
                        <Link 
                          to={`/${generateSlug(post.title)}`} // 🟢 CLEAN URL
                          className="text-gray-900 hover:text-black"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      {/* Excerpt */}
                      {post.content && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {markdownToPlainText(post.content).substring(0, 120)}...
                        </p>
                      )}

                      {/* Date */}
                      <div className="flex items-center justify-start text-sm text-gray-500 mt-3">
                        <time dateTime={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                    </header>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Remaining posts grid */}
      {!searchQuery && allPosts.length > 6 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.slice(6, 6 + page * postsPerPage).map((post) => (
                <BlogCard 
                  key={post._id} 
                  blog={post} 
                  size="normal" 
                  showExcerpt={true}
                  cleanUrl={true} // Pass prop to use clean URLs
                />
              ))}
            </div>

            {/* Load More Button */}
            {6 + page * postsPerPage < allPosts.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="inline-block px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                  aria-label="Load more blog posts"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}