// scripts/verify-routes.js
process.env.PORT = 4099;
process.env.NODE_ENV = 'test';
process.env.QUIET_STARTUP = '1';

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ensure the local build folder frontend/dist exists
const distPath = path.resolve(__dirname, '../frontend/dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory "frontend/dist" not found! Run "npm run build" in frontend first.');
  process.exit(1);
}

console.log('🚀 Starting Express Server on test port 4099...');

// Import and start server
const { server } = require('../src/api/server.js');

// Helper to delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  // Wait for database connection attempts to timeout/resolve and server to bind
  console.log('⏳ Waiting 3 seconds for server initialization...');
  await sleep(3000);

  const results = [];
  let testsPassed = true;

  const testCases = [
    {
      route: '/',
      expectedType: 'text/html',
      description: 'Public Homepage (SPA index)',
      check: (data, headers) => {
        return data.includes('<div id="root">') && data.includes('/assets/index-');
      }
    },
    {
      route: '/ads.txt',
      expectedType: 'text/plain',
      description: 'ads.txt Authorized Sellers File',
      check: (data, headers) => {
        return data.includes('google.com') && data.includes('pub-9239182778221521') && !data.includes('<!doctype html>');
      }
    },
    {
      route: '/privacy-policy.html',
      expectedType: 'text/html',
      description: 'Static Privacy Policy Page',
      check: (data, headers) => {
        return data.includes('<title>Privacy Policy') && !data.includes('<div id="root">') && data.includes('ToolHub (n-dizi.in)');
      }
    },
    {
      route: '/terms.html',
      expectedType: 'text/html',
      description: 'Static Terms of Service Page',
      check: (data, headers) => {
        return data.includes('<title>Terms of Service') && !data.includes('<div id="root">');
      }
    },
    {
      route: '/sitemap.xml',
      expectedType: 'application/xml',
      description: 'XML Sitemap Configuration',
      check: (data, headers) => {
        return data.includes('<urlset') && data.includes('privacy-policy.html') && !data.includes('/dashboard');
      }
    },
    {
      route: '/login',
      expectedType: 'text/html',
      description: 'Unprotected SPA Route (SPA index fallback)',
      check: (data, headers) => {
        return data.includes('<div id="root">') && data.includes('/assets/index-');
      }
    }
  ];

  console.log('\n🧪 Running Route Validation Tests...');

  for (const tc of testCases) {
    try {
      const res = await axios.get(`http://localhost:4099${tc.route}`, { timeout: 3500 });
      const contentType = res.headers['content-type'] || '';
      const typeMatches = contentType.includes(tc.expectedType);
      const logicMatches = tc.check(res.data, res.headers);
      
      const passed = typeMatches && logicMatches;
      if (!passed) testsPassed = false;

      results.push({
        route: tc.route,
        description: tc.description,
        statusCode: res.status,
        contentType,
        typeMatches,
        logicMatches,
        status: passed ? 'PASS' : 'FAIL'
      });
    } catch (err) {
      testsPassed = false;
      results.push({
        route: tc.route,
        description: tc.description,
        error: err.message,
        status: 'FAIL'
      });
    }
  }

  console.log('\n📊 TEST RESULTS TABLE:');
  console.log('-------------------------------------------------------------------------------------------------------');
  console.log('Route'.padEnd(25) + ' | ' + 'Description'.padEnd(35) + ' | ' + 'Status'.padEnd(10) + ' | ' + 'Details');
  console.log('-------------------------------------------------------------------------------------------------------');
  
  for (const r of results) {
    const routeStr = r.route.padEnd(25);
    const descStr = r.description.padEnd(35);
    const statusStr = (r.status === 'PASS' ? '🟢 PASS' : '🔴 FAIL').padEnd(10);
    const details = r.error ? `Error: ${r.error}` : `HTTP ${r.statusCode} | Content-Type: ${r.contentType.split(';')[0]}`;
    console.log(`${routeStr} | ${descStr} | ${statusStr} | ${details}`);
  }
  console.log('-------------------------------------------------------------------------------------------------------');

  // Tear down server
  console.log('\n🛑 Tearing down local server...');
  server.close(() => {
    console.log('👋 Local server stopped.');
    process.exit(testsPassed ? 0 : 1);
  });
}

runTests();
