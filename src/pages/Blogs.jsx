import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Try server-side query param first, then /tag/:tag, then fallback to client-side filtering
        let tagged = [];
        try {
          const byQuery = await api.getBlogs('blog');
          console.debug('Blogs.jsx: api.getBlogs("blog") returned:', byQuery?.length);
          if (Array.isArray(byQuery) && byQuery.length > 0) {
            tagged = byQuery;
          } else {
            try {
              const byTagRoute = await api.blogsByTag('blog');
              console.debug('Blogs.jsx: api.blogsByTag("blog") returned:', byTagRoute?.length);
              if (Array.isArray(byTagRoute) && byTagRoute.length > 0) {
                tagged = byTagRoute;
              }
            } catch (e2) {
              console.debug('Blogs.jsx: api.blogsByTag failed', e2?.message || e2);
            }
          }

          if (!tagged || tagged.length === 0) {
            // fallback to client-side filtering
            const all = await api.getBlogs();
            console.debug('Blogs.jsx: api.getBlogs() total posts:', (all || []).length);
            tagged = (all || []).filter(b => {
              const normalized = (b.tags || []).map(t => String(t).toLowerCase().trim());
              return normalized.some(t => t === 'blog' || t.includes('blog'));
            });
          }
        } catch (e) {
          console.error('Blogs.jsx: unexpected error while loading tags', e);
        }
        console.debug('Blogs.jsx: final tagged count =', (tagged || []).length, 'sample tags:', (tagged[0] && tagged[0].tags) || 'none');
        setBlogs(tagged || []);
      } catch (err) {
        console.error('Error loading blog-tagged posts:', err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Helmet>
        <title>Tech Blog – Latest Technology News, AI & Software | SJWrites</title>
        <meta name="description" content="Latest technology blogs on SJWrites covering AI, apps, software, gadgets, and digital innovation." />
        <link rel="canonical" href="https://sjwrites.com/blog" />
        {/* Blog-level schema */}
       <script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "SJWrites Tech Blog",
  "url": "https://sjwrites.com/blog",
  "description": "Latest technology blogs covering AI, software, apps, and gadgets.",
  "publisher": {
    "@type": "Organization",
    "name": "SJWrites",
    "logo": {
      "@type": "ImageObject",
      "url": "https://sjwrites.com/logo.png"
    }
  }
})}
</script>

      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Latest Technology Blogs</h1>
          <p className="text-gray-600">Stay updated with the latest tech news, AI advances, software tutorials, and gadget reviews from SJWrites.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-56 bg-white rounded-lg shadow p-6 animate-pulse" />
            ))}
          </div>
        ) : (
          <section>
            {blogs.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No technology blog posts available yet. Check back soon for updates on AI, software, and gadgets.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(b => (
                  <BlogCard key={b._id} blog={b} showExcerpt={true} cleanUrl={true} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
