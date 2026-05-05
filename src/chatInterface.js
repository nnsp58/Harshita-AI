/**
 * ChatInterface - CLI chat interface for n-dizi CSC Automation
 * 
 * Provides interactive command-line interface for users
 * to interact with the MasterAgent
 */

const readline = require('readline');
const { MasterAgent } = require('./core/masterAgent');

class ChatInterface {
  constructor() {
    this.masterAgent = new MasterAgent();
    this.rl = null;
    this.currentUserId = 'default_user';
    this.running = false;
  }

  /**
   * Start the chat interface
   */
  start() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    ███████╗ ██████╗ ██████╗ ██╗███████╗ ██████╗ ███╗   ██╗ ║
║    ██╔════╝██╔═══██╗██╔══██╗██║╚══███╔╝██╔═══██╗████╗  ██║ ║
║    █████╗  ██║   ██║██████╔╝██║  ███╔╝ ██║   ██║██╔██╗ ██║ ║
║    ██╔══╝  ██║   ██║██╔══██╗██║ ███╔╝  ██║   ██║██║╚██╗██║ ║
║    ██║     ╚██████╔╝██║  ██║██║███████╗╚██████╔╝██║ ╚████║ ║
║    ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝ ║
║                  CSC AUTOMATION SYSTEM                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    console.log(`
📋 Welcome to n-dizi CSC Automation System!
   
🔹 Type 'help' to see available commands
🔹 Type 'plan' to view subscription plans  
🔹 Type 'status' to check your account
🔹 Type 'exit' or 'quit' to leave
🔹 Type 'subscribe <plan>' to activate subscription

Starting service...
    `);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n📝 You: '
    });

    this.running = true;
    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const input = line.trim();
      
      if (input) {
        await this.handleInput(input);
      }
      
      if (this.running) {
        this.rl.prompt();
      }
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye! Thanks for using n-dizi CSC Automation.');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down...');
      this.rl.close();
    });
  }

  /**
   * Handle user input
   */
  async handleInput(input) {
    const response = await this.masterAgent.processMessage(this.currentUserId, input);
    this.displayResponse(response);
  }

  /**
   * Display response to user
   */
  displayResponse(response) {
    console.log('');

    switch (response.type) {
      case 'access_denied':
        console.log('⚠️ ' + response.message);
        break;

      case 'success':
        console.log('✅ ' + response.message);
        break;

      case 'error':
        console.log('❌ ' + response.message);
        break;

      case 'info':
        console.log(response.message);
        break;

      case 'manual_required':
        console.log(response.message);
        console.log('\n' + response.instruction);
        break;

      case 'collecting_input':
        console.log('📝 ' + response.message);
        break;

      case 'result':
        if (response.success) {
          console.log('✅ ' + response.message);
        } else {
          console.log('❌ ' + response.message);
        }
        if (response.data) {
          console.log('\n📋 Details:');
          console.log(JSON.stringify(response.data, null, 2));
        }
        break;

      default:
        console.log(response.message || 'Response received.');
    }
  }

  /**
   * Stop the chat interface
   */
  stop() {
    this.running = false;
    if (this.rl) {
      this.rl.close();
    }
  }
}

// Start if run directly
if (require.main === module) {
  const chat = new ChatInterface();
  chat.start();
}

module.exports = { ChatInterface };