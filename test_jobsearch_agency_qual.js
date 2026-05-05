// Test combined agency + qualification queries
require('dotenv').config();
const { MasterAgent } = require('./src/core/masterAgent');

async function runTests() {
  const ma = new MasterAgent();
  const userId = 'test_user';

  // Subscribe first
  await ma.processMessage(userId, 'subscribe free');

  const tests = [
    "SSC jobs for graduate",
    "bank PO vacancies",
    "railway jobs for 12th pass",
    "defence jobs for 10th pass",
    "police constable jobs",
    "postal jobs for graduate"
  ];

  console.log('=== AGENCY + QUALIFICATION TESTS ===\n');

  for (const msg of tests) {
    console.log(`User: "${msg}"`);
    const result = await ma.processMessage(userId, msg);
    if (result.type === 'result' && result.agent === 'JobSearchAgent') {
      const data = result.data;
      if (data.success) {
        console.log(`  ✅ Found ${data.jobs?.length || 0} jobs`);
        data.jobs?.slice(0, 2).forEach(j => console.log(`     - ${j.title} (${j.agency})`));
      } else {
        console.log(`  ❌ ${data.message}`);
      }
    } else if (result.type === 'collect_input') {
      console.log(`  🤔 Bot asks: ${result.message}`);
    } else {
      console.log(`  ⚠️ Unexpected: ${JSON.stringify(result).substring(0, 100)}`);
    }
    console.log('');
  }
}

runTests().catch(console.error);
