 import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-gray-600 mt-16 border-t">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">© {new Date().getFullYear()} SJWrites. All rights reserved.</p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Link 
            to="/privacypolicy" 
            className="px-3 py-1 text-sm rounded text-blue-600 hover:text-blue-800 hover:underline"
          >
            Privacy Policy
          </Link>
          
          <Link 
            to="/about" 
            className="px-3 py-1 text-sm rounded text-blue-600 hover:text-blue-800 hover:underline"
          >
            About Us
          </Link>

          <Link 
            to="/admin/login" 
            className="px-3 py-1 text-sm rounded text-blue-600 hover:text-blue-800 hover:underline"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}