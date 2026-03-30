import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <ShoppingBag className="w-8 h-8" />
              <span>The Market Hub</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              The world's most trusted marketplace for buying and selling everything from cars to electronics. Join our community today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/#features" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Features</Link></li>
              <li><Link to="/#products" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Products</Link></li>
              <li><Link to="/#categories" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Categories</Link></li>
              <li><Link to="/my-ads" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Favorite</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/faq" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>India, Maharashtra, Mumbai 400063</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <span>sachinkamatxyz@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} The Market Hub Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Privacy</Link>
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Terms</Link>
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
