/**
 * Admin API Routes — Role-based dashboards
 *
 * Roles:
 *   - superadmin: Full system control (you)
 *   - csc_admin: CSC owner — manage their operators
 *   - operator: VLE — own data only
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../../models/database');
const { learningEngine } = require('../../core/learningEngine');
const { conversationMemory } = require('../../core/conversationMemory');

// Role check middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Role required: ${roles.join(' or ')}` });
    }
    next();
  };
}

// All admin routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════
//  SUPERADMIN — Full system control
// ═══════════════════════════════════════════════════════════
router.get('/control/overview', requireRole('superadmin', 'csc_admin'), async (req, res) => {
  try {
    const [userCount, jobCount, candidateCount, completedJobs, failedJobs] = await Promise.all([
      prisma?.user?.count() ?? 0,
      prisma?.job?.count() ?? 0,
      prisma?.candidate?.count() ?? 0,
      prisma?.job?.count({ where: { status: 'completed' } }) ?? 0,
      prisma?.job?.count({ where: { status: 'failed' } }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    const learning = learningEngine.getStats();
    const conversations = conversationMemory.getStats();

    res.json({
      success: true,
      data: {
        users: { total: userCount },
        jobs: { total: jobCount, completed: completedJobs, failed: failedJobs },
        candidates: { total: candidateCount },
        learning,
        conversations,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// All users list (superadmin only)
router.get('/control/users', requireRole('superadmin'), async (req, res) => {
  try {
    const users = await prisma?.user?.findMany({
      select: { id: true, email: true, name: true, role: true, is_active: true, csc_id: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 100,
    }) || [];
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Skills list with usage stats
router.get('/control/skills', requireRole('superadmin', 'csc_admin'), (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    const registry = masterAgent?.registry;
    if (!registry) return res.json({ success: false, error: 'Skill registry not ready' });

    const skills = registry.getAllSkills().map(s => {
      const insights = learningEngine.getSkillInsights(s.name);
      return {
        name: s.name,
        displayName: s.displayName,
        category: s.category,
        version: s.version,
        intents: s.intents.length,
        keywords: (s.keywords.hi?.length || 0) + (s.keywords.en?.length || 0) + (s.keywords.hinglish?.length || 0),
        usageCount: s.usageCount,
        successRate: insights.successRate,
        learnedKeywords: insights.learnedKeywords.length,
        canRunOffline: s.canRunOffline,
      };
    });

    res.json({ success: true, data: skills });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// System health
router.get('/control/health', requireRole('superadmin'), (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const masterAgent = req.app.get('masterAgent');
    const upgrader = req.app.get('nightlyUpgrader');
    const networkMonitor = req.app.get('networkMonitor');

    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
        skillsLoaded: masterAgent?.registry?.skills?.size || 0,
        nightlyUpgrade: upgrader?.getSchedule() || null,
        network: networkMonitor?.getStatus() || null,
        node: process.version,
        platform: process.platform,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  CSC ADMIN — CSC owner dashboard
// ═══════════════════════════════════════════════════════════
router.get('/csc/overview', requireRole('csc_admin', 'superadmin'), async (req, res) => {
  try {
    const cscId = req.user.csc_id || req.user.cscId;
    const filter = cscId ? { csc_id: cscId } : {};

    const [operators, totalJobs, completedJobs, candidates] = await Promise.all([
      prisma?.user?.count({ where: { ...filter, role: 'operator' } }) ?? 0,
      prisma?.job?.count({ where: filter }) ?? 0,
      prisma?.job?.count({ where: { ...filter, status: 'completed' } }) ?? 0,
      prisma?.candidate?.count({ where: filter }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    res.json({
      success: true,
      data: {
        cscId,
        operators,
        jobs: { total: totalJobs, completed: completedJobs },
        candidates,
        revenue: completedJobs * 50, // Placeholder ₹50 per completed job
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Operators list (CSC admin sees their own, superadmin sees all)
router.get('/csc/operators', requireRole('csc_admin', 'superadmin'), async (req, res) => {
  try {
    const cscId = req.user.csc_id || req.user.cscId;
    const where = req.user.role === 'superadmin' ? {} : { csc_id: cscId };

    const operators = await prisma?.user?.findMany({
      where: { ...where, role: { in: ['operator', 'csc_admin'] } },
      select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
    }) || [];

    res.json({ success: true, data: operators });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  VLE / OPERATOR — Personal dashboard
// ═══════════════════════════════════════════════════════════
router.get('/vle/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const [myJobs, myCompleted, myCandidates] = await Promise.all([
      prisma?.job?.count({ where: { user_id: userId } }) ?? 0,
      prisma?.job?.count({ where: { user_id: userId, status: 'completed' } }) ?? 0,
      prisma?.candidate?.count({ where: { user_id: userId } }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    // Get user's own conversation history
    const myConvos = conversationMemory.getUserSkills(userId);

    res.json({
      success: true,
      data: {
        userId,
        name: req.user.name,
        jobs: { total: myJobs, completed: myCompleted },
        candidates: myCandidates,
        skillsUsed: myConvos.length,
        recentSkills: myConvos.slice(0, 5),
        earnings: myCompleted * 30, // Placeholder ₹30 per completed job
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
