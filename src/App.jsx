import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import AuthorPage from './pages/AutherPages';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageBlogs from './pages/ManageBlogs';
import RegisterForm from './pages/RegisterForm';
import BlogList from './components/BlogList';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivcayPolicy';
import { api } from './api/client';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Page title component
const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = `${title} - SJWrites`;
  }, [title]);

  return null;
};

// Protected Route Component for admin pages only
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

// Helper function to generate slug
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Component to handle redirect from old ID-based URLs to new slug-based URLs
function BlogIdRedirect() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogAndRedirect = async () => {
      try {
        const blogData = await api.getBlog(id);
        setBlog(blogData);
        const slug = generateSlug(blogData.title);
        // Replace the current URL with the new slug-based URL
        window.location.replace(`/blog/${slug}?id=${id}`);
      } catch (error) {
        console.error('Error fetching blog for redirect:', error);
        // If error, redirect to blogs page
        window.location.replace('/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogAndRedirect();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return null;
}

// Fixed Position Push Notification Ad Component
const PushNotificationAd = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState('bottom-right'); // 'bottom-right' or 'bottom-left'

  useEffect(() => {
    // Check if ad script is already loaded
    const existingScript = document.querySelector('script.adScriptClass');
    
    if (!existingScript) {
      // Load the ad script
      const script = document.createElement('script');
      script.src = 'https://www.adsrock.online/assets/ads/ad.js';
      script.className = 'adScriptClass';
      script.async = true;
      
      script.onload = () => {
        console.log('Ad script loaded successfully');
        setAdLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load ad script');
        setAdError(true);
      };
      
      document.body.appendChild(script);
    } else {
      setAdLoaded(true);
    }

    // Check if we're on admin pages - hide ad on admin pages
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setIsVisible(false);
    }

    // Randomly choose position for variation
    const randomPosition = Math.random() > 0.5 ? 'bottom-right' : 'bottom-left';
    setPosition(randomPosition);

    // Auto-hide after 30 seconds
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 30000);

    return () => {
      clearTimeout(autoHideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't show on admin pages or if hidden
  if (!isVisible || window.location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <div 
      className={`fixed ${position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4'} z-50 transition-all duration-300`}
      style={{
        animation: 'slideUp 0.5s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs"
          aria-label="Close ad"
        >
          ×
        </button>
        
        {/* Ad container */}
        <div 
          className="MainAdverTiseMentDiv" 
          data-publisher="eyJpdiI6IitPMHBxdWp4Y01wcjYxTUs3TlVWSEE9PSIsInZhbHVlIjoiRENtaGM4bGFVVkxSOUN3NXl5WmVoZz09IiwibWFjIjoiYzQ1NTE5NjFkM2IzNDgwOTkzNDU1ZmYwM2RlOTU2N2Y3MzFjNGYzM2RmYjMxMzQ4ZDhiOTA1NmM1MzE2OTM4MSJ9" 
          data-adsize="300x300"
          style={{
            width: '300px',
            height: '300px',
            display: 'block'
          }}
        >
          {/* Loading/Error states */}
          {!adLoaded && !adError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">Loading ad...</p>
              </div>
            </div>
          )}
          
          {adError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <p className="text-sm text-gray-600 mb-2">Advertisement</p>
                <p className="text-xs text-gray-500">Ad could not be loaded</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Ad label */}
        <div className="absolute bottom-2 left-2">
          <span className="text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">Ad</span>
        </div>
      </div>
      
      {/* Add CSS animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 640px) {
          .fixed.bottom-4.right-4,
          .fixed.bottom-4.left-4 {
            right: 16px !important;
            left: 16px !important;
            width: calc(100% - 32px) !important;
            max-width: 300px;
            margin: 0 auto;
          }
          
          .MainAdverTiseMentDiv {
            width: 100% !important;
            height: 300px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={
          <>
            <PageTitle title="Home" />
            <Home />
          </>
        } />
        <Route path="/blog/:slug" element={
          <>
            {/* Title will be set dynamically in BlogDetail */}
            <BlogDetail />
          </>
        } />
        <Route path="/author/:id" element={
          <>
            <PageTitle title="Author" />
            <AuthorPage />
          </>
        } />
        <Route path="/admin/login" element={
          <>
            <PageTitle title="Admin Login" />
            <AdminLogin />
          </>
        } />
        <Route path="/blogs" element={
          <>
            <PageTitle title="All Blogs" />
            <BlogList />
          </>
        } />
        <Route path="/about" element={
          <>
            <PageTitle title="About Us" />
            <About />
          </>
        } />
        <Route path="/privacypolicy" element={
          <>
            <PageTitle title="Privacy Policy" />
            <PrivacyPolicy />
          </>
        } />
        
        {/* Protected routes (admin only) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <PageTitle title="Admin Dashboard" />
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/registeration" element={
          <ProtectedRoute>
            <PageTitle title="Admin Registration" />
            <RegisterForm />
          </ProtectedRoute>
        } />
        
        {/* Redirect old ID-based URLs to new slug-based URLs */}
        <Route path="/blog/:id" element={<BlogIdRedirect />} />
        
        {/* Catch all route - redirect to home for any unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      
      {/* Push Notification Ad - Shows on all public pages */}
      <PushNotificationAd />
    </Router>
  );
}