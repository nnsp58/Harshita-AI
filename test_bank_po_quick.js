require('dotenv').config();
const { MasterAgent } = require('./src/core/masterAgent');

async function test() {
  const ma = new MasterAgent();
  await ma.processMessage('test_user', 'subscribe free');

  console.log('Testing: bank PO vacancies');
  const resp = await ma.processMessage('test_user', 'bank PO vacancies');
  console.log('Response type:', resp.type);
  if (resp.type === 'result' && resp.data) {
    console.log('Success:', resp.data.success);
    console.log('Count:', resp.data.count);
    if (resp.data.jobs) {
      resp.data.jobs.forEach(j => console.log(' -', j.title, '(' + j.agency + ')'));
    } else {
      console.log('Message:', resp.data.message);
    }
  } else {
    console.log('Unexpected:', JSON.stringify(resp).substring(0, 200));
  }
}

test().catch(console.error);
