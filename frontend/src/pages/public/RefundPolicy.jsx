import React from 'react';
import SEO from '../../components/SEO';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <SEO 
        title="Refund Policy - Harshita AI" 
        description="Digital Subscription Refund and Cancellation Policy for Harshita AI."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-indigo">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Refund & Cancellation Policy</h1>
        
        <h3>Digital Subscription Policy</h3>
        <p>
          Subscription fees for Harshita AI are generally <strong>non-refundable</strong> because we provide instant access to digital services, computing power, and AI models.
        </p>

        <h3>Exceptions for Refunds</h3>
        <p>Refunds may be considered only in exceptional cases such as:</p>
        <ul>
          <li>Duplicate payment processing errors.</li>
          <li>Payment deducted but subscription not activated.</li>
          <li>Verified technical issues on our end preventing access, determined after support review.</li>
        </ul>

        <h3>Cancellation Policy</h3>
        <p>
          Users may cancel their subscription anytime from the Billing Dashboard. Cancellation stops future auto-renewals. Premium access will remain active until the end of your current billing cycle.
        </p>

        <h3>Requesting a Refund</h3>
        <p>
          Refund requests must be submitted through the Contact Support page within 7 days of the transaction.
        </p>
      </div>
    </div>
  );
}
