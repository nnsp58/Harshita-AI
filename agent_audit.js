const fs = require('fs');
const path = require('path');

const agentsDir = path.join(process.cwd(), 'src', 'agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js'));

const report = {
  total: files.length,
  workable: 0,
  stub: 0,
  missingExecute: [],
  syntaxErrors: [],
  details: []
};

for (const file of files) {
  try {
    const filePath = path.join(agentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const size = fs.statSync(filePath).size;
    
    let isWorkable = true;
    let issues = [];

    if (size < 500) {
      isWorkable = false;
      issues.push('Likely a stub (very small file size)');
      report.stub++;
    }

    if (!content.includes('execute') && !content.includes('async function')) {
      isWorkable = false;
      issues.push('Missing execute() method');
      report.missingExecute.push(file);
    }

    if (isWorkable) {
      report.workable++;
    }

    report.details.push({
      agent: file,
      size: `${(size/1024).toFixed(2)} KB`,
      status: isWorkable ? '✅ Workable' : '❌ Needs Work',
      issues
    });

  } catch (e) {
    report.syntaxErrors.push({ file, error: e.message });
  }
}

console.log(JSON.stringify(report, null, 2));
