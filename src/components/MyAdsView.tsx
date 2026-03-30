import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, collection, query, where, getDocs, deleteDoc, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { Trash2, Edit3, CheckCircle, Clock, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MyAdsView() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchMyProducts() {
      try {
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    }

    fetchMyProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      setShowConfirmModal(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      await updateDoc(doc(db, 'products', id), { status: 'sold' });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' } : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Please login to view your ads</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
        <Link
          to="/sell"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Post New Ad
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white h-32 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow"
            >
              <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img
                  src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{product.title}</h3>
                  {product.status === 'sold' ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Sold</span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                  )}
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {product.category === 'Jobs' ? 'Salary: ₹' : 
                   product.category === 'Services' ? `Price: ${product.pricingModel === 'Percentage' ? '' : '₹'}` : 
                   '₹'}
                  {product.price.toLocaleString()}
                  {product.category === 'Services' && product.pricingModel === 'Percentage' ? '%' : ''}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {product.createdAt ? formatDistanceToNow(product.createdAt.toDate()) : 'Recently'}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {product.status === 'active' && (
                  <button
                    onClick={() => handleMarkAsSold(product.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Sold
                  </button>
                )}
                <Link
                  to={`/product/${product.id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold"
                >
                  <Edit3 className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => setShowConfirmModal(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">You haven't posted any ads yet.</p>
          <Link
            to="/sell"
            className="text-blue-600 font-bold hover:underline"
          >
            Start selling now
          </Link>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Listing?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirmModal)}
                disabled={!!deletingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
