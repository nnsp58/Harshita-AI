const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { cognitiveTrainer } = require('./cognitiveTrainer');
const { prisma } = require('../models/database');

class SelfEvolutionAgent {
    constructor() {
        this.learningLogPath = path.join(process.cwd(), 'data', 'learning', 'interactions.json');
        this.failuresLogPath = path.join(process.cwd(), 'data', 'learning', 'failures.json');
        this.newAgentsPath = path.join(process.cwd(), 'src', 'agents', 'evolved');
        if (!fs.existsSync(this.newAgentsPath)) fs.mkdirSync(this.newAgentsPath, { recursive: true });
        this.projectRoot = process.cwd();
    }

    // Helper to execute commands
    runCmd(command, cwd = this.projectRoot) {
      return new Promise((resolve) => {
        exec(command, { cwd, timeout: 5000 }, (error, stdout, stderr) => {
          resolve({ success: !error, stdout: stdout.trim(), stderr: stderr.trim() });
        });
      });
    }

    /**
     * Startup scan: Runs checks, reports findings, and logs to registry
     */
    async scanProject() {
        console.log('🧬 [SelfHealing] Scanning project configurations and dependencies...');
        const issues = [];
        
        // 1. Database Connection check
        let dbConnected = false;
        try {
            if (prisma) {
                await prisma.$queryRaw`SELECT 1`;
                dbConnected = true;
            }
        } catch (e) {
            issues.push({
                issue: 'Database Connection Error',
                rootCause: e.message,
                fixApplied: 'Failed database check. Verify dev.db file accessibility.',
                status: 'pending_repair',
                moduleName: 'Database'
            });
        }

        // 2. Build folder check
        const buildDir = path.join(this.projectRoot, 'frontend', 'dist');
        const buildExists = fs.existsSync(buildDir);
        if (!buildExists) {
            issues.push({
                issue: 'Missing compiled frontend build directory (frontend/dist)',
                rootCause: 'Vite production build has not been run',
                fixApplied: 'Initiating auto-build or requesting npm run build',
                status: 'pending_repair',
                moduleName: 'Frontend Build'
            });
        }

        // 3. Environment check
        const envPath = path.join(this.projectRoot, '.env');
        if (!fs.existsSync(envPath)) {
            issues.push({
                issue: 'Missing .env configuration file',
                rootCause: 'No environmental settings configured',
                fixApplied: 'Requires administrator setup',
                status: 'pending_repair',
                moduleName: 'Environment'
            });
        }

        // 4. PWA manifest check
        const pwaPath = path.join(this.projectRoot, 'frontend', 'public', 'manifest.json');
        if (!fs.existsSync(pwaPath)) {
            issues.push({
                issue: 'Missing PWA manifest file (manifest.json)',
                rootCause: 'PWA settings have not been initialized',
                fixApplied: 'Create fallback manifest configuration',
                status: 'pending_repair',
                moduleName: 'PWA manifest'
            });
        }

        // 5. Audit Skills
        const skillsAudit = await this.checkSkills();
        for (const broken of skillsAudit.brokenList) {
            issues.push({
                issue: `Broken Skill File: ${broken.file}`,
                rootCause: broken.error,
                fixApplied: 'Skill file validation failure. Check syntax errors.',
                status: 'detected',
                moduleName: 'Skill Registry'
            });
        }
        for (const missing of skillsAudit.missingList) {
            issues.push({
                issue: `Missing Skill File for Intent: ${missing.intent}`,
                rootCause: 'IntentDetector override contains intent but no skill handles it',
                fixApplied: 'Block route mapping to prevent runtime error',
                status: 'detected',
                moduleName: 'Skill Registry'
            });
        }

        // 6. Audit Video Generator
        const videoAudit = await this.checkVideoGenerator();
        for (const err of videoAudit.errors) {
            issues.push({
                issue: `Story Video Generator Alert: ${err.title}`,
                rootCause: err.reason,
                fixApplied: 'Review system configuration parameters',
                status: 'detected',
                moduleName: 'Story Video'
            });
        }

        // Log issues to Database
        let fixedCount = 0;
        let pendingCount = 0;
        if (dbConnected && prisma) {
            for (const iss of issues) {
                try {
                    // Attempt automatic repair for common config issues
                    const repaired = await this.attemptAutomaticRepair(iss);
                    const finalStatus = repaired ? 'fixed' : iss.status;
                    
                    if (repaired) fixedCount++;
                    else pendingCount++;

                    await prisma.improvementRegistry.create({
                        data: {
                            issue: iss.issue,
                            rootCause: iss.rootCause,
                            fixApplied: repaired ? 'Auto-repair resolved issue.' : iss.fixApplied,
                            status: finalStatus,
                            moduleName: iss.moduleName
                        }
                    });
                } catch (e) {
                    console.error('[SelfHealing] DB Logging failed:', e.message);
                }
            }
        }

        const score = Math.max(10, 100 - (issues.length * 10) + (fixedCount * 5));
        
        console.log(`🧬 [SelfHealing] Project scan complete. Health Score: ${score}/100. Issues: ${issues.length} (${fixedCount} resolved).`);
        return {
            score,
            totalIssues: issues.length,
            fixed: fixedCount,
            pending: pendingCount,
            issues
        };
    }

