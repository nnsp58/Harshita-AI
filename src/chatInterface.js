/**
 * ChatInterface - CLI chat interface for n-dizi CSC Automation
 * 
 * Provides interactive command-line interface for users
 * to interact with the MasterAgent
 */

const readline = require('readline');
const masterAIOrchestrator = require('./core/MasterAIOrchestrator');

class ChatInterface {
  constructor() {
    this.masterOrchestrator = masterAIOrchestrator;
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
║                  HARSHITA AI ORCHESTRATOR                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    console.log(`
📋 Welcome to Harshita AI Operating System!
   
🔹 Type your request naturally (e.g. "Leave application likho")
🔹 Type 'exit' or 'quit' to leave

Starting Master AI Orchestrator...
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
      
      if (input === 'exit' || input === 'quit') {
        this.rl.close();
        return;
      }
      
      if (input) {
        await this.handleInput(input);
      }
      
      if (this.running) {
        this.rl.prompt();
      }
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye! Thanks for using Harshita AI.');
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
    console.log("🧠 [MasterAI] Processing request...");
    const response = await this.masterOrchestrator.processRequest(this.currentUserId, input);
    this.displayResponse(response);
  }

  /**
   * Display response to user
   */
  displayResponse(response) {
    console.log('');
    if (response.warnings && response.warnings.length > 0) {
      console.log('⚠️ Warnings:', response.warnings.join(', '));
    }

    switch (response.mode) {
      case 'legal_generated':
        console.log('✅ Legal Draft Ready [A4 Workspace Opened]');
        console.log('\n' + response.message);
        break;

      case 'code_editor':
        console.log('✅ Code Ready [Code Editor Opened]');
        console.log('\n' + response.message);
        break;

      case 'chat':
        console.log('💬 ' + response.message);
        break;

      case 'error':
        console.log('❌ ' + response.message);
        break;

      default:
        console.log('✅ ' + (response.message || 'Done.'));
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