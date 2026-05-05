// Interactive Chat Bot Test - Talk directly with MasterAgent
// Run: node interactive_chat.js

const readline = require('readline');
const { MasterAgent } = require('./src/core/masterAgent');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const master = new MasterAgent();
const userId = 'demo_user_' + Date.now();

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 CSC AUTOMATION CHAT BOT - Interactive Mode          ║
║                                                          ║
║   Type your messages below. Type 'exit' to quit.        ║
║   Try: "help", "plan", "search land in UP"              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);

async function chat() {
  while (true) {
    const input = await question('📝 You: ');
    const msg = input.trim();
    
    if (msg.toLowerCase() === 'exit' || msg.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye! Shutting down chat bot...');
      process.exit(0);
    }
    
    if (!msg) continue;
    
    try {
      const response = await master.processMessage(userId, msg);
      
      console.log('\n🤖 Bot:');
      
      switch (response.type) {
        case 'info':
          console.log(response.message);
          break;
        case 'success':
          console.log('✅', response.message);
          if (response.data) {
            console.log('   Data:', JSON.stringify(response.data, null, 2).substring(0, 200));
          }
          break;
        case 'error':
          console.log('❌', response.message);
          break;
        case 'access_denied':
          console.log('🔒', response.message);
          break;
        case 'collecting_input':
          console.log('📝', response.message);
          console.log(`   (Bot is waiting for: ${response.field})`);
          break;
        case 'manual_required':
          console.log('⚠️', response.message);
          if (response.instruction) {
            console.log(`   ${response.instruction}`);
          }
          break;
        case 'result':
          if (response.success) {
            console.log('✅', response.message);
          } else {
            console.log('❌', response.message);
          }
          if (response.data) {
            console.log('   Result:', JSON.stringify(response.data, null, 2).substring(0, 300));
          }
          break;
        default:
          console.log(response.message || JSON.stringify(response, null, 2).substring(0, 300));
      }
      
      console.log('');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Stack:', error.stack.substring(0, 200));
      console.log('');
    }
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Start
chat().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
