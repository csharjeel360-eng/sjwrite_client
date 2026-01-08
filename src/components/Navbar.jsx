import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar({ onSearch }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    
    checkAuthStatus();
    
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
        if (onSearch && q) {
          onSearch(q);
          if (window.location.pathname !== '/') navigate('/');
        } else {
          // Ensure Home is shown first, then broadcast search event
          if (window.location.pathname !== '/') navigate('/');
          setTimeout(() => window.dispatchEvent(new CustomEvent('siteSearch', { detail: q })), 50);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
        // Navigate home and broadcast clear so listeners reset
        if (window.location.pathname !== '/') navigate('/');
        setTimeout(() => window.dispatchEvent(new CustomEvent('siteSearch', { detail: '' })), 50);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Left Navigation */}
          <div className="flex items-center gap-6">
            {/* Fixed Logo */}
            <Link 
              to="/" 
              className="text-2xl font-bold text-black flex items-center"
            >
              SJ Writes
            </Link>

            {/* Desktop Navigation - Left Side */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                }
              >
                Home
              </NavLink>

              <NavLink 
                to="/blogs" 
                className={({isActive}) => 
                  isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                }
              >
                Blogs
              </NavLink>

              <NavLink 
                to="/about" 
                className={({isActive}) => 
                  isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                }
              >
                About Us
              </NavLink>
              <NavLink 
                to="/contact" 
                className={({isActive}) => 
                  isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                }
              >
                Contact
              </NavLink>
              
              {/* Show admin links only if authenticated */}
              {isAdmin && (
                <>
                  <NavLink 
                    to="/admin/dashboard" 
                    className={({isActive}) => 
                      isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                    }
                  >
                    Dashboard
                  </NavLink>
                  
                  <NavLink 
                    to="/admin/registeration" 
                    className={({isActive}) => 
                      isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'
                    }
                  >
                    Add new admin
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  if (onSearch) {
                    onSearch(v);
                  } else {
                    window.dispatchEvent(new CustomEvent('siteSearch', { detail: v }));
                  }
                }}
                placeholder="Search posts..."
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
              />
              {/* Search Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button (Mobile) */}
            <button 
              className="md:hidden p-2 text-gray-700 hover:text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {isAdmin ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                      </div>
                      <Link 
                        to="/admin/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/admin/registeration" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Add New Admin
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Guest User</p>
                        <p className="text-xs text-gray-500">Not logged in</p>
                      </div>
                      <Link 
                        to="/admin/login" 
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-black focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu (includes search on mobile) */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-3">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="px-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchQuery(v);
                    if (onSearch) {
                      onSearch(v);
                    } else {
                      window.dispatchEvent(new CustomEvent('siteSearch', { detail: v }));
                    }
                  }}
                  placeholder="Search posts..."
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/blogs" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </NavLink>
            <NavLink 
              to="/about" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </NavLink>
            
            {/* Show admin links only if authenticated */}
            {isAdmin && (
              <>
                <NavLink 
                  to="/admin/dashboard" 
                  className={({isActive}) => 
                    `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                
                <NavLink 
                  to="/admin/registeration" 
                  className={({isActive}) => 
                    `block py-2 px-4 rounded-md ${isActive ? 'bg-gray-100 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add new admin
                </NavLink>
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 rounded-md text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
            
            {/* Show login option if not authenticated */}
            {!isAdmin && (
              <NavLink 
                to="/admin/login" 
                className="block py-2 px-4 rounded-md bg-black text-white hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}