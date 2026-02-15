import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';

export default function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const SNAP_TTL = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Try restore from session snapshot first
        const snapshotKey = 'trending_snapshot_v1';
        let raw = null;
        try { raw = sessionStorage.getItem(snapshotKey); } catch (e) { raw = null; }
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.fetchedAt && (Date.now() - parsed.fetchedAt) < SNAP_TTL) {
              setPosts(parsed.data || []);
              setLoading(false);
              return;
            }
          } catch (e) { /* ignore and refetch */ }
        }

        // Try getBlogs?tag= first, then /tag/:tag, then client-side fallback
        let tagged = [];
        try {
          const byQuery = await api.getBlogs('trending');
          console.log('Trending.jsx: api.getBlogs("trending") returned:', byQuery?.length);
          if (Array.isArray(byQuery) && byQuery.length > 0) {
            tagged = byQuery;
          } else {
            try {
              const byTagRoute = await api.blogsByTag('trending');
              console.log('Trending.jsx: api.blogsByTag("trending") returned:', byTagRoute?.length);
              if (Array.isArray(byTagRoute) && byTagRoute.length > 0) tagged = byTagRoute;
            } catch (e2) {
              console.warn('Trending.jsx: api.blogsByTag failed', e2?.message || e2);
            }
          }

          if (!tagged || tagged.length === 0) {
            const all = await api.getBlogs();
            console.log('Trending.jsx: api.getBlogs() total posts:', (all || []).length);
            if (all?.length > 0) {
              tagged = (all || []).filter(b => {
                const normalized = (b.tags || []).map(t => String(t).toLowerCase().trim());
                return normalized.some(t => t === 'trending' || t.includes('trending'));
              });
            }
          }
        } catch (e) {
          console.error('Trending.jsx: unexpected error while loading tags', e);
        }

        // sort by date so newest trending appear first
        (tagged || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Trending.jsx: final tagged count =', (tagged || []).length);
        setPosts(tagged || []);

        // Save snapshot for quick restore when navigating back
        try {
          sessionStorage.setItem(snapshotKey, JSON.stringify({ fetchedAt: Date.now(), data: tagged || [] }));
        } catch (e) { /* ignore */ }
      } catch (err) {
        console.error('Error loading trending posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Helmet>
        <title>Trending Tech Blogs – Latest Technology News & AI | SJWrites</title>
        <meta name="description" content="Discover trending tech blogs on SJWrites featuring AI, software, apps, gadgets, and the latest technology updates." />
        <link rel="canonical" href="https://sjwrites.com/blog/trending" />
        {/* ItemList schema for Trending posts */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Trending Tech Blogs",
            "itemListOrder": "Descending",
            "numberOfItems": posts.length,
            "itemListElement": posts.map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `https://sjwrites.com/blog/${(p.slug) ? p.slug : p.title ? p.title.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-') : p._id}`
            }))
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Trending Tech Blogs — Latest Trending Posts</h1>
          <p className="text-gray-600 max-w-3xl">
            Explore trending technology blogs based on recent popularity and engagement. These articles cover AI innovations, software updates, apps, gadgets, and emerging tech trends.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-56 bg-white rounded-lg shadow p-6 animate-pulse" />
            ))}
          </div>
        ) : (
          <section>
            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No trending posts found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(p => (
                  <BlogCard key={p._id} blog={p} showExcerpt={true} cleanUrl={true} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
