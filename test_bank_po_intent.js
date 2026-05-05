// Test specific intent detection
require('dotenv').config();
const { MasterAgent } = require('./src/core/masterAgent');

async function testIntent() {
  const ma = new MasterAgent();

  const msg = 'bank PO vacancies';
  const intent = ma._detectIntent(msg);
  console.log(`Message: "${msg}" -> Intent: ${intent}`);

  // Now parse task data
  const taskData = ma._parseTaskData('jobsearch', msg, {});
  console.log('Task data:', taskData);
}

testIntent().catch(console.error);
