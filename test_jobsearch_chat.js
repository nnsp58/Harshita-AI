// Test JobSearch via Chat Bot (MasterAgent)
require('dotenv').config();
console.log('🔧 Environment loaded:');
console.log('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('');

const { MasterAgent } = require('./src/core/masterAgent');

async function testChatJobSearch() {
  const master = new MasterAgent();
  const userId = 'test_user';
  
  console.log('=== CHAT BOT: JOB SEARCH TEST ===\n');
  
  // Subscribe first
  console.log('Subscribing to free trial...');
  await master.processMessage(userId, 'subscribe free');
  
  // Test various job search queries
  const queries = [
    'find me a job',
    'search jobs for 10th pass',
    'government jobs for 12th pass',
    'sarkari naukri for graduate',
    'show all jobs',
    'jobs in SSC',
    'railway jobs'
  ];
  
  for (const query of queries) {
    console.log(`\n📝 User: "${query}"`);
    const resp = await master.processMessage(userId, query);
    console.log(`🤖 Bot (${resp.type}):`);
    
    if (resp.type === 'result' && resp.data) {
      if (resp.data.count) {
        console.log(`   Found ${resp.data.count} jobs`);
        resp.data.jobs.slice(0, 2).forEach(job => {
          console.log(`   • ${job.title} (${job.agency})`);
          console.log(`     Salary: ${job.salary}`);
          console.log(`     Link: ${job.link}`);
        });
      } else {
        console.log(`   ${resp.message?.substring(0, 120)}`);
      }
    } else if (resp.type === 'collecting_input') {
      console.log(`   Bot asks: ${resp.message}`);
    } else if (resp.type === 'access_denied') {
      console.log(`   🔒 Access denied - need subscription`);
    } else {
      console.log(`   ${resp.message?.substring(0, 120)}`);
    }
  }
  
  console.log('\n✅ Job search via chat complete!');
}

testChatJobSearch().catch(console.error);
