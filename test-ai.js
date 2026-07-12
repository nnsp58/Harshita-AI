require('dotenv').config();
const { aiProviderManager } = require('./src/utils/aiProviderManager');

async function test() {
  try {
    console.log("Testing Groq with Tools...");
    const clientGroq = aiProviderManager.providers.get('groq');
    if (clientGroq) {
      try {
        await clientGroq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Hello' }],
          tools: [{ type: 'function', function: { name: 'test', description: 'test', parameters: { type: 'object', properties: { msg: { type: 'string' } } } } }],
          max_tokens: 10
        });
        console.log("✅ Groq SUCCESS");
      } catch (e) {
        console.log("❌ Groq Error:", e.message);
      }
    }

    console.log("Testing OpenAI...");
    const clientOpenAI = aiProviderManager.providers.get('openai');
    if (clientOpenAI) {
      try {
        await clientOpenAI.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        });
        console.log("✅ OpenAI SUCCESS");
      } catch (e) {
        console.log("❌ OpenAI Error:", e.message);
      }
    }

  } catch (err) {
    console.error("Fatal:", err);
  }
}

test();
