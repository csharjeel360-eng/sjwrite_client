import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';

export default function HotBlogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const SNAP_TTL = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Try restore from session snapshot first
        const snapshotKey = 'hotblogs_snapshot_v1';
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

        // Fetch all posts then pick top by views (fallback for no backend hot endpoint)
        const all = await api.getBlogs();
        console.debug('HotBlogs: total posts fetched', (all || []).length);
        const sorted = (all || []).slice().sort((a, b) => (b.views || 0) - (a.views || 0));
        const topPosts = sorted.slice(0, 10);
        setPosts(topPosts);

        // Save snapshot for quick restore when navigating back
        try {
          sessionStorage.setItem(snapshotKey, JSON.stringify({ fetchedAt: Date.now(), data: topPosts }));
        } catch (e) { /* ignore */ }
      } catch (err) {
        console.error('Error loading hot posts:', err);
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
        <title>Hot Tech Blogs – Most Viewed Technology Posts | SJWrites</title>
        <meta name="description" content="Discover the top 10 most viewed tech blogs on SJWrites — covering AI, software, apps, gadgets, and the latest digital innovation." />
        <link rel="canonical" href="https://sjwrites.com/blog/hot" />
        {/* ItemList schema for Hot posts */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Hot Tech Blogs",
            "itemListOrder": "Descending",
            "numberOfItems": posts.length,
            "itemListElement": posts.map((p, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://sjwrites.com/blog/${(p.slug) ? p.slug : p.title ? p.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') : p._id}`
            }))
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Hot Tech Blogs — Top 10 Most Viewed</h1>
          <p className="text-gray-600 max-w-3xl">
            These hot tech blogs are ranked based on views and popularity. Explore the most-read
            articles covering AI, software updates, gadgets, apps, and emerging technology trends.
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
              <div className="text-center py-16 text-gray-600">No hot posts found.</div>
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
