const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\cae8bc0e-5325-47e0-9336-70404c1f5e4c\\.system_generated\\logs\\transcript.jsonl';
const targetPath = 'd:\\Harshita-AI\\src\\api\\server.js';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  const step = JSON.parse(line);
  if (step.type === 'VIEW_FILE' && step.content && step.content.includes('Total Lines: 597')) {
    console.log('Found the viewed file content at step:', step.step_index);
    // Parse the file content from step.content
    // The content looks like:
    // "Created At: ...\nFile Path: ...\nTotal Lines: 680\n... Showing lines 1 to 680\n1: ...\n2: ..."
    const contentLines = step.content.split('\n');
    const codeLines = [];
    
    for (const cl of contentLines) {
      const match = cl.match(/^\s*(\d+):\s*(.*)/);
      if (match) {
        // Remove \r if present
        codeLines.push(match[2].replace(/\r$/, ''));
      }
    }
    
    if (codeLines.length > 0) {
      const fullCode = codeLines.join('\n');
      fs.writeFileSync(targetPath, fullCode, 'utf8');
      console.log(`Successfully restored ${codeLines.length} lines of code to ${targetPath}`);
      break;
    }
  }
}
