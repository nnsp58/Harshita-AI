const fs = require('fs');
const { execSync } = require('child_process');

const logPath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\cae8bc0e-5325-47e0-9336-70404c1f5e4c\\.system_generated\\tasks\\task-199.log';
const logContent = fs.readFileSync(logPath, 'utf8');

const blobHashes = [];
const matches = logContent.matchAll(/dangling blob ([a-f0-9]+)/g);
for (const match of matches) {
  blobHashes.push(match[1]);
}

console.log(`Found ${blobHashes.length} dangling blobs to search.`);

for (const hash of blobHashes) {
  try {
    const content = execSync(`git cat-file -p ${hash}`, { encoding: 'utf8', cwd: 'd:\\Harshita-AI' });
    if (content.includes('generateTemplateDraft') && content.includes('STORAGE_KEY') && content.length > 20000) {
      console.log(`MATCH FOUND! Blob Hash: ${hash}, Length: ${content.length}`);
      fs.writeFileSync('d:\\Harshita-AI\\frontend\\src\\pages\\LegalDraft.jsx', content, 'utf8');
      console.log('Successfully restored file from dangling blob!');
      break;
    }
  } catch (e) {
    // Ignore cat-file errors
  }
}
