/**
 * SubscriptionManager - Controls user access to agents based on plan
 * 
 * Plans:
 *   BASIC    - 2 agent groups (document + browser)
 *   STANDARD - 5 agent groups (+ land, ration, cscLogin)
 *   PRO      - All 10 agents (+ ticket, legal)
 * 
 * Duration discounts:
 *   Monthly     = base price
 *   Quarterly   = -10%
 *   Half-Yearly = -20%
 *   Yearly      = -30%
 *   24 Months   = -40%
 *   48 Months   = -50%
 */

const PLANS = {
   free: {
     name: 'FREE TRIAL',
     basePrice: 0,
     allowedAgents: [
       'document', 'validator', 'notifier', 'fileProcessor', 'browser',
       'land', 'ration', 'ticket', 'cscLogin', 'legal', 'jobsearch'
     ],
     maxTasksPerDay: 20,
     prioritySupport: false,
     description: '7 Days Free Trial - All Agents (including Job Search)',
     isTrial: true,
     trialDays: 7
   },
  basic: {
    name: 'BASIC',
    basePrice: 299,
    allowedAgents: ['document', 'validator', 'notifier', 'fileProcessor', 'browser'],
    maxTasksPerDay: 10,
    prioritySupport: false,
    description: '2 agent groups - Document & Form Fill'
  },
  standard: {
    name: 'STANDARD',
    basePrice: 699,
    allowedAgents: [
      'document', 'validator', 'notifier', 'fileProcessor', 'browser',
      'land', 'ration', 'cscLogin'
    ],
    maxTasksPerDay: 50,
    prioritySupport: true,
    description: '5 agent groups - Land, Ration, CSC Login + Basic'
  },
   pro: {
     name: 'PRO',
     basePrice: 1299,
     allowedAgents: [
       'document', 'validator', 'notifier', 'fileProcessor', 'browser',
       'land', 'ration', 'ticket', 'cscLogin', 'legal', 'jobsearch'
     ],
     maxTasksPerDay: -1, // unlimited
     prioritySupport: true,
     description: 'All 11 agents - Unlimited tasks'
   }
};

const DURATION_DISCOUNTS = {
  monthly:    { months: 1,  discount: 0,    label: '1 Month' },
  quarterly:  { months: 3,  discount: 0.10, label: '3 Months (-10%)' },
  halfYearly: { months: 6,  discount: 0.20, label: '6 Months (-20%)' },
  yearly:     { months: 12, discount: 0.30, label: '1 Year (-30%)' },
  twoYearly:  { months: 24, discount: 0.40, label: '2 Years (-40%)' },
  fourYearly: { months: 48, discount: 0.50, label: '4 Years (-50%)' }
};

// Agent name -> readable name mapping
const AGENT_DISPLAY_NAMES = {
  land: 'Land Record Agent',
  ration: 'Ration Card Agent',
  ticket: 'Ticket Booking Agent',
  cscLogin: 'CSC/eDistrict Login Agent',
  document: 'Document AI Agent',
  legal: 'Legal Draft Agent',
  jobsearch: 'Job Search Agent',
  browser: 'Form Fill Agent',
  validator: 'Validation Agent',
  notifier: 'Notification Agent',
  fileProcessor: 'File Processing Agent'
};

class SubscriptionManager {
  constructor() {
    // In-memory user subscriptions (replace with DB in production)
    this.userSubscriptions = new Map();
    this.dailyUsage = new Map(); // userId -> { date, count }
  }

