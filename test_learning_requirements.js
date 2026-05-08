const { WebLearningAgent } = require('./src/agents/webLearningAgent');
require('dotenv').config();

async function testExtraction() {
  const agent = new WebLearningAgent();
  
  // Example URL (In a real scenario, this would be a specific instructions page)
  const testUrl = 'https://ssc.nic.in/Notice/Notice'; 
  
  console.log('🚀 Testing autonomous file requirement extraction...');
  
  try {
    const result = await agent.extractFileRequirements(testUrl);
    
    // Test T&C Summary
    console.log('\n📜 Testing smart Terms and Conditions summary...');
    const tcResult = await agent.summarizeTermsAndConditions(testUrl);
    
    if (tcResult.success) {
      console.log('✅ T&C Summary Successful!');
      console.log('📝 Summary:', tcResult.summary.summary);
      console.log('💰 Fees:', tcResult.summary.fees);
      console.log('🎓 Eligibility:', tcResult.summary.eligibility);
    } else {
      console.log('❌ T&C Summary failed:', tcResult.error);
    }
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testExtraction();
