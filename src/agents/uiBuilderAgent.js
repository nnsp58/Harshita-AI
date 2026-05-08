/**
 * UIBuilderAgent - AI-powered Code & Web Page Generator
 * 
 * Capabilities:
 *   - Generate complete HTML/CSS/JS web pages from prompts
 *   - Create dashboards, landing pages, forms, reports
 *   - Generate reusable UI components
 *   - Build custom tools and utilities
 *   - Auto-save and serve generated pages
 * 
 * Cost: ₹0 (Uses Groq free tier)
 * 
 * Usage:
 *   "Build a landing page for SSC exam preparation"
 *   "Create a dashboard showing candidate statistics"
 *   "Generate a form for collecting voter ID details"
 *   "Make a price comparison table for CSC services"
 */

const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');

// Template library for common patterns
const DESIGN_TOKENS = {
  colors: {
    primary: '#1a1a2e',
    primaryLight: '#2c2c54',
    accent: '#4834d4',
    success: '#27ae60',
    danger: '#e74c3c',
    dark: '#0a0a0f',
    light: '#f4f7f6',
    cardBg: '#ffffff',
    textPrimary: '#1a1a2e',
    textSecondary: '#6c757d',
    gradient: 'linear-gradient(135deg, #1a1a2e, #4834d4)'
  },
  fonts: {
    heading: "'Segoe UI', 'Noto Sans Devanagari', sans-serif",
    body: "'Segoe UI', Arial, sans-serif",
    mono: "'Fira Code', 'Consolas', monospace"
  },
  shadows: {
    card: '0 4px 20px rgba(0,0,0,0.08)',
    elevated: '0 8px 32px rgba(0,0,0,0.12)',
    glow: '0 0 20px rgba(124, 10, 2, 0.3)'
  }
};

const PAGE_TYPES = {
  landing: {
    name: 'Landing Page',
    description: 'एक आकर्षक लैंडिंग पेज जिसमें Hero, Features, CTA शामिल हो',
    sections: ['hero', 'features', 'stats', 'cta', 'footer']
  },
  dashboard: {
    name: 'Dashboard',
    description: 'डेटा विज़ुअलाइज़ेशन के साथ एक एडमिन डैशबोर्ड',
    sections: ['header', 'stats-cards', 'charts', 'table', 'sidebar']
  },
  form: {
    name: 'Data Collection Form',
    description: 'एक स्मार्ट फॉर्म जिसमें वैलिडेशन हो',
    sections: ['header', 'form-fields', 'submit', 'footer']
  },
  report: {
    name: 'Report Page',
    description: 'एक प्रिंट-रेडी रिपोर्ट पेज',
    sections: ['header', 'summary', 'details', 'charts', 'footer']
  },
  portfolio: {
    name: 'Portfolio / Profile',
    description: 'एक पर्सनल या बिजनेस प्रोफाइल पेज',
    sections: ['hero', 'about', 'services', 'testimonials', 'contact']
  },
  tool: {
    name: 'Interactive Tool',
    description: 'एक इंटरैक्टिव वेब टूल (कैलकुलेटर, कनवर्टर आदि)',
    sections: ['header', 'input', 'output', 'instructions']
  },
  custom: {
    name: 'Custom Page',
    description: 'AI द्वारा पूरी तरह कस्टम डिज़ाइन',
    sections: []
  }
};

class UIBuilderAgent {
  constructor() {
    this.name = 'UIBuilderAgent';
    this.outputDir = path.join(process.cwd(), 'output', 'generated_pages');
    this.templateDir = path.join(process.cwd(), 'output', 'templates');
    this._ensureDirectories();

    const available = aiProviderManager.getAvailableProviders();
    console.log(`[UIBuilderAgent] Available providers: ${available.join(', ') || 'none'}`);
  }

