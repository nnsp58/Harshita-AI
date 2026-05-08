/**
 * Test UIBuilderAgent - Generate pages and code
 */
require('dotenv').config();
const { UIBuilderAgent } = require('./src/agents/uiBuilderAgent');

async function testUIBuilder() {
  const agent = new UIBuilderAgent();

  console.log('🎨 ========== UIBuilderAgent Test Suite ==========\n');

  // Test 1: List available page types
  console.log('📋 Test 1: Available Page Types');
  const types = agent.listPageTypes();
  console.log(types.message);

  // Test 2: Generate a landing page (template fallback if no AI key)
  console.log('\n🌐 Test 2: Generate Landing Page');
  const landingResult = await agent.execute({
    action: 'generate_page',
    prompt: 'CSC Digital Seva Kendra - Government Services at your doorstep',
    pageType: 'landing',
    data: {
      stat1: '5,000+',
      label1: 'VLE Centers',
      stat2: '99.2%',
      label2: 'Success Rate',
      stat3: '₹0',
      label3: 'AI Cost'
    }
  });
  console.log(landingResult.message);

  // Test 3: Generate a dashboard
  console.log('\n📊 Test 3: Generate Dashboard');
  const dashboardResult = await agent.execute({
    action: 'generate_page',
    prompt: 'Rawan AI Admin Dashboard with candidate stats, job progress, and agent health',
    pageType: 'dashboard'
  });
  console.log(dashboardResult.message);

  // Test 4: Generate code
  console.log('\n💻 Test 4: Generate JavaScript Code');
  const codeResult = await agent.execute({
    action: 'generate_code',
    prompt: 'Create a function that validates Indian Aadhaar number (12 digits with Verhoeff checksum)',
    options: { language: 'javascript' }
  });
  console.log(codeResult.message);

  // Test 5: List generated pages
  console.log('\n📁 Test 5: List Generated Pages');
  const listResult = agent.listGeneratedPages();
  console.log(listResult.message);
  if (listResult.pages.length > 0) {
    listResult.pages.forEach(p => {
      console.log(`  📄 ${p.fileName} (${p.size}) - ${p.created}`);
    });
  }

  console.log('\n✅ ========== All Tests Complete ==========');
}

testUIBuilder().catch(err => console.error('Test failed:', err));
