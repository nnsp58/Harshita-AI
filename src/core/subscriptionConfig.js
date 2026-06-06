/**
 * SubscriptionConfig — Centralized plan configuration
 * Yahan se plans modify karo, baaki sab automatically update ho jayega
 *
 * Production deployment ke liye:
 *   1. Razorpay/Stripe credentials add karo .env mein
 *   2. enabled: false → enabled: true (paid plans activate)
 *   3. Plans visible in /subscription page
 */

const PLANS = {
  // ────────── FREE TRIAL ──────────
  free: {
    id: 'free',
    name: 'Free Trial',
    nameHi: 'फ्री ट्रायल',
    icon: '🎁',
    price: 0,
    duration: 7, // days
    durationLabel: '7 Days',
    durationLabelHi: '7 दिन',
    features: [
      'सभी 21 AI Skills',
      'TA-DA Naksha (5 prints/day)',
      'Form Fill (10 forms/day)',
      'Job Search',
      'Resume Builder',
      'WhatsApp Bot (limited)',
      'Email support',
    ],
    limits: {
      maxTasksPerDay: 20,
      maxNakshaPerDay: 5,
      maxFormsPerDay: 10,
      maxBulkImport: 0,
      whatsappAccess: 'limited',
      prioritySupport: false,
      apiAccess: false,
    },
    allowedSkills: '*', // All
    isTrial: true,
    enabled: true, // Always enabled
    color: 'from-gray-500 to-gray-700',
    badge: null,
  },

  // ────────── BASIC ──────────
  basic: {
    id: 'basic',
    name: 'Basic',
    nameHi: 'बेसिक',
    icon: '⚡',
    price: 299,
    duration: 30,
    durationLabel: 'Monthly',
    durationLabelHi: 'मासिक',
    features: [
      'Document OCR & Form Fill',
      '50 forms/day',
      '10 TA-DA Naksha/day',
      'Basic chat support',
      'Mobile app access',
    ],
    limits: {
      maxTasksPerDay: 50,
      maxNakshaPerDay: 10,
      maxFormsPerDay: 50,
      maxBulkImport: 100,
      whatsappAccess: false,
      prioritySupport: false,
      apiAccess: false,
    },
    allowedSkills: ['document_ocr', 'form_fill', 'tada_process', 'job_search', 'general_chat', 'notepad'],
    isTrial: false,
    enabled: false, // Set to true when payment gateway is configured
    color: 'from-blue-500 to-blue-700',
    badge: null,
  },

  // ────────── STANDARD (Most Popular) ──────────
  standard: {
    id: 'standard',
    name: 'Standard',
    nameHi: 'स्टैंडर्ड',
    icon: '⭐',
    price: 699,
    duration: 30,
    durationLabel: 'Monthly',
    durationLabelHi: 'मासिक',
    features: [
      'सभी Basic features',
      'Land Record + Ration Card',
      'CSC/eDistrict Login',
      'WhatsApp Bot Access',
      'Bulk Import (500 candidates)',
      'Priority email support',
      'Custom branding',
    ],
    limits: {
      maxTasksPerDay: 200,
      maxNakshaPerDay: 30,
      maxFormsPerDay: 200,
      maxBulkImport: 500,
      whatsappAccess: true,
      prioritySupport: true,
      apiAccess: false,
    },
    allowedSkills: ['document_ocr', 'form_fill', 'tada_process', 'job_search', 'general_chat',
      'notepad', 'land_record', 'ration_card', 'whatsapp', 'bulk_import',
      'eligibility_check', 'file_processor', 'result_generator'],
    isTrial: false,
    enabled: false,
    color: 'from-amber-500 to-orange-600',
    badge: 'Most Popular',
    popular: true,
  },

  // ────────── PRO ──────────
  pro: {
    id: 'pro',
    name: 'Pro',
    nameHi: 'प्रो',
    icon: '👑',
    price: 1299,
    duration: 30,
    durationLabel: 'Monthly',
    durationLabelHi: 'मासिक',
    features: [
      'सभी Standard features',
      'Legal Drafts + Ticket Booking',
      'Project Reports',
      'Unlimited tasks',
      '24/7 priority support',
      'API access',
      'Custom integrations',
      'Multi-operator support',
    ],
    limits: {
      maxTasksPerDay: -1, // unlimited
      maxNakshaPerDay: -1,
      maxFormsPerDay: -1,
      maxBulkImport: -1,
      whatsappAccess: true,
      prioritySupport: true,
      apiAccess: true,
    },
    allowedSkills: '*', // All 21 skills
    isTrial: false,
    enabled: false,
    color: 'from-purple-500 to-pink-600',
    badge: 'Premium',
  },

  // ────────── ENTERPRISE (custom) ──────────
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameHi: 'एंटरप्राइज',
    icon: '🏢',
    price: 0, // Contact for pricing
    duration: 30,
    durationLabel: 'Custom',
    durationLabelHi: 'कस्टम',
    features: [
      'सभी Pro features',
      'Dedicated server',
      'Custom AI training',
      'White-label solution',
      'Multiple CSC centers',
      'On-premise deployment option',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limits: {
      maxTasksPerDay: -1,
      maxNakshaPerDay: -1,
      maxFormsPerDay: -1,
      maxBulkImport: -1,
      whatsappAccess: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true,
    },
    allowedSkills: '*',
    isTrial: false,
    enabled: false,
    contactSales: true,
    color: 'from-indigo-600 to-violet-800',
    badge: 'Custom',
  },
}

// Duration discounts
const DURATION_OPTIONS = [
  { id: 'monthly', months: 1, discount: 0, label: '1 Month', labelHi: '1 महीना' },
  { id: 'quarterly', months: 3, discount: 0.10, label: '3 Months', labelHi: '3 महीने', save: '10%' },
  { id: 'halfYearly', months: 6, discount: 0.20, label: '6 Months', labelHi: '6 महीने', save: '20%' },
  { id: 'yearly', months: 12, discount: 0.30, label: '1 Year', labelHi: '1 साल', save: '30%' },
  { id: 'twoYearly', months: 24, discount: 0.40, label: '2 Years', labelHi: '2 साल', save: '40%' },
]

// Calculate final price after discount
function calculatePrice(plan, durationId = 'monthly') {
  const duration = DURATION_OPTIONS.find(d => d.id === durationId)
  if (!duration || plan.price === 0) return plan.price * (duration?.months || 1)
  const total = plan.price * duration.months
  const discounted = total * (1 - duration.discount)
  return Math.round(discounted)
}

// Get publicly visible plans (only enabled ones)
function getVisiblePlans() {
  return Object.values(PLANS).filter(p => p.enabled || p.isTrial || p.contactSales)
}

module.exports = { PLANS, DURATION_OPTIONS, calculatePrice, getVisiblePlans }
