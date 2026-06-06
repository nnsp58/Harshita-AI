/**
 * Subscription API Routes
 *
 * Endpoints:
 *   GET  /api/subscription/plans     — List all visible plans
 *   GET  /api/subscription/me        — Current user's subscription
 *   POST /api/subscription/start-trial — Start free trial
 *   POST /api/subscription/checkout  — Create Razorpay order (when enabled)
 *   POST /api/subscription/verify    — Verify payment & activate
 *   POST /api/subscription/admin/activate — Admin: manual activate (no payment)
 *   GET  /api/subscription/usage     — Get user's daily usage
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { PLANS, DURATION_OPTIONS, calculatePrice, getVisiblePlans } = require('../../core/subscriptionConfig');
const { prisma } = require('../../models/database');

// In-memory subscription store (replace with DB in production)
const subscriptions = new Map(); // userId → subscription
const dailyUsage = new Map();    // userId:YYYY-MM-DD → count

// ═══════════════════════════════════════════════════════════
//  PUBLIC: List all visible plans
// ═══════════════════════════════════════════════════════════
router.get('/plans', (req, res) => {
  try {
    const plans = getVisiblePlans().map(p => ({
      ...p,
      // Don't expose internal limits structure to public unless needed
      pricesByDuration: DURATION_OPTIONS.map(d => ({
        ...d,
        finalPrice: calculatePrice(p, d.id),
      })),
    }));
    res.json({
      success: true,
      data: {
        plans,
        durations: DURATION_OPTIONS,
        paymentEnabled: !!process.env.RAZORPAY_KEY_ID,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  Get current user's subscription
// ═══════════════════════════════════════════════════════════
router.get('/me', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const sub = subscriptions.get(userId);

    if (!sub) {
      return res.json({
        success: true,
        data: { active: false, plan: null, daysLeft: 0, usage: getDailyUsage(userId) }
      });
    }

    const now = new Date();
    const endDate = new Date(sub.endDate);
    const isExpired = now > endDate;
    const daysLeft = isExpired ? 0 : Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        active: !isExpired && sub.isActive,
        plan: PLANS[sub.planId],
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysLeft,
        isExpired,
        usage: getDailyUsage(userId),
        subscription: sub,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  Start Free Trial
// ═══════════════════════════════════════════════════════════
router.post('/start-trial', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const existing = subscriptions.get(userId);

    if (existing && existing.planId === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Trial already used',
        message: 'आप पहले ही फ्री ट्रायल का उपयोग कर चुके हैं।'
      });
    }

    const plan = PLANS.free;
    const startDate = new Date();
    const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

    const subscription = {
      userId,
      planId: 'free',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true,
      isTrial: true,
      autoRenew: false,
      paymentId: null,
      activatedBy: 'self',
    };

    subscriptions.set(userId, subscription);

    res.json({
      success: true,
      message: '🎉 Free trial activated! 7 days for full access.',
      messageHi: '🎉 फ्री ट्रायल चालू हो गया! 7 दिन का पूर्ण एक्सेस।',
      data: { subscription, plan }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
