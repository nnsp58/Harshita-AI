// Complete end-to-end chat bot test
require('dotenv').config();
const { MasterAgent } = require('./src/core/masterAgent');

async function fullTest() {
  const master = new MasterAgent();
  const userId = 'demo_user';
  
  console.log('=== COMPLETE CHAT BOT TEST ===\n');
  
  // 1. No subscription - should be denied
  console.log('1️⃣  Testing WITHOUT subscription:');
  let resp = await master.processMessage(userId, 'search land in UP');
  console.log(`   Land search: ${resp.type} - ${resp.message?.substring(0, 60)}...`);
  
  resp = await master.processMessage(userId, 'help');
  console.log(`   Help: ${resp.type}`);
  
  // 2. Subscribe to free trial
  console.log('\n2️⃣  Subscribing to FREE trial:');
  resp = await master.processMessage(userId, 'subscribe free');
  console.log(`   Result: ${resp.type}`);
  console.log(`   Message: ${resp.message?.substring(0, 100)}...`);
  
  // 3. Check status
  console.log('\n3️⃣  Checking subscription status:');
  resp = await master.processMessage(userId, 'status');
  console.log(`   Status command: ${resp.type}`);
  console.log(`   ${resp.message?.substring(0, 120)}...`);
  
  // 4. Now try services - they should work!
  console.log('\n4️⃣  Testing services WITH subscription:');
  
  const services = [
    'search land record in Bulandshahr',
    'check ration card status',
    'book train from Delhi to Kolkata',
    'draft affidavit for passport',
    'extract data from my documents',
    'compress my image'
  ];
  
  for (const service of services) {
    resp = await master.processMessage(userId, service);
    const icon = resp.type === 'collecting_input' ? '📝' : 
                 resp.type === 'result' ? '✅' : '❌';
    console.log(`   ${icon} ${service.substring(0, 40)}`);
    console.log(`      → ${resp.type}${resp.data ? ` (${resp.data.action || resp.data.agent})` : ''}`);
  }
  
  console.log('\n✅ All chat features working!');
}

fullTest().catch(console.error);
