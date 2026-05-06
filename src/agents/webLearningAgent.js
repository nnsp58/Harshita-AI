/**
 * WebLearningAgent - Fetches and learns from trusted web sources
 *
 * Rules:
 * - Use only trusted domains
 * - Summarize data using AI
 * - Do not store raw HTML
 * - Validate before saving
 */

const axios = require('axios');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { KnowledgeStore } = require('../core/knowledgeStore');

class WebLearningAgent {
  constructor() {
    this.knowledgeStore = new KnowledgeStore();

    // Trusted domains for learning
    this.trustedDomains = [
      'gov.in',
      'nic.in',
      'india.gov.in',
      'digitalindia.gov.in',
      'meity.gov.in',
      'csc.gov.in',
      'up.gov.in',
      'bihar.gov.in',
      'rajasthan.gov.in',
      'mp.gov.in',
      'uidai.gov.in',
      'epfindia.gov.in',
      'esic.in',
      'cbse.gov.in',
      'nta.ac.in',
      'indianrailways.gov.in',
      'irctc.co.in',
      'ssc.nic.in',
      'rrb.gov.in'
    ];

    this.userAgent = 'HARSHITA-Learning-Agent/1.0 (Educational Research)';
  }

  /**
   * Check if domain is trusted
   */
  _isTrustedDomain(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return this.trustedDomains.some(trusted => domain.endsWith(trusted));
    } catch (error) {
      return false;
    }
  }

  /**
   * Learn from a specific URL
   */
  async learnFromUrl(url, topic = null) {
    if (!this._isTrustedDomain(url)) {
      throw new Error(`Domain not trusted for learning: ${url}`);
    }

    console.log(`[WebLearningAgent] Learning from: ${url}`);

    try {
      // Fetch content
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status === 200
      });

      // Check final URL after redirects
      const finalUrl = response.request.res.responseUrl || url;
      if (!this._isTrustedDomain(finalUrl)) {
        throw new Error('Redirect led to untrusted domain');
      }

      const html = response.data;

      // Extract text content (simple extraction, avoid complex parsing)
      const textContent = this._extractTextFromHtml(html);

      if (textContent.length < 100) {
        throw new Error('Insufficient content extracted from page');
      }

      // Summarize using AI
      const summary = await this._summarizeContent(textContent, topic);

      // Validate summary
      if (!this._validateSummary(summary)) {
        throw new Error('Summary validation failed');
      }

      // Store knowledge
      const knowledgeEntry = {
        topic: topic || this._extractTopicFromUrl(url),
        source: url,
        summary: summary.summary,
        keyPoints: summary.keyPoints,
        category: this._categorizeContent(url, textContent),
        extractedAt: new Date().toISOString(),
        contentLength: textContent.length,
        trustLevel: 'verified'
      };

      await this.knowledgeStore.storeWebKnowledge(knowledgeEntry);

      return {
        success: true,
        knowledgeId: knowledgeEntry.id,
        topic: knowledgeEntry.topic,
        summary: knowledgeEntry.summary
      };

    } catch (error) {
      console.error(`[WebLearningAgent] Failed to learn from ${url}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract text content from HTML (simple method)
   */
  _extractTextFromHtml(html) {
    // Remove scripts and styles
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' '); // Remove all tags
    text = text.replace(/\s+/g, ' ').trim(); // Normalize whitespace

    // Limit content length
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '...';
    }

    return text;
  }

  /**
   * Summarize content using AI
   */
  async _summarizeContent(content, topic) {
    const prompt = `Please summarize the following content from a government website${topic ? ` about ${topic}` : ''}.

Content:
${content}

Please provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)

Format your response as JSON with keys: "summary" and "keyPoints" (array of strings).`;

    try {
      const response = await aiProviderManager.createChatCompletion('WebLearningAgent', {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('[WebLearningAgent] AI summarization failed:', error.message);
      // Fallback summary
      return {
        summary: content.substring(0, 200) + '...',
        keyPoints: ['Content extracted from trusted source', 'Summary generation failed']
      };
    }
  }

  /**
   * Validate summary content
   */
  _validateSummary(summary) {
    if (!summary.summary || !summary.keyPoints) return false;
    if (summary.summary.length < 10) return false;
    if (!Array.isArray(summary.keyPoints) || summary.keyPoints.length === 0) return false;

    // Check for inappropriate content
    const combined = (summary.summary + ' ' + summary.keyPoints.join(' ')).toLowerCase();
    const forbiddenWords = ['hack', 'exploit', 'illegal', 'forbidden', 'banned'];
    return !forbiddenWords.some(word => combined.includes(word));
  }

  /**
   * Extract topic from URL
   */
  _extractTopicFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').filter(p => p);
      const domain = urlObj.hostname.replace('www.', '');

      if (path.length > 0) {
        return `${domain}/${path.join('/')}`;
      }
      return domain;
    } catch (error) {
      return 'unknown_topic';
    }
  }

  /**
   * Categorize content based on URL and content
   */
  _categorizeContent(url, content) {
    const urlLower = url.toLowerCase();
    const contentLower = content.toLowerCase();

    if (urlLower.includes('aadhaar') || urlLower.includes('uidai')) return 'identity';
    if (urlLower.includes('ration') || urlLower.includes('food')) return 'food_security';
    if (urlLower.includes('land') || urlLower.includes('bhulekh')) return 'land_records';
    if (urlLower.includes('railway') || urlLower.includes('irctc')) return 'transport';
    if (urlLower.includes('job') || urlLower.includes('employment')) return 'employment';
    if (urlLower.includes('education') || urlLower.includes('exam')) return 'education';
    if (urlLower.includes('csc')) return 'csc_services';

    // Content-based categorization
    if (contentLower.includes('government') && contentLower.includes('service')) return 'government_services';
    if (contentLower.includes('certificate') || contentLower.includes('document')) return 'certificates';

    return 'general';
  }

  /**
   * Get learned knowledge for a topic
   */
  async getKnowledgeForTopic(topic) {
    return await this.knowledgeStore.search(topic, 'web_knowledge');
  }

  /**
   * Get learning statistics
   */
  async getStats() {
    const knowledgeStats = await this.knowledgeStore.getStats();
    return {
      trustedDomains: this.trustedDomains.length,
      webKnowledgeEntries: knowledgeStats.webKnowledge || 0
    };
  }
}

module.exports = { WebLearningAgent };