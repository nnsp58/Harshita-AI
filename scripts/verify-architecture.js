const fs = require('fs');
const path = require('path');

const masterAgentPath = path.join(__dirname, '../src/agents/masterAgent.js');

try {
  const code = fs.readFileSync(masterAgentPath, 'utf8');

  // PRD-073 Architecture Lock Check
  const violations = [
    'aiProviderManager',
    'createChatCompletion',
    'require("../utils/aiProviderManager")',
    'require(\'../utils/aiProviderManager\')'
  ];

  let hasViolation = false;
  violations.forEach(v => {
    if (code.includes(v)) {
      console.error(`❌ ARCHITECTURE VIOLATION: MasterAgent must not contain '${v}'. PRD-073 strictly forbids MasterAgent from accessing LLMs directly.`);
      hasViolation = true;
    }
  });

  if (hasViolation) {
    console.error(`\n🚨 BUILD FAILED: MasterAgent is acting as an LLM consumer instead of a Router.\nRefer to PRD-073: Agent-Oriented AI Operating System.`);
    process.exit(1);
  } else {
    console.log(`✅ Architecture Verification Passed: MasterAgent is purely a router.`);
    process.exit(0);
  }

} catch (err) {
  console.error("Error reading masterAgent.js:", err);
  process.exit(1);
}
