import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, ShieldCheck, ShoppingBag, UserPlus, CreditCard, AlertTriangle, Edit3, Trash2, TrendingUp, Ban, UserMinus, Mail } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | string[];
  icon: any;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "What is The Market Hub?",
    answer: "The Market Hub is an online marketplace where users can buy and sell products easily. It connects buyers and sellers directly without any middleman.",
    icon: ShoppingBag
  },
  {
    question: "How do I create an account?",
    answer: "You can sign up using your email or phone number and verify it through OTP. Once registered, you can start buying or selling immediately.",
    icon: UserPlus
  },
  {
    question: "Is it free to use The Market Hub?",
    answer: "Yes, basic usage like browsing and posting listings is free. However, some premium features (like promoted listings) may have charges.",
    icon: CreditCard
  },
  {
    question: "How can I sell an item on The Market Hub?",
    answer: [
      "Create an account",
      "Click on “Post Ad”",
      "Upload product images",
      "Add title, price, and description",
      "Publish your listing"
    ],
    icon: Edit3
  },
  {
    question: "How do I contact a seller?",
    answer: "You can directly chat with the seller through the platform or use the contact details provided in the listing.",
    icon: MessageCircle
  },
  {
    question: "Does The Market Hub handle payments?",
    answer: "The Market Hub only connects buyers and sellers. Payments are handled directly between users unless otherwise specified.",
    icon: CreditCard
  },
  {
    question: "Is The Market Hub responsible for product quality?",
    answer: "No. The Market Hub does not own or verify products. Buyers should check product details carefully before purchasing.",
    icon: AlertTriangle
  },
  {
    question: "How can I stay safe while using The Market Hub?",
    answer: [
      "Avoid advance payments to unknown sellers",
      "Meet in a safe public place",
      "Verify product before buying",
      "Do not share OTP or personal banking details"
    ],
    icon: ShieldCheck
  },
  {
    question: "What should I do if I face fraud or suspicious activity?",
    answer: "Immediately report the user through the “Report” option or contact our support team with details and screenshots.",
    icon: ShieldCheck
  },
  {
    question: "Can I edit or delete my listing?",
    answer: "Yes, you can update or delete your listings anytime from your account dashboard.",
    icon: Trash2
  },
  {
    question: "Why was my listing removed?",
    answer: "Listings may be removed if they violate our Terms & Conditions, contain false information, or include prohibited items.",
    icon: Ban
  },
  {
    question: "How can I boost my listing?",
    answer: "You can use our premium promotion features to increase visibility and reach more buyers.",
    icon: TrendingUp
  },
  {
    question: "Can I sell any product on The Market Hub?",
    answer: "No. You cannot sell illegal, stolen, or restricted items. Please follow our listing guidelines.",
    icon: Ban
  },
  {
    question: "How do I delete my account?",
    answer: "You can request account deletion from your profile settings or contact support for assistance.",
    icon: UserMinus
  },
  {
    question: "How can I contact The Market Hub support?",
    answer: [
      "Email: sachinkamatxyz@gmail.com",
      "Support section in app/website"
    ],
    icon: Mail
  }
];

export default function FAQView() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = FAQ_DATA.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(faq.answer) ? faq.answer.join(' ') : faq.answer).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Frequently Asked Questions – <span className="text-blue-600">The Market Hub</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about buying and selling on The Market Hub.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const Icon = faq.icon;
            return (
              <div 
                key={index} 
                className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-gray-200 shadow-sm hover:border-blue-200'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-bold text-lg ${isOpen ? 'text-blue-600' : 'text-gray-900'}`}>{faq.question}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0 border-t border-gray-50 mt-2">
                    <div className="text-gray-600 leading-relaxed pt-4">
                      {Array.isArray(faq.answer) ? (
                        <ul className="space-y-2">
                          {faq.answer.map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{faq.answer}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No questions found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer Tagline */}
      <div className="text-center pt-8">
        <div className="h-px bg-gray-200 w-24 mx-auto mb-8"></div>
        <p className="text-2xl font-bold text-gray-900">
          The Market Hub – <span className="text-blue-600">Your Trusted Platform for Smart Buying & Easy Selling</span>
        </p>
      </div>
    </div>
  );
}
