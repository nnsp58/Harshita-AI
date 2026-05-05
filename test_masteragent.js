// Direct test of MasterAgent (bypass UI)
require('dotenv').config();
const { MasterAgent } = require('./src/core/masterAgent');

async function testChat() {
  console.log('🧪 Testing MasterAgent Chat Intelligence...\n');
  
  const master = new MasterAgent();
  const userId = 'test_user_001';
  
  const testCases = [
    { msg: 'help', expect: 'help' },
    { msg: 'plan', expect: 'plan' },
    { msg: 'status', expect: 'status' },
    { msg: 'search land record in Uttar Pradesh', expect: 'land' },
    { msg: 'check ration card status', expect: 'ration' },
    { msg: 'book train ticket from Delhi to Mumbai', expect: 'ticket' },
    { msg: 'login to CSC portal', expect: 'login' },
    { msg: 'draft affidavit for passport', expect: 'legal' },
    { msg: 'extract data from my Aadhaar', expect: 'document' },
    { msg: 'compress my photo', expect: 'file' },
    { msg: 'validate my data', expect: 'validate' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      const result = await master.processMessage(userId, test.msg);
      const success = result.type === test.expect ? '✅' : 
                     result.type === 'access_denied' ? '🔒' :
                     result.type === 'error' ? '❌' : '⚠️';
      
      if (result.type === test.expect) passed++;
      else failed++;
      
      console.log(`${success} "${test.msg}"`);
      console.log(`   Intent: ${result.type}`);
      if (result.message) console.log(`   Message: ${result.message.substring(0, 80)}...`);
      console.log('');
    } catch (error) {
      console.error(`❌ "${test.msg}" crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`   Passed: ${passed}/${testCases.length}`);
  console.log(`   Failed: ${failed}/${testCases.length}`);
  
  // Test subscription flow
  console.log('\n💳 Testing subscription commands...');
  const subResult = await master.processMessage(userId, 'subscribe pro monthly');
  console.log('Subscribe result:', subResult.type, subResult.message?.substring(0, 100));
  
  const statusResult = await master.processMessage(userId, 'status');
  console.log('Status result:', statusResult.type, statusResult.message?.substring(0, 100));
  
  console.log('\n✅ Chat bot test complete!');
}

testChat().catch(console.error);
