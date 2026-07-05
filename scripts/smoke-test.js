const http = require('http');
const assert = require('assert');

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const results = [];
let passed = 0;
let failed = 0;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    passed++;
    console.log(`✅ ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    failed++;
    console.log(`❌ ${name}: ${err.message}`);
  }
}

async function run() {
  console.log('🚀 Starting Smoke Tests...\n');

  await test('Health Check', async () => {
    const res = await request('GET', '/health');
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  await test('API Root', async () => {
    const res = await request('GET', '/');
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  });

  await test('Auth Login - Invalid', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'test@test.com', password: 'wrong' });
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  await test('Google Auth - Invalid Token', async () => {
    const res = await request('POST', '/api/auth/google', { token: 'invalid' });
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  await test('Chat History - No Auth', async () => {
    const res = await request('GET', '/api/auth/chat/history');
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  console.log('\n📊 Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${passed + failed}`);

  if (failed > 0) {
    console.log('\n❌ Smoke tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Smoke test runner error:', err);
  process.exit(1);
});
