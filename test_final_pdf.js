// Test updated DocumentAIAgent PDF extraction
const { DocumentAIAgent } = require('./src/agents/documentAIAgent');

async function test() {
  const agent = new DocumentAIAgent();
  
  console.log('=== Testing PDF extraction with resume.pdf ===\n');
  const result = await agent.extractTextFromPDF('uploads/resume.pdf');
  
  console.log('\n=== Result ===');
  console.log('Confidence:', result.confidence);
  console.log('Text length:', result.text.length);
  console.log('\nExtracted text:');
  console.log(result.text);
}

test().catch(console.error);
