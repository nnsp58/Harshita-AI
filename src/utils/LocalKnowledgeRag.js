/**
 * LocalKnowledgeRag - Offline Retrieval Augmented Generation Layer
 *
 * Matches user prompts against local legal FAQs and rules before hitting APIs
 */

const LOCAL_KNOWLEDGE = [
  {
    keywords: ['cheque bounce', 'check bounce', 'चेक बाउंस', '138'],
    answer: `चेक बाउंस होने पर (Section 138 NI Act) कानूनी नियम:
1. चेक बाउंस होने के 30 दिनों के भीतर देनदार को कानूनी नोटिस (Legal Notice) भेजना अनिवार्य है।
2. नोटिस मिलने के बाद देनदार को भुगतान के लिए 15 दिनों का समय दिया जाता है।
3. यदि 15 दिनों में भुगतान नहीं होता, तो अगले 30 दिनों के भीतर कोर्ट में केस दर्ज कराया जा सकता है।`
  },
  {
    keywords: ['rent agreement', 'किराया नामा', 'kiraya', 'rent'],
    answer: `किराया अनुबंध (Rent Agreement) नियम:
1. 11 महीने से अधिक के किराया अनुबंध का रजिस्ट्रेशन कराना अनिवार्य है।
2. 11 महीने तक के समझौते के लिए ₹100 या ₹500 के स्टांप पेपर का उपयोग किया जा सकता है।
3. अनुबंध में सिक्योरिटी डिपॉजिट, किराया राशि, नोटिस पीरियड और मेंटेनेंस शर्तों का स्पष्ट उल्लेख होना चाहिए।`
  },
  {
    keywords: ['gst', 'जीएसटी', 'goods and services tax'],
    answer: `जीएसटी (GST - Goods and Services Tax):
1. भारत में एक एकल अप्रत्यक्ष कर (Single Indirect Tax) जो 1 जुलाई 2017 से लागू हुआ।
2. मुख्य दरें: 5%, 12%, 18%, और 28% हैं।
3. ₹40 लाख (सेवाओं के लिए ₹20 लाख) से अधिक के वार्षिक टर्नओवर वाले व्यवसायों के लिए रजिस्ट्रेशन आवश्यक है।`
  },
  {
    keywords: ['affidavit', 'शपथा', 'shapath', 'sworn'],
    answer: `शपथ पत्र (Affidavit):
1. यह एक व्यक्ति द्वारा स्वेच्छा से दी गई लिखित घोषणा या बयान है।
2. इसे नोटरी पब्लिक, ओथ कमिश्नर या मजिस्ट्रेट द्वारा सत्यापित किया जाना आवश्यक है।
3. गलत जानकारी देने पर आईपीसी धारा 193 के तहत कानूनी कार्रवाई की जा सकती है।`
  }
];

class LocalKnowledgeRag {
  constructor() {
    this.knowledge = LOCAL_KNOWLEDGE;
  }

  /**
   * Search query inside local knowledge base
   * @returns {string|null} Matches or null
   */
  search(query) {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();

    for (const item of this.knowledge) {
      const match = item.keywords.some(keyword => lowerQuery.includes(keyword));
      if (match) {
        return item.answer;
      }
    }
    return null;
  }
}

const localKnowledgeRag = new LocalKnowledgeRag();

module.exports = { LocalKnowledgeRag, localKnowledgeRag };
