import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, limit, deleteDoc, setDoc } from '../firebase';
import { useAuth } from '../App';
import { MessageCircle, User, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function ProductDetailsView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    async function checkFavorite() {
      if (!id) return;
      try {
        const favRef = doc(db, 'users', user.uid, 'favorites', id);
        const favSnap = await getDoc(favRef);
        setIsFavorited(favSnap.exists());
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    }
    checkFavorite();
  }, [user, id]);

  const handleFavorite = async () => {
    if (!id || !product) return;

    setFavoriteLoading(true);
    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', id);
      if (isFavorited) {
        // Remove from favorites
        await deleteDoc(favRef);
        setIsFavorited(false);
      } else {
        // Add to favorites
        await setDoc(favRef, {
          productId: id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || `https://picsum.photos/seed/${id}/400/300`,
          category: product.category,
          addedAt: serverTimestamp()
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Product link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to copy link');
    }
  };

  const handleChat = async () => {
    if (user.uid === product.sellerId) {
      alert("You can't chat with yourself!");
      return;
    }

    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('productId', '==', id),
        where('buyerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        navigate(`/chats/${querySnapshot.docs[0].id}`);
        return;
      }

      // Create new chat
      const newChat = {
        productId: id,
        productTitle: product.title,
        buyerId: user.uid,
        sellerId: product.sellerId,
        participants: [user.uid, product.sellerId],
        lastMessage: `Hi, I'm interested in ${product.title}`,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(chatsRef, newChat);
      
      // Add initial message
      await addDoc(collection(db, 'chats', docRef.id, 'messages'), {
        chatId: docRef.id,
        senderId: user.uid,
        text: `Hi, I'm interested in ${product.title}`,
        createdAt: serverTimestamp()
      });

      navigate(`/chats/${docRef.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 mt-4 underline">Go back home</button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [`https://picsum.photos/seed/${product.id}/800/600`];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Images and Description */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group">
          <img
            src={images[currentImage]}
            alt={product.title}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            decoding="async"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur hover:bg-white/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur hover:bg-white/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentImage ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-2xl font-bold">Description</h2>
          <div className="prose prose-blue max-w-none text-gray-600">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Right Column: Price, Seller, and Actions */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {product.category === 'Jobs' ? 'Salary: ₹' : 
               product.category === 'Services' ? `Price: ${product.pricingModel === 'Percentage' ? '' : '₹'}` : 
               '₹'}
              {product.price.toLocaleString()}
              {product.category === 'Services' && product.pricingModel === 'Percentage' ? '%' : ''}
            </h1>
            <p className="text-xl text-gray-600 font-medium">{product.title}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {product.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.createdAt ? formatDistanceToNow(product.createdAt.toDate()) : 'Recently'}
            </span>
          </div>

          {product.category === 'Cars' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.seatingCapacity && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Seating</p>
                  <p className="text-sm font-bold text-gray-700">{product.seatingCapacity}</p>
                </div>
              )}
              {product.condition && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">
                    {product.condition} {product.usedDuration ? `(${product.usedDuration})` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Properties' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.propertyType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Type</p>
                  <p className="text-sm font-bold text-gray-700">{product.propertyType}</p>
                </div>
              )}
              {product.propertyName && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Ownership</p>
                  <p className="text-sm font-bold text-gray-700">{product.propertyName}</p>
                </div>
              )}
              {product.offerType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Offer</p>
                  <p className="text-sm font-bold text-gray-700">{product.offerType}</p>
                </div>
              )}
              {product.bhk && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">BHK</p>
                  <p className="text-sm font-bold text-gray-700">{product.bhk}</p>
                </div>
              )}
              {product.propertyCondition && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">
                    {product.propertyCondition} {product.propertyAge ? `(${product.propertyAge})` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Mobiles' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.brand && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Brand</p>
                  <p className="text-sm font-bold text-gray-700">{product.brand}</p>
                </div>
              )}
              {product.quantity && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Quantity</p>
                  <p className="text-sm font-bold text-gray-700">{product.quantity}</p>
                </div>
              )}
              {product.mobileCondition && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">
                    {product.mobileCondition} {product.mobileUsedDuration ? `(${product.mobileUsedDuration})` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Jobs' && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {product.companyName && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Company</p>
                    <p className="text-sm font-bold text-gray-700">{product.companyName}</p>
                  </div>
                )}
                {product.jobType && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Job Type</p>
                    <p className="text-sm font-bold text-gray-700">{product.jobType}</p>
                  </div>
                )}
                {product.qualification && (
                  <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Qualification</p>
                    <p className="text-sm font-bold text-gray-700">{product.qualification}</p>
                  </div>
                )}
                {product.jobAddress && (
                  <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Location</p>
                    <p className="text-sm font-bold text-gray-700">{product.jobAddress}</p>
                  </div>
                )}
              </div>
              
              {product.benefits && product.benefits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {product.benefits.map((benefit: string) => (
                      <span key={benefit} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {product.category === 'Bikes' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.bikeBrand && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Brand</p>
                  <p className="text-sm font-bold text-gray-700">{product.bikeBrand}</p>
                </div>
              )}
              {product.bikeCondition && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">{product.bikeCondition}</p>
                </div>
              )}
              {product.bikeUsedDuration && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Used Duration</p>
                  <p className="text-sm font-bold text-gray-700">{product.bikeUsedDuration}</p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Electronics' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.electronicsBrand && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Brand</p>
                  <p className="text-sm font-bold text-gray-700">{product.electronicsBrand}</p>
                </div>
              )}
              {product.electronicsCondition && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">{product.electronicsCondition}</p>
                </div>
              )}
              {product.electronicsUsedDuration && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Used Duration</p>
                  <p className="text-sm font-bold text-gray-700">{product.electronicsUsedDuration}</p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Furniture' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.furnitureBrand && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Brand</p>
                  <p className="text-sm font-bold text-gray-700">{product.furnitureBrand}</p>
                </div>
              )}
              {product.furnitureCondition && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Condition</p>
                  <p className="text-sm font-bold text-gray-700">{product.furnitureCondition}</p>
                </div>
              )}
              {product.furnitureUsedDuration && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Used Duration</p>
                  <p className="text-sm font-bold text-gray-700">{product.furnitureUsedDuration}</p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Fashion' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.fashionGender && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Category</p>
                  <p className="text-sm font-bold text-gray-700">{product.fashionGender}</p>
                </div>
              )}
              {product.fashionSubcategory && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Subcategory</p>
                  <p className="text-sm font-bold text-gray-700">{product.fashionSubcategory}</p>
                </div>
              )}
              {product.personalCareType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Type</p>
                  <p className="text-sm font-bold text-gray-700">{product.personalCareType}</p>
                </div>
              )}
              {product.fashionGender === 'Personal Care' && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Kit Product</p>
                  <p className="text-sm font-bold text-gray-700">{product.isKitProduct ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          )}

          {product.category === 'Services' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.serviceCompanyName && (
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Company Name</p>
                  <p className="text-sm font-bold text-gray-700">{product.serviceCompanyName}</p>
                </div>
              )}
              {product.pricingModel && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Pricing Model</p>
                  <p className="text-sm font-bold text-gray-700">{product.pricingModel}</p>
                </div>
              )}
              {product.serviceType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Service Type</p>
                  <p className="text-sm font-bold text-gray-700">{product.serviceType}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 sm:pt-0">
            <button 
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-colors ${
                isFavorited 
                  ? 'bg-red-50 border-red-200 text-red-600' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              <span className="hidden xs:inline">{isFavorited ? 'Favorited' : 'Favorite'}</span>
              <span className="xs:hidden">{isFavorited ? 'Liked' : 'Like'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-6 shadow-sm sm:sticky sm:top-24 h-fit">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{product.sellerName || 'Seller'}</h3>
              <p className="text-sm text-gray-500">Member since 2026</p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:relative sm:p-0 sm:bg-transparent sm:border-none z-40">
            <button
              onClick={handleChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-6 h-6" />
              Chat with Seller
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <SimilarProducts category={product.category} currentProductId={product.id} />
      </div>
    </div>
  );
}

function SimilarProducts({ category, currentProductId }: { category: string, currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', category),
          where('status', '==', 'active'),
          limit(5)
        );
        const snap = await getDocs(q);
        const filtered = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== currentProductId);
        setProducts(filtered);
      } catch (error: any) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [category, currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Fresh Recommendations in {category}</h2>
          <Link to={`/?category=${category}`} className="text-blue-600 font-semibold hover:underline">View all</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <Link 
            key={p.id} 
            to={`/product/${p.id}`} 
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              <img 
                src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/400/300`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-4 space-y-1">
              <p className="text-lg font-bold text-gray-900">
                {p.category === 'Jobs' ? 'Salary: ' : ''}₹{p.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 line-clamp-1">{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
