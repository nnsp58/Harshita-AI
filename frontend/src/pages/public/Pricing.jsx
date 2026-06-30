import React from 'react';
import SEO from '../../components/SEO';
import { Check, X } from 'lucide-react';
import { useStore } from '../../store';

export default function Pricing() {
  const { user } = useStore();
  const handleUpgrade = (plan) => {
    alert(`Mock Razorpay Checkout for ${plan} initiated.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <SEO 
        title="Pricing & Plans - Harshita AI" 
        description="Choose the right AI plan for your needs. Affordable pricing for rural India."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            India's most powerful AI platform, priced for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900">Free</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₹0<span className="text-xl text-gray-500 font-medium">/month</span>
            </div>
            <p className="mt-4 text-gray-500">Perfect for exploring basic AI capabilities.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Limited AI Chat</li>
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Basic Legal Documents</li>
              <li className="flex items-center text-gray-400"><X className="mr-3" size={20}/> A4 Document Workspace</li>
              <li className="flex items-center text-gray-400"><X className="mr-3" size={20}/> WhatsApp Super Agent</li>
            </ul>
            <button className="mt-8 w-full block py-3 px-4 bg-indigo-50 text-indigo-700 font-bold text-center rounded-xl hover:bg-indigo-100 transition">
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 transform md:-translate-y-4 border-4 border-indigo-200 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white">Premium</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
              ₹49<span className="text-xl text-indigo-200 font-medium">/month</span>
            </div>
            <p className="mt-4 text-indigo-100">Unlock the full power of Harshita AI.</p>
            <ul className="mt-8 space-y-4 text-indigo-50">
              <li className="flex items-center"><Check className="text-yellow-400 mr-3" size={20}/> Unlimited AI Chat</li>
              <li className="flex items-center"><Check className="text-yellow-400 mr-3" size={20}/> Unlimited Legal Documents</li>
              <li className="flex items-center"><Check className="text-yellow-400 mr-3" size={20}/> A4 Document Workspace</li>
              <li className="flex items-center"><Check className="text-yellow-400 mr-3" size={20}/> WhatsApp Integration</li>
              <li className="flex items-center"><Check className="text-yellow-400 mr-3" size={20}/> Voice Commands</li>
            </ul>
            <button onClick={() => handleUpgrade('premium')} className="mt-8 w-full block py-3 px-4 bg-white text-indigo-600 font-bold text-center rounded-xl hover:bg-gray-50 transition shadow-md">
              Upgrade to Premium
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₹199<span className="text-xl text-gray-500 font-medium">/month</span>
            </div>
            <p className="mt-4 text-gray-500">For agencies, businesses, and super users.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Everything in Premium</li>
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Coding Agent</li>
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Website Builder</li>
              <li className="flex items-center"><Check className="text-green-500 mr-3" size={20}/> Business CRM AI</li>
            </ul>
            <button onClick={() => handleUpgrade('professional')} className="mt-8 w-full block py-3 px-4 bg-gray-900 text-white font-bold text-center rounded-xl hover:bg-gray-800 transition">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
