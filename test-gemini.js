const fetch = require('node-fetch');
require('dotenv').config();

async function testGemini() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'hello' }]
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}
testGemini();
