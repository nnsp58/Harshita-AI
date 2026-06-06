/**
 * CognitiveTrainer — High-effort, zero-flaw dynamic training engine for Harshita AI.
 * 
 * Implements SOTA prompt tuning, failure reflection loops, multi-agent collaboration instructions,
 * and dialect/Hinglish localization matrices.
 */

const fs = require('fs');
const path = require('path');

class CognitiveTrainer {
  constructor() {
    this.patchesFile = path.join(process.cwd(), 'data', 'learning', 'cognitive_patches.json');
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.patchesFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.patchesFile)) {
      fs.writeFileSync(this.patchesFile, JSON.stringify({
        skills: {},
        globalSynonyms: {
          "gum": ["kho", "lost", "missing", "nhi mil raha", "chori"],
          "naam": ["name", "correction", "change", "sudhar"],
          "patni": ["wife", "spouse", "patni ke naam", "biwi"],
          "sampatti": ["property", "zameen", "land", "plot"]
        },
        meta: { lastUpdate: new Date().toISOString() }
      }, null, 2));
    }
  }

  loadPatches() {
    try {
      if (fs.existsSync(this.patchesFile)) {
        return JSON.parse(fs.readFileSync(this.patchesFile, 'utf8'));
      }
    } catch (e) {
      console.error('[CognitiveTrainer] Failed to load patches:', e.message);
    }
    return { skills: {}, globalSynonyms: {} };
  }

  savePatches(data) {
    try {
      data.meta = { lastUpdate: new Date().toISOString() };
      fs.writeFileSync(this.patchesFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('[CognitiveTrainer] Failed to save patches:', e.message);
    }
  }

  /**
   * Compiles the system instructions dynamically by integrating learning logs,
   * error patches, and dialect mappings.
   */
  compileSystemPrompt(skillName, defaultRole, guidelines = []) {
    const patches = this.loadPatches();
    const skillPatch = patches.skills[skillName] || {};
    const successGuidelines = skillPatch.successGuidelines || [];
    const failureCorrections = skillPatch.failureCorrections || [];
    
    const combinedGuidelines = [
      ...guidelines,
      ...successGuidelines,
      ...failureCorrections,
      "CRITICAL: Detect user's selected language or raw input language strictly (Hindi, English, or Bilingual Hindi+English). Output ONLY the legal draft or clean response matching that preference. Never hallucinate details; leave placeholders as [_____] or [नाम] if info is not supplied."
    ];

    const dialectMatrix = `
VERNACULAR LOCALIZATION ENGINE:
- Properly map Hinglish (Roman Hindi) terms:
  * "gum/kho/chori" -> Lost / Missing documents (generate Lost affidavit/NOC).
  * "naam change/sudhar" -> Name correction/change (generate Name Change Affidavit).
  * "patni/wife ke naam" -> Gift Deed or Transfer Deed.
  * "kiraya/rent/kirayedar" -> Rent Agreement.
  * "bantwara/partition" -> Partition Deed.
- Keep tone professional, legal, and culturally aligned with Indian Tehsil/District court requirements.
    `;

    return `${defaultRole}

${dialectMatrix}

GUIDELINES:
${combinedGuidelines.map((g, idx) => `${idx + 1}. ${g}`).join('\n')}

COGNITIVE TASK COLLABORATION:
- If verification is needed, mention that user details can be validated against Land Records or CSC databases.
- If raw file extraction is required, specify the fields to extract from marksheet/Aadhaar.
`;
  }
}

const cognitiveTrainer = new CognitiveTrainer();
module.exports = { CognitiveTrainer, cognitiveTrainer };
