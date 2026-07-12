require('dotenv').config();
const { MasterAgent } = require('./src/agents/masterAgent');

async function testGeneralChatRouting() {
  console.log("=== Testing PRD-073 Architecture (General Chat) ===");
  console.log("Command: 'What is Quantum Computing?'");
  
  const masterAgent = new MasterAgent();
  
  // Give it a second to load skills
  setTimeout(async () => {
    try {
      const response = await masterAgent.processCommand('test_user_002', 'What is Quantum Computing?', { lang: 'en' });
      
      console.log("\\n=== Response ===");
      console.log("Skill Used:", response.skill); // Should be 'general_chat'
      console.log("Message Output:\\n", response.message);
      
      console.log("\\n=== Test Passed if Skill Used == general_chat and Message contains AI response ===");
      process.exit(0);
    } catch (err) {
      console.error("Error during test:", err);
      process.exit(1);
    }
  }, 2000);
}

testGeneralChatRouting();
