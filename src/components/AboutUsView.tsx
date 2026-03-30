import { ShoppingBag, Target, Eye, Award } from 'lucide-react';

export default function AboutUsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          About Us – <span className="text-blue-600">The Market Hub</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Welcome to The Market Hub, a modern and trusted marketplace designed to simplify buying and selling for everyone.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-6">
          <p>
            The Market Hub was founded with a clear vision — to create a platform where people can easily connect, trade, and grow without unnecessary complications. Whether you're looking to sell products or find great deals, The Market Hub provides a seamless and secure experience.
          </p>
          <p>
            Our platform bridges the gap between buyers and sellers by offering a user-friendly interface, fast listing process, and a growing community of trusted users. From everyday items to valuable deals, The Market Hub is built to make transactions simple, transparent, and efficient.
          </p>
          <p>
            At The Market Hub, we believe that trust and convenience are the foundation of any successful marketplace. That’s why we continuously work on improving safety features, reducing fraud, and ensuring that every user has a smooth experience.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="bg-blue-50 p-8 rounded-2xl space-y-4 border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To empower individuals and businesses by providing a reliable platform for easy buying and selling.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl space-y-4 border border-gray-200">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become one of the most trusted and widely used marketplace platforms in India and globally.
            </p>
          </div>
        </div>

        {/* Founder Section */}
        <div className="pt-12 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <Award className="w-12 h-12" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <p className="text-gray-600 italic leading-relaxed">
                The Market Hub is proudly founded by <span className="font-bold text-gray-900">Sachin Kamat (Founder & CEO)</span>, who aims to revolutionize the online marketplace industry with innovation, trust, and simplicity.
              </p>
              <p className="text-blue-600 font-bold">Join us and be a part of the future of digital commerce.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="text-center pt-8">
        <div className="h-px bg-gray-200 w-24 mx-auto mb-8"></div>
        <p className="text-2xl font-bold text-gray-900">
          The Market Hub – <span className="text-blue-600">Buy Smart. Sell Easy.</span>
        </p>
      </div>
    </div>
  );
}
