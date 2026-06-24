// src/api/controllers/selfHealingController.js - Platform Diagnostic & Self-Healing Controller

const fs = require('fs');
const path = require('path');
const { prisma } = require('../../models/database');

const runSystemAudit = async () => {
  const issues = [];
  const autoFixesApplied = [];
  const pendingActions = [];

  let systemHealth = 100;
  let skillsHealth = 100;
  let userHealth = 100;
  let seoHealth = 100;
  let deploymentHealth = 100;

  // 1. SYSTEM HEALTH AUDIT
  try {
    if (prisma) {
      await prisma.user.count();
    } else {
      throw new Error("Prisma client not initialized");
    }
  } catch (err) {
    systemHealth -= 50;
    issues.push({
      issue: 'SQLite Database Connection Failure',
      severity: 'critical',
      moduleName: 'Technical',
      rootCause: err.message,
      suggestedFix: 'Check DATABASE_URL configuration in .env and restart server.',
      autoFixAvailable: false,
      status: 'failed_repair'
    });
  }

  // Memory usage check
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  if (heapUsedMB > 1200) {
    systemHealth -= 20;
    issues.push({
      issue: 'High Memory Usage Warning',
      severity: 'warning',
      moduleName: 'Technical',
      rootCause: `Heap usage is currently ${heapUsedMB}MB.`,
      suggestedFix: 'Run garbage collection or inspect memory leak in video generator scripts.',
      autoFixAvailable: false,
      status: 'detected'
    });
  }

  // Temp folder permission check
  try {
    const uploadPath = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    fs.accessSync(uploadPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    systemHealth -= 30;
    issues.push({
      issue: 'Upload Directory Write Access Denied',
      severity: 'critical',
      moduleName: 'Technical',
      rootCause: err.message,
      suggestedFix: 'Grant write/read permissions to uploads folder.',
      autoFixAvailable: false,
      status: 'detected'
    });
  }

  // 2. SKILLS HEALTH AUDIT
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!groqKey) {
    skillsHealth -= 40;
    issues.push({
      issue: 'Missing GROQ API Key',
      severity: 'warning',
      moduleName: 'Skills',
      rootCause: 'GROQ_API_KEY is not defined in .env.',
      suggestedFix: 'Register at groq.com, obtain API key, and set in settings.',
      autoFixAvailable: false,
      status: 'detected'
    });
  }
  
  if (!geminiKey) {
    skillsHealth -= 50;
    issues.push({
      issue: 'Missing GEMINI API Key',
      severity: 'critical',
      moduleName: 'Skills',
      rootCause: 'GEMINI_API_KEY is not defined in .env.',
      suggestedFix: 'Set GEMINI_API_KEY to enable video script generating capabilities.',
      autoFixAvailable: false,
      status: 'detected'
    });
  }

  // 3. USER HEALTH AUDIT
  try {
    if (prisma) {
      const activeUsersCount = await prisma.user.count({ where: { is_active: true } });
      if (activeUsersCount === 0) {
        userHealth -= 30;
        issues.push({
          issue: 'No Active Users Found',
          severity: 'warning',
          moduleName: 'User Experience',
          rootCause: 'Database holds zero active operators.',
          suggestedFix: 'Register or seed a default user profile.',
          autoFixAvailable: false,
          status: 'detected'
        });
      }
    }
  } catch (e) {
    userHealth = 50;
  }

  // 4. SEO HEALTH AUDIT & AUTO-FIXES
  const frontendPublicPath = path.join(__dirname, '../../../frontend/public');
  const rootPublicPath = path.join(__dirname, '../../../public');

  const checkAndFixSeoFile = (filename, defaultContent, description) => {
    let exists = false;
    let targetPath = '';

    // Check frontend/public or public
    if (fs.existsSync(frontendPublicPath)) {
      targetPath = path.join(frontendPublicPath, filename);
      exists = fs.existsSync(targetPath);
    } else if (fs.existsSync(rootPublicPath)) {
      targetPath = path.join(rootPublicPath, filename);
      exists = fs.existsSync(targetPath);
    }

    if (!exists && targetPath) {
      try {
        fs.writeFileSync(targetPath, defaultContent, 'utf8');
        autoFixesApplied.push({
          issue: `Missing ${filename} SEO file`,
          severity: 'warning',
          moduleName: 'SEO',
          rootCause: `${filename} was missing from the public folder.`,
          fixApplied: `Automatically generated standard ${filename} in public directory.`,
          status: 'fixed'
        });
      } catch (err) {
        seoHealth -= 20;
        issues.push({
          issue: `Missing ${filename} SEO file`,
          severity: 'warning',
          moduleName: 'SEO',
          rootCause: err.message,
          suggestedFix: `Manually place a ${filename} in public.`,
          autoFixAvailable: true,
          status: 'failed_repair'
        });
      }
    }
  };

  // Run SEO Checks
  checkAndFixSeoFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: https://n-dizi.in/sitemap.xml`, 'Robots crawl permissions');
  checkAndFixSeoFile('ads.txt', `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`, 'AdSense advertising identification');
  checkAndFixSeoFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://n-dizi.in/</loc>\n    <priority>1.0</priority>\n  </url>\n</urlset>`, 'Search engine indexing paths');

  // 5. DEPLOYMENT HEALTH AUDIT
  if (process.env.NODE_ENV !== 'production') {
    deploymentHealth -= 10;
    issues.push({
      issue: 'Environment Running in Development Mode',
      severity: 'recommendation',
      moduleName: 'Deployment',
      rootCause: 'NODE_ENV is set to development.',
      suggestedFix: 'Update NODE_ENV=production in production staging environments.',
      autoFixAvailable: false,
      status: 'detected'
    });
  }

  // Calculate global average health score
  systemHealth = Math.max(0, systemHealth);
  skillsHealth = Math.max(0, skillsHealth);
  userHealth = Math.max(0, userHealth);
  seoHealth = Math.max(0, seoHealth);
  deploymentHealth = Math.max(0, deploymentHealth);
  const globalHealth = Math.round((systemHealth + skillsHealth + userHealth + seoHealth + deploymentHealth) / 5);

  // Categorize issues
  const criticalIssues = [];
  const warnings = [];
  const recommendations = [];

  // Combine fresh issues and write/persist to ImprovementRegistry
  const allIssues = [...issues, ...autoFixesApplied];
  for (const item of allIssues) {
    criticalIssues.push(item); // default sorting or severity segregation below
    try {
      if (prisma) {
        await prisma.improvementRegistry.create({
          data: {
            issue: item.issue,
            severity: item.severity || 'warning',
            moduleName: item.moduleName,
            rootCause: item.rootCause || 'N/A',
            suggestedFix: item.suggestedFix || 'N/A',
            autoFixAvailable: item.autoFixAvailable || false,
            fixApplied: item.fixApplied || 'None',
            status: item.status
          }
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Registry log failed:', dbErr.message);
    }
  }

  // Filter issues for client return
  const finalCritical = allIssues.filter(i => i.severity === 'critical' && i.status !== 'fixed');
  const finalWarnings = allIssues.filter(i => i.severity === 'warning' && i.status !== 'fixed');
  const finalRecs = allIssues.filter(i => i.severity === 'recommendation' && i.status !== 'fixed');
  const finalPending = allIssues.filter(i => i.status !== 'fixed');

  return {
    healthScores: {
      system: systemHealth,
      skills: skillsHealth,
      user: userHealth,
      seo: seoHealth,
      deployment: deploymentHealth,
      global: globalHealth
    },
    criticalIssues: finalCritical,
    warnings: finalWarnings,
    recommendations: finalRecs,
    autoFixesApplied: autoFixesApplied,
    pendingActions: finalPending
  };
};

const getAudit = async (req, res, next) => {
  try {
    const report = await runSystemAudit();
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAudit,
  runSystemAudit
};
