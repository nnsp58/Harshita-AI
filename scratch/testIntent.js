const { IntentDetector } = require('./src/skills/IntentDetector');
const { SkillRegistry } = require('./src/skills/SkillRegistry');

async function test() {
  const registry = new SkillRegistry();
  await registry.autoLoad();
  const detector = new IntentDetector(registry);
  const result = await detector.detect("prarthi chanchal patni imar hau application to principal atal awasya school", "hi");
  console.log("DETECTION RESULT:", JSON.stringify(result, null, 2));
}

test();
