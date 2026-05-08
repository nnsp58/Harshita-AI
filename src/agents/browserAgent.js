const { chromium } = require('playwright');
const { SelectorDiscoveryAgent } = require('./selectorDiscoveryAgent');

function safe(v) {
  return v ? String(v) : '';
}

/**
 * Split full name into components.
 * Handles typical Indian names: "NAR NARAYAN SINGH" -> {firstName: "NAR", middleName: "NARAYAN", lastName: "SINGH"}
 */
function parseName(fullName) {
  if (!fullName) return { firstName: '', middleName: '', lastName: '' };

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  } else if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  } else {
    // 3+ parts: first, all middle, last
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleName = parts.slice(1, -1).join(' ');
    return { firstName, middleName, lastName };
  }
}

function normalizeGender(g) {
  if (!g) return '';
  g = g.toLowerCase();
  if (g.includes('male')) return 'male';
  if (g.includes('female')) return 'female';
  if (g.includes('trans') || g.includes('other') || g.includes('third')) return 'transgender';
  return g;
}

function normalizeMarital(m) {
  if (!m) return '';
  m = m.toLowerCase();
  if (m.includes('single')) return 'single';
  if (m.includes('married')) return 'married';
  if (m.includes('divorce')) return 'divorced';
  if (m.includes('widow')) return 'widowed';
  return m;
}

function normalizeCategory(c) {
  if (!c) return '';
  c = c.toLowerCase();
  if (c.includes('gen')) return 'general';
  if (c.includes('obc')) return 'obc';
  if (c.includes('sc')) return 'sc';
  if (c.includes('st')) return 'st';
  return c;
}

async function runBrowserTask(formUrl = 'https://www.w3schools.com/html/html_forms.asp', userData, options = {}) {
  let browser = null;
  const discoveryAgent = new SelectorDiscoveryAgent();
  
  const log = (msg) => {
    console.log(msg);
    if (options.onLog) options.onLog({ type: 'ai', message: msg });
  };

  const updateStatus = (task, status) => {
    if (options.onStatusUpdate) options.onStatusUpdate({ name: task, status });
  };

  try {
    if (!userData) {
      userData = require('../data/userData.json');
    }

    updateStatus('Launching Browser', 'Starting');
    browser = await chromium.launch({ headless: false }); // Show browser for review
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setDefaultTimeout(30000);

    log(`🌐 Opening form: ${formUrl}`);
    updateStatus('Loading Portal', 'Navigating');
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle').catch(() => {});

    // 1. Scan for interactive elements with their labels
    updateStatus('Scanning Form', 'Analyzing DOM');
    const elementsData = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(el => {
        let labelText = '';
        if (el.id) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label) labelText = label.innerText;
        }
        if (!labelText) {
          const parentLabel = el.closest('label');
          if (parentLabel) labelText = parentLabel.innerText;
        }

        return {
          id: el.id,
          name: el.name,
          type: el.type,
          placeholder: el.placeholder,
          label: labelText,
          ariaLabel: el.getAttribute('aria-label'),
          selector: el.id ? `#${el.id}` : (el.name ? `input[name="${el.name}"]` : '')
        };
      }).filter(el => el.selector);
    });

    // 2. Discover mappings autonomously
    updateStatus('AI Selector Discovery', 'Discovering Fields');
    const requiredFields = ['firstName', 'lastName', 'fullName', 'dob', 'gender', 'aadhaar', 'mobile', 'email', 'fatherName'];
    const mappings = await discoveryAgent.discoverSelectors(elementsData, requiredFields);
    log(`🧠 Harshita AI Discovered Mappings: ${Object.keys(mappings).join(', ')}`);

    // 3. Fill the form based on discovered mappings
    updateStatus('Filling Form', 'Applying Data');
    const parsedName = parseName(userData.personal?.fullName);
    const flatData = {
      firstName: userData.personal?.firstName || parsedName.firstName,
      lastName: userData.personal?.lastName || parsedName.lastName,
      fullName: userData.personal?.fullName,
      dob: userData.personal?.dob,
      gender: userData.personal?.gender,
      aadhaar: userData.documents?.aadhaar,
      mobile: userData.contact?.phone,
      email: userData.contact?.email,
      fatherName: userData.personal?.fatherName
    };

    let filledCount = 0;
    for (const [field, selector] of Object.entries(mappings)) {
      const value = flatData[field];
      if (value && selector) {
        try {
          const exists = await page.$(selector);
          if (exists) {
            await page.fill(selector, String(value));
            filledCount++;
            log(`✅ Filled ${field} -> ${selector}`);
          }
        } catch (e) {
          console.error(`⚠️ Failed to fill ${field}:`, e.message);
        }
      }
    }

    log(`✅ Completed: Filled ${filledCount} fields autonomously`);
    updateStatus('Final Review', 'Waiting for User');
    await page.waitForTimeout(5000);

    return { 
      success: true, 
      message: `Autonomous discovery completed. Filled ${filledCount} fields.`,
      mappings
    };
  } catch (error) {
    log(`❌ Browser error: ${error.message}`);
    updateStatus('Error', error.message);
    // if (browser) await browser.close().catch(() => {});
    return { success: false, message: error.message };
  }
}

module.exports = { runBrowserTask };