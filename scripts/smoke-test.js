const { spawn } = require('child_process');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;
const API_URL = `${BASE_URL}/api`;
const EMAIL = process.env.SMOKE_EMAIL || 'vle@example.com';
const PASSWORD = process.env.SMOKE_PASSWORD || 'vle123456';

const steps = [];
let serverProcess = null;
let createdJobId = null;

function record(name, ok, detail = '') {
  steps.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${name}${detail ? ` - ${detail}` : ''}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestWithRetry(fn, retries = 70, delayMs = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await sleep(delayMs);
    }
  }
  throw lastError;
}

function startServerIfNeeded() {
  if (process.env.SMOKE_EXTERNAL_SERVER === '1') return;

  serverProcess = spawn(process.execPath, ['src/api/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      REDIS_ENABLED: process.env.REDIS_ENABLED || 'false',
      QUIET_STARTUP: process.env.QUIET_STARTUP || '1',
      DEBUG_AUTH: process.env.DEBUG_AUTH || '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', data => {
    if (process.env.SMOKE_VERBOSE === '1') process.stdout.write(data);
  });

  serverProcess.stderr.on('data', data => {
    if (process.env.SMOKE_VERBOSE === '1') process.stderr.write(data);
  });
}

async function main() {
  startServerIfNeeded();
  const prisma = new PrismaClient();

  try {
    const health = await requestWithRetry(() => axios.get(`${BASE_URL}/health`, { timeout: 3000 }));
    record('health endpoint', health.data?.status === 'healthy', `network=${health.data?.network?.online}`);

    const apiInfo = await axios.get(API_URL);
    record('api info endpoint', apiInfo.data?.name === 'CSC Automation API');

    const login = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    const token = login.data?.data?.token;
    record('login', Boolean(token), EMAIL);

    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const me = await axios.get(`${API_URL}/auth/me`, auth);
    record('auth/me', me.data?.success === true, me.data?.data?.email);

    const candidates = await axios.get(`${API_URL}/candidate`, auth);
    const candidate = candidates.data?.data?.[0];
    record('candidate list', Array.isArray(candidates.data?.data), `${candidates.data?.data?.length || 0} candidate(s)`);

    const documents = await axios.get(`${API_URL}/document`, auth);
    record('document list', Array.isArray(documents.data?.data), `${documents.data?.data?.length || 0} document(s)`);

    const stats = await axios.get(`${API_URL}/job/stats/overview`, auth);
    record('job stats', stats.data?.success === true, `total=${stats.data?.data?.total ?? 0}`);

    if (!candidate) {
      throw new Error('No seeded candidate found. Run npm run db:seed first.');
    }

    const job = await axios.post(`${API_URL}/job`, {
      candidate_id: candidate.id,
      service_type: 'ssc',
      priority: 1,
      notes: 'Automated smoke test job'
    }, auth);
    record('create ssc job', job.data?.success === true, job.data?.data?.id);
    createdJobId = job.data?.data?.id;

    const jobList = await axios.get(`${API_URL}/job`, auth);
    record('job list', Array.isArray(jobList.data?.data), `${jobList.data?.data?.length || 0} job(s)`);

    const cscDashboard = await axios.get(`${API_URL}/csc/dashboard`, auth);
    record('csc dashboard', cscDashboard.data?.success === true);
  } finally {
    if (createdJobId) {
      await prisma.job.delete({ where: { id: createdJobId } }).catch(() => {});
    }
    await prisma.$disconnect().catch(() => {});

    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  }

  const failed = steps.filter(step => !step.ok);
  if (failed.length) {
    console.error(`\nSmoke test failed: ${failed.length} step(s) failed.`);
    process.exit(1);
  }

  console.log(`\nSmoke test passed: ${steps.length} checks.`);
}

main().catch(error => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  console.error('\nSmoke test error:', error.response?.data || error.message || error.code || error);
  process.exit(1);
});
