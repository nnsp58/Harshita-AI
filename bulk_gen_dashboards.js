/**
 * Bulk Generate 10 Professional Dashboards for Harshita AI
 */
require('dotenv').config();
const { UIBuilderAgent } = require('./src/agents/uiBuilderAgent');
const fs = require('fs');
const path = require('path');

async function bulkGenerate() {
  const agent = new UIBuilderAgent();
  const themes = [
    { name: 'Minimalist White', style: 'Clean, spacious, high contrast, minimalist' },
    { name: 'Sleek Dark Mode', style: 'Dark theme, deep blues, vibrant neon accents' },
    { name: 'Glassmorphism', style: 'Translucent cards, frosted glass effect, colorful blurry background' },
    { name: 'Corporate Professional', style: 'Business blue and white, very structured, formal' },
    { name: 'Neon Futuristic', style: 'Dark grid background, neon purple and cyan accents, glow effects' },
    { name: 'Vibrant Gradient', style: 'Energetic bold gradients, modern typography' },
    { name: 'Soft Neumorphism', style: 'Soft inner and outer shadows, tactile 3D feel, light gray' },
    { name: 'Premium Gold & Black', style: 'Luxury feel, deep black with gold accents' },
    { name: 'Modern Material', style: 'Google Material Design 3 style, organic shapes' },
    { name: 'Compact Grid', style: 'Highly optimized for mobile, grid-based, max data density' }
  ];

  console.log('🚀 Harshita AI: Starting bulk generation of 10 dashboards...\n');

  const results = [];
  
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    console.log(`🎨 Generating Dashboard ${i+1}/10: ${theme.name}...`);
    
    try {
      const result = await agent.execute({
        action: 'generate_page',
        prompt: `A highly professional VLE Admin Dashboard for Harshita AI with VLE name, total applications, earnings, and agent status. Theme: ${theme.style}`,
        pageType: 'dashboard',
        options: { 
          style: theme.style,
          features: 'Mobile-first, compact cards, professional charts, real-time status indicators'
        }
      });
      
      results.push({
        id: i + 1,
        name: theme.name,
        fileName: result.fileName,
        filePath: result.filePath
      });
      
      console.log(`✅ ${theme.name} completed.`);
    } catch (e) {
      console.error(`❌ Failed to generate ${theme.name}:`, e.message);
    }
  }

  // Create a summary HTML page to view all 10 dashboards
  const catalogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harshita AI - Dashboard Catalog</title>
  <style>
    body { font-family: 'Inter', sans-serif; background: #f4f7f6; padding: 20px; text-align: center; }
    .header { padding: 40px; background: #1a1a2e; color: white; border-radius: 12px; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: 0.3s; }
    .card:hover { transform: translateY(-5px); }
    .card h3 { margin-top: 0; color: #1a1a2e; }
    .btn { display: inline-block; padding: 10px 20px; background: #4834d4; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Harshita AI Dashboard Catalog</h1>
    <p>Select your favorite professional dashboard design</p>
  </div>
  <div class="grid">
    ${results.map(r => `
      <div class="card">
        <h3>${r.id}. ${r.name}</h3>
        <p>Professional Mobile-First UI</p>
        <a href="${r.fileName}" class="btn" target="_blank">Preview Dashboard</a>
      </div>
    `).join('')}
  </div>
  <p style="margin-top: 40px; color: #888;">🤖 Powered by Harshita AI Platform</p>
</body>
</html>`;

  fs.writeFileSync(path.join(process.cwd(), 'output', 'generated_pages', 'catalog.html'), catalogHtml);
  console.log('\n✨ ALL DASHBOARDS GENERATED SUCCESSFULLY!');
  console.log(`📁 Open output/generated_pages/catalog.html to view them all.`);
}

bulkGenerate().catch(console.error);
