// Test pdf-parse correctly
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function test() {
  const pdfPath = path.join(__dirname, 'uploads', 'resume.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log('✅ PDF parsed successfully');
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('PDF info:', data.info);
    console.log('\nText content:');
    console.log(data.text);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }
}

test();
