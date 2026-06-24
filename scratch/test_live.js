const axios = require('axios');

const urls = [
  'https://n-dizi.in/ads.txt',
  'https://n-dizi.in/privacy-policy.html',
  'https://n-dizi.in/terms.html',
  'https://n-dizi.in/disclaimer.html',
  'https://n-dizi.in/about.html'
];

async function checkUrls() {
  console.log('📡 Fetching live status for static pages...');
  for (const url of urls) {
    try {
      const response = await axios.get(url, { 
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`\n-----------------------------------------`);
      console.log(`🔗 URL: ${url}`);
      console.log(`🟢 STATUS: ${response.status}`);
      console.log(`📄 TYPE: ${response.headers['content-type']}`);
      
      const snippet = typeof response.data === 'string' 
        ? response.data.substring(0, 150).replace(/\r?\n|\r/g, ' ') 
        : JSON.stringify(response.data);
      console.log(`📝 CONTENT PREVIEW: "${snippet}..."`);
      
      // Verification logic:
      const isHtml = response.headers['content-type']?.includes('text/html');
      if (url.endsWith('.txt')) {
        if (isHtml) {
          console.log(`❌ FAIL: Text file served as HTML (SPA fallback issue)`);
        } else if (response.data.includes('google.com')) {
          console.log(`✅ PASS: Correct ads.txt format!`);
        } else {
          console.log(`❌ FAIL: Invalid ads.txt content`);
        }
      } else {
        if (response.data.includes('id="root"') || response.data.includes('SimpleDashboard')) {
          console.log(`❌ FAIL: HTML page returned SPA React fallback shell instead of static content`);
        } else {
          console.log(`✅ PASS: Correct static HTML content!`);
        }
      }
    } catch (error) {
      console.log(`\n-----------------------------------------`);
      console.log(`🔗 URL: ${url}`);
      console.log(`🔴 ERROR: ${error.message}`);
    }
  }
}

checkUrls();
