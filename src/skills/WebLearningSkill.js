/**
 * WebLearningSkill — वेब लर्निंग और पोर्टल ट्रेनिंग
 * 
 * Capabilities:
 *   - Accept URL from user
 *   - Fetch page title, meta, forms, buttons, links
 *   - Summarize portal structure
 *   - Store learned patterns for future automation
 */
const { BaseSkill } = require('./BaseSkill');
const https = require('https');
const http = require('http');
const url = require('url');

class WebLearningSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'web_learning';
    this.displayName = 'वेब लर्निंग';
    this.displayNameEn = 'Web Learning & Training';
    this.description = 'नये पोर्टल और वेबसाइट्स से डेटा निकालना और ट्रेनिंग लेना';
    this.descriptionEn = 'Extract data and learn from new portals/websites';
    this.version = '2.0.0';
    this.category = 'automation';
    this.canRunOffline = false;
    this.priority = 5;
    this.intents = ['learn_site', 'web_extract', 'train_bot', 'analyze_portal'];
    this.keywords = {
      hi: ['लर्निंग', 'वेबसाइट', 'सीखो', 'पोर्टल', 'ट्रेनिंग', 'analyze'],
      en: ['learn', 'extract', 'train', 'portal', 'analyze', 'scrape'],
      hinglish: ['website se seekho', 'portal analyze karo', 'naya site train karo']
    };
    this.requiredAgents = ['webLearningAgent', 'selectorDiscoveryAgent'];

    // Store learned sites (in-memory; production: DB)
    this.learnedSites = new Map();
  }

  async execute(context) {
    const { message, userId } = context;
    const text = (message || '').trim();

    // Extract URL from message
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    
    if (!urlMatch) {
      // No URL — check if user is asking about previously learned sites
      if (/list|सूची|dikhao|show|learned|seekhi/i.test(text)) {
        return this._showLearnedSites();
      }
      return this._reply(
        '🌐 *वेब लर्निंग मोड*\n\n' +
        'कृपया उस वेबसाइट का URL दें जिसे मुझे analyze करना है:\n\n' +
        'Example:\n• "https://ssc.nic.in analyze karo"\n• "https://upbhulekh.gov.in se seekho"\n\n' +
        'मैं वेबसाइट के फॉर्म, बटन और स्ट्रक्चर को ऑटोमैटिक समझ लूँगा।',
        { mode: 'awaiting_url' }
      );
    }

    const targetUrl = urlMatch[0];

    // Fetch and analyze the page
    try {
      const pageData = await this._fetchPage(targetUrl);
      
      if (!pageData.success) {
        return this._reply(
          `❌ "${targetUrl}" fetch नहीं हो पाई:\n${pageData.error}\n\n` +
          `कृपया URL चेक करें और फिर कोशिश करें।`,
          { mode: 'fetch_error', url: targetUrl }
        );
      }

      // Analyze HTML structure
      const analysis = this._analyzeHTML(pageData.html, targetUrl);

      // Store learned data
      this.learnedSites.set(targetUrl, {
        ...analysis,
        learnedAt: new Date().toISOString(),
        learnedBy: userId,
      });

      // Build report
      let report = `✅ *वेबसाइट Analysis Complete!*\n\n`;
      report += `🔗 URL: ${targetUrl}\n`;
      report += `📝 Title: ${analysis.title || 'N/A'}\n`;
      report += `📄 Description: ${analysis.description || 'N/A'}\n\n`;
      
      report += `📊 *Structure Found:*\n`;
      report += `• Forms: ${analysis.forms} found\n`;
      report += `• Input Fields: ${analysis.inputs} found\n`;
      report += `• Buttons: ${analysis.buttons} found\n`;
      report += `• Links: ${analysis.links} found\n`;
      report += `• Images: ${analysis.images} found\n`;
      report += `• Tables: ${analysis.tables} found\n\n`;

      if (analysis.formDetails.length > 0) {
        report += `📝 *Form Details:*\n`;
        analysis.formDetails.forEach((form, i) => {
          report += `\n*Form ${i + 1}:* ${form.action || 'inline'}\n`;
          report += `  Method: ${form.method || 'GET'}\n`;
          form.fields.forEach(f => {
            report += `  • ${f.name || f.id || 'unnamed'} (${f.type})\n`;
          });
        });
        report += '\n';
      }

      report += `💾 Site data saved! अगली बार इस portal पर ऑटोमेशन कर सकते हैं।\n`;
      report += `🔄 Full automation के लिए Browser Agent से combine होगा।`;

      return this._reply(report, {
        mode: 'analysis_complete',
        url: targetUrl,
        analysis,
      });

    } catch (err) {
      return this._reply(`⚠️ Analysis error: ${err.message}`);
    }
  }

  /**
   * Fetch page HTML with timeout
   */
  _fetchPage(targetUrl) {
    return new Promise((resolve) => {
      const proto = targetUrl.startsWith('https') ? https : http;
      const options = {
        timeout: 10000,
        headers: {
          'User-Agent': 'HarshitaAI/2.0 WebLearning',
          'Accept': 'text/html',
        },
      };

      const req = proto.get(targetUrl, options, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(this._fetchPage(res.headers.location));
        }

        let html = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk) => { html += chunk; });
        res.on('end', () => resolve({ success: true, html, statusCode: res.statusCode }));
      });

      req.on('error', (err) => resolve({ success: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout (10s)' }); });
    });
  }

  /**
   * Analyze HTML structure — extract forms, inputs, buttons, links
   */
  _analyzeHTML(html, pageUrl) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);

    // Count elements
    const forms = (html.match(/<form[\s>]/gi) || []).length;
    const inputs = (html.match(/<input[\s>]/gi) || []).length;
    const buttons = (html.match(/<button[\s>]/gi) || []).length + (html.match(/type=["']submit["']/gi) || []).length;
    const links = (html.match(/<a[\s]/gi) || []).length;
    const images = (html.match(/<img[\s]/gi) || []).length;
    const tables = (html.match(/<table[\s>]/gi) || []).length;

    // Extract form details
    const formDetails = [];
    const formMatches = html.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/gi);
    for (const fm of formMatches) {
      const formHtml = fm[0];
      const actionMatch = formHtml.match(/action=["'](.*?)["']/i);
      const methodMatch = formHtml.match(/method=["'](.*?)["']/i);
      
      const fields = [];
      const inputMatches = formHtml.matchAll(/<input[^>]*>/gi);
      for (const im of inputMatches) {
        const inputTag = im[0];
        const typeM = inputTag.match(/type=["'](.*?)["']/i);
        const nameM = inputTag.match(/name=["'](.*?)["']/i);
        const idM = inputTag.match(/id=["'](.*?)["']/i);
        fields.push({
          type: typeM?.[1] || 'text',
          name: nameM?.[1] || '',
          id: idM?.[1] || '',
        });
      }

      formDetails.push({
        action: actionMatch?.[1] || '',
        method: (methodMatch?.[1] || 'GET').toUpperCase(),
        fields,
      });

      if (formDetails.length >= 5) break; // Limit to 5 forms
    }

    return {
      title: titleMatch?.[1]?.trim() || '',
      description: descMatch?.[1]?.trim()?.substring(0, 150) || '',
      forms,
      inputs,
      buttons,
      links,
      images,
      tables,
      formDetails,
      url: pageUrl,
    };
  }

  _showLearnedSites() {
    if (this.learnedSites.size === 0) {
      return this._reply('📭 अभी कोई भी site learn नहीं की गई है।\nकोई URL दें, मैं analyze कर लूँगा!');
    }

    let list = '📚 *Learned Sites:*\n\n';
    let i = 1;
    for (const [siteUrl, data] of this.learnedSites) {
      list += `${i}. ${data.title || siteUrl}\n   🔗 ${siteUrl}\n   📊 ${data.forms} forms, ${data.inputs} inputs\n\n`;
      i++;
    }

    return this._reply(list, { mode: 'learned_sites' });
  }
}

module.exports = { WebLearningSkill };
