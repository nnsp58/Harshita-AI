const { prisma } = require('../models/database');

class BillingEngine {
  constructor() {
    this.plans = {
      free: { price: 0, name: 'Free' },
      premium: { price: 49, name: 'Premium' },
      professional: { price: 199, name: 'Professional' }
    };
  }

  /**
   * Mock Razorpay Order Creation
   */
  async createOrder(userId, planType) {
    const plan = this.plans[planType];
    if (!plan) throw new Error("Invalid plan type");

    // In production, this would call razorpay.orders.create
    const orderId = `order_${Math.random().toString(36).substring(7)}_${Date.now()}`;
    
    return {
      orderId,
      amount: plan.price * 100, // in paise
      currency: 'INR',
      plan: planType
    };
  }

  /**
   * Mock Razorpay Payment Verification
   */
  async verifyAndActivate(userId, orderId, paymentId, planType) {
    const plan = this.plans[planType];
    if (!plan) throw new Error("Invalid plan type");

    // In production, verify crypto signature using RAZORPAY_KEY_SECRET

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Deactivate old subscriptions
    await prisma.subscription.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false }
    });

    // Create new subscription
    const sub = await prisma.subscription.create({
      data: {
        user_id: userId,
        plan_type: planType,
        start_date: startDate,
        end_date: endDate,
        is_active: true
      }
    });

    // Log transaction
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        subscription_id: sub.id,
        payment_id: paymentId,
        order_id: orderId,
        amount: plan.price,
        status: 'success'
      }
    });

    // Create invoice
    await prisma.invoice.create({
      data: {
        transaction_id: tx.id,
        user_id: userId,
        invoice_number: `INV-${Date.now()}`,
        amount: plan.price
      }
    });

    // Update User plan cache
    await prisma.user.update({
      where: { id: userId },
      data: { 
        preferences: { 
          plan: planType,
          expires_at: endDate.toISOString()
        }
      }
    });

    return sub;
  }

  /**
   * Middleware to check Premium Access
   */
  async checkPremiumAccess(req, res, next) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const activeSub = await prisma.subscription.findFirst({
        where: {
          user_id: userId,
          is_active: true,
          end_date: { gt: new Date() }
        }
      });

      if (!activeSub || activeSub.plan_type === 'free') {
        return res.status(403).json({ 
          error: "Upgrade Required", 
          code: "UPGRADE_REQUIRED",
          message: "This feature requires a Premium or Professional plan."
        });
      }

      // Valid premium/pro user
      req.subscription = activeSub;
      next();
    } catch (e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const billingEngine = new BillingEngine();
module.exports = { billingEngine, BillingEngine };
