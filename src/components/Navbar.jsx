 import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoText, setLogoText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();

  // Typewriter animation for logo
  useEffect(() => {
    const fullText = 'SJWrites';
    let currentIndex = 0;
    let timeoutId;

    const typeText = () => {
      if (currentIndex <= fullText.length) {
        setLogoText(fullText.substring(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typeText, 150);
      } else {
        setIsTyping(false);
        // After finishing, restart the animation after a delay
        timeoutId = setTimeout(() => {
          setLogoText('');
          currentIndex = 0;
          setIsTyping(true);
          typeText();
        }, 10000);
      }
    };

    // Start the animation
    typeText();

    // Cleanup on component unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Check if admin is logged in on component mount and on changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    
    // Check initially
    checkAuthStatus();
    
    // Listen for custom auth events (triggered after login/logout)
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    // Listen for storage events (login/logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        checkAuthStatus();
      }
    };
    
    // Add event listeners
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // Dispatch custom event to update all navbar instances
    window.dispatchEvent(new Event('authChange'));
    
    // Redirect to home page after logout
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Left Navigation */}
          <div className="flex items-center gap-6">
            {/* Animated Logo */}
            <Link 
              to="/" 
              className="text-2xl font-bold text-black flex items-center min-h-[2rem]"
            >
              {logoText}
              <span className={`ml-0.5 bg-black h-6 w-0.5 ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
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

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu (Desktop) */}
            <div className="relative">
              {isAdmin ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLogout}
                    className="hidden md:block text-gray-700 hover:text-red-600 transition"
                  >
                    Logout
                  </button>
                  
                  {/* User icon with dropdown */}
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
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Login button replaced with user icon */
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu for non-logged in users */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                    </div>
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

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-3">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/blogs" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </NavLink>
            <NavLink 
              to="/about" 
              className={({isActive}) => 
                `block py-2 px-4 rounded-md ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </NavLink>
            
            {/* Show admin links only if authenticated */}
            {isAdmin && (
              <>
                <NavLink 
                  to="/admin/dashboard" 
                  className={({isActive}) => 
                    `block py-2 px-4 rounded-md ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                
                <NavLink 
                  to="/admin/registeration" 
                  className={({isActive}) => 
                    `block py-2 px-4 rounded-md ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`
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
                className="block py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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