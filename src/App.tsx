/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocFromServer, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { Search, PlusCircle, MessageCircle, User as UserIcon, Home, ShoppingBag, AlertTriangle, X, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from './lib/utils';
import firebaseConfig from '../firebase-applet-config.json';

// --- Mock User for Guest Access ---
const GUEST_USER = {
  uid: 'guest-user',
  displayName: 'Guest User',
  email: 'guest@example.com',
  photoURL: 'https://ui-avatars.com/api/?name=Guest+User&background=random'
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Application Error</h2>
            <p className="text-gray-600">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Dummy useAuth for compatibility ---
export function useAuth() {
  return {
    user: GUEST_USER,
    loading: false,
    isSigningIn: false,
    signIn: async () => {},
    logout: async () => {},
  };
}

// --- Components (Lazy Loaded) ---
const HomeView = lazy(() => import('./components/HomeView'));
const ProductDetailsView = lazy(() => import('./components/ProductDetailsView'));
const SellView = lazy(() => import('./components/SellView'));
const ChatsView = lazy(() => import('./components/ChatsView'));
const MyAdsView = lazy(() => import('./components/MyAdsView'));
const AboutUsView = lazy(() => import('./components/AboutUsView'));
const PrivacyPolicyView = lazy(() => import('./components/PrivacyPolicyView'));
const TermsAndConditionsView = lazy(() => import('./components/TermsAndConditionsView'));
const FAQView = lazy(() => import('./components/FAQView'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const Footer = lazy(() => import('./components/Footer'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to allow lazy-loaded components to render
      const timer = setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [hash, pathname]);

  return null;
}

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600 shrink-0">
          <ShoppingBag className="w-6 h-6 sm:w-8 h-8" />
          <span className="hidden xs:inline">The Market Hub</span>
        </Link>

        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/chats" className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <MessageCircle className="w-6 h-6 text-gray-600" />
          </Link>
          <Link to="/my-ads" className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">My Ads</span>
          </Link>
          <Link to="/profile" className="w-8 h-8 sm:w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shrink-0">
            <img 
              src={GUEST_USER.photoURL} 
              alt={GUEST_USER.displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </Link>
          <button
            onClick={() => navigate('/sell')}
            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden lg:inline">Sell</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const linkClass = "flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors";

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link to={to} className={linkClass}>
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-50">
      <NavItem to="/" icon={Home} label="Home" />
      <NavItem to="/chats" icon={MessageCircle} label="Chats" />
      
      <div className="flex flex-col items-center gap-1 -mt-8">
        <button 
          onClick={() => navigate('/sell')}
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 border-4 border-white"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
        <span className="text-[10px] font-medium text-blue-600 mt-1">Sell</span>
      </div>

      <NavItem to="/my-ads" icon={ShoppingBag} label="My Ads" />
      <NavItem to="/profile" icon={UserIcon} label="Profile" />
    </div>
  );
}

export default function App() {
  const [connectionError, setConnectionError] = useState<{ message: string | React.ReactNode, isCritical: boolean } | null>(null);

  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      setConnectionError(null);
    } catch (error: any) {
      if (error.message?.includes('the client is offline')) {
        const msg = (
          <div className="space-y-4">
            <p className="text-sm opacity-90">
              The app is "offline" because it cannot reach your Firestore database.
            </p>
            <div className="bg-white/10 p-4 rounded-xl space-y-3 text-sm border border-white/20">
              <p className="font-bold underline">Follow these steps to fix it:</p>
              <ol className="list-decimal ml-4 space-y-2">
                <li>
                  Open your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-200 decoration-2 underline-offset-2">Firebase Console here</a>.
                </li>
                <li>
                  If you see a <strong>"Create Database"</strong> button, click it. Choose <strong>"Start in test mode"</strong>.
                </li>
              </ol>
            </div>
          </div>
        );
        setConnectionError({ message: msg, isCritical: true });
      } else {
        setConnectionError({ message: error.message || "Unknown connection error", isCritical: false });
      }
    }
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20 sm:pb-0">
          {connectionError && (
            connectionError.isCritical ? (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4 sm:p-6">
                <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="bg-white/20 p-4 rounded-full">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold">Firestore Connection Failed</h2>
                      <p className="text-red-100 font-medium">Your database is currently unreachable</p>
                    </div>
                    <div className="text-left w-full">{connectionError.message}</div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                      <button onClick={() => testConnection()} className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-4 rounded-2xl transition-all font-bold text-lg shadow-lg">
                        <RefreshCw className="w-5 h-5" /> Retry Connection
                      </button>
                      <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 bg-red-700 text-white hover:bg-red-800 px-6 py-4 rounded-2xl transition-all font-bold text-lg border border-white/10">
                        Reload Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-600 text-white p-3 text-center text-xs sm:text-sm font-medium sticky top-0 z-[100] animate-in fade-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 h-5 shrink-0" />
                  <span>{typeof connectionError.message === 'string' ? connectionError.message : 'Connection issue detected'}</span>
                  <button onClick={() => testConnection()} className="ml-2 sm:ml-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors font-bold">
                    <RefreshCw className="w-3 h-3 sm:w-4 h-4" /> Retry
                  </button>
                </div>
              </div>
            )
          )}
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full p-4">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/product/:id" element={<ProductDetailsView />} />
                <Route path="/sell" element={<SellView />} />
                <Route path="/chats" element={<ChatsView />} />
                <Route path="/chats/:chatId" element={<ChatsView />} />
                <Route path="/my-ads" element={<MyAdsView />} />
                <Route path="/about-us" element={<AboutUsView />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsView />} />
                <Route path="/faq" element={<FAQView />} />
                <Route path="/profile" element={<ProfileView />} />
              </Routes>
            </Suspense>
          </main>
          <BottomNav />
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