  _ensureDirectories() {
    [this.outputDir, this.templateDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Main execution entry point
   */
  async execute(taskData) {
    const { action, prompt, pageType, data, options } = taskData;

    switch (action) {
      case 'generate_page':
        return await this.generatePage(prompt, pageType, data, options);
      case 'generate_component':
        return await this.generateComponent(prompt, options);
      case 'generate_code':
        return await this.generateCode(prompt, options);
      case 'list_types':
        return this.listPageTypes();
      case 'list_generated':
        return this.listGeneratedPages();
      default:
        return {
          success: false,
          agent: this.name,
          message: `Unknown action: ${action}. Available: generate_page, generate_component, generate_code, list_types, list_generated`
        };
    }
  }

  /**
   * Generate a complete web page from a prompt
   */
  async generatePage(prompt, pageType = 'custom', data = {}, options = {}) {
    if (!prompt) {
      return {
        success: false,
        agent: this.name,
        message: 'Please describe what page you want to create.',
        availableTypes: Object.keys(PAGE_TYPES)
      };
    }

    console.log(`[UIBuilderAgent] Generating ${pageType} page: "${prompt}"`);

    const typeInfo = PAGE_TYPES[pageType] || PAGE_TYPES.custom;
    const language = options.language || 'en'; // Default to Professional English as requested

    const systemPrompt = `You are a world-class frontend developer and UI/UX designer. 
You create stunning, modern, production-ready web pages.

DESIGN SYSTEM:
- Primary Color: ${DESIGN_TOKENS.colors.primary}
- Accent Color: ${DESIGN_TOKENS.colors.accent}
- Font: ${DESIGN_TOKENS.fonts.heading}
- Use CSS Grid and Flexbox for layouts
- MOBILE-FIRST approach: design for 360-412px width screens FIRST, then scale up
- Add smooth animations and hover effects
- Use modern CSS features (gradients, backdrop-filter, etc.)
- Include Font Awesome CDN for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
- Include Lucide Icons: <script src="https://unpkg.com/lucide@latest"></script>
- Include Chart.js (MANDATORY for dashboards): <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
- Include Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

PAGE TYPE: ${typeInfo.name} (${typeInfo.description})
${typeInfo.sections.length > 0 ? `SECTIONS TO INCLUDE: ${typeInfo.sections.join(', ')}` : ''}

CRITICAL MOBILE RULES:
- Cards must have max padding of 16px on mobile, font-size max 14px for body text
- Hero section: max padding 24px on mobile, h1 max font-size 1.4rem on mobile  
- Feature/stat cards: display as compact horizontal row (icon left, text right) on mobile, NOT large stacked blocks
- Use grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) for stat cards on mobile
- Buttons: full width (width:100%) on mobile, padding 12px
- No element should cause horizontal scroll on 360px screen
- Container padding: 12px on mobile

GENERAL RULES:
1. Return ONLY the complete HTML code (<!DOCTYPE html> to </html>)
2. All CSS must be inline in a <style> tag (no external CSS files)
3. All JavaScript must be inline in a <script> tag (no external JS files except CDN)
4. Make it visually STUNNING - use gradients, shadows, animations
5. Use Indian context where applicable (₹ currency, Hindi text, Indian names)
6. If data is provided, use it to populate the page directly (do NOT use {{ }} placeholders)
7. Add favicon emoji in title
8. DO NOT use any placeholder images - use CSS shapes, gradients, or Font Awesome icons instead
9. Language: ${language === 'hi' ? 'Pure Hindi' : language === 'en' ? 'English' : 'Mix of Hindi and English'}`;

    const userPrompt = `Create this page: ${prompt}

${data && Object.keys(data).length > 0 ? `\nDATA TO USE:\n${JSON.stringify(data, null, 2)}` : ''}
${options.features ? `\nADDITIONAL FEATURES: ${options.features}` : ''}
${options.style ? `\nSTYLE PREFERENCE: ${options.style}` : ''}

Return the complete HTML code only. No explanations.`;

    try {
      const client = aiProviderManager.getClient(this.name);
      if (!client) {
        // Fallback to template-based generation
        return this._generateFromTemplate(prompt, pageType, data);
      }

      const model = aiProviderManager.getModel(this.name);
      console.log(`[UIBuilderAgent] Using AI: ${model}`);

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      let htmlContent = completion.choices[0].message.content;

      // Clean up AI response - extract HTML if wrapped in markdown
      htmlContent = this._extractHTML(htmlContent);

      // Inject Rawan branding footer
      htmlContent = this._injectBranding(htmlContent);

      // Save to file
      const fileName = this._generateFileName(prompt, pageType);
      const filePath = path.join(this.outputDir, fileName);
      fs.writeFileSync(filePath, htmlContent, 'utf8');

      // Also save metadata
      const metaPath = path.join(this.outputDir, fileName.replace('.html', '.meta.json'));
      fs.writeFileSync(metaPath, JSON.stringify({
        prompt,
        pageType,
        generatedAt: new Date().toISOString(),
        model,
        fileName,
        filePath
      }, null, 2));

      console.log(`[UIBuilderAgent] ✅ Page generated: ${filePath}`);

      return {
        success: true,
        agent: this.name,
        action: 'generate_page',
        pageType: typeInfo.name,
        filePath,
        fileName,
        preview: htmlContent.substring(0, 500) + '...',
        message: `✅ "${typeInfo.name}" successfully generated!\n📁 Saved: ${filePath}\n🌐 Open this file in browser to view.`
      };

    } catch (error) {
      console.error(`[UIBuilderAgent] Generation failed:`, error.message);
      // Fallback to template
      return this._generateFromTemplate(prompt, pageType, data);
    }
  }

  /**
   * Generate a reusable UI component
   */
  async generateComponent(prompt, options = {}) {
    if (!prompt) {
      return { success: false, message: 'Describe the component you want.' };
    }

    const systemPrompt = `You are a frontend component expert. Generate a self-contained HTML/CSS/JS component.
Return ONLY the HTML code for the component (wrapped in a <div>).
Include scoped CSS in a <style> tag and any JS in a <script> tag.
Make it reusable and well-documented with comments.
Use modern CSS (flexbox, grid, variables, animations).`;

    try {
      const client = aiProviderManager.getClient(this.name);
      if (!client) {
        return { success: false, message: 'No AI provider available for component generation.' };
      }

      const model = aiProviderManager.getModel(this.name);
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create this component: ${prompt}` }
        ],
        temperature: 0.6,
        max_tokens: 2000
      });

      let componentCode = completion.choices[0].message.content;
      componentCode = this._extractHTML(componentCode);

      const fileName = `component_${Date.now()}.html`;
      const filePath = path.join(this.templateDir, fileName);
      fs.writeFileSync(filePath, componentCode, 'utf8');

      return {
        success: true,
        agent: this.name,
        action: 'generate_component',
        filePath,
        code: componentCode,
        message: `✅ Component generated!\n📁 Saved: ${filePath}`
      };

    } catch (error) {
      return { success: false, message: `Component generation failed: ${error.message}` };
    }
  }

  /**
   * Generate any code (JS, Python, Node.js, etc.)
   */
  async generateCode(prompt, options = {}) {
    if (!prompt) {
      return { success: false, message: 'Describe what code you need.' };
    }

    const language = options.language || 'javascript';

    const systemPrompt = `You are an expert ${language} developer.
Generate clean, well-commented, production-ready code.
Follow best practices and modern patterns.
Return ONLY the code, no explanations.`;

    try {
      const client = aiProviderManager.getClient(this.name);
      if (!client) {
        return { success: false, message: 'No AI provider available.' };
      }

      const model = aiProviderManager.getModel(this.name);
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 3000
      });

      let code = completion.choices[0].message.content;

      // Extract code from markdown blocks if present
      const codeMatch = code.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        code = codeMatch[1].trim();
      }

      const ext = { javascript: 'js', python: 'py', html: 'html', css: 'css', sql: 'sql' }[language] || 'txt';
      const fileName = `generated_${Date.now()}.${ext}`;
      const filePath = path.join(this.outputDir, fileName);
      fs.writeFileSync(filePath, code, 'utf8');

      return {
        success: true,
        agent: this.name,
        action: 'generate_code',
        language,
        filePath,
        code,
        message: `✅ ${language} code generated!\n📁 Saved: ${filePath}`
      };

    } catch (error) {
      return { success: false, message: `Code generation failed: ${error.message}` };
    }
  }

  /**
   * List available page types
   */
  listPageTypes() {
    const types = Object.entries(PAGE_TYPES).map(([key, val]) => ({
      key,
      name: val.name,
      description: val.description,
      sections: val.sections
    }));

    let msg = '\n🎨 === Available Page Types ===\n\n';
    types.forEach(t => {
      msg += `  [${t.key}] ${t.name}\n`;
      msg += `    ${t.description}\n\n`;
    });
    msg += '💡 Usage: "build a <type> page about <topic>"\n';

    return { success: true, agent: this.name, types, message: msg };
  }

  /**
   * List previously generated pages
   */
  listGeneratedPages() {
    try {
      const files = fs.readdirSync(this.outputDir)
        .filter(f => f.endsWith('.html'))
        .map(f => {
          const stats = fs.statSync(path.join(this.outputDir, f));
          const metaPath = path.join(this.outputDir, f.replace('.html', '.meta.json'));
          let meta = {};
          if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          }
          return {
            fileName: f,
            size: `${(stats.size / 1024).toFixed(1)} KB`,
            created: stats.birthtime.toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' }),
            prompt: meta.prompt || 'Unknown',
            pageType: meta.pageType || 'custom'
          };
        });

      return {
        success: true,
        agent: this.name,
        count: files.length,
        pages: files,
        message: files.length > 0
          ? `📁 ${files.length} generated pages found in output/generated_pages/`
          : '📭 No pages generated yet. Try: "build a landing page for CSC services"'
      };
    } catch (error) {
      return { success: true, agent: this.name, count: 0, pages: [], message: 'No pages generated yet.' };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Extract HTML from AI response (remove markdown wrappers)
   */
  _extractHTML(content) {
    // Remove markdown code blocks if present
    const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch) return htmlMatch[1].trim();

    const genericMatch = content.match(/```\n([\s\S]*?)```/);
    if (genericMatch) return genericMatch[1].trim();

    // If it already starts with <!DOCTYPE or <html, return as-is
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
      return content.trim();
    }

    return content;
  }

  /**
   * Inject Rawan branding into generated pages
   */
  _injectBranding(html) {
    const brandingTag = `\n<!-- Powered by Harshita AI Platform | UIBuilderAgent | ${new Date().toISOString()} -->\n`;

    if (html.includes('</body>')) {
      const footer = `
  <div style="text-align:center;padding:24px;background:#0a0a0f;color:#666;font-size:12px;margin-top:60px;border-top: 1px solid #1a1a2e;">
    🤖 Powered by <strong style="color:#4834d4;">Harshita AI Platform</strong> | Adaptive UI Engine &copy; ${new Date().getFullYear()}
  </div>`;
      html = html.replace('</body>', `${footer}\n</body>`);
    }

    return brandingTag + html;
  }

  /**
   * Generate a clean file name from prompt
   */
  _generateFileName(prompt, pageType) {
    const slug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 40);

    return `${pageType}_${slug}_${Date.now()}.html`;
  }

  /**
   * Fallback: Generate page from built-in template when AI is unavailable
   */
  _generateFromTemplate(prompt, pageType, data = {}) {
    console.log(`[UIBuilderAgent] Using template fallback for: ${pageType}`);

    const title = prompt || 'Rawan Generated Page';
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🤖 ${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root {
      --primary: ${DESIGN_TOKENS.colors.primary};
      --primary-light: ${DESIGN_TOKENS.colors.primaryLight};
      --accent: ${DESIGN_TOKENS.colors.accent};
      --success: ${DESIGN_TOKENS.colors.success};
      --dark: ${DESIGN_TOKENS.colors.dark};
      --light: ${DESIGN_TOKENS.colors.light};
      --shadow: ${DESIGN_TOKENS.shadows.card};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', ${DESIGN_TOKENS.fonts.body};
      background: var(--light);
      color: var(--dark);
      min-height: 100vh;
    }
    .header {
      background: ${DESIGN_TOKENS.colors.gradient};
      color: white;
      padding: 48px 32px;
      text-align: center;
    }
    .header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; }
    .header p { font-size: 1rem; opacity: 0.85; max-width: 600px; margin: 0 auto; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    .card {
      background: white;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: var(--shadow);
      transition: transform 0.2s;
    }
    .card:hover { transform: translateY(-3px); }
    .card h2 { color: var(--primary); font-size: 1.1rem; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 16px 12px;
      box-shadow: var(--shadow);
      text-align: center;
    }
    .stat-card .icon { font-size: 1.5rem; margin-bottom: 6px; }
    .stat-card .value { font-size: 1.4rem; font-weight: 800; color: var(--primary); }
    .stat-card .label { color: #888; font-size: 0.75rem; margin-top: 2px; }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
    }
    .btn:hover { background: var(--primary-light); transform: scale(1.03); }
    .footer {
      text-align: center;
      padding: 16px;
      background: var(--dark);
      color: #888;
      font-size: 0.8rem;
      margin-top: 40px;
    }
    @media (max-width: 480px) {
      .header { padding: 24px 16px; }
      .header h1 { font-size: 1.3rem; }
      .header p { font-size: 0.85rem; }
      .grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .stat-card { padding: 12px 8px; border-radius: 10px; }
      .stat-card .icon { font-size: 1.2rem; margin-bottom: 4px; }
      .stat-card .value { font-size: 1.1rem; }
      .stat-card .label { font-size: 0.65rem; }
      .card { padding: 16px; border-radius: 12px; }
      .card h2 { font-size: 1rem; }
      .btn { width: 100%; text-align: center; padding: 12px; }
      .container { padding: 12px; }
    }
    @media (min-width: 481px) and (max-width: 768px) {
      .header h1 { font-size: 1.6rem; }
      .header { padding: 32px 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 ${title}</h1>
    <p>Rawan AI Platform द्वारा स्वचालित रूप से जनरेट किया गया पेज</p>
  </div>

  <div class="container">
    <div class="grid">
      <div class="stat-card">
        <div class="icon">📊</div>
        <div class="value">${data.stat1 || '1,250'}</div>
        <div class="label">${data.label1 || 'Total Candidates'}</div>
      </div>
      <div class="stat-card">
        <div class="icon">✅</div>
        <div class="value">${data.stat2 || '98%'}</div>
        <div class="label">${data.label2 || 'Success Rate'}</div>
      </div>
      <div class="stat-card">
        <div class="icon">⚡</div>
        <div class="value">${data.stat3 || '₹0'}</div>
        <div class="label">${data.label3 || 'Operating Cost'}</div>
      </div>
    </div>

    <div class="card" style="margin-top:32px;">
      <h2><i class="fas fa-info-circle"></i> About This Page</h2>
      <p style="line-height:1.8;color:#555;">
        This page was generated by the <strong>UIBuilderAgent</strong> of the Rawan AI Platform.
        The AI-powered builder can create landing pages, dashboards, forms, reports, and more
        from simple text prompts. Connect an AI provider (Groq/Gemini) for full creative control.
      </p>
      <br>
      <a href="#" class="btn"><i class="fas fa-rocket"></i> Get Started</a>
    </div>
  </div>

  <div class="footer">
    🤖 Powered by <strong style="color:#4834d4;">Harshita AI Platform</strong> | Adaptive UI Engine &copy; ${new Date().getFullYear()}
  </div>
</body>
</html>`;

    const fileName = this._generateFileName(prompt, pageType);
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      success: true,
      agent: this.name,
      action: 'generate_page',
      pageType: PAGE_TYPES[pageType]?.name || 'Template',
      filePath,
      fileName,
      message: `✅ Page generated using built-in template!\n📁 Saved: ${filePath}\n💡 Tip: Connect Groq/Gemini API for AI-powered custom designs.`
    };
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log(`[UIBuilderAgent] Cleanup complete.`);
  }
}

module.exports = { UIBuilderAgent };
