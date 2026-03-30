import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const CATEGORIES = [
  'Cars', 'Properties', 'Mobiles', 'Jobs', 'Bikes', 'Electronics', 'Furniture', 'Fashion', 'Services'
];

export default function SellView() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
    seatingCapacity: '',
    condition: '',
    usedDuration: '',
    // Property specific fields
    propertyType: '',
    propertyName: '',
    offerType: '',
    propertyCondition: '',
    propertyAge: '',
    bhk: '',
    // Mobile specific fields
    brand: '',
    mobileCondition: '',
    mobileUsedDuration: '',
    quantity: '1',
    // Job specific fields
    companyName: '',
    jobAddress: '',
    qualification: '',
    jobType: '',
    benefits: [] as string[],
    // Bike specific fields
    bikeBrand: '',
    bikeCondition: '',
    bikeUsedDuration: '',
    // Electronics specific fields
    electronicsBrand: '',
    electronicsCondition: '',
    electronicsUsedDuration: '',
    // Furniture specific fields
    furnitureBrand: '',
    furnitureCondition: '',
    furnitureUsedDuration: '',
    // Fashion specific fields
    fashionGender: '',
    fashionSubcategory: '',
    personalCareType: '',
    isKitProduct: false,
    serviceCompanyName: '',
    pricingModel: '',
    serviceType: ''
  });

  const handleAiDescription = async () => {
    if (!formData.title) {
      alert('Please enter a title first');
      return;
    }

    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a professional and attractive OLX-style product description for: ${formData.title}. 
        Include key features, condition, and why someone should buy it. Keep it concise and use bullet points.`
      });
      
      if (response.text) {
        setFormData(prev => ({ ...prev, description: response.text }));
      }
    } catch (error) {
      console.error('AI error:', error);
      alert('Failed to generate description with AI. Please try writing it manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        sellerId: user.uid,
        sellerName: user.displayName,
        status: 'active',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      navigate(`/product/${docRef.id}`);
    } catch (error) {
      console.error('Error adding product:', error);
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Post Your Ad</h1>
          <p className="text-gray-500">Fill in the details to reach millions of buyers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    formData.category === cat 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Ad Title</label>
            <input
              required
              type="text"
              placeholder="e.g. iPhone 13 Pro Max 256GB"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <button
                type="button"
                onClick={handleAiDescription}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Generate
              </button>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Describe what you are selling..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              {formData.category === 'Jobs' ? 'Salary (₹)' : 
               formData.category === 'Services' ? `Price (${formData.pricingModel === 'Percentage' ? '%' : '₹'})` : 
               'Price (₹)'}
            </label>
            <input
              required
              type="number"
              placeholder={
                formData.category === 'Jobs' ? 'Enter monthly salary' : 
                formData.category === 'Services' ? (formData.pricingModel === 'Percentage' ? 'Enter percentage' : 'Enter fixed price') : 
                'Enter price'
              }
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {formData.category === 'Cars' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Seating Capacity</label>
                <div className="flex gap-2">
                  {['2 Seater', '4 Seater', '7 Seater'].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, seatingCapacity: cap }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.seatingCapacity === cap 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Used'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, condition: cond, usedDuration: cond === 'New' ? '' : prev.usedDuration }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.condition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.condition === 'Used' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Used Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1-30 Days', '1-12 Months', '1-5 Years'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, usedDuration: dur }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.usedDuration === dur 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.category === 'Properties' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['House', 'Farm House', 'Corporate office', 'Apartment', 'Plot', 'Mension', 'Villa', 'Room For Rent'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.propertyType === type 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Property Name / Ownership</label>
                <div className="flex gap-2">
                  {['Society', 'Company', 'Co-operative society'].map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyName: name }))}
                      className={`flex-1 p-2 text-xs rounded-lg border transition-all ${
                        formData.propertyName === name 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Offer Type</label>
                <div className="flex gap-2">
                  {['Sell', 'Rent'].map(offer => (
                    <button
                      key={offer}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, offerType: offer }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.offerType === offer 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {offer}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Old'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyCondition: cond, propertyAge: cond === 'New' ? '' : prev.propertyAge }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.propertyCondition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.propertyCondition === 'Old' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Property Age</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['0-6 Months', '6-12 Months', '1-2 Years', '2-5 Years', '5-10 Years', '10-15 Years'].map(age => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, propertyAge: age }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.propertyAge === age 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">BHK</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                  {Array.from({ length: 20 }, (_, i) => `${i + 1}BHK`).map(bhk => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bhk: bhk }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.bhk === bhk 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.category === 'Mobiles' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Brand Name</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Samsung', 'vivo', 'Apple', 'Xiaomi', 'OPPO', 'Realme', 'OnePlus', 'Google', 'Other'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, brand }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.brand === brand 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Old'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mobileCondition: cond, mobileUsedDuration: cond === 'New' ? '' : prev.mobileUsedDuration }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.mobileCondition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.mobileCondition === 'Old' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Used Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1-30 Days', '1-12 Months', '1-3 Years'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mobileUsedDuration: dur }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.mobileUsedDuration === dur 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Quantity Unit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {formData.category === 'Jobs' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Google, Microsoft"
                  value={formData.companyName}
                  onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Work Location / Address</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sector 5, Gurgaon"
                  value={formData.jobAddress}
                  onChange={e => setFormData(prev => ({ ...prev, jobAddress: e.target.value }))}
                  className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Required Qualification</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. B.Tech, MBA, 12th Pass"
                  value={formData.qualification}
                  onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                  className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Job Type</label>
                <div className="flex gap-2">
                  {['Part Time', 'Permanent'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jobType: type }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.jobType === type 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Benefits (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['PF', 'Equity', 'Medical', 'Cab', 'Accommodation', 'Mobile', 'Laptop', 'Perks'].map(benefit => (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          benefits: prev.benefits.includes(benefit)
                            ? prev.benefits.filter(b => b !== benefit)
                            : [...prev.benefits, benefit]
                        }));
                      }}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.benefits.includes(benefit)
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {benefit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.category === 'Bikes' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Brand Name</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Honda', 'Hero', 'TVS', 'Bajaj', 'Yamaha', 'Royal Enfield', 'Suzuki', 'KTM', 'Other'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bikeBrand: brand }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.bikeBrand === brand 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Old'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bikeCondition: cond, bikeUsedDuration: cond === 'New' ? '' : prev.bikeUsedDuration }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.bikeCondition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.bikeCondition === 'Old' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Used Duration</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['0-3 Months', '3-6 Months', '6-12 Months', '1-5 Years', '5-10 Years'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bikeUsedDuration: dur }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.bikeUsedDuration === dur 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.category === 'Electronics' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Brand Name (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['No Brand', 'Sony', 'Samsung', 'LG', 'Panasonic', 'Dell', 'HP', 'Apple', 'Other'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, electronicsBrand: brand }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.electronicsBrand === brand 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Old'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, electronicsCondition: cond, electronicsUsedDuration: cond === 'New' ? '' : prev.electronicsUsedDuration }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.electronicsCondition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.electronicsCondition === 'Old' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Used Duration</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['1-7 days', '1-3 weeks', '1-2 Months', '2-6 Months'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, electronicsUsedDuration: dur }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.electronicsUsedDuration === dur 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.category === 'Furniture' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Brand Name (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['No Brand', 'IKEA', 'Ashley', 'Herman Miller', 'Steelcase', 'Wayfair', 'Other'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, furnitureBrand: brand }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.furnitureBrand === brand 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Old'].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, furnitureCondition: cond, furnitureUsedDuration: cond === 'New' ? '' : prev.furnitureUsedDuration }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.furnitureCondition === cond 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {formData.furnitureCondition === 'Old' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Used Duration</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['0-3 days', '3-6 days', '6-15 days', '15-30 days', '1-3 Months'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, furnitureUsedDuration: dur }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.furnitureUsedDuration === dur 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.category === 'Fashion' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Women", "Men", "Girls", "Boys", "Baby's", "Personal Care"].map(gender => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fashionGender: gender, fashionSubcategory: '' }))}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.fashionGender === gender 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {formData.fashionGender && formData.fashionGender !== 'Personal Care' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-blue-900">Subcategory</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(formData.fashionGender === "Baby's" 
                      ? ["Clothing", "Accessories", "Personal Care"]
                      : ["Clothing", "Accessories", "Cosmetic", "GYM", "Sports", "Other"]
                    ).map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, fashionSubcategory: sub }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.fashionSubcategory === sub 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.fashionGender === 'Personal Care' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-blue-900">Type</label>
                    <div className="flex gap-2">
                      {['Organic', 'Mix Cosmetic'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, personalCareType: type }))}
                          className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                            formData.personalCareType === type 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isKitProduct"
                      checked={formData.isKitProduct}
                      onChange={(e) => setFormData(prev => ({ ...prev, isKitProduct: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isKitProduct" className="text-sm font-bold text-blue-900">Kit product for Personal care</label>
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.category === 'Services' && (
            <div className="space-y-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Service Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cleaners Pro, Tech Solutions"
                  value={formData.serviceCompanyName}
                  onChange={e => setFormData(prev => ({ ...prev, serviceCompanyName: e.target.value }))}
                  className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Pricing Model</label>
                <div className="flex gap-2">
                  {['Fixed', 'Percentage'].map(model => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pricingModel: model }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.pricingModel === model 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Service Type</label>
                <div className="flex gap-2">
                  {['Physical', 'Online'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, serviceType: type }))}
                      className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                        formData.serviceType === type 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Photos (Optional)</label>
            <div className="flex flex-wrap gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label 
                  htmlFor="image-upload"
                  className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-400 cursor-pointer transition-all"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      
                      const newImages: string[] = [];
                      let processedCount = 0;
                      
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          newImages.push(reader.result as string);
                          processedCount++;
                          if (processedCount === files.length) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images, ...newImages].slice(0, 5)
                            }));
                            // Reset input value to allow selecting same file again
                            e.target.value = '';
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Upload up to 5 photos of your product.</p>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Post Now
          </button>
        </form>
      </div>
    </div>
  );
}
