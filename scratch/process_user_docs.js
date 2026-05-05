require('dotenv').config();
const { DocumentAIAgent } = require('../src/agents/documentAIAgent');
const path = require('path');
const fs = require('fs');

async function processDocs() {
  console.log('--- Starting Real Document Processing ---');
  
  const agent = new DocumentAIAgent();
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  // List of key documents to process
  const filesToProcess = [
    '10TH MARKSHEET.jpg',
    'MARK 12.jpg',
    'aadhaar_front.jpg'
  ];

  const results = [];

  for (const fileName of filesToProcess) {
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      console.log(`Processing: ${fileName}...`);
      try {
        const result = await agent.processDocument(filePath);
        results.push({ file: fileName, data: result });
        console.log(`Success: ${fileName} extracted.`);
      } catch (err) {
        console.error(`Error processing ${fileName}:`, err.message);
      }
    } else {
      console.warn(`File not found: ${fileName}`);
    }
  }

  // Merge results into a profile
  const profile = agent.mergeStructuredData(results.map(r => r.data));
  
  console.log('\n--- Final Extracted Profile ---');
  console.log(JSON.stringify(profile, null, 2));
  
  // Save to a temporary file for the frontend to pick up if needed
  fs.writeFileSync(path.join(__dirname, 'real_profile.json'), JSON.stringify(profile, null, 2));
}

processDocs().catch(console.error);
