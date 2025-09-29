 import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component for admin pages only
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public routes (accessible to everyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/author/:id" element={<AuthorPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        
        {/* Protected routes (admin only) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/registeration" element={
          <ProtectedRoute>
            <RegisterForm />
          </ProtectedRoute>
        } />
        
        {/* Catch all route - redirect to home for any unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}