require('dotenv').config();
const { MasterAgent } = require('./src/agents/masterAgent');

const TESTS = [
  // ── Algebra
  { cat:'Algebra',  q:'bina quadratic formula ke x^2 - 11x + 30 = 0 solve karo' },
  { cat:'Algebra',  q:'yadi a+b=10 aur ab=21 to a^3 + b^3 nikalo' },
  { cat:'Algebra',  q:'(a+b+c)^2 ka poora vistar likho aur siddh karo' },
  // ── Trigonometry
  { cat:'Trig',     q:'siddh karo: sinA / (1 - cosA) = (1 + cosA) / sinA' },
  { cat:'Trig',     q:'yadi sin theta = 3/5 to sabhi trigonometric ratios nikalo' },
  { cat:'Trig',     q:'ek tower ki height nikalo yadi 50 m door se elevation angle 60 degree hai' },
  // ── Geometry
  { cat:'Geom',     q:'Brahmagupta Formula kab lagoo hoti hai aur kab nahi' },
  { cat:'Geom',     q:'kewal char bhujaon se area kab nahi nikala ja sakta' },
  // ── Mensuration
  { cat:'Mens',     q:'Frustum ka volume siddh karo' },
  { cat:'Mens',     q:'Hemisphere aur Sphere me antar batao' },
  // ── Physics
  { cat:'Phys',     q:'v^2 = u^2 + 2as derive karo' },
  { cat:'Phys',     q:'Free Fall aur Projectile Motion me antar batao' },
  { cat:'Phys',     q:'Rocket antariksh me kaise chalta hai jab piche hawa nahi hoti' },
  { cat:'Phys',     q:'yadi 3 ohm, 6 ohm aur 9 ohm parallel hain to kul resistance nikalo' },
  { cat:'Phys',     q:'Transformer DC par kyu nahi chalta' },
  // ── Chemistry
  { cat:'Chem',     q:'18 gram water me kitne molecules hote hain' },
  { cat:'Chem',     q:'pH 3 aur pH 5 me kitni guna amliyata ka antar hai' },
  // ── Reasoning
  { cat:'Reason',   q:'3 aadmi 3 din me 3 deewar banate hain to 9 aadmi 9 din me kitni deewar banayenge' },
  { cat:'Reason',   q:'ghadi 3:15 dikha rahi hai to ghante aur minute ki sui me kitna kon banega' },
  // ── Land
  { cat:'Land',     q:'plot: front 22 ft, back 66 ft, left 55 ft, right 55 ft — area nikalo ya batao kya extra chahiye' }
];

function grade(q, a){
  a = String(a || '').toLowerCase();
  const patterns = {
    'bina quadratic': /x\s*=\s*5.*x\s*=\s*6|x\s*=\s*6.*x\s*=\s*5|\(x-5\).*\(x-6\)/i,
    'a\\^3 \\+ b\\^3': /370|a\^3\s*\+\s*b\^3\s*=\s*370/,
    '\\(a\\+b\\+c\\)': /a\^2.*b\^2.*c\^2.*2ab.*2bc.*2ac|2ab.*2bc.*2ca/,
    'sina.*1.*cosa': /(siddh|prove|proved|equal|barabar|identity)/,
    'sin theta = 3/5': /(cos.*4\/5|tan.*3\/4)/,
    'elevation angle 60': /(86\.6|50.*root|50.*sqrt|50√3|86)/,
    'brahmagupta': /(cyclic|chakriya|s-a.*s-b|semi.?perimeter)/,
    'char bhujaon': /(unique|nahin|nahi|diagonal|angle)/,
    'frustum': /(1\/3|pi.*h.*r1|R\^2\s*\+\s*r\^2)/,
    'hemisphere': /(aadha|half|2\/3|4\/3)/,
    'v\\^2 = u\\^2': /(2as|derive|integr|newton|equation)/,
    'free fall': /(gravity|horizontal|parabol|projectile)/,
    'rocket': /(newton.*third|action.*reaction|momentum|conservation)/,
    '3 ohm, 6 ohm': /(1\.63|18\/11|1\.636)/,
    'transformer': /(alternating|ac|changing|flux|dc)/,
    '18 gram water': /6\.022\s*[x×]?\s*10\^?23|avogadro/,
    'ph 3 aur ph 5': /100|10\^2|two\s*orders|100\s*guna/,
    '3 aadmi 3 din': /27\s*(deewar|walls|deewaar)/,
    'ghadi 3:15': /7\.5|7½|7\s*1\/2/,
    'front 22': /(diagonal|nahi.*nikal|impossible|extra.*chahiye|angle|need.*more)/
  };
  for (const [k,rx] of Object.entries(patterns)) {
    if (new RegExp(k,'i').test(q)) return rx.test(a) ? 'PASS' : 'FAIL';
  }
  return '?';
}

function short(t, n=280){ if(!t) return '(empty)'; t=String(t).replace(/\s+/g,' ').trim(); return t.slice(0,n)+(t.length>n?'…':''); }

(async () => {
  const master = new MasterAgent(null);
  await new Promise(r => setTimeout(r, 1500));
  console.log(`Skills loaded: ${master.registry?.skills?.size}`);
  console.log('='.repeat(90));
  const results = [];
  for (const t of TESTS) {
    try {
      const s = Date.now();
      const r = await master.processCommand('u1', t.q, { userId: 'u1' });
      const ms = Date.now()-s;
      const skill = r?.skill || 'n/a';
      const ans = r?.message || '';
      const verdict = grade(t.q, ans);
      results.push({ cat:t.cat, verdict, skill, q:t.q, ans });
      console.log(`\n[${t.cat}] ${verdict}  (skill:${skill}, ${ms}ms)`);
      console.log(`  Q: ${t.q}`);
      console.log(`  A: ${short(ans)}`);
    } catch(e){ console.log(`\n[${t.cat}] ERROR: ${e.message}`); results.push({cat:t.cat, verdict:'ERR'}); }
  }
  console.log('\n' + '='.repeat(90));
  console.log('SUMMARY');
  const pass = results.filter(r=>r.verdict==='PASS').length;
  const fail = results.filter(r=>r.verdict==='FAIL').length;
  const other = results.length - pass - fail;
  console.log(`Total: ${results.length}  PASS: ${pass}  FAIL: ${fail}  UNGRADED: ${other}`);
  console.log('\nBy category:');
  const byCat = {};
  results.forEach(r => { byCat[r.cat] = byCat[r.cat] || {pass:0,fail:0}; byCat[r.cat][r.verdict==='PASS'?'pass':'fail']++; });
  Object.entries(byCat).forEach(([c,v]) => console.log(`  ${c}: ${v.pass}/${v.pass+v.fail}`));
  process.exit(0);
})();
