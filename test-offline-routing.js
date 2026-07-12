require('dotenv').config();
const { MasterAgent } = require('./src/agents/masterAgent');

async function testOfflineRouting() {
  console.log("=== Testing Offline-First Architecture ===");
  console.log("Command: 'बैंक मैनेजर को नई पासबुक के लिए प्रार्थना पत्र लिखो'");
  
  const masterAgent = new MasterAgent();
  
  // Give it a second to load skills
  setTimeout(async () => {
    try {
      const response = await masterAgent.processCommand('test_user_001', 'बैंक मैनेजर को नई पासबुक के लिए प्रार्थना पत्र लिखो', { lang: 'hi' });
      
      console.log("\\n=== Response ===");
      console.log("Skill Used:", response.skill);
      console.log("Message Output:\\n", response.message.substring(0, 500) + '...');
      
      console.log("\\n=== Test Passed if Skill Used != general_chat ===");
      process.exit(0);
    } catch (err) {
      console.error("Error during test:", err);
      process.exit(1);
    }
  }, 2000);
}

testOfflineRouting();
