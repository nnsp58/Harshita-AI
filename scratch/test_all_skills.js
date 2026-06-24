const path = require('path');
require('dotenv').config();

async function runTests() {
  console.log('🤖 Starting Health Test for all Harshita AI Skills...\n');
  
  const { SkillRegistry } = require('../src/skills/SkillRegistry');
  const registry = new SkillRegistry();
  
  // Try to load all skills
  const skillsDir = path.join(__dirname, '../src/skills');
  await registry.autoLoad(skillsDir);
  
  console.log('\n📊 RUNNING HEALTH CHECKS ON REGISTERED SKILLS:');
  console.log('==================================================');
  
  const healthResults = await registry.healthCheckAll();
  let healthyCount = 0;
  let brokenCount = 0;
  
  healthResults.forEach(res => {
    if (res.healthy) {
      console.log(`   🟢 [HEALTHY] ${res.name} (Uses: ${res.usageCount})`);
      healthyCount++;
    } else {
      console.log(`   🔴 [BROKEN]  ${res.name} - Error: ${res.error || 'Unknown error'}`);
      brokenCount++;
    }
  });
  
  console.log('\n==================================================');
  console.log(`✨ Test completed! Healthy: ${healthyCount} | Broken: ${brokenCount}`);
  
  if (brokenCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('❌ Critical error running skill tests:', err);
  process.exit(1);
});
