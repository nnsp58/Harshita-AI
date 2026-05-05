// Test PDF text extraction with pdfjs-dist
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');

// Set worker source (required for pdfjs-dist in Node.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.min.js');

async function extractTextFromPDF(filePath) {
  console.log('📄 Extracting text from:', filePath);
  
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument(data).promise;
    console.log(`   PDF has ${pdf.numPages} page(s)`);
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
      console.log(`   Page ${i}: ${textContent.items.length} text items`);
    }
    
    console.log(`\n✅ Extracted ${fullText.length} characters`);
    console.log('Text preview (first 500 chars):');
    console.log(fullText.substring(0, 500));
    
    return fullText.trim();
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
}

const pdfPath = path.join(__dirname, 'uploads', 'resume.pdf');
extractTextFromPDF(pdfPath);
