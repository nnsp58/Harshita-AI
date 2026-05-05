// Test PDF extraction
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function testPDF() {
  const pdfPath = path.join(__dirname, 'uploads', 'resume.pdf');
  
  console.log('Testing PDF extraction with pdf-parse...');
  console.log('File:', pdfPath);
  console.log('Exists:', fs.existsSync(pdfPath));
  console.log('Size:', fs.statSync(pdfPath).size, 'bytes');
  
  try {
    const data = fs.readFileSync(pdfPath);
    const result = await pdfParse(data);
    
    console.log('\n✅ PDF Parsed Successfully');
    console.log('Pages:', result.numpages);
    console.log('Text length:', result.info.text.length);
    console.log('Text preview:');
    console.log(result.info.text.substring(0, 500));
  } catch (err) {
    console.error('\n❌ PDF parsing failed:', err.message);
    console.error('Stack:', err.stack);
  }
}

testPDF();
