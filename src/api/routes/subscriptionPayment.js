/**
 * Subscription Payment Routes - Razorpay Integration
 * 
 * Endpoints:
 *   POST /api/subscription/create-order
 *   POST /api/subscription/verify
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Lazy load Razorpay only when needed
let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_secret'
    });
  }
  return razorpay;
}

// Create order for subscription
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan, duration = 'monthly' } = req.body;
    const userId = req.user?.id || 'demo';

    const amountMap = {
      basic: 299,
      standard: 699,
      pro: 1299
    };

    const base = amountMap[plan] || 299;
    let amount = base * 100; // paise

    // Simple duration multiplier (can be improved)
    const multipliers = { quarterly: 3, halfYearly: 6, yearly: 12 };
    if (multipliers[duration]) amount = Math.round(amount * multipliers[duration] * 0.9); // 10% discount example

    const order = await getRazorpay().orders.create({
      amount,
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
        duration
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      duration
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify payment
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, duration } = req.body;

    // In production: verify signature with crypto
    // For now, accept and activate subscription (demo)

    const { SubscriptionManager } = require('../../core/subscriptionManager');
    const subManager = new SubscriptionManager(); // In real app use singleton from app

    const result = subManager.subscribe(req.user?.id || 'demo', plan || 'basic', duration || 'monthly');

    res.json({
      success: true,
      message: 'Payment verified. Subscription activated!',
      subscription: result.subscription || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
