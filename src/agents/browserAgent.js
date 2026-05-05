const { chromium } = require('playwright');

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

async function runBrowserTask(formUrl = 'https://www.w3schools.com/html/html_forms.asp', userData) {
  let browser = null;
  
  try {
    if (!userData) {
      userData = require('../data/userData.json');
    }

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setDefaultTimeout(30000);

    console.log(`🌐 Opening form: ${formUrl}`);
    await page.goto(formUrl);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await page.waitForSelector('input, select, textarea', { timeout: 15000 }).catch(() => {});
    const elements = await page.$$('input, select, textarea');
    const totalElements = elements.length;
    console.log(`📋 Found ${totalElements} form elements`);

    if (totalElements === 0) {
      console.log('⚠️ No form elements found');
      return { success: false, message: 'No form elements found on page' };
    }

    const gender = normalizeGender(userData.personal?.gender);
    const marital = normalizeMarital(userData.personal?.maritalStatus);
    const category = normalizeCategory(userData.personal?.category);

    const parsedName = parseName(userData.personal?.fullName);
    const personal = {
      ...userData.personal,
      firstName: userData.personal?.firstName || parsedName.firstName,
      middleName: userData.personal?.middleName || parsedName.middleName,
      lastName: userData.personal?.lastName || parsedName.lastName,
    };

    for (let el of elements) {
      const name = (await el.getAttribute('name')) || '';
      const type = (await el.getAttribute('type')) || '';
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const placeholder = (await el.getAttribute('placeholder')) || '';
      const id = (await el.getAttribute('id')) || '';
      const field = (name + ' ' + placeholder + ' ' + id).toLowerCase();

      try {
        if (field.includes('name') && field.includes('full')) {
          await el.fill(safe(personal.fullName));
        } else if (field.includes('first') && field.includes('name')) {
          await el.fill(safe(personal.firstName));
        } else if (field.includes('middle') && field.includes('name')) {
          await el.fill(safe(personal.middleName));
        } else if (field.includes('second') && field.includes('name')) {
          await el.fill(safe(personal.middleName));
        } else if (field.includes('last') && field.includes('name')) {
          await el.fill(safe(personal.lastName));
        } else if (field.includes('name')) {
          await el.fill(safe(personal.fullName));
        } else if (field.includes('father')) {
          await el.fill(safe(personal.fatherName));
        } else if (field.includes('mother')) {
          await el.fill(safe(personal.motherName));
        } else if (field.includes('email')) {
          await el.fill(safe(userData.contact?.email));
        } else if (field.includes('phone') || field.includes('mobile')) {
          await el.fill(safe(userData.contact?.phone));
        } else if (field.includes('gender') || field.includes('sex')) {
          if (type === 'radio') {
            const val = ((await el.getAttribute('value')) || '').toLowerCase();
            if (val.includes(gender) || (gender === 'male' && val.includes('m')) || (gender === 'female' && val.includes('f'))) {
              await el.check();
            }
          } else if (tag === 'select') {
            await el.selectOption({ label: gender });
          }
        } else if (field.includes('marital') || field.includes('status')) {
          if (type === 'radio') {
            const val = ((await el.getAttribute('value')) || '').toLowerCase();
            if (val.includes(marital)) await el.check();
          } else if (tag === 'select') {
            await el.selectOption({ label: marital });
          }
        } else if (field.includes('category') || field.includes('caste')) {
          if (type === 'radio') {
            const val = ((await el.getAttribute('value')) || '').toLowerCase();
            if (val.includes(category)) await el.check();
          } else if (tag === 'select') {
            await el.selectOption({ label: category });
          }
        } else if (field.includes('dob') || field.includes('birth') || field.includes('date')) {
          await el.fill(safe(userData.personal?.dob));
        } else if (field.includes('address') && field.includes('line1')) {
          await el.fill(safe(userData.address?.line1));
        } else if (field.includes('address') && field.includes('line2')) {
          await el.fill(safe(userData.address?.line2));
        } else if (field.includes('city')) {
          await el.fill(safe(userData.address?.city));
        } else if (field.includes('district')) {
          await el.fill(safe(userData.address?.district));
        } else if (field.includes('state')) {
          await el.fill(safe(userData.address?.state));
        } else if (field.includes('pin') || field.includes('zip')) {
          await el.fill(safe(userData.address?.pincode));
        } else if (field.includes('aadhaar') || field.includes('aadhar')) {
          await el.fill(safe(userData.documents?.aadhaar));
        } else if (field.includes('pan')) {
          await el.fill(safe(userData.documents?.pan));
        } else if (field.includes('voter') || field.includes('vid')) {
          await el.fill(safe(userData.documents?.voterId));
        }
      } catch (e) {}
    }

    let filledCount = 0;
    for (let el of elements) {
      const wasFilled = await el.evaluate(e => {
        if (e.tagName.toLowerCase() === 'input' && (e.type === 'checkbox' || e.type === 'radio')) {
          return e.checked;
        }
        return e.value && e.value.length > 0;
      });
      if (wasFilled) filledCount++;
    }
    console.log(`✅ Filled ${filledCount}/${totalElements} fields`);

    await page.waitForTimeout(5000);

    return { 
      success: true, 
      message: `Form filled with ${filledCount}/${totalElements} fields. Please review and submit.`,
      requiresManualStep: true, 
      manualStepReason: 'form_review',
      filledFields: filledCount,
      totalFields: totalElements
    };
  } catch (error) {
    console.error('❌ Browser error:', error.message);
    if (browser) await browser.close().catch(() => {});
    return { success: false, message: error.message };
  }
}

module.exports = { runBrowserTask };