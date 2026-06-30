import React from 'react';
import SEO from '../../components/SEO';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <SEO 
        title="Terms & Conditions - Harshita AI" 
        description="Terms and Conditions of use for Harshita AI."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-indigo">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms & Conditions</h1>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using Harshita AI, you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h3>2. Description of Service</h3>
        <p>Harshita AI provides users with access to a rich collection of AI tools, including but not limited to AI chat, document generation, coding agents, and automation tools.</p>

        <h3>3. User Conduct</h3>
        <p>You agree not to use the service for any illegal purposes or for the transmission of material that is unlawful, harassing, libelous, invasive of another's privacy, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable.</p>

        <h3>4. Modifications to Service</h3>
        <p>Harshita AI reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
      </div>
    </div>
  );
}
