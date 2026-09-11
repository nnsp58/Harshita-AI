const { MasterAgent } = require('./src/agents/masterAgent');

async function runTests() {
  const master = new MasterAgent();
  // Wait a moment for ready
  await new Promise(r => setTimeout(r, 1000));

  const tests = [
    { id: 1, text: 'hello', lang: 'en' },
    { id: 2, text: 'I need to create an affidavit.', lang: 'en' },
    { id: 3, text: 'Create a police complaint and give me the final PDF.', lang: 'en' },
    { id: 4, text: 'I need to divide my land equally between three brothers.', lang: 'en' },
    { id: 5, text: 'Read this document, extract the required information and create an application.', lang: 'en' },
    { id: 6, text: 'I need to file my ITR.', lang: 'en' },
    { id: 7, text: 'Create a cartoon video for me.', lang: 'en' },
    { id: 8, text: 'Translate hello into Hindi.', lang: 'en' },
    { id: 9, text: 'Gautam Chaudhary s/o Pankaj Vill Post Sikhera Tehsil Bulandshahr District Bulandshahr. 26 August 2026 ko mere ghar se mera carry bag jisme kuch jaruri documents aur Poco M3 phone tha le gaya. Main us waqt sharab ke nashe me tha. Usne mere ghar par sharab pi thi. Mera naam Nar Narayan Singh s/o Shri Meer Singh Vill Post Sikhera District Bulandshahr PIN 203002.', lang: 'hi' }
  ];

  for (const t of tests) {
    console.log(`\n=================== TEST ${t.id} ===================`);
    console.log(`INPUT: "${t.text.substring(0, 70)}..."`);
    try {
      const res = await master.handleCommand('test_user', t.text, { lang: t.lang });
      console.log(`SKILL: ${res.skill}`);
      console.log(`RESPONSE_TYPE: ${res.responseType || res.type}`);
      console.log(`ACTION: ${res.action ? JSON.stringify(res.action) : 'none'}`);
      console.log(`SNIPPET: ${(res.message || '').substring(0, 150).replace(/\n/g, ' ')}`);
      if (res.data && res.data.trace) {
        console.log(`CONFERENCE TRACE: ${JSON.stringify(res.data.trace)}`);
      }
    } catch(err) {
      console.error(`ERROR: ${err.message}`);
    }
  }
  process.exit(0);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
