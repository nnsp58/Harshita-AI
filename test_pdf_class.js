// Check PDFParse class API
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function test() {
  const pdfPath = path.join(__dirname, 'uploads', 'resume.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse(dataBuffer);
    const data = await parser.parse();
    
    console.log('✅ PDF parsed with PDFParse class');
    console.log('Pages:', data.numpages);
    console.log('Text:', data.text);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