  /**
   * Register a user with a subscription plan
   */
  subscribe(userId, planKey, durationKey = 'monthly') {
    const plan = PLANS[planKey];
    if (!plan) {
      return { success: false, message: `Invalid plan: ${planKey}. Available: free, basic, standard, pro` };
    }

    // Handle FREE trial separately
    if (planKey === 'free') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan.trialDays || 7));

      const subscription = {
        userId,
        plan: planKey,
        planName: plan.name,
        duration: 'trial',
        durationLabel: `${plan.trialDays || 7} Days Free Trial`,
        allowedAgents: [...plan.allowedAgents],
        maxTasksPerDay: plan.maxTasksPerDay,
        prioritySupport: plan.prioritySupport,
        totalPrice: 0,
        startDate,
        endDate,
        isActive: true,
        isTrial: true,
        createdAt: new Date()
      };

      this.userSubscriptions.set(userId, subscription);

      return {
        success: true,
        message: `🎉 FREE Trial activated! You have ${plan.trialDays || 7} days to try all features.\nAll agents are unlocked for ${plan.maxTasksPerDay} tasks/day.\n\nUse 'subscribe <plan>' anytime to upgrade to a paid plan.`,
        subscription
      };
    }

    // Paid plans require duration
    const duration = DURATION_DISCOUNTS[durationKey];
    if (!duration) {
      return { success: false, message: `Invalid duration: ${durationKey}` };
    }

    const totalPrice = plan.basePrice * duration.months * (1 - duration.discount);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration.months);

    const subscription = {
      userId,
      plan: planKey,
      planName: plan.name,
      duration: durationKey,
      durationLabel: duration.label,
      allowedAgents: [...plan.allowedAgents],
      maxTasksPerDay: plan.maxTasksPerDay,
      prioritySupport: plan.prioritySupport,
      totalPrice: Math.round(totalPrice),
      startDate,
      endDate,
      isActive: true,
      createdAt: new Date()
    };

    this.userSubscriptions.set(userId, subscription);

    return {
      success: true,
      message: `Subscribed to ${plan.name} plan (${duration.label})`,
      subscription
    };
  }

  /**
   * Check if user has access to a specific agent
   */
  checkAccess(userId, requiredAgent) {
    const subscription = this.userSubscriptions.get(userId);

    // No subscription
    if (!subscription) {
      return {
        allowed: false,
        reason: 'no_subscription',
        message: this._buildUpgradeMessage(requiredAgent, 'no_subscription')
      };
    }

    // Subscription expired
    if (new Date() > subscription.endDate) {
      subscription.isActive = false;
      return {
        allowed: false,
        reason: 'expired',
        message: this._buildUpgradeMessage(requiredAgent, 'expired')
      };
    }

    // Agent not in plan
    if (!subscription.allowedAgents.includes(requiredAgent)) {
      return {
        allowed: false,
        reason: 'agent_not_available',
        message: this._buildUpgradeMessage(requiredAgent, 'agent_not_available', subscription.planName)
      };
    }

    // Daily limit check
    if (subscription.maxTasksPerDay > 0) {
      const usage = this._getDailyUsage(userId);
      if (usage >= subscription.maxTasksPerDay) {
        return {
          allowed: false,
          reason: 'daily_limit',
          message: `Daily task limit reached (${subscription.maxTasksPerDay}/${subscription.maxTasksPerDay}). Try again tomorrow or upgrade your plan.`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Increment daily usage counter
   */
  recordUsage(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    const current = this.dailyUsage.get(key) || 0;
    this.dailyUsage.set(key, current + 1);
  }

  /**
   * Get daily usage count
   */
  _getDailyUsage(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    return this.dailyUsage.get(key) || 0;
  }

  /**
   * Build upgrade warning message
   */
  _buildUpgradeMessage(requiredAgent, reason, currentPlan = null) {
    const agentName = AGENT_DISPLAY_NAMES[requiredAgent] || requiredAgent;

    let msg = '';

    if (reason === 'no_subscription') {
      msg = `\n--- ACCESS DENIED ---\n`;
      msg += `Ye service use karne ke liye subscription chahiye.\n`;
      msg += `Required: ${agentName}\n\n`;
      msg += `Available Plans:\n`;
      msg += `  FREE TRIAL - FREE for 7 days - All Agents\n`;
      msg += `  BASIC     - Rs.${PLANS.basic.basePrice}/month  - ${PLANS.basic.description}\n`;
      msg += `  STANDARD  - Rs.${PLANS.standard.basePrice}/month - ${PLANS.standard.description}\n`;
      msg += `  PRO       - Rs.${PLANS.pro.basePrice}/month - ${PLANS.pro.description}\n\n`;
      msg += `Type 'subscribe free' for 7-day free trial!\n`;
      msg += `Or 'subscribe <plan>' to activate any plan.\n`;
      msg += `---\n`;
    } else if (reason === 'expired') {
      msg = `\n--- SUBSCRIPTION EXPIRED ---\n`;
      msg += `Aapki subscription expire ho gayi hai.\n`;
      msg += `Renew kare to continue using ${agentName}.\n`;
      msg += `Type 'renew' to renew your plan.\n`;
      msg += `---\n`;
    } else if (reason === 'agent_not_available') {
      msg = `\n--- UPGRADE REQUIRED ---\n`;
      msg += `Ye service aapke current plan (${currentPlan}) me available nahi hai.\n`;
      msg += `Required: ${agentName}\n\n`;

      // Find the minimum plan that includes this agent
      const requiredPlan = this._findMinimumPlan(requiredAgent);
      if (requiredPlan) {
        msg += `Minimum Required Plan: ${requiredPlan.name} (Rs.${requiredPlan.basePrice}/month)\n\n`;
      }

      msg += `Duration Options:\n`;
      for (const [key, dur] of Object.entries(DURATION_DISCOUNTS)) {
        msg += `  ${dur.label}\n`;
      }
      msg += `\nType 'upgrade <plan>' to upgrade.\n`;
      msg += `---\n`;
    }

    return msg;
  }

  /**
   * Find minimum plan that includes the required agent
   */
  _findMinimumPlan(requiredAgent) {
    for (const plan of [PLANS.basic, PLANS.standard, PLANS.pro]) {
      if (plan.allowedAgents.includes(requiredAgent)) {
        return plan;
      }
    }
    return null;
  }

  /**
   * Get user subscription info
   */
  getSubscription(userId) {
    return this.userSubscriptions.get(userId) || null;
  }

  /**
   * Get plan details for display
   */
  getPlansInfo() {
    let info = '\n=== SUBSCRIPTION PLANS ===\n\n';

    for (const [key, plan] of Object.entries(PLANS)) {
      info += `[${plan.name}] - Rs.${plan.basePrice}/month\n`;
      info += `  ${plan.description}\n`;
      info += `  Tasks/day: ${plan.maxTasksPerDay === -1 ? 'Unlimited' : plan.maxTasksPerDay}\n`;
      info += `  Agents: ${plan.allowedAgents.map(a => AGENT_DISPLAY_NAMES[a] || a).join(', ')}\n\n`;
    }

    info += 'Duration Discounts:\n';
    for (const [key, dur] of Object.entries(DURATION_DISCOUNTS)) {
      info += `  ${dur.label}\n`;
    }

    info += '\n===\n';
    return info;
  }

  /**
   * Get user status summary
   */
  getUserStatus(userId) {
    const sub = this.userSubscriptions.get(userId);
    if (!sub) {
      return 'No active subscription. Type "plan" to see available plans.';
    }

    const daysLeft = Math.ceil((sub.endDate - new Date()) / (1000 * 60 * 60 * 24));
    const usage = this._getDailyUsage(userId);
    const limit = sub.maxTasksPerDay === -1 ? 'Unlimited' : sub.maxTasksPerDay;

    let status = `\n=== YOUR SUBSCRIPTION ===\n`;
    status += `Plan: ${sub.planName}\n`;
    status += `Duration: ${sub.durationLabel}\n`;
    status += `Status: ${sub.isActive && daysLeft > 0 ? 'ACTIVE' : 'EXPIRED'}\n`;
    status += `Days Remaining: ${Math.max(0, daysLeft)}\n`;
    status += `Tasks Today: ${usage}/${limit}\n`;
    status += `Priority Support: ${sub.prioritySupport ? 'Yes' : 'No'}\n`;
    status += `===\n`;

    return status;
  }
}

module.exports = { SubscriptionManager, PLANS, DURATION_DISCOUNTS, AGENT_DISPLAY_NAMES };
