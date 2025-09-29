 import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import BlogList from '../components/BlogList';
import FeaturedPost from '../components/FeaturedPost';
import NewsletterSignup from '../components/NewsletterSignup';
import SearchBar from '../components/SearchBar';
import SortBar from '../components/SortBar';
import BlogCard from '../components/BlogCard';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Helmet } from "react-helmet";
export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showClearFilterTag, setShowClearFilterTag] = useState(false);
  
  const location = useLocation();
  const navigationType = useNavigationType();
  const hasFilters = useRef(false);
  const prevPath = useRef(location.pathname);
  const exploreSectionRef = useRef(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await api.getBlogs();
        setAllPosts(posts);
        setFilteredPosts(posts);
        
        // Get 3 most liked posts for featured section
        const featured = posts
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 3);
        setFeaturedPosts(featured);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Track filter changes
  useEffect(() => {
    const hasActiveFilters = searchQuery !== '' || sortBy !== 'date' || selectedCategory !== null;
    hasFilters.current = hasActiveFilters;
    setShowClearFilterTag(hasActiveFilters);
  }, [searchQuery, sortBy, selectedCategory]);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    // If user pressed back button and we had filters applied
    if (navigationType === 'POP' && hasFilters.current && prevPath.current === location.pathname) {
      clearFilters();
    }
    
    // Update the previous path
    prevPath.current = location.pathname;
  }, [location.pathname, navigationType]);

  // Apply filters and sorting
  useEffect(() => {
    if (allPosts.length === 0) return;
    
    let result = [...allPosts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.tags && Array.isArray(post.tags) && 
          post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(post => 
        post.tags && Array.isArray(post.tags) && 
        post.tags.some(tag => 
          typeof tag === 'string' && 
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date_oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'likes':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'comments':
        result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredPosts(result);
  }, [allPosts, searchQuery, sortBy, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory(null); // Clear category when searching
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when selecting category
    
    // Scroll to explore section after a small delay to allow state update
    setTimeout(() => {
      document.getElementById('explore')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('date');
    setSelectedCategory(null);
    setShowClearFilterTag(false);
  };

  // Calculate total views correctly
  const totalViews = allPosts.reduce((sum, post) => {
    // Handle different possible view field formats
    const views = typeof post.views === 'number' ? post.views : 
                 typeof post.viewCount === 'number' ? post.viewCount : 
                 typeof post.views === 'string' ? parseInt(post.views) || 0 : 0;
    return sum + views;
  }, 1);

  // Get unique categories from tags
  const categories = [...new Set(allPosts.flatMap(post => 
    post.tags && Array.isArray(post.tags) ? post.tags : []
  ))].filter(tag => typeof tag === 'string').slice(0, 8);

  // If we don't have enough categories, use default ones
  const defaultCategories = ['Technology', 'Design', 'Business', 'Lifestyle', 'Health', 'Education', 'Travel', 'Food'];
  const displayCategories = categories.length >= 4 ? categories : defaultCategories;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Clear Filter Sticky Tag */}
       
      <AnimatePresence>
        {showClearFilterTag && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-4 z-50 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-2"
          >
            <span className="text-sm font-medium text-gray-700">
              Filters applied
            </span>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"
            >
              Clear all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Discover Stories That
              <span className="block text-blue-200">Inspire & Inform</span>
            </motion.h1>
             
            <motion.p 
            
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Read inspiring blogs at SJWrites covering lifestyle, technology, business, and personal growth. Stay updated with tips, stories, and knowledge.
               
             </motion.p>
           
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a 
                href="#explore" 
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Explore Articles
              </a>
              <a 
                href="#newsletter" 
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Join Newsletter
              </a>
            </motion.div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Search and Sort Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="w-full lg:w-1/2">
                <SearchBar onSearch={handleSearch} placeholder="Search blog posts..." />
              </div>
              <div className="w-full lg:w-48">
                <SortBar onSort={handleSort} defaultSort={sortBy} />
              </div>
            </div>
            
            {(searchQuery || sortBy !== 'date' || selectedCategory) && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} found
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && ` in category "${selectedCategory}"`}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && searchQuery === '' && !selectedCategory && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
              <p className="mt-4 text-lg text-gray-600">Handpicked articles worth reading</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <FeaturedPost key={post._id} post={post} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section - Only show when not searching or filtering by category */}
      {searchQuery === '' && !selectedCategory && (
        <section className="py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400">{allPosts.length}+</div>
                <div className="text-sm md:text-base text-gray-300 mt-2">Articles Published</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400">
                  {new Set(allPosts.map(post => post.author)).size}+
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-2">Expert Writers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-400">
                  {totalViews.toLocaleString()}+
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-2">Total Views</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">
                  {new Set(allPosts.flatMap(post => post.tags || [])).size}+
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-2">Content Categories</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Blog List Section */}
      <section id="explore" className="py-16 bg-gray-50" ref={exploreSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {searchQuery && `Results for "${searchQuery}"`}
              {selectedCategory && `Browse articles in ${selectedCategory}`}
              {!searchQuery && !selectedCategory && 'Discover our most recent publications'}
            </p>
          </div>
          
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <BlogCard key={post._id} blog={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="newsletter" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1 mb-8 md:mb-0 md:mr-8">
                <h2 className="text-3xl font-bold text-white mb-4">Stay in the loop</h2>
                <p className="text-blue-100 text-lg">
                  Subscribe to our newsletter for the latest articles, updates, and exclusive content.
                </p>
              </div>
              
              <div className="flex-1 w-full">
                <form 
                  action="https://formspree.io/f/mjkezqby"
                  method="POST"
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="Enter your email"
                      className="w-full px-5 py-3 rounded-lg border border-transparent text-base focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 placeholder-blue-200 text-white"
                    />
                  </div>
                  
                  <input type="hidden" name="_subject" value="New newsletter subscription" />
                  
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  >
                    Subscribe Now
                  </button>
                  
                  <p className="text-blue-200 text-sm text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview - Only show when not searching or filtering */}
      {searchQuery === '' && !selectedCategory && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Explore Categories</h2>
              <p className="mt-4 text-lg text-gray-600">Find content that matches your interests</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayCategories.map((category, index) => {
                const postCount = allPosts.filter(post => 
                  post.tags && post.tags.some(tag => 
                    typeof tag === 'string' && tag.toLowerCase().includes(category.toLowerCase())
                  )
                ).length;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {postCount} article{postCount !== 1 ? 's' : ''}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
       
    </main>
  );
}