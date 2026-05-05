// Test multi-provider AI system
require('dotenv').config();
const { aiProviderManager } = require('./src/utils/aiProviderManager');

console.log('🔧 Testing AI Provider Manager\n');

// Check available providers
console.log('Available providers:', aiProviderManager.getAvailableProviders());
console.log('');

// Test getClient for different agents
const agents = ['DocumentAIAgent', 'LegalDraftAgent', 'JobSearchAgent', 'MasterAgent'];

for (const agent of agents) {
  const client = aiProviderManager.getClient(agent);
  const provider = aiProviderManager.getEffectiveProvider(agent);
  const model = aiProviderManager.getModel(agent);
  
  console.log(`${agent}:`);
  console.log(`  Provider: ${provider}`);
  console.log(`  Model: ${model}`);
  console.log(`  Client available: ${client ? '✅' : '❌'}`);
  console.log('');
}

console.log('✅ Provider manager test complete!');
console.log('\n💡 To switch providers per agent, set in .env:');
console.log('   AI_DOCUMENT_PROVIDER=groq');
console.log('   AI_LEGAL_PROVIDER=gemini');
console.log('   AI_JOB_PROVIDER=openai');
