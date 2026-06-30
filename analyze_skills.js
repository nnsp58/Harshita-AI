const { SkillRegistry } = require('./src/skills/SkillRegistry');

async function analyze() {
  const registry = new SkillRegistry();
  await registry.autoLoad();
  
  const stats = registry.getStats();
  const summary = registry.getSkillSummary();
  
  console.log(JSON.stringify({ stats, summary }, null, 2));
}

analyze().catch(console.error);
