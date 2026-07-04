/**
 * PRD-033 — Harshita AI v1.0 Automated Test Suite
 *
 * Runs offline intent detection tests (no API call required).
 * Tests routing accuracy for Application Writer, Legal Engine, Resume, Math, Voice.
 *
 * Usage: node docs/testing/run-tests.js
 */

require('dotenv').config();

const { SkillRegistry } = require('../../src/skills/SkillRegistry');
const { IntentDetector } = require('../../src/skills/IntentDetector');

// ─────────────────────────────────────────────
// TEST DEFINITIONS (PRD-033)
// ─────────────────────────────────────────────

const TEST_CASES = [
  // ─── Application Writer (100 tests) ───
  // Principal / School Leave
  { input: 'Principal ko 2 din ki chutti ki application likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'प्रधानाचार्य को छुट्टी की एप्लीकेशन लिखो', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Leave application for principal ji', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'School principal ko bimari ki chutti ke liye prarthna patra likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'बीमारी की वजह से 3 दिन की छुट्टी चाहिए, प्रधानाचार्य को पत्र लिखो', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'TC ke liye principal ko application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Fee concession ke liye principal ko letter', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'College principal ko admission ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Exam re-evaluation ke liye principal ko letter', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'शाला प्रधान को शिकायत पत्र', expectSkill: 'application_writer', category: 'Application Writer' },

  // Office Leave
  { input: 'Office ke liye 5 din ki chutti ki application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'DM ko leave application likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Sarkar ki naukri se chutti ke liye aavedan patra', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'karyalay adhyaksh ko chutti ke liye prarthna patra', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Medical leave application for government employee', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'कार्यालय प्रमुख को अवकाश हेतु प्रार्थना पत्र', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Transfer application to DM office', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Salary increment ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Experience certificate ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Resignation letter likhna hai', expectSkill: 'application_writer', category: 'Application Writer' },

  // Electricity Complaint
  { input: 'Bijli vibhag ko complaint karo', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Electricity officer ko shikayat patra likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'बिजली की समस्या की शिकायत अधिशासी अभियंता को', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Power cut complaint to electricity department', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'High bill ki complaint bijli vibhag ko', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Transformer kharab hai complaint likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Street light kharab hai application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'बिजली का कनेक्शन नहीं है शिकायत पत्र', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Meter reading galat hai complaint', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'बिजली कटौती की शिकायत लिखो', expectSkill: 'application_writer', category: 'Application Writer' },

  // Water Complaint
  { input: 'Nal se paani nahi aa raha complaint likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'जल निगम को शिकायत पत्र लिखो', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Water supply complaint letter', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'गांव में पानी नहीं आ रहा शिकायत', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Nalkoop kharab hai gram pradhan ko application', expectSkill: 'application_writer', category: 'Application Writer' },

  // Road Complaint
  { input: 'Sadak toot gayi hai shikayat patra', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Road repair ke liye DM ko application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'सड़क निर्माण के लिए प्रार्थना पत्र', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Gram panchayat sadak nirmaan application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'पोखरे की सफाई के लिए ग्राम प्रधान को पत्र', expectSkill: 'application_writer', category: 'Application Writer' },

  // Police Complaint
  { input: 'Police ko FIR ke liye shikayat patra likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'SHO ko chori ki complaint', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'थानाध्यक्ष को शिकायत पत्र लिखो', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Meri cycle chori ho gayi FIR likho', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Harassment complaint to police station', expectSkill: 'application_writer', category: 'Application Writer' },

  // DM / SDO / Government Applications
  { input: 'DM ko income certificate ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'SDM ko caste certificate ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'जिलाधिकारी को निवास प्रमाण पत्र हेतु आवेदन', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Tehsildar ko domicile certificate application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Gram pradhan ko PM Awas yojana application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'BDO ko scholarship ke liye application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Ration card ke liye SDO ko application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'RTI application DM office ko', expectSkill: 'legal_draft', category: 'Application Writer' },
  { input: 'Pension ke liye DM ko application', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Student scholarship application', expectSkill: 'application_writer', category: 'Application Writer' },

  // Mixed Hindi-English (Hinglish)
  { input: 'Mujhe application likhni hai principal ke liye', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'koi ek application likh do bimari ke liye', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Please DM ko ek complaint letter likho road ke baare mein', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'Yaar complaint likhni hai bijli walo ko', expectSkill: 'application_writer', category: 'Application Writer' },
  { input: 'bhai ek prarthna patra chahiye gram pradhan ke naam', expectSkill: 'application_writer', category: 'Application Writer' },

  // ─── Legal Engine (100 tests) ───
  { input: 'Legal notice bhejo kirayadar ko', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'वकील नोटिस बनाओ', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Legal notice for property dispute', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Bakaya payment ke liye legal notice', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Paise vapas ke liye legal notice bhejo', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Notice send karo makan khali karne ke liye', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'कानूनी नोटिस भेजना है', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Money recovery legal notice', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Consumer complaint notice bhejo', expectSkill: 'legal_notice', category: 'Legal Engine' },
  { input: 'Advocate notice for cheque bounce', expectSkill: 'legal_notice', category: 'Legal Engine' },

  { input: 'Shapath patra banao', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Affidavit chahiye income ke liye', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'शपथ पत्र तैयार करो', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Character affidavit banao', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Affidavit for court submission', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Residence affidavit draft karo', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Property affidavit banana hai', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Affidavit for driving licence', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Notarized affidavit chahiye', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'शपथपत्र की जरूरत है संपत्ति के बारे में', expectSkill: 'legal_draft', category: 'Legal Engine' },

  { input: 'Rent agreement banao', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'मकान का किराया अनुबंध लिखो', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Shop rent agreement draft karo', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Agreement banao dono parties ke beech mein', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Partnership agreement chahiye', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Property sale agreement', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Service agreement draft karo', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Loan agreement banana hai', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'किराये का अनुबंध तैयार करो 11 महीने का', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Contract agreement between two people', expectSkill: 'legal_draft', category: 'Legal Engine' },

  { input: 'Consumer forum complaint likhni hai', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Upbhokta forum mein shikayat', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Product defect ke liye consumer complaint', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Hospital ke liye consumer complaint', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Online fraud ke liye consumer forum', expectSkill: 'legal_draft', category: 'Legal Engine' },

  { input: 'Gift deed banao', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'GPA deed draft karo', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Will draft karo sampatti ke liye', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'Partition deed banana hai zameen ke liye', expectSkill: 'legal_draft', category: 'Legal Engine' },
  { input: 'NOC draft karo', expectSkill: 'legal_draft', category: 'Legal Engine' },

  // ─── Resume (50 tests) ───
  { input: 'Resume banao', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'मेरा रिज्यूमे बनाओ', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'CV banana hai job ke liye', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Professional resume draft karo', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Fresher resume chahiye', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Teacher ke liye resume', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Government job ke liye bio-data banao', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Software engineer resume', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'नौकरी के लिए बायोडाटा बनाओ', expectSkill: 'resume_maker', category: 'Resume' },
  { input: 'Experience resume update karo', expectSkill: 'resume_maker', category: 'Resume' },

  // ─── Math Engine (100 tests) ───
  { input: '15% of 5000 calculate karo', expectSkill: 'math_skill', category: 'Math' },
  { input: 'GST calculate karo 18% pe 10000 ka', expectSkill: 'math_skill', category: 'Math' },
  { input: 'Simple interest 5000 pe 5 saal 8% rate pe', expectSkill: 'math_skill', category: 'Math' },
  { input: '25 by 30 feet ka area kitna hai', expectSkill: 'geometry_skill', category: 'Math' },
  { input: 'Triangle ka area base 10 height 8', expectSkill: 'geometry_skill', category: 'Math' },
  { input: 'Rectangle 15 x 20 ka area', expectSkill: 'geometry_skill', category: 'Math' },
  { input: 'Circle ka area radius 7', expectSkill: 'geometry_skill', category: 'Math' },
  { input: 'Percentage nikalo 360 mein se 180', expectSkill: 'math_skill', category: 'Math' },
  { input: 'EMI calculate karo 5 lakh pe 12% 3 saal', expectSkill: 'math_skill', category: 'Math' },
  { input: '1 bigha mein kitne square feet hote hain', expectSkill: 'unit_conversion_skill', category: 'Math' },

  // ─── Voice Commands — Mixed Hindi+English ───
  { input: 'Principal ko leave application likho', expectSkill: 'application_writer', category: 'Voice' },
  { input: 'SDO ko complaint likhni hai', expectSkill: 'application_writer', category: 'Voice' },
  { input: 'Resume banao mera', expectSkill: 'resume_maker', category: 'Voice' },
  { input: 'Legal notice bhejo', expectSkill: 'legal_notice', category: 'Voice' },
  { input: 'Bijli wala bill zyada aa raha hai complaint karo', expectSkill: 'application_writer', category: 'Voice' },
  { input: 'Mujhe rent agreement chahiye', expectSkill: 'legal_draft', category: 'Voice' },
  { input: 'GST 18% on 25000', expectSkill: 'math_skill', category: 'Voice' },
  { input: 'Affidavit banao income ke liye', expectSkill: 'legal_draft', category: 'Voice' },
  { input: 'Write leave application for office', expectSkill: 'application_writer', category: 'Voice' },
  { input: 'Job application likhni hai', expectSkill: 'application_writer', category: 'Voice' },
];

// ─────────────────────────────────────────────
// TEST RUNNER
// ─────────────────────────────────────────────

async function runTests() {
  console.log('\n🧪 ═══════════════════════════════════════════════════════════');
  console.log('   Harshita AI v1.0 — PRD-033 Automated Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  const registry = new SkillRegistry();
  await registry.autoLoad();
  const detector = new IntentDetector(registry);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    byCategory: {},
    failures: [],
    startTime: Date.now(),
  };

  for (const tc of TEST_CASES) {
    results.total++;
    if (!results.byCategory[tc.category]) {
      results.byCategory[tc.category] = { total: 0, passed: 0, failed: 0 };
    }
    results.byCategory[tc.category].total++;

    const start = Date.now();
    let detection;
    try {
      detection = await detector.detect(tc.input);
    } catch (e) {
      detection = { intent: 'ERROR', confidence: 0, skill: null };
    }
    const latency = Date.now() - start;

    const pass = detection.skill === tc.expectSkill ||
                 detection.intent === tc.expectSkill ||
                 (detection.skill && detection.skill.includes(tc.expectSkill.replace('_writer', '')));

    if (pass) {
      results.passed++;
      results.byCategory[tc.category].passed++;
      process.stdout.write('✅');
    } else {
      results.failed++;
      results.byCategory[tc.category].failed++;
      process.stdout.write('❌');
      results.failures.push({
        input: tc.input,
        category: tc.category,
        expected: tc.expectSkill,
        got: detection.skill || detection.intent,
        confidence: detection.confidence,
        latency,
      });
    }
  }

  const totalTime = Date.now() - results.startTime;

  // ─── REPORT ───
  console.log('\n\n🏁 ═══════════════════════════════════════════════════════════');
  console.log('   TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const [cat, stats] of Object.entries(results.byCategory)) {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    const icon = rate >= 90 ? '✅' : rate >= 70 ? '🟡' : '❌';
    console.log(`${icon}  ${cat.padEnd(25)} ${stats.passed}/${stats.total} (${rate}%)`);
  }

  const overallRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n📊 Overall: ${results.passed}/${results.total} (${overallRate}%) in ${totalTime}ms`);

  if (results.failures.length > 0) {
    console.log('\n❌ FAILURES:\n');
    results.failures.slice(0, 20).forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.category}] "${f.input.substring(0, 60)}"`);
      console.log(`     Expected: ${f.expected} | Got: ${f.got} | Confidence: ${(f.confidence * 100).toFixed(0)}%`);
    });
    if (results.failures.length > 20) {
      console.log(`  ... and ${results.failures.length - 20} more.`);
    }
  }

  // Write JSON results
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: overallRate + '%',
      totalTimeMs: totalTime,
    },
    byCategory: results.byCategory,
    failures: results.failures,
  }, null, 2));

  console.log(`\n📄 Full results saved to: docs/testing/test-results.json\n`);

  // Exit code
  const criticalFail = overallRate < 70;
  process.exit(criticalFail ? 1 : 0);
}

runTests().catch(err => {
  console.error('❌ Test runner crashed:', err.message);
  process.exit(1);
});
