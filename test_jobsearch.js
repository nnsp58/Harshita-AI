// Test JobSearchAgent directly
require('dotenv').config(); // Load .env first
const { JobSearchAgent } = require('./src/agents/jobSearchAgent');

async function testJobSearch() {
  console.log('🧪 Testing JobSearchAgent...\n');
  
  const agent = new JobSearchAgent();
  
  // Test 1: Get all jobs
  console.log('1️⃣ Getting all jobs:');
  const allJobs = await agent.execute({ action: 'get_all_jobs' });
  console.log(`   Total jobs: ${allJobs.count}`);
  console.log(`   First job: ${allJobs.jobs[0]?.title} (${allJobs.jobs[0]?.agency})`);
  
  // Test 2: Search by qualification - 10th pass
  console.log('\n2️⃣ Searching for 10th pass jobs:');
  const result10 = await agent.execute({
    action: 'search_jobs',
    userQualification: '10th pass'
  });
  console.log(`   Found: ${result10.count} jobs`);
  result10.jobs.slice(0, 3).forEach(job => {
    console.log(`   - ${job.title} (${job.agency})`);
  });
  
  // Test 3: Search by qualification - 12th pass
  console.log('\n3️⃣ Searching for 12th pass jobs:');
  const result12 = await agent.execute({
    action: 'search_jobs',
    userQualification: '12th pass'
  });
  console.log(`   Found: ${result12.count} jobs`);
  result12.jobs.slice(0, 3).forEach(job => {
    console.log(`   - ${job.title}`);
  });
  
  // Test 4: Search by qualification - Graduate
  console.log('\n4️⃣ Searching for Graduate jobs:');
  const resultGrad = await agent.execute({
    action: 'search_jobs',
    userQualification: 'graduate'
  });
  console.log(`   Found: ${resultGrad.count} jobs`);
  resultGrad.jobs.slice(0, 3).forEach(job => {
    console.log(`   - ${job.title} (${job.salary})`);
  });
  
  // Test 5: Unknown qualification
  console.log('\n5️⃣ Unknown qualification:');
  const unknown = await agent.execute({
    action: 'search_jobs',
    userQualification: 'B.Tech in Computer Science'
  });
  console.log(`   Success: ${unknown.success}`);
  console.log(`   Message: ${unknown.message?.substring(0, 100)}`);
  
  console.log('\n✅ JobSearchAgent test complete!');
}

testJobSearch().catch(console.error);
