const express = require('express');
const router = express.Router();
const { aiProviderManager } = require('../../utils/aiProviderManager');

router.post('/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Text and targetLang are required' });
  }
  
  const LANGUAGES = {
    'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French',
    'de': 'German', 'zh': 'Chinese', 'ja': 'Japanese', 'ru': 'Russian',
    'ar': 'Arabic', 'pt': 'Portuguese', 'bn': 'Bengali', 'ur': 'Urdu'
  };
  
  const fromName = sourceLang && LANGUAGES[sourceLang] ? LANGUAGES[sourceLang] : 'auto-detect';
  const toName = LANGUAGES[targetLang] || targetLang;

  try {
    const prompt = `You are a professional universal translator. Translate the following text from ${fromName} to ${toName}. 
CRITICAL RULE: Return ONLY the translated text. Do not add explanations, conversational text, or prefixes like "[English]". Keep the original formatting if possible.

Text to translate:
${text}`;
    
    // Choose an AI provider. E.g., 'LanguageSkill' or 'groq'
    let client = aiProviderManager.getClient('LanguageSkill');
    let model = aiProviderManager.getModel('LanguageSkill');
    
    if (!client) {
      client = aiProviderManager.getClient('groq') || aiProviderManager.getClient('gemini');
      model = aiProviderManager.getModel('groq') || 'gemini-1.5-flash';
    }
    
    if (!client) {
       return res.status(503).json({ error: 'No AI providers available' });
    }
    
    const response = await client.chat.completions.create({
      model: model || 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000
    });
    
    const translatedText = response.choices[0].message.content.trim();
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
