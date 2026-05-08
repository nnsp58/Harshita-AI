const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');

class SelfEvolutionAgent {
    constructor() {
        this.learningLogPath = path.join(process.cwd(), 'logs', 'learning_collector.json');
        this.newAgentsPath = path.join(process.cwd(), 'src', 'agents', 'evolved');
        if (!fs.existsSync(this.newAgentsPath)) fs.mkdirSync(this.newAgentsPath, { recursive: true });
    }

    async analyzeAndEvolve() {
        console.log('🧠 [SelfEvolution] Analyzing performance logs for self-upgrade...');
        
        if (!fs.existsSync(this.learningLogPath)) return { evolved: false, reason: 'No logs yet' };

        const logs = JSON.parse(fs.readFileSync(this.learningLogPath, 'utf8'));
        const errors = logs.filter(l => l.status === 'failed' || l.error);

        if (errors.length > 3) {
            console.log(`🧠 [SelfEvolution] Found ${errors.length} systemic issues. Initiating code evolution...`);
            return await this.createMissingCapability(errors);
        }

        return { evolved: false, reason: 'System performing within parameters' };
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
                temperature: 0.2
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