    /**
     * Self-Repair rules for basic common config errors
     */
    async attemptAutomaticRepair(issue) {
        try {
            // Rule A: Missing PWA manifest fallback
            if (issue.issue === 'Missing PWA manifest file (manifest.json)') {
                const manifestDir = path.join(this.projectRoot, 'frontend', 'public');
                if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
                const fallbackManifest = {
                    name: "Harshita AI",
                    short_name: "HarshitaAI",
                    start_url: "/",
                    display: "standalone",
                    background_color: "#020617",
                    theme_color: "#f59e0b",
                    icons: []
                };
                fs.writeFileSync(path.join(manifestDir, 'manifest.json'), JSON.stringify(fallbackManifest, null, 2));
                return true;
            }

            // Rule B: Missing environmental stub
            if (issue.issue === 'Missing .env configuration file') {
                const envContent = `PORT=4000\nNODE_ENV=development\nDATABASE_URL="file:./dev.db"\n`;
                fs.writeFileSync(path.join(this.projectRoot, '.env'), envContent);
                return true;
            }

            // Rule C: Auto-run build if dist is missing
            if (issue.issue === 'Missing compiled frontend build directory (frontend/dist)') {
                console.log('[SelfHealing] Auto-repair: Triggering Vite build...');
                const buildRes = await this.runCmd('npm run build', path.join(this.projectRoot, 'frontend'));
                if (buildRes.success) {
                    return true;
                }
            }
        } catch (err) {
            console.error('[SelfHealing] Auto-repair failed:', err.message);
        }
        return false;
    }

    /**
     * Checks skills registration, active, development, hidden, broken status
     */
    async checkSkills() {
        const skillsDir = path.join(this.projectRoot, 'src', 'skills');
        const BaseSkill = require(path.join(skillsDir, 'BaseSkill.js')).BaseSkill;

        const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('Skill.js') && f !== 'BaseSkill.js');

        const activeList = [];
        const brokenList = [];
        const devList = [];
        const disabledList = [];
        const hiddenList = [];
        const missingList = [];

        // Identify files
        for (const file of files) {
            const filePath = path.join(skillsDir, file);
            try {
                const module = require(filePath);
                const SkillClass = Object.values(module).find(
                    v => typeof v === 'function' && v.prototype instanceof BaseSkill
                );
                
                if (!SkillClass) {
                    brokenList.push({ file, error: 'No exported BaseSkill class found' });
                    continue;
                }

                const instance = new SkillClass();
                
                // Classify by status
                if (instance.disabled) {
                    disabledList.push(instance);
                } else if (instance.inDevelopment || instance.in_development || instance.status === 'in_development') {
                    devList.push(instance);
                } else if (instance.category === 'security' || instance.name === 'security_guardrail' || instance.hidden) {
                    hiddenList.push(instance);
                } else {
                    activeList.push(instance);
                }
            } catch (err) {
                brokenList.push({ file, error: err.stack ? err.stack.split('\n')[0] : err.message });
            }
        }

        // Check missing skills based on IntentDetector.js mapped intents
        try {
            const { IntentDetector } = require('./IntentDetector');
            // Mock registry to avoid loading loop
            const mockRegistry = {
                findByIntent: () => null,
                getAllSkills: () => [...activeList, ...hiddenList, ...devList]
            };
            const detector = new IntentDetector(mockRegistry);
            
            // Hardcoded override list
            const overrides = ['affidavit', 'legal_notice', 'application_writer', 'create_passport_photo', 'illegal_activity'];
            
            // Hardcoded keyword intents list
            const mappedIntents = [
                'job_search', 'tada_process', 'document_ocr', 'form_fill', 'ration_card',
                'land_record', 'legal_draft', 'project_report', 'ticket_booking', 'eligibility_check',
                'notepad', 'resume_maker', 'general_chat', 'self_healing', 'whatsapp', 'bulk_import',
                'web_learning', 'ui_builder', 'network_monitor', 'validator', 'file_processor', 'result_generator'
            ];

            const allMappedIntents = [...new Set([...overrides, ...mappedIntents])];
            const allLoadedIntents = new Set(
                [...activeList, ...hiddenList, ...devList].flatMap(s => s.intents || [])
            );

            for (const intent of allMappedIntents) {
                if (!allLoadedIntents.has(intent)) {
                    missingList.push({ intent });
                }
            }
        } catch (e) {
            console.warn('[SelfHealing] Failed to check missing intents:', e.message);
        }

