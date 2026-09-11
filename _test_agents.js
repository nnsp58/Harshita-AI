// Agent test — run from project root
require('dotenv').config();
const { MasterAgent } = require('./src/agents/masterAgent');

const TESTS = [
  { name: 'Greeting',             input: 'namaste' },
  { name: 'Who are you',          input: 'aap kaun ho' },
  { name: 'Weather (off-topic)',  input: 'aaj mausam kaisa hai' },
  { name: 'GK question',          input: 'India ke pradhan mantri kaun hain' },
  { name: 'Math',                 input: '25 * 8 kya hota hai' },
  { name: 'ITR start',            input: 'mera ITR file karna hai' },
  { name: 'ITR knowledge',        input: 'ITR ke bare me kya jante ho' },
  { name: 'Legal notice',         input: 'legal notice draft chahiye' },
  { name: 'Resume',               input: 'resume banana hai' },
  { name: 'Job search',           input: 'CSC me job chahiye' },
  { name: 'Ration card',          input: 'ration card banwana hai' },
  { name: 'Pension',              input: 'pension form bharna hai' },
  { name: 'PAN card',             input: 'PAN card apply karna hai' },
  { name: 'Nonsense',             input: 'blablabla xyz' }
];

function short(txt, n=200) {
  if (txt == null) return '(empty)';
  return String(txt).replace(/\s+/g,' ').trim().slice(0,n) + (String(txt).length>n ? '…' : '');
}

(async () => {
  console.log('Loading MasterAgent…');
  const master = new MasterAgent(null);
  if (master.registry && master.registry.loadAllSkills) {
    try { await master.registry.loadAllSkills(); } catch(e){}
  }
  await new Promise(r => setTimeout(r, 800));
  const count = master.registry?.skills?.size ?? '?';
  console.log(`Ready. Skills loaded: ${count}`);
  console.log('='.repeat(90));

  for (const t of TESTS) {
    try {
      const s = Date.now();
      const r = await master.processCommand('u1', t.input, { userId: 'u1' });
      const ms = Date.now()-s;
      const reply  = r?.response ?? r?.reply ?? r?.message ?? r?.text ?? JSON.stringify(r);
      const skill  = r?.skill ?? r?.matchedSkill ?? r?.intent ?? r?.skillName ?? 'n/a';
      const prov   = r?.provider ?? r?.aiProvider ?? '';
      console.log(`\n[${t.name}]`);
      console.log(`  IN  : ${t.input}`);
      console.log(`  OUT : (${skill}${prov?' via '+prov:''}, ${ms}ms) ${short(reply)}`);
    } catch (e) {
      console.log(`\n[${t.name}] ERROR: ${e.message}`);
    }
  }
  console.log('\n' + '='.repeat(90));
  process.exit(0);
})();
