/**
 * Harshita AI — Comprehensive Agent & Skill Test Suite
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPORT_PATH = path.join(process.cwd(), 'AGENT_TEST_REPORT.md');
const results = [];
const bugs = [];
const fixes = [];

function pass(name, details) {
  results.push({ name, status: 'PASS', details });
  console.log('  \u2705 PASS: ' + name + ' \u2014 ' + details);
}
function fail(name, details, bugDesc) {
  results.push({ name, status: 'FAIL', details });
  bugs.push({ name, bugDesc: bugDesc || details });
  console.log('  \u274c FAIL: ' + name + ' \u2014 ' + details);
}
function warn(name, details) {
  results.push({ name, status: 'WARN', details });
  console.log('  \u26a0\ufe0f WARN: ' + name + ' \u2014 ' + details);
}
function fixApplied(desc) {
  fixes.push(desc);
  console.log('  \ud83d\udd27 FIX: ' + desc);
}

function httpGet(url) {
  return new Promise((resolve) => {
    http.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 200) }));
    }).on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

const cp = require('child_process');

(async () => {
  let serverProcess = null;
  console.log('\n=== PRE-FLIGHT CHECK: Server Status ===');
  const healthRes = await httpGet('http://localhost:3001/api/health');
  if (healthRes.status === 0) {
    console.log('Server not running. Booting server.js programmatically...');
    serverProcess = cp.fork(path.join(process.cwd(), 'server.js'), [], { stdio: 'ignore' });
    
    console.log('Waiting for server to initialize...');
    let attempts = 0;
    while (attempts < 15) {
      await new Promise(r => setTimeout(r, 1000));
      const check = await httpGet('http://localhost:3001/api/health');
      if (check.status === 200) {
        console.log('Server is up and ready!');
        break;
      }
      attempts++;
    }
  } else {
    console.log('Server is already running.');
  }

  // ─────────────────────────────────────────
  // TEST 1: Environment Variables
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 1: Environment Variables ===');
  const requiredEnvVars = [
    'GEMINI_API_KEY', 'GROQ_API_KEY', 'HUGGINGFACE_TOKEN',
    'GITHUB_TOKEN', 'JWT_SECRET', 'PORT'
  ];
  for (const key of requiredEnvVars) {
    if (process.env[key]) {
      pass('ENV:' + key, 'Set (' + process.env[key].substring(0, 8) + '...)');
    } else {
      fail('ENV:' + key, 'Missing from .env');
    }
  }

  // ─────────────────────────────────────────
  // TEST 2: AI Provider Manager
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 2: AI Provider Manager ===');
  let aiProviderManager;
  try {
    const mod = require('./src/utils/aiProviderManager');
    aiProviderManager = mod.aiProviderManager;
    const providers = aiProviderManager.getAvailableProviders();
    pass('AIProviderManager:Load', providers.length + ' providers: ' + providers.map(p => p.name).join(', '));

    if (typeof aiProviderManager.generateResponse === 'function') {
      pass('AIProviderManager:generateResponse', 'Method exists');
    } else {
      fail('AIProviderManager:generateResponse', 'Method missing', 'generateResponse() not defined');
    }

    if (aiProviderManager.huggingFaceToken) {
      pass('AIProviderManager:HuggingFace', 'Token loaded');
    } else {
      fail('AIProviderManager:HuggingFace', 'Token missing', 'HUGGINGFACE_TOKEN not loaded into aiProviderManager');
    }
  } catch (e) {
    fail('AIProviderManager:Load', e.message);
  }

  // ─────────────────────────────────────────
  // TEST 3: Agent File Import Path Check + Auto-Fix
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 3: Agent Import Paths (Auto-Fix) ===');
  const agentFiles = [
    'ApplicationAgent', 'DeployAgent', 'DocumentOcrAgent',
    'FormFillAgent', 'GeneralChatAgent', 'LegalAgent', 'MathAgent',
    'NotepadAgent', 'PDFAgent', 'PhotoMakerAgent', 'ResumeAgent',
    'StoryVideoAgent', 'TadaAgent', 'TranslationAgent', 'VoiceAgent'
  ];
  const agentDir = path.join(process.cwd(), 'src', 'agents');

  for (const agent of agentFiles) {
    const filePath = path.join(agentDir, agent + '.js');
    if (!fs.existsSync(filePath)) {
      fail('Agent:' + agent + ':FileExists', 'File not found');
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("require('../../utils/") || content.includes('require("../../utils/')) {
      fail('Agent:' + agent + ':ImportPath', "Wrong path '../../utils/' — should be '../utils/'");
      const fixed = content
        .replace(/require\('\.\.\/\.\.\/utils\//g, "require('../utils/")
        .replace(/require\("\.\.\/\.\.\/utils\//g, 'require("../utils/');
      fs.writeFileSync(filePath, fixed);
      fixApplied('Fixed import path in ' + agent + '.js: ../../utils/ -> ../utils/');
    } else if (content.includes("require('../utils/") || content.includes('require("../utils/') ||
               content.includes("require('../../src/utils/")) {
      pass('Agent:' + agent + ':ImportPath', 'Correct path');
    } else {
      warn('Agent:' + agent + ':ImportPath', 'No utils import (may be intentional)');
    }
  }

  // ─────────────────────────────────────────
  // TEST 4: Skills Registry
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 4: Skills Registry ===');
  try {
    const { SkillRegistry } = require('./src/skills/SkillRegistry');
    const registry = new SkillRegistry();
    await registry.autoLoad();
    const skills = registry.getAllSkills ? registry.getAllSkills() : [];
    pass('SkillRegistry:Load', skills.length + ' skills loaded');

    const expectedSkills = [
      'application_writer', 
      'legal_draft', 
      'legal_notice', 
      'general_chat', 
      'job_search', 
      'math_skill', 
      'language_translator', 
      'notepad', 
      'tada_process', 
      'resume_maker'
    ];
    for (const sid of expectedSkills) {
      const s = registry.getSkill(sid);
      if (s) {
        pass('Skill:' + sid, 'Found — ' + (s.displayName || s.name || sid));
      } else {
        warn('Skill:' + sid, 'Not found in registry');
      }
    }
  } catch (e) {
    fail('SkillRegistry:Load', e.message);
  }

  // ─────────────────────────────────────────
  // TEST 5: Core Engine Modules
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 5: Core Engine Modules ===');
  const coreModules = [
    { name: 'SelfHealingEngine', reqPath: './src/core/SelfHealingEngine', key: 'selfHealingEngine' },
    { name: 'MemoryEngine', reqPath: './src/core/MemoryEngine', key: 'memoryEngine' },
    { name: 'VerificationEngine', reqPath: './src/core/VerificationEngine', key: 'verificationEngine' },
    { name: 'LearningEngine', reqPath: './src/core/learningEngine', key: 'learningEngine' },
    { name: 'GitDeployManager', reqPath: './src/core/gitDeployManager', key: null },
  ];
  for (const mod of coreModules) {
    try {
      const loaded = require(mod.reqPath);
      const inst = mod.key ? loaded[mod.key] : loaded;
      if (inst) {
        pass('Core:' + mod.name, 'Loaded');
        if (mod.name === 'GitDeployManager' && loaded.githubToken) {
          pass('Core:GitDeployManager:GitHubToken', 'GitHub token loaded for authenticated push');
        } else if (mod.name === 'GitDeployManager') {
          fail('Core:GitDeployManager:GitHubToken', 'githubToken null', 'GITHUB_TOKEN not propagated to gitDeployManager');
        }
      } else {
        fail('Core:' + mod.name, 'Export is null/undefined');
      }
    } catch (e) {
      fail('Core:' + mod.name, e.message);
    }
  }

  // ─────────────────────────────────────────
  // TEST 6: Frontend Workspace Files
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 6: Frontend Workspace Files ===');
  const workspaces = [
    { p: 'frontend/src/workspaces/converter/PassportWorkspace.jsx', n: 'Passport Photo' },
    { p: 'frontend/src/workspaces/converter/QRWorkspace.jsx', n: 'QR Generator' },
    { p: 'frontend/src/workspaces/converter/PDFWorkspace.jsx', n: 'PDF Tools' },
    { p: 'frontend/src/workspaces/converter/TranslatorWorkspace.jsx', n: 'Translator' },
    { p: 'frontend/src/workspaces/converter/VoiceWorkspace.jsx', n: 'Voice Tools' },
    { p: 'frontend/src/workspaces/converter/AudioWorkspace.jsx', n: 'Audio Converter' },
    { p: 'frontend/src/workspaces/media/ImageWorkspace.jsx', n: 'Image Compressor' },
    { p: 'frontend/src/workspaces/legal/AffidavitWorkspace.jsx', n: 'Legal Affidavit' },
    { p: 'frontend/src/workspaces/legal/NoticeWorkspace.jsx', n: 'Legal Notice' },
    { p: 'frontend/src/workspaces/legal/GiftDeedWorkspace.jsx', n: 'Gift Deed' },
    { p: 'frontend/src/workspaces/tax/ITRWorkspace.jsx', n: 'ITR Filing' },
    { p: 'frontend/src/workspaces/tax/GSTWorkspace.jsx', n: 'GST' },
    { p: 'frontend/src/workspaces/tax/RefundWorkspace.jsx', n: 'Tax Refund' },
  ];
  for (const ws of workspaces) {
    const full = path.join(process.cwd(), ws.p);
    if (!fs.existsSync(full)) {
      fail('Workspace:' + ws.n, 'File not found');
      continue;
    }
    const size = fs.statSync(full).size;
    if (size < 500) {
      fail('Workspace:' + ws.n, 'Stub/placeholder only ' + size + ' bytes — not implemented');
    } else {
      pass('Workspace:' + ws.n, Math.round(size/1024) + 'KB');
    }
  }

  // ─────────────────────────────────────────
  // TEST 7: API Routes
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 7: API Routes ===');
  await new Promise(r => setTimeout(r, 1000));
  const PORT = process.env.PORT || 3001;
  const routes = [
    { url: 'http://localhost:' + PORT + '/api/health', name: 'Health Check' },
    { url: 'http://localhost:' + PORT + '/api/agents', name: 'Agents List' },
    { url: 'http://localhost:' + PORT + '/api/dashboard/stats', name: 'Dashboard Stats' },
    { url: 'http://localhost:' + PORT + '/api/jobs', name: 'Jobs API' },
  ];
  for (const route of routes) {
    const res = await httpGet(route.url);
    if (res.status === 200) {
      pass('API:' + route.name, 'HTTP 200 OK');
    } else if (res.status === 401) {
      warn('API:' + route.name, 'HTTP 401 Auth required (protected route — expected)');
    } else if (res.status === 0) {
      fail('API:' + route.name, 'Connection refused: ' + res.error);
    } else {
      fail('API:' + route.name, 'HTTP ' + res.status);
    }
  }

  // ─────────────────────────────────────────
  // TEST 8: ApplicationSkill Conversation Flow (P0 Test)
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 8: ApplicationSkill Conversation (P0) ===');
  try {
    const ApplicationSkill = require('./src/skills/ApplicationSkill');
    // ApplicationSkill exports a class — need to instantiate it
    const SkillClass = ApplicationSkill.ApplicationSkill || ApplicationSkill.default || ApplicationSkill;
    const skill = typeof SkillClass === 'function' ? new SkillClass() : SkillClass;
    
    if (skill && typeof skill.execute === 'function') {
      // ApplicationSkill.execute takes ONE arg: context = { message, userId, ... }
      const result = await skill.execute({
        message: 'Principal ko application likho',
        userId: 'qa-test',
        lang: 'hi',
        history: []
      });
      const text = (result && (result.message || result.output || '')).toLowerCase();
      const askedQ = text.includes('naam') || text.includes('name') || text.includes('school') ||
                     text.includes('class') || text.includes('?') || text.includes('kaun') ||
                     text.includes('vidyalaya') || text.includes('kisake') ||
                     (result && (result.type === 'question' || result.conversationState === 'collecting'));
      if (askedQ) {
        pass('ApplicationSkill:ConversationFlow', 'CORRECT — Asks clarifying questions before drafting');
      } else {
        fail('ApplicationSkill:ConversationFlow', 'INCORRECT — Drafts immediately without collecting missing info (P0 Bug QA-001)');
      }
    } else {
      fail('ApplicationSkill:Load', 'execute() method missing on instance');
    }
  } catch (e) {
    fail('ApplicationSkill:Load', e.message);
  }

  // ─────────────────────────────────────────
  // TEST 9: Database
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 9: Database ===');
  try {
    const { prisma } = require('./src/models/database');
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
      pass('Database:Connection', 'SQLite connected via Prisma');
      try {
        const count = await prisma.user.count();
        pass('Database:Users', count + ' users in database');
      } catch (e) {
        warn('Database:Users', 'Count failed: ' + e.message);
      }
    } else {
      fail('Database:Connection', 'Prisma client is null');
    }
  } catch (e) {
    fail('Database:Connection', e.message);
  }

  // ─────────────────────────────────────────
  // TEST 10: Skill Files Integrity
  // ─────────────────────────────────────────
  console.log('\n=== TEST GROUP 10: Skill File Integrity ===');
  const skillsDir = path.join(process.cwd(), 'src', 'skills');
  // Exclude: SkillRegistry, IntentDetector, helpers, schema, base class, and non-skill engines
  const skipFiles = new Set([
    'SkillRegistry.js', 'IntentDetector.js', 'SkillSchema.js',
    'AISkillHelper.js', 'BaseSkill.js',
    'DocumentIntelligenceEngine.js' // helper engine, not a skill
  ]);
  const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.js') && !skipFiles.has(f));
  for (const sf of skillFiles) {
    const full = path.join(skillsDir, sf);
    const content = fs.readFileSync(full, 'utf8');
    const size = fs.statSync(full).size;
    if (size < 150) {
      fail('Skill:' + sf, 'Stub file (' + size + ' bytes) — not implemented');
    } else if (!content.includes('execute(') && !content.includes('execute =')) {
      fail('Skill:' + sf, 'No execute() method found');
    } else {
      pass('Skill:' + sf, Math.round(size/1024) + 'KB, has execute()');
    }
  }

  // ─────────────────────────────────────────
  // GENERATE REPORT
  // ─────────────────────────────────────────
  console.log('\n\n=== Generating Report ===\n');
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const health = Math.round((passed / total) * 100);

  let md = '# HARSHITA AI — COMPLETE AGENT & TOOL TEST REPORT\n\n';
  md += '> Generated: ' + new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' }) + ' IST\n\n';
  md += '## 1. Executive Summary\n\n';
  md += '| Metric | Value |\n|---|---|\n';
  md += '| **Total Tests** | ' + total + ' |\n';
  md += '| Passed | **' + passed + '** |\n';
  md += '| Failed | **' + failed + '** |\n';
  md += '| Warnings | **' + warned + '** |\n';
  md += '| **System Health Score** | **' + health + '/100** |\n';
  md += '| **Auto-Fixes Applied** | **' + fixes.length + '** |\n\n';
  md += '---\n\n';
  md += '## 2. Full Test Results\n\n';
  md += '| Test | Status | Details |\n|---|---|---|\n';
  for (const r of results) {
    const icon = r.status === 'PASS' ? '\u2705' : r.status === 'WARN' ? '\u26a0\ufe0f' : '\u274c';
    md += '| ' + r.name + ' | ' + icon + ' ' + r.status + ' | ' + r.details.replace(/\|/g, '/') + ' |\n';
  }
  md += '\n---\n\n';
  md += '## 3. Bugs Found (' + bugs.length + ')\n\n';
  if (bugs.length === 0) {
    md += 'No bugs found.\n\n';
  } else {
    bugs.forEach((b, i) => {
      md += '### Bug ' + (i+1) + ': ' + b.name + '\n' + b.bugDesc + '\n\n';
    });
  }
  md += '---\n\n';
  md += '## 4. Auto-Fixes Applied (' + fixes.length + ')\n\n';
  if (fixes.length === 0) {
    md += 'No automatic fixes were applied.\n\n';
  } else {
    fixes.forEach(f => { md += '- ' + f + '\n'; });
  }
  md += '\n---\n*Generated by Harshita AI Test Suite*\n';

  fs.writeFileSync(REPORT_PATH, md);
  console.log('\nReport: ' + REPORT_PATH);
  console.log('Score: ' + health + '/100 | Passed: ' + passed + ' | Failed: ' + failed + ' | Fixes: ' + fixes.length);

  if (serverProcess) {
    console.log('\nShutting down programmatic server.js instance...');
    serverProcess.kill('SIGTERM');
  }
})().catch(err => {
  console.error('Test Suite Error:', err);
  if (typeof serverProcess !== 'undefined' && serverProcess) serverProcess.kill('SIGTERM');
  process.exit(1);
});
