// Test JobSearchAgent with both AI providers
require('dotenv').config();
const { JobSearchAgent } = require('./src/agents/jobSearchAgent');

async function testAIProviders() {
  console.log('🧪 Testing JobSearchAgent AI Providers\n');
  
  // Test 1: Check which provider is active
  const agent = new JobSearchAgent();
  console.log('Active provider:', agent.provider);
  console.log('OpenAI client type:', typeof agent.openai);
  console.log('');
  
  // Test 2: Test non-standard qualification (B.Tech) - triggers AI
  console.log('Testing AI matching for "B.Tech in Computer Science":');
  const result = await agent.execute({
    action: 'search_jobs',
    userQualification: 'B.Tech in Computer Science'
  });
  
  console.log('Success:', result.success);
  console.log('Message:', result.message?.substring(0, 150));
  if (result.jobs) {
    console.log('Jobs found:', result.count);
    result.jobs.forEach(job => {
      console.log(`  - ${job.title} (${job.agency})`);
    });
  }
  
  // Test 3: Test "PhD" qualification
  console.log('\nTesting "Postgraduate" qualification:');
  const result2 = await agent.execute({
    action: 'search_jobs',
    userQualification: 'postgraduate'
  });
  console.log('Found:', result2.count, 'jobs');
  
  // Test 4: Test "ITI" qualification
  console.log('\nTesting "ITI" qualification:');
  const result3 = await agent.execute({
    action: 'search_jobs',
    userQualification: 'ITI'
  });
  console.log('Found:', result3.count, 'jobs');
  
  console.log('\n✅ AI + Rule-based matching test complete!');
  console.log('\n💡 To use Gemini Flash:');
  console.log('   1. Get API key from https://makersuite.google.com/app/apikey');
  console.log('   2. Add to .env: GEMINI_API_KEY=your-key');
  console.log('   3. Restart - automatically switches to Gemini');
}

testAIProviders().catch(console.error);
