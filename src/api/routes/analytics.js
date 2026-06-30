const express = require('express');
const router = express.Router();
const { prisma } = require('../../models/database');

// GET /api/analytics - Get comprehensive real-time dashboard stats
router.get('/', async (req, res) => {
  try {
    // 1. User Metrics
    const totalUsers = await prisma.user.count();
    const registeredUsers = await prisma.user.count({ where: { role: 'operator' } });
    const superAdmins = await prisma.user.count({ where: { role: 'superadmin' } });
    const googleLoginUsers = await prisma.user.count({
      where: {
        email: { endsWith: '@gmail.com' }
      }
    });

    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Unique active users from skill runs in intervals
    const dauResult = await prisma.skillUsage.groupBy({
      by: ['user_id'],
      where: { request_time: { gte: past24h } }
    });
    const dau = Math.max(1, dauResult.length); // Fallback to 1 for demo purposes if database is empty

    const wauResult = await prisma.skillUsage.groupBy({
      by: ['user_id'],
      where: { request_time: { gte: past7d } }
    });
    const wau = Math.max(1, wauResult.length);

    const mauResult = await prisma.skillUsage.groupBy({
      by: ['user_id'],
      where: { request_time: { gte: past30d } }
    });
    const mau = Math.max(1, mauResult.length);

    // 2. Skill Metrics
    const skillRuns = await prisma.skillUsage.findMany({
      orderBy: { request_time: 'desc' }
    });

    const skillsMap = {};
    skillRuns.forEach(run => {
      const name = run.skill_name;
      if (!skillsMap[name]) {
        skillsMap[name] = {
          name,
          runs: 0,
          users: new Set(),
          success: 0,
          failed: 0,
          lastUsed: run.request_time
        };
      }
      skillsMap[name].runs += 1;
      skillsMap[name].users.add(run.user_id);
      if (run.success) {
        skillsMap[name].success += 1;
      } else {
        skillsMap[name].failed += 1;
      }
      if (new Date(run.request_time) > new Date(skillsMap[name].lastUsed)) {
        skillsMap[name].lastUsed = run.request_time;
      }
    });

    const skillMetrics = Object.values(skillsMap).map(s => ({
      name: s.name,
      runs: s.runs,
      users: s.users.size,
      success: s.success,
      failed: s.failed,
      lastUsed: s.lastUsed
    }));

    // 3. Agent Metrics
    const agentsMap = {
      'Legal Agent': { totalRequests: 0, successCount: 0, totalTime: 0 },
      'Video Agent': { totalRequests: 0, successCount: 0, totalTime: 0 },
      'SEO Agent': { totalRequests: 0, successCount: 0, totalTime: 0 },
      'Website Builder Agent': { totalRequests: 0, successCount: 0, totalTime: 0 },
      'Research Agent': { totalRequests: 0, successCount: 0, totalTime: 0 }
    };

    skillRuns.forEach(run => {
      const agent = run.agent_name || 'Research Agent';
      if (agentsMap[agent]) {
        agentsMap[agent].totalRequests += 1;
        if (run.success) agentsMap[agent].successCount += 1;
        agentsMap[agent].totalTime += run.response_time;
      }
    });

    const agentMetrics = Object.entries(agentsMap).map(([name, data]) => {
      const successRate = data.totalRequests > 0 
        ? Math.round((data.successCount / data.totalRequests) * 100) 
        : 100;
      const avgResponseTime = data.totalRequests > 0 
        ? Math.round(data.totalTime / data.totalRequests) 
        : 0;
      return {
        name,
        totalRequests: data.totalRequests,
        successRate,
        avgResponseTime
      };
    });

    // 4. Document Metrics (Affidavits, Notices, Agreements, PDFs, DOCX downloads)
    const affidavits = skillMetrics.find(s => s.name.includes('affidavit'))?.runs || 0;
    const notices = skillMetrics.find(s => s.name.includes('notice'))?.runs || 0;
    const agreements = skillMetrics.find(s => s.name.includes('agreement') || s.name.includes('rent') || s.name.includes('deed'))?.runs || 0;
    
    // Custom events tracked in skill usage
    const pdfsDownloaded = skillRuns.filter(r => r.skill_name === 'pdf_export').length;
    const docxDownloaded = skillRuns.filter(r => r.skill_name === 'docx_export').length;

    // 5. Live Activity Feed (last 20 logs)
    const liveActivity = skillRuns.slice(0, 20).map(run => {
      let message = `Ran skill ${run.skill_name}`;
      if (run.skill_name.includes('notice')) message = `Generated Legal Notice`;
      else if (run.skill_name.includes('affidavit')) message = `Generated Affidavit`;
      else if (run.skill_name.includes('agreement') || run.skill_name.includes('rent')) message = `Created Rent Agreement`;
      else if (run.skill_name.includes('deed')) message = `Created Deed`;
      else if (run.skill_name.includes('seo')) message = `Used SEO Agent`;
      else if (run.skill_name.includes('video')) message = `Used Video Agent`;
      else if (run.skill_name.includes('pdf')) message = `Downloaded PDF`;
      else if (run.skill_name.includes('docx')) message = `Downloaded DOCX`;
      
      return {
        id: run.id,
        user: `User-${run.user_id.substring(0, 5)}`,
        message,
        timestamp: run.request_time
      };
    });

    // 6. Charts (daily usage in past 7 days)
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const count = skillRuns.filter(r => {
        const time = new Date(r.request_time);
        return time >= startOfDay && time <= endOfDay;
      }).length;

      dailyUsage.push({
        date: startOfDay.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        runs: count
      });
    }

    res.json({
      userMetrics: {
        totalUsers,
        registeredUsers,
        googleLoginUsers,
        superAdmins,
        dau,
        wau,
        mau
      },
      skillMetrics,
      agentMetrics,
      documentMetrics: {
        affidavits,
        notices,
        agreements,
        pdfsDownloaded,
        docxDownloaded
      },
      liveActivity,
      dailyUsage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/track - Track custom events (e.g. PDF/DOCX downloads)
router.post('/track', express.json(), async (req, res) => {
  try {
    const { event, userId } = req.body;
    if (event) {
      await prisma.skillUsage.create({
        data: {
          user_id: userId || 'anonymous',
          skill_name: event,
          agent_name: event.includes('pdf') || event.includes('docx') ? 'Legal Agent' : 'Research Agent',
          request_time: new Date(),
          response_time: 0,
          success: true
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/system - Get status of all AI providers (HASA)
router.get('/system', (req, res) => {
  try {
    const { aiProviderManager } = require('../../utils/aiProviderManager');
    const providers = aiProviderManager.getAvailableProviders();
    const costs = {};
    for (const [key, value] of aiProviderManager.providerCosts.entries()) {
      costs[key] = value;
    }
    res.json({
      providers,
      costs,
      activeProvider: aiProviderManager.defaultProvider
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/system/backup - Trigger manual DB backup
router.post('/system/backup', async (req, res) => {
  try {
    const { systemMonitor } = require('../../utils/SystemMonitor');
    const success = await systemMonitor.performBackup();
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/system/route - Override active default provider
router.post('/system/route', express.json(), (req, res) => {
  try {
    const { provider } = req.body;
    const { aiProviderManager } = require('../../utils/aiProviderManager');
    if (aiProviderManager.providers.has(provider)) {
      aiProviderManager.defaultProvider = provider;
      res.json({ success: true, activeProvider: provider });
    } else {
      res.status(400).json({ error: 'Provider not found or unavailable' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
