const { ApplicationSkill } = require('../src/skills/ApplicationSkill');

(async () => {
  const skill = new ApplicationSkill();

  // Simulate a STALLED provider: createChatCompletion never resolves (firewall/blocked host)
  skill.aiManager = {
    providers: new Map([['gemini', {}]]), // size > 0 so we enter the AI path
    async createChatCompletion() { return new Promise(() => {}); } // never settles
  };

  // Pre-fill the collection session so execute() goes straight to GENERATION
  const userId = 'testuser';
  const sess = skill._getSession(userId);
  sess.step = 'generating';
  sess.data = { applicantName: 'Ram Kumar', authority: 'SHO (थानाध्यक्ष)', subject: 'Bike chori hone ki shikayat' };

  const t0 = Date.now();
  const res = await skill.execute({ message: 'SHO ko bike chori hone ki application likho', userId });
  const dt = Date.now() - t0;

  console.log('RESOLVED_IN_MS:', dt);
  console.log('MODE:', res.data && res.data.mode);
  console.log('HAS_DRAFT:', !!res.message, '| LENGTH:', res.message ? res.message.length : 0);
  console.log('RESULT:', res.message ? res.message.substring(0, 80) + '...' : res.message);
  process.exit(0);
})();
