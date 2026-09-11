const fs = require('fs');
const path = require('path');
const { IntentDetector } = require('../src/skills/IntentDetector');
const { SkillRegistry } = require('../src/skills/SkillRegistry');

const testPrompts = [
  // Math & Core Calculations
  "22+55",
  "10% of 500",
  "Area of circle with radius 5",
  "Calculate GST 18% on 5000",
  "Convert 5 bigha to acre",
  "EMI for 100000 loan at 10% for 12 months",
  "22 front 43 back 50 length plot area",
  "gole ka aayatan ka formula",
  
  // Tax
  "ITR kya hai",
  "ITR bhar do",
  "Mera income tax return file karna hai",
  
  // Legal
  "Gift deed kya hoti hai",
  "Gift deed banao",
  "Resume banao",
  "Legal notice bhejna hai",
  
  // Information vs Execution
  "Resume kya hota hai",
  "ITR ke bare me batao",
  "Application likho leave ke liye",
  "Application kya hai",
  "Write a poem about nature",
  "Explain quantum computing",
  "Generate flutter app code",
  "Write a story about a brave king",
  
  // Utility
  "Mausam batao",
  "Delhi weather",
  
  // Ambiguous (Should trigger clarification or suggestions)
  "help",
  "batao",
  "kya karu",
  "random text testing 123",
  
  // Greeting & Identity
  "who are you",
  "aapka owner kaun hai",
  "kisne banaya hai aapko",
  "kaun ho tum"
];

const expandedPrompts = [];
for (let i = 0; i < 500; i++) {
    expandedPrompts.push(testPrompts[i % testPrompts.length]);
}

async function runTests() {
  console.log("Loading Skill Registry...");
  const registry = new SkillRegistry();
  await registry.autoLoad();
  const detector = new IntentDetector(registry);
  
  console.log("Running Routing Tests...");
  let report = "# ROUTING_REPORT.md\n\n";
  report += "| Prompt | Detected Intent | Department | Skill | Offline | LLM Used | Confidence | Reason |\n";
  report += "|---|---|---|---|---|---|---|---|\n";
  
  for (const prompt of expandedPrompts) {
    const startTime = Date.now();
    const result = await detector.detect(prompt, 'hi', []);
    const execTime = Date.now() - startTime;
    
    let skillObj = registry.getSkill(result.skill || result.intent);
    
    let department = skillObj ? (skillObj.department || skillObj.category || 'General') : 'General';
    let skillName = result.skill || 'None';
    let offline = skillObj ? skillObj.canRunOffline : false;
    let llmUsed = (skillName === 'general_chat' && result.confidence >= 0.6) || (skillObj && skillObj.requiresLLM) ? 'YES' : 'NO';
    let reason = result.method || 'Unknown';
    
    // Check masterAgent thresholds
    let finalSkill = skillName;
    if (result.confidence < 0.35) {
        finalSkill = "CLARIFICATION";
        llmUsed = 'NO';
    } else if (result.confidence >= 0.35 && result.confidence < 0.60) {
        finalSkill = "SUGGESTIONS";
        llmUsed = 'NO';
    } else if (finalSkill === 'None' || finalSkill === 'general_chat') {
        finalSkill = 'LLM_AGENT (GeneralChat)';
    }

    report += `| ${prompt} | ${result.intent} | ${department} | ${finalSkill} | ${offline} | ${llmUsed} | ${(result.confidence*100).toFixed(0)}% | ${reason} |\n`;
  }
  
  fs.writeFileSync(path.join(process.cwd(), 'ROUTING_REPORT.md'), report, 'utf8');
  console.log("Routing test complete. Check ROUTING_REPORT.md");
}

runTests();
