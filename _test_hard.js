require('dotenv').config();
const { MasterAgent } = require('./src/agents/masterAgent');

const TESTS = [
  { cat: 'Algebra',       q: 'bina quadratic formula ke x^2 - 11x + 30 = 0 solve karo' },
  { cat: 'Trigonometry',  q: 'yadi sin theta = 3/5 hai to sabhi trigonometric ratios batao' },
  { cat: 'Physics',       q: 'v^2 = u^2 + 2as ka derivation karo' },
  { cat: 'Chemistry',     q: '18 gram water me kitne molecules hote hain' },
  { cat: 'Land Measure',  q: 'plot ki front 22 ft, back 66 ft, left 55 ft, right 55 ft — area nikaal sakte ho? kya formula chahiye?' },
  { cat: 'Reasoning',     q: '3 aadmi 3 din me 3 deewar banate hain, to 9 aadmi 9 din me kitni deewar banayenge' }
];

function short(t, n=350){ if(!t) return '(empty)'; t=String(t).replace(/\s+/g,' ').trim(); return t.slice(0,n)+(t.length>n?'…':''); }

(async () => {
  const master = new MasterAgent(null);
  await new Promise(r => setTimeout(r, 1500));
  console.log(`Skills loaded: ${master.registry?.skills?.size}`);
  console.log('='.repeat(90));
  for (const t of TESTS) {
    try {
      const s = Date.now();
      const r = await master.processCommand('u1', t.q, { userId: 'u1' });
      const ms = Date.now()-s;
      console.log(`\n[${t.cat}]  (${r?.skill}, ${ms}ms)`);
      console.log(`  Q: ${t.q}`);
      console.log(`  A: ${short(r?.message)}`);
    } catch(e){ console.log(`\n[${t.cat}] ERROR: ${e.message}`); }
  }
  process.exit(0);
})();
