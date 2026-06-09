const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Skill.js') && f !== 'BaseSkill.js');

files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const m1 = c.match(/canRunOffline\s*=\s*(true|false)/);
  const m2 = c.match(/displayName\s*=\s*['"](.+?)['"]/);
  const name = f.replace('Skill.js', '');
  console.log(name + ' | offline=' + (m1 ? m1[1] : '?') + ' | display=' + (m2 ? m2[1] : '?'));
});
