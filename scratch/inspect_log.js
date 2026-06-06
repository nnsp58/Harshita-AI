const fs = require('fs');

const logPath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\cae8bc0e-5325-47e0-9336-70404c1f5e4c\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  const step = JSON.parse(line);
  if (step.step_index === 41 || (step.type === 'VIEW_FILE' && step.content && step.content.includes('Total Lines: 680'))) {
    console.log('Step Index:', step.step_index);
    console.log('Content Length:', step.content.length);
    console.log('Snippet Start:\n', step.content.substring(0, 1000));
    console.log('\n-------------------\nSnippet End:\n', step.content.substring(step.content.length - 1000));
  }
}
