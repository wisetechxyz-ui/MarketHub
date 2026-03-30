import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db, collection, getDocs, query, where, orderBy, limit, handleFirestoreError, OperationType } from '../firebase';
import { Tag, MapPin, Clock, Search, SlidersHorizontal, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'Cars', 'Properties', 'Mobiles', 'Jobs', 'Bikes', 'Electronics', 'Furniture', 'Fashion', 'Services'
];

export default function HomeView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        if (selectedCategory) {
          q = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            where('category', '==', selectedCategory),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        // Fallback if index is missing
        if (error.message?.includes('index') || error.code === 'failed-precondition') {
          try {
            let q = query(
              collection(db, 'products'),
              where('status', '==', 'active'),
              limit(20)
            );
            if (selectedCategory) {
              q = query(
                collection(db, 'products'),
                where('status', '==', 'active'),
                where('category', '==', selectedCategory),
                limit(20)
              );
            }
            const querySnapshot = await getDocs(q);
            const productsData: any[] = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            // Sort in memory
            productsData.sort((a, b) => {
              const dateA = a.createdAt?.toMillis() || 0;
              const dateB = b.createdAt?.toMillis() || 0;
              return dateB - dateA;
            });
            setProducts(productsData);
          } catch (innerError) {
            handleFirestoreError(innerError, OperationType.LIST, 'products');
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, 'products');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  const handleCategorySelect = (cat: string | null) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
    setSelectedCategory(cat);
  };

  const filteredProducts = products
    .filter(product => {
      const price = product.price || 0;
      const min = priceRange.min ? parseInt(priceRange.min) : 0;
      const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
      return price >= min && price <= max;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0; // Newest is already handled by Firestore query or memory sort
    });

  return (
    <div className="space-y-8" id="features">
      {/* Categories & Filter Button */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" id="categories">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border text-sm font-bold shrink-0",
            showFilters ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <div className="h-6 w-px bg-gray-200 shrink-0" />
        <button
          onClick={() => handleCategorySelect(null)}
          className={cn(
            "px-4 sm:px-6 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all shrink-0",
            !selectedCategory
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          )}
        >
          All
        </button>
        {CATEGORIES.filter(cat => !selectedCategory || cat === selectedCategory || cat !== 'Services').map(cat => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={cn(
              "px-4 sm:px-6 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              selectedCategory === cat
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="overflow-hidden">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setPriceRange({ min: '', max: '' });
                  setSortBy('newest');
                }}
                className="w-full p-2 text-sm text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero / Banner */}
      <div className="relative h-48 sm:h-64 md:h-80 rounded-2xl sm:rounded-3xl overflow-hidden mb-8 group">
        <img
          src="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=2000"
          alt="Marketplace Hero"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent flex flex-col justify-center px-6 sm:px-12">
          <div className="max-w-xl space-y-2 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Buy & Sell Everything <br className="hidden sm:block" />
              <span className="text-blue-400">In One Place</span>
            </h1>
            <p className="text-sm sm:text-lg text-blue-100 max-w-md opacity-90">
              Join millions of people buying and selling on The Market Hub. The safest way to trade in your community.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div id="products">
        <h2 className="text-2xl font-bold mb-6">Fresh recommendations</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-blue-600">
                    {product.category}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {product.category === 'Jobs' ? 'Salary: ₹' : 
                       product.category === 'Services' ? `Price: ${product.pricingModel === 'Percentage' ? '' : '₹'}` : 
                       '₹'}
                      {product.price.toLocaleString()}
                      {product.category === 'Services' && product.pricingModel === 'Percentage' ? '%' : ''}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{product.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {product.createdAt ? formatDistanceToNow(product.createdAt.toDate()) : 'Recently'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
