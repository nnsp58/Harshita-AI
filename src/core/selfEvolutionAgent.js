const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { cognitiveTrainer } = require('./cognitiveTrainer');

class SelfEvolutionAgent {
    constructor() {
        this.learningLogPath = path.join(process.cwd(), 'logs', 'learning_collector.json');
        this.failuresLogPath = path.join(process.cwd(), 'data', 'learning', 'failures.json');
        this.newAgentsPath = path.join(process.cwd(), 'src', 'agents', 'evolved');
        if (!fs.existsSync(this.newAgentsPath)) fs.mkdirSync(this.newAgentsPath, { recursive: true });
    }

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

        const systemErrors = allLogs.filter(l => l.status === 'failed' || l.error || !l.success);
        const totalErrors = [...systemErrors, ...failureLogs];

        if (totalErrors.length > 0) {
            console.log(`🧠 [SelfEvolution] Found ${totalErrors.length} total issues. Commencing Cognitive Auditing and Prompt Patching...`);
            await this.auditAndPatchSkills(totalErrors);
        }

        // If there are too many code errors, consider creating/fixing capabilities
        if (systemErrors.filter(e => e.error).length > 3) {
            return await this.createMissingCapability(systemErrors);
        }

        return { evolved: true, reason: 'Cognitive self-training completed successfully' };
    }

    /**
     * SOTA Cognitive Auditing: Learns from failure logs and writes optimal prompt instructions
     * dynamically into cognitive_patches.json.
     */
    async auditAndPatchSkills(errors) {
        const client = aiProviderManager.getClient('SelfEvolutionAgent');
        const model = aiProviderManager.getModel('SelfEvolutionAgent');
        
        if (!client) {
            console.warn('[SelfEvolution] AI provider unavailable for cognitive auditing.');
            return;
        }

        // Group errors by skill
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
                const response = await client.chat.completions.create({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2,
                    response_format: { type: 'json_object' }
                });

                const content = response.choices[0].message.content.trim();
                const analysis = JSON.parse(content);

                if (!patches.skills[skill]) patches.skills[skill] = {};
                
                patches.skills[skill].successGuidelines = [
                    ...new Set([...(patches.skills[skill].successGuidelines || []), ...(analysis.successGuidelines || [])])
                ].slice(-5); // Keep last 5 rules

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
            const client = aiProviderManager.getClient('SelfEvolutionAgent');
            const model = aiProviderManager.getModel('SelfEvolutionAgent');
            
            const response = await client.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                response_format: { type: 'json_object' }
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
