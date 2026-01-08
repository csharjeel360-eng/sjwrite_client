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

  // Generate structured data for all blog images
  const generateImageStructuredData = () => {
    const blogPosts = allPosts.slice(0, 10); // Limit to first 10 posts for homepage
    const images = [];
    
    blogPosts.forEach(post => {
      if (post.blogImage) {
        images.push({
          "@type": "ImageObject",
          "url": post.blogImage,
          "name": post.title,
          "description": post.excerpt || markdownToPlainText(post.content).substring(0, 100),
          "caption": post.title,
          "contentUrl": post.blogImage,
          "thumbnailUrl": post.blogImage,
          "associatedArticle": {
            "@type": "BlogPosting",
            "headline": post.title,
            "url": `https://sjwrites.com/blog/${generateSlug(post.title)}?id=${post._id}`
          }
        });
      }
    });
    
    return images;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>Loading - SJWrites</title>
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
        {/* 🚀 CRITICAL SEO FIX: Add Canonical Tag */}
        <link rel="canonical" href="https://sjwrites.com" />
        
        <title>SJWrites - Entertaining & Trending Stories and Much More</title>
        <meta name="description" content="SJWrites - Entertaining & Trending Stories, Fun Videos, Celebrity News and Photos is a one stop shop for all your entertainment news." />
        
        {/* 🚀 SEO FIX: Add Social Meta Tags for better sharing */}
        <meta property="og:title" content="SJWrites - Entertaining & Trending Stories and Much More" />
        <meta property="og:description" content="Your one-stop shop for entertainment news, stories, videos, and more." />
        <meta property="og:image" content={featuredPost?.blogImage || "https://sjwrites.com/default-og.jpg"} />
        <meta property="og:url" content="https://sjwrites.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta property="og:image:alt" content="SJWrites - Featured Content" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SJWrites - Entertaining & Trending Stories" />
        <meta name="twitter:description" content="Your one-stop shop for entertainment news" />
        <meta name="twitter:image" content={featuredPost?.blogImage || "https://sjwrites.com/default-og.jpg"} />
        <meta name="twitter:image:alt" content="SJWrites - Featured Content" />
        
        {/* 🚀 SEO FIX: Add Website Schema Markup */}
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
        
        {/* 🚀 NEW: Add CollectionPage Schema for homepage with images */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Latest Blog Posts - SJWrites",
            "description": "Latest entertaining and trending stories from SJWrites",
            "url": "https://sjwrites.com",
            "hasPart": allPosts.slice(0, 5).map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt || markdownToPlainText(post.content).substring(0, 150),
              "image": post.blogImage,
              "url": `https://sjwrites.com/blog/${generateSlug(post.title)}?id=${post._id}`,
              "datePublished": post.createdAt,
              "dateModified": post.updatedAt || post.createdAt
            }))
          })}
        </script>
        
        {/* 🚀 NEW: Image Object Schema for featured images */}
        {featuredPost?.blogImage && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "url": featuredPost.blogImage,
              "name": featuredPost.title,
              "description": featuredPost.excerpt || markdownToPlainText(featuredPost.content).substring(0, 100),
              "caption": `Featured: ${featuredPost.title}`,
              "contentUrl": featuredPost.blogImage,
              "thumbnailUrl": featuredPost.blogImage,
              "associatedArticle": {
                "@type": "BlogPosting",
                "headline": featuredPost.title,
                "url": `https://sjwrites.com/blog/${generateSlug(featuredPost.title)}?id=${featuredPost._id}`
              },
              "width": "1200",
              "height": "675"
            })}
          </script>
        )}
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {featuredPost && featuredPost.blogImage && (
          <link rel="preload" as="image" href={featuredPost.blogImage} />
        )}
      </Helmet>

      {/* 🚀 SEO FIX: Add H1 Heading at the top of the page (invisible but for SEO) */}
      <h1 className="sr-only">SJWrites - Entertaining & Trending Stories, Fun Videos, Celebrity News and Photos</h1>

      {/* Search Results (shown when user types in navbar) */}
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
                  <BlogCard key={post._id} blog={post} size="normal" showExcerpt={true} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Section with Big Image */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">FRESH</h2>
          
          {/* Neemopani-style mosaic layout - First 3 posts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large featured post (left side - 2/3 width) */}
            {featuredPost && (
              <div className="lg:col-span-2">
                <article className="entry-tpl-tile entry-tpl-tile-xl g1-dark" 
                  itemScope 
                  itemType="https://schema.org/BlogPosting"
                  itemProp="hasPart"
                >
                  {/* Featured Image with Structured Data */}
                  <div className="entry-featured-media" itemScope itemType="https://schema.org/ImageObject">
                    <Link 
                      to={`/blog/${generateSlug(featuredPost.title)}?id=${featuredPost._id}`} 
                      className="g1-frame"
                      itemProp="url"
                    >
                      <div className="g1-frame-inner">
                        {featuredPost.blogImage && (
                          <img
                            src={featuredPost.blogImage}
                            alt={`${featuredPost.title} - Featured image on SJWrites`}
                            className="w-full h-96 object-cover lazyloaded rounded-lg"
                            loading="eager"
                            fetchpriority="high"
                            width="1200"
                            height="675"
                            decoding="async"
                            itemProp="contentUrl"
                            data-image="primary"
                            // 🚀 NEW: These attributes help Google index the image
                            data-indexable="true"
                            data-article-id={featuredPost._id}
                          />
                        )}
                        <span className="g1-frame-icon"></span>
                      </div>
                    </Link>
                    {/* Hidden structured data for the image */}
                    <meta itemProp="name" content={featuredPost.title} />
                    <meta itemProp="description" content={featuredPost.excerpt || markdownToPlainText(featuredPost.content).substring(0, 100)} />
                    <meta itemProp="url" content={featuredPost.blogImage} />
                    <meta itemProp="width" content="1200" />
                    <meta itemProp="height" content="675" />
                    <meta itemProp="caption" content={`Featured image for: ${featuredPost.title}`} />
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
                              <a 
                                key={idx}
                                href={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1"
                                itemProp="keywords"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </a>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-2xl md:text-3xl font-bold entry-title mb-4" itemProp="headline">
                        <Link 
                          to={`/blog/${generateSlug(featuredPost.title)}?id=${featuredPost._id}`}
                          className="text-gray-900 hover:text-black"
                          itemProp="url"
                        >
                          {featuredPost.title}
                        </Link>
                      </h1>

                      {/* Excerpt */}
                      {featuredPost.content && (
                        <p className="text-gray-600 mb-6 line-clamp-3 text-lg" itemProp="description">
                          {markdownToPlainText(featuredPost.content).substring(0, 200)}...
                        </p>
                      )}

                      {/* Read More Button */}
                      <div className="entry-ctas">
                        <Link 
                          to={`/blog/${generateSlug(featuredPost.title)}?id=${featuredPost._id}`}
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
            
            {/* Two smaller posts (right side - 1/3 width) */}
            <div className="space-y-6">
              {latestPosts.slice(0, 2).map((post, index) => (
                <article key={post._id} className="entry-tpl-tile g1-dark" 
                  itemScope 
                  itemType="https://schema.org/BlogPosting"
                >
                  {/* Featured Image with Structured Data */}
                  <div className="entry-featured-media" itemScope itemType="https://schema.org/ImageObject">
                    <Link 
                      to={`/blog/${generateSlug(post.title)}?id=${post._id}`} 
                      className="g1-frame"
                      itemProp="url"
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
                            itemProp="contentUrl"
                            data-indexable="true"
                            data-article-id={post._id}
                          />
                        )}
                        <span className="g1-frame-icon"></span>
                      </div>
                    </Link>
                    {/* Hidden structured data for the image */}
                    <meta itemProp="name" content={post.title} />
                    <meta itemProp="description" content={post.excerpt || markdownToPlainText(post.content).substring(0, 80)} />
                    <meta itemProp="url" content={post.blogImage} />
                    <meta itemProp="width" content="600" />
                    <meta itemProp="height" content="320" />
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
                              <a 
                                key={idx}
                                href={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1 text-sm"
                                itemProp="keywords"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </a>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold entry-title" itemProp="headline">
                        <Link 
                          to={`/blog/${generateSlug(post.title)}?id=${post._id}`}
                          className="text-gray-900 hover:text-black"
                          itemProp="url"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Small stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                        <span itemProp="datePublished" content={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center" itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
                            <meta itemProp="interactionType" content="https://schema.org/LikeAction" />
                            <meta itemProp="userInteractionCount" content={post.likes || 0} />
                            ❤️ {post.likes || 0}
                          </span>
                          <span className="flex items-center ml-2">
                            <meta itemProp="commentCount" content={post.comments?.length || 0} />
                            💬 {post.comments?.length || 0}
                          </span>
                        </span>
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
                <article key={post._id} className="entry-tpl-tile g1-dark" 
                  itemScope 
                  itemType="https://schema.org/BlogPosting"
                >
                  {/* Featured Image with Structured Data */}
                  <div className="entry-featured-media" itemScope itemType="https://schema.org/ImageObject">
                    <Link 
                      to={`/blog/${generateSlug(post.title)}?id=${post._id}`} 
                      className="g1-frame"
                      itemProp="url"
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
                            itemProp="contentUrl"
                            data-indexable="true"
                            data-article-id={post._id}
                          />
                        )}
                        <span className="g1-frame-icon"></span>
                      </div>
                    </Link>
                    {/* Hidden structured data for the image */}
                    <meta itemProp="name" content={post.title} />
                    <meta itemProp="description" content={post.excerpt || markdownToPlainText(post.content).substring(0, 80)} />
                    <meta itemProp="url" content={post.blogImage} />
                    <meta itemProp="width" content="800" />
                    <meta itemProp="height" content="450" />
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
                              <a 
                                key={idx}
                                href={`/category/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="entry-category entry-category-item text-black hover:underline ml-1 text-sm"
                                itemProp="keywords"
                              >
                                {tag}{idx === 0 ? ',' : ''}
                              </a>
                            ))}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold entry-title mb-3" itemProp="headline">
                        <Link 
                          to={`/blog/${generateSlug(post.title)}?id=${post._id}`}
                          className="text-gray-900 hover:text-black"
                          itemProp="url"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {post.content && (
                        <p className="text-gray-600 mb-4 line-clamp-2" itemProp="description">
                          {markdownToPlainText(post.content).substring(0, 120)}...
                        </p>
                      )}

                      {/* Small stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                        <span itemProp="datePublished" content={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center" itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
                            <meta itemProp="interactionType" content="https://schema.org/LikeAction" />
                            <meta itemProp="userInteractionCount" content={post.likes || 0} />
                            ❤️ {post.likes || 0}
                          </span>
                          <span className="flex items-center ml-2">
                            <meta itemProp="commentCount" content={post.comments?.length || 0} />
                            💬 {post.comments?.length || 0}
                          </span>
                        </span>
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
                <BlogCard key={post._id} blog={post} size="normal" showExcerpt={true} />
              ))}
            </div>

            {/* Load More Button for additional posts */}
            {6 + page * postsPerPage < allPosts.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="inline-block px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
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