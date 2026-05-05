// Test name parsing
function parseName(fullName) {
  if (!fullName) return { firstName: '', middleName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  } else if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  } else {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleName = parts.slice(1, -1).join(' ');
    return { firstName, middleName, lastName };
  }
}

function testParseName() {
  const cases = [
    { input: 'NAR NARAYAN SINGH', expected: { firstName: 'NAR', middleName: 'NARAYAN', lastName: 'SINGH' } },
    { input: 'ALICE', expected: { firstName: 'ALICE', middleName: '', lastName: '' } },
    { input: 'BOB SMITH', expected: { firstName: 'BOB', middleName: '', lastName: 'SMITH' } },
    { input: 'JOHN DOE JR', expected: { firstName: 'JOHN', middleName: 'DOE', lastName: 'JR' } },
    { input: '  leading and trailing  ', expected: { firstName: 'leading', middleName: 'and', lastName: 'trailing' } }
  ];

  let passed = 0, failed = 0;
  for (const tc of cases) {
    const result = parseName(tc.input);
    const ok = result.firstName === tc.expected.firstName &&
               result.middleName === tc.expected.middleName &&
               result.lastName === tc.expected.lastName;
    if (ok) {
      passed++;
      console.log(`✅ "${tc.input}" ->`, result);
    } else {
      failed++;
      console.log(`❌ "${tc.input}" expected`, tc.expected, 'got', result);
    }
  }
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
}

testParseName();
