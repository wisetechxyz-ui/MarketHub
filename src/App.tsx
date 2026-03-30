/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext, Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  getDocFromServer, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Search, PlusCircle, MessageCircle, User as UserIcon, LogOut, Home, ShoppingBag, AlertTriangle, Mail, Lock, UserPlus, LogIn, X } from 'lucide-react';
import { cn } from './lib/utils';

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

// --- Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
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
  const { user, loading, isSigningIn, signIn } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600 shrink-0">
          <ShoppingBag className="w-6 h-6 sm:w-8 h-8" />
          <span className="hidden xs:inline">MarketHub</span>
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
          {loading ? (
            <div className="w-8 h-8 sm:w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <>
              <Link to="/chats" className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </Link>
              <Link to="/my-ads" className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">My Ads</span>
              </Link>
              <Link to="/profile" className="w-8 h-8 sm:w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shrink-0">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
                  alt={user.displayName || 'User'} 
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
            </>
          ) : (
            <button
              onClick={signIn}
              disabled={isSigningIn}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                  <span>Login with Google</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isSigningIn, signIn } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-20 space-y-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto my-10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-blue-600 text-3xl font-extrabold tracking-tight">
            <ShoppingBag className="w-10 h-10" />
            MarketHub
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
          <p className="text-gray-500 max-w-md">
            Please sign in with your Google account to access this section and start buying or selling.
          </p>
        </div>

        <button
          onClick={signIn}
          disabled={isSigningIn}
          className="w-full max-w-xs bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
        >
          {isSigningIn ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-gray-400">
          By continuing, you agree to MarketHub's Terms of Service and Privacy Policy.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function BottomNav() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const guestLinkClass = "flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors";

  const NavItem = ({ to, icon: Icon, label, protected: isProtected }: { to: string, icon: any, label: string, protected?: boolean }) => {
    const content = (
      <>
        <Icon className="w-6 h-6" />
        <span className="text-[10px] font-medium">{label}</span>
      </>
    );

    if (isProtected && !user) {
      return (
        <button onClick={signIn} className={guestLinkClass}>
          {content}
        </button>
      );
    }

    return (
      <Link to={to} className={guestLinkClass}>
        {content}
      </Link>
    );
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-50">
      <NavItem to="/" icon={Home} label="Home" />
      <NavItem to="/chats" icon={MessageCircle} label="Chats" protected />
      
      <div className="flex flex-col items-center gap-1 -mt-8">
        <button 
          onClick={() => user ? navigate('/sell') : signIn()}
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 border-4 border-white"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
        <span className="text-[10px] font-medium text-blue-600 mt-1">Sell</span>
      </div>

      <NavItem to="/my-ads" icon={ShoppingBag} label="My Ads" protected />
      <NavItem to="/profile" icon={UserIcon} label="Profile" protected />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set user immediately for UI responsiveness
        setUser(user);
        setLoading(false);

        // Background profile sync
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Profile sync error:", error);
          // We don't block the UI if profile sync fails
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      let message = 'An error occurred during sign in.';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'The sign-in popup was closed before completion. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Only one sign-in popup can be open at a time.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for sign-in. Please check your Firebase Console settings.';
      }
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, loading, isSigningIn, signIn, logout }}>
        <Router>
          <ScrollToHash />
          {authError && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{authError}</p>
                </div>
                <button onClick={() => setAuthError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="min-h-screen bg-gray-50 flex flex-col pb-20 sm:pb-0">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-6">
                  <div className="flex items-center gap-3 text-blue-600 text-3xl font-extrabold tracking-tight">
                    <ShoppingBag className="w-10 h-10" />
                    MarketHub
                  </div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-blue-600"></div>
                </div>
              ) : (
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomeView />} />
                    <Route path="/product/:id" element={<ProductDetailsView />} />
                    <Route path="/sell" element={<ProtectedRoute><SellView /></ProtectedRoute>} />
                    <Route path="/chats" element={<ProtectedRoute><ChatsView /></ProtectedRoute>} />
                    <Route path="/chats/:chatId" element={<ProtectedRoute><ChatsView /></ProtectedRoute>} />
                    <Route path="/my-ads" element={<ProtectedRoute><MyAdsView /></ProtectedRoute>} />
                    <Route path="/about-us" element={<AboutUsView />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditionsView />} />
                    <Route path="/faq" element={<FAQView />} />
                    <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
              )}
            </main>
            <BottomNav />
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </div>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

