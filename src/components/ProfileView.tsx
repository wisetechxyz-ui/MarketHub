import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, doc, getDoc, setDoc, updateDoc, OperationType, handleFirestoreError } from '../firebase';
import { User, Mail, Phone, Edit2, Save, X, Camera, ShoppingBag, MessageCircle, LogOut, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function ProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(user ? {
    uid: user.uid,
    displayName: user.displayName || 'User',
    email: user.email,
    photoURL: user.photoURL,
    bio: '',
    phoneNumber: ''
  } : null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
    phoneNumber: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'favorites'>('about');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function fetchProfile() {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile(data);
          setFormData({
            displayName: data.displayName || '',
            bio: data.bio || '',
            phoneNumber: data.phoneNumber || ''
          });
        } else if (user) {
          // If doc doesn't exist, we use the auth user data
          setProfile({
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL,
            bio: '',
            phoneNumber: ''
          });
          setFormData({
            displayName: user.displayName || '',
            bio: '',
            phoneNumber: ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchFavorites() {
      try {
        const favRef = collection(db, 'users', user.uid, 'favorites');
        const q = query(favRef, orderBy('addedAt', 'desc'));
        const snap = await getDocs(q);
        setFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setFavLoading(false);
      }
    }

    fetchProfile();
    fetchFavorites();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL
      }, { merge: true });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile && !user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Cover Area */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="px-4 sm:px-8 pb-6 sm:pb-8">
          <div className="relative -mt-12 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
                <img 
                  src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&background=random`} 
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 transition-colors">
                <Camera className="w-4 h-4 sm:w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{profile.displayName}</h1>
              <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1 text-sm">
                <Mail className="w-4 h-4" />
                <span className="truncate">{profile.email}</span>
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input 
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Add phone number"
                    className="text-sm w-full bg-gray-50 border-none rounded p-1 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <span className="text-sm">{profile.phoneNumber || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Quick Links</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/my-ads')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>My Listings</span>
              </button>
              <button 
                onClick={() => navigate('/chats')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"
              >
                <MessageCircle className="w-5 h-5" />
                <span>My Messages</span>
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-4 px-2 font-bold transition-all relative ${
                activeTab === 'about' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About Me
              {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 px-2 font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Favorites ({favorites.length})
              {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </button>
          </div>

          {activeTab === 'about' ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Bio</h3>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell people about yourself..."
                    rows={4}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {profile.bio || "No bio added yet. Tell people a bit about yourself!"}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Display Name</h3>
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {favLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav: any) => (
                    <Link 
                      key={fav.id} 
                      to={`/product/${fav.productId}`}
                      className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all group"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={fav.image} 
                          alt={fav.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-gray-900 truncate">{fav.title}</h4>
                        <p className="text-blue-600 font-bold">₹{fav.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{fav.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">No favorites yet</h3>
                    <p className="text-gray-500">Items you favorite will appear here.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Start Browsing
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-900">Ready to sell something?</h3>
                <p className="text-blue-700">List your items and reach thousands of buyers.</p>
              </div>
              <button 
                onClick={() => navigate('/sell')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Post an Ad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
