/**
 * Test script for ApplicationSkill
 * Run: node test_application_skill.js
 */

const path = require('path');
process.chdir(path.join(__dirname));

async function runTests() {
  console.log('=== ApplicationSkill Live Test ===\n');

  let ApplicationSkill;
  try {
    const mod = require('./src/skills/ApplicationSkill');
    ApplicationSkill = mod.ApplicationSkill;
    console.log('✅ ApplicationSkill loaded');
  } catch (err) {
    console.error('❌ Failed to load ApplicationSkill:', err.message);
    process.exit(1);
  }

  let aiProviderManager;
  try {
    aiProviderManager = require('./src/utils/aiProviderManager').aiProviderManager;
    console.log('✅ aiProviderManager loaded');
    console.log('   Providers:', aiProviderManager.providers ? [...aiProviderManager.providers.keys()] : 'N/A');
  } catch (err) {
    console.log('⚠️  aiProviderManager not available:', err.message);
  }

  const skill = new ApplicationSkill();
  console.log('✅ Skill instance:', skill.displayName);
  console.log('   Intents:', skill.intents.join(', '));

  console.log('\n─────────────────────────────────────────────');
  console.log('TEST 1: Multi-turn conversation → Final Draft');
  console.log('─────────────────────────────────────────────');

  const userId = 'test_conv_001';
  const turns = [
    'प्रधानाचार्य महोदय को 10 दिन का अवकाश के लिए प्रार्थना पत्र लिखो',
    'चंचल',
    'प्रधानाचार्य',
    'सावन माह में हरिद्वार से कांवड़ लाने के लिए जाना है',
  ];

  let generatedDraft = null;
  for (let i = 0; i < turns.length; i++) {
    const msg = turns[i];
    console.log(`\n>> Turn ${i + 1}: "${msg}"`);
    const ctx = { userId, message: msg, lang: 'hi', params: {} };
    try {
      const res = await skill.execute(ctx);
      const out = typeof res === 'string' ? res : (res?.message || JSON.stringify(res));
      console.log('<< Response:', out.replace(/\n/g, ' ↵ '));
      if (i === turns.length - 1) {
        generatedDraft = out;
      }
    } catch (err) {
      console.error('❌ Turn failed:', err.message);
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('VALIDATION: Format + Content checks');
  console.log('─────────────────────────────────────────────');

  const checks = {
    'सेवा में': generatedDraft?.includes('सेवा में'),
    'श्रीमान प्रधानाचार्य': generatedDraft?.includes('श्रीमान प्रधानाचार्य'),
    'अटल आवासीय विद्यालय': generatedDraft?.includes('अटल आवासीय विद्यालय'),
    'कोंडू': generatedDraft?.includes('कोंडू'),
    'विषय': generatedDraft?.includes('विषय'),
    'महोदय': generatedDraft?.includes('महोदय'),
    'सविनय निवेदन': generatedDraft?.includes('सविनय निवेदन'),
    'अतः': generatedDraft?.includes('अतः'),
    'धन्यवाद': generatedDraft?.includes('धन्यवाद'),
    'दिनांक': generatedDraft?.includes('दिनांक'),
    'भवदीय': generatedDraft?.includes('भवदीय'),
    'चंचल': generatedDraft?.includes('चंचल'),
    'माली': generatedDraft?.includes('माली'),
    'कांवड़': generatedDraft?.includes('कांवड़'),
    'हरिद्वार': generatedDraft?.includes('हरिद्वार'),
  };

  let passed = 0;
  let failed = 0;
  for (const [label, result] of Object.entries(checks)) {
    const icon = result ? '✅' : '❌';
    console.log(`  ${icon} "${label}" ${result ? 'found' : 'MISSING'}`);
    if (result) passed++;
    else failed++;
  }

  console.log('\n── Generated Draft ───────────────────');
  console.log(generatedDraft || '(empty)');
  console.log('────────────────────────────────────────────');

  const result = failed === 0;
  console.log(`\nResult: ${result ? '✅ ALL CHECKS PASSED' : `❌ ${failed} checks FAILED`} (${passed}/${passed + failed})`);
  return result;
}

runTests()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error('\nTest runner crashed:', err);
    process.exit(1);
  });
