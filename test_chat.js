// Test chat bot with sample inputs
const { ChatInterface } = require('./src/chatInterface');

// Mock readline for testing
const chat = new ChatInterface();

// Simulate user messages
const testMessages = [
  'help',
  'plan',
  'status',
  'search land record in UP',
  'book train from Delhi to Mumbai on 25-04-2026',
  'draft affidavit for passport',
  'exit'
];

async function runTests() {
  console.log('🧪 Testing Chat Interface...\n');
  
  for (const msg of testMessages) {
    console.log(`📝 User: ${msg}`);
    try {
      const response = await chat.masterAgent.processMessage('test_user', msg);
      console.log('🤖 Bot:', response.message || JSON.stringify(response));
      console.log('');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n✅ Chat test complete');
}

runTests().catch(console.error);