        return {
            totalRegistered: files.length + missingList.length,
            activeCount: activeList.length,
            brokenCount: brokenList.length,
            devCount: devList.length,
            disabledCount: disabledList.length,
            hiddenCount: hiddenList.length,
            missingCount: missingList.length,
            brokenList,
            missingList
        };
    }

    /**
     * Story Video Generator checks
     */
    async checkVideoGenerator() {
        const errors = [];
        
        // 1. Check FFmpeg binary
        try {
            const ffmpeg = require('ffmpeg-static');
            if (!ffmpeg || !fs.existsSync(ffmpeg)) {
                errors.push({ title: 'FFmpeg Access', reason: 'Static FFmpeg binary could not be resolved by package' });
            }
        } catch (e) {
            errors.push({ title: 'FFmpeg Module', reason: 'ffmpeg-static node module is not installed' });
        }

        // 2. Check settings keys (Gemini, OpenAI, ElevenLabs)
        if (prisma) {
            try {
                const keys = await prisma.systemSetting.findMany({
                    where: { key: { in: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'FAL_AI_API_KEY'] } }
                });
                const keyMap = {};
                for (const k of keys) keyMap[k.key] = k.value;

                if (!keyMap.GEMINI_API_KEY && !keyMap.OPENAI_API_KEY) {
                    errors.push({ title: 'AI API Keys', reason: 'Neither Gemini nor OpenAI API keys are configured (Story generation disabled)' });
                }
                if (!keyMap.ELEVENLABS_API_KEY) {
                    errors.push({ title: 'ElevenLabs Key', reason: 'ElevenLabs voice narration key is missing (fallback to free TTSMaker active)' });
                }
            } catch (e) {
                // Settings DB fail
            }
        }

        return {
            healthy: errors.length === 0,
            errors
        };
    }

    /**
     * Retrieve status summary report
     */
    async getHealthReport() {
        let detected = 0;
        let fixed = 0;
        let pending = 0;
        let logs = [];

        try {
            if (prisma) {
                logs = await prisma.improvementRegistry.findMany({
                    orderBy: { created_at: 'desc' },
                    take: 50
                });
                detected = await prisma.improvementRegistry.count();
                fixed = await prisma.improvementRegistry.count({ where: { status: 'fixed' } });
                pending = await prisma.improvementRegistry.count({ where: { status: { in: ['detected', 'pending_repair'] } } });
            }
        } catch (e) {
            // fallback
        }

        const score = Math.max(10, 100 - (pending * 8));

        return {
            score,
            detected,
            fixed,
            pending,
            logs
        };
    }

    /**
     * SOTA Cognitive Auditing: Learns from failure logs and writes optimal prompt instructions
     */
    async analyzeAndEvolve() {
        console.log('🧠 [SelfEvolution] Analyzing performance logs for self-upgrade...');
        
        let allLogs = [];
        if (fs.existsSync(this.learningLogPath)) {
            try {
                allLogs = JSON.parse(fs.readFileSync(this.learningLogPath, 'utf8'));
            } catch (e) {
                console.warn('[SelfEvolution] Failed to read learning collector logs:', e.message);
            }
        }

        let failureLogs = [];
        if (fs.existsSync(this.failuresLogPath)) {
            try {
                failureLogs = JSON.parse(fs.readFileSync(this.failuresLogPath, 'utf8'));
            } catch (e) {
                console.warn('[SelfEvolution] Failed to read failure logs:', e.message);
            }
        }

        const feedbackLogPath = path.join(process.cwd(), 'data', 'learning', 'feedback.json');
        let feedbackLogs = [];
        if (fs.existsSync(feedbackLogPath)) {
            try {
                feedbackLogs = JSON.parse(fs.readFileSync(feedbackLogPath, 'utf8'));
            } catch (e) {
                console.warn('[SelfEvolution] Failed to read feedback logs:', e.message);
            }
        }

        const negativeFeedbacks = feedbackLogs.filter(f => f.rating === 'negative' || f.rating === 1 || f.rating === 'down');
        const feedbackErrors = [];
        for (const fb of negativeFeedbacks) {
            const match = allLogs.find(log => log.id === fb.interactionId);
            if (match) {
                feedbackErrors.push({
                    skill: match.skill || match.intent || 'general',
                    input: match.input || match.userInput,
                    error: `User Negative Feedback: ${fb.comment || 'Disliked response'}`
                });
            }
        }

        const systemErrors = allLogs.filter(l => l.status === 'failed' || l.error || l.success === false);
        const totalErrors = [...systemErrors, ...failureLogs, ...feedbackErrors];

        if (totalErrors.length > 0) {
            console.log(`🧠 [SelfEvolution] Found ${totalErrors.length} total issues. Commencing Cognitive Auditing and Prompt Patching...`);
            await this.auditAndPatchSkills(totalErrors);
        }

        if (systemErrors.filter(e => e.error).length > 3) {
            return await this.createMissingCapability(systemErrors);
        }

        // Trigger startup system scans
        await this.scanProject();

        return { evolved: true, reason: 'Cognitive self-training completed successfully' };
    }

    async auditAndPatchSkills(errors) {
        const skillErrors = {};
        for (const err of errors) {
            const skill = err.skill || err.intent || err.agentUsed || 'general';
            if (!skillErrors[skill]) skillErrors[skill] = [];
            skillErrors[skill].push(err);
        }

        const patches = cognitiveTrainer.loadPatches();

        for (const [skill, logs] of Object.entries(skillErrors)) {
            console.log(`🧠 [SelfEvolution] Optimizing cognitive skills for: "${skill}"`);
            const sampleLogs = logs.slice(-5).map(l => ({
                input: l.input || l.userInput,
                error: l.error || l.reason || l.message || 'unknown failure'
            }));

            const prompt = `You are a meta-prompt optimizer for AI agents.
Analyze the following failure logs for the agent skill "${skill}":
${JSON.stringify(sampleLogs)}

Produce a list of 2-3 precise system guidelines (in English) that will prevent these errors in future runs.
Return ONLY valid JSON format:
{
  "successGuidelines": ["rule 1", "rule 2"],
  "failureCorrections": ["how to avoid mistake 1", "how to avoid mistake 2"]
}`;

            try {
                const response = await aiProviderManager.createChatCompletion('SelfEvolutionAgent', {
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2,
                    responseFormat: 'json'
                });

                const content = response.choices[0].message.content.trim();
                const analysis = JSON.parse(content);

                if (!patches.skills[skill]) patches.skills[skill] = {};
                
                patches.skills[skill].successGuidelines = [
                    ...new Set([...(patches.skills[skill].successGuidelines || []), ...(analysis.successGuidelines || [])])
                ].slice(-5);

                patches.skills[skill].failureCorrections = [
                    ...new Set([...(patches.skills[skill].failureCorrections || []), ...(analysis.failureCorrections || [])])
                ].slice(-5);

                console.log(`✅ [SelfEvolution] Successfully patched prompt structure for skill: "${skill}"`);
            } catch (e) {
                console.error(`❌ [SelfEvolution] Failed to generate cognitive patches for ${skill}:`, e.message);
            }
        }

        cognitiveTrainer.savePatches(patches);
    }

    async createMissingCapability(errorLogs) {
        const prompt = `Based on these system errors, determine if a NEW agent type is needed or if an existing one needs a fix.
        Errors: ${JSON.stringify(errorLogs.slice(-5))}
        
        If a new agent is needed, provide the Node.js class code for it.
        Return ONLY valid JSON: { "action": "create_agent" | "fix_existing", "agentName": "Name", "code": "..." }`;

        try {
            const response = await aiProviderManager.createChatCompletion('SelfEvolutionAgent', {
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                responseFormat: 'json'
            });

            const plan = JSON.parse(response.choices[0].message.content.trim());
            
            if (plan.action === 'create_agent') {
                const fileName = `${plan.agentName.toLowerCase()}Agent.js`;
                fs.writeFileSync(path.join(this.newAgentsPath, fileName), plan.code);
                return { evolved: true, type: 'new_agent', name: plan.agentName };
            }
        } catch (e) {
            console.error('❌ [Evolution] Failed to evolve:', e.message);
        }
        return { evolved: false };
    }
}

module.exports = { SelfEvolutionAgent };
