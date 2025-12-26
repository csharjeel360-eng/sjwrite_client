 import { useEffect, useState } from 'react';
import { api } from '../api/client';
import BlogCard from './BlogCard';
import SearchBar from './SearchBar';
import SortBar from './SortBar';
import TagChips from './TagChips';

// Helper function to safely extract tags from blog objects
const extractAllTags = (blogs) => {
  const allTags = new Map();
  
  blogs.forEach(blog => {
    if (blog.tags) {
      let tagsArray = [];
      
      if (Array.isArray(blog.tags)) {
        tagsArray = blog.tags;
      } else if (typeof blog.tags === 'string') {
        tagsArray = blog.tags.split(',').map(tag => tag.trim());
      }
      
      tagsArray.forEach(tag => {
        if (tag && typeof tag === 'string' && tag.trim() !== '') {
          const trimmedTag = tag.trim();
          allTags.set(trimmedTag, (allTags.get(trimmedTag) || 0) + 1);
        }
      });
    }
  });
  
  return Array.from(allTags.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 15);
};

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getBlogs();
      setBlogs(data);
      setFilteredBlogs(data);
      
      const tags = extractAllTags(data);
      setAllTags(tags);
    } catch (err) {
      setError('Failed to load blogs. Please try again.');
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (blogs.length === 0) return;
    
    let result = [...blogs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        (blog.content && blog.content.toLowerCase().includes(query)) ||
        (blog.tags && Array.isArray(blog.tags) && 
          blog.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply tag filter
    if (activeFilter !== 'all') {
      result = result.filter(blog => 
        blog.tags && 
        (Array.isArray(blog.tags) ? blog.tags.includes(activeFilter) : 
         typeof blog.tags === 'string' && blog.tags.split(',').map(t => t.trim()).includes(activeFilter))
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
    
    setFilteredBlogs(result);
  }, [blogs, searchQuery, activeFilter, sortBy]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveFilter('all');
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleTag = (tag) => {
    setActiveFilter(tag === activeFilter ? 'all' : tag);
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setSortBy('date');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
          <div className="w-full md:w-1/2">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full md:w-48">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Search blog posts..." />
          <SortBar onSort={handleSort} defaultSort={sortBy} />
        </div>
        
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={load}
            className="px-5 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="w-full lg:w-1/2">
            <SearchBar onSearch={handleSearch} placeholder="Search blog posts..." />
          </div>
          <div className="w-full lg:w-48">
            <SortBar onSort={handleSort} defaultSort={sortBy} />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filter by tags:</h3>
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-black hover:text-gray-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
            <TagChips 
              tags={allTags} 
              onClick={handleTag} 
              activeTag={activeFilter !== 'all' ? activeFilter : null}
            />
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
          {activeFilter !== 'all' && ` tagged with "${activeFilter}"`}
        </p>
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}