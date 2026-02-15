import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DeferredScript from './components/DeferredScript';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Blogs from './pages/Blogs';
import HotBlogs from './pages/HotBlogs';
import Trending from './pages/Trending';
import AuthorPage from './pages/AutherPages';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageBlogs from './pages/ManageBlogs';
import RegisterForm from './pages/RegisterForm';
// BlogList removed — blogs are shown on Home now
import About from './pages/About';
import PrivacyPolicy from './pages/PrivcayPolicy';
import TermsOfService from './pages/TermsOfService';
import Disclaimer from './pages/Disclaimer';
import ContactUs from './pages/ContactUs';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogAndRedirect = async () => {
      try {
        const blogData = await api.getBlog(id);
        setBlog(blogData);
        const slug = generateSlug(blogData.title);
        // Navigate to the new slug-based URL without a full page reload
        const target = `/${slug}?id=${id}`;
        // Only navigate if we're not already at the intended URL
        if (window.location.pathname !== `/${slug}` || window.location.search.indexOf(`id=${id}`) === -1) {
          navigate(target, { replace: true });
        }
      } catch (error) {
        console.error('Error fetching blog for redirect:', error);
        // If error, redirect to blogs page
        navigate('/blogs', { replace: true });
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

// Push notification / ad behavior removed per request.

export default function App() {
  return (
    <Router>
      <MetaDefaults />
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
        {/* Blogs collection (posts tagged 'blog') */}
        <Route path="/blog" element={
          <>
            <Blogs />
          </>
        } />
        <Route path="/blog/trending" element={
          <>
            <PageTitle title="Trending Blogs" />
            <Trending />
          </>
        } />
        <Route path="/blog/hot" element={
          <>
            <PageTitle title="Hot Blogs" />
            <HotBlogs />
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
        {/* /blogs route removed — use Home with navbar filter */}
        <Route path="/about" element={
          <>
            <PageTitle title="About Us" />
            <About />
          </>
        } />
        <Route path="/contact" element={
          <>
            <PageTitle title="Contact Us" />
            <ContactUs />
          </>
        } />
        <Route path="/privacypolicy" element={
          <>
            <PageTitle title="Privacy Policy" />
            <PrivacyPolicy />
          </>
        } />
        <Route path="/terms" element={
          <>
            <PageTitle title="Terms of Service" />
            <TermsOfService />
          </>
        } />
        <Route path="/disclaimer" element={
          <>
            <PageTitle title="Disclaimer" />
            <Disclaimer />
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

        {/* Support root-path slugs for blog detail (clean URLs without /blog) */}
        <Route path="/:slug" element={
          <>
            <BlogDetail />
          </>
        } />

        {/* Catch all route - redirect to home for any unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      {/* Deferred third-party scripts: load after idle/interaction to reduce TBT */}
      <DeferredScript
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5685971541362154"
        id="adsbygoogle"
        strategy="idle"
        attrs={{ crossorigin: 'anonymous' }}
      />
      <DeferredScript
        src="https://www.googletagmanager.com/gtm.js?id=GTM-TQCV2FSF"
        id="gtm-script"
        strategy="idle"
      />
    </Router>
  );
}

function MetaDefaults() {
  const { pathname } = useLocation();
  const canonical = `https://sjwrites.com${pathname}`;

  return (
    <Helmet>
      <meta name="description" content="SJWrites — entertainment, trending stories, celebrity news and more. Read the latest articles." />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index,follow" />
    </Helmet>
  );
}