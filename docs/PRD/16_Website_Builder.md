# PRD 16 — Website Builder Engine

## Overview

The Website Builder Engine generates complete, production-ready websites from natural language descriptions — landing pages, portfolios, business sites, government portals, and more.

---

## Existing Implementation

### UIBuilderSkill
**File:** `src/skills/UIBuilderSkill.js` (3,747 bytes)
- Basic UI component generation
- Dashboard layout creation

### UIBuilderAgent
**File:** `src/agents/uiBuilderAgent.js` (23,022 bytes)
- Full HTML/CSS/JS generation
- React component generation

---

## Website Types

| Type | Description | Complexity |
|------|-------------|------------|
| Landing Page | Single-page marketing site | Low |
| Portfolio | Personal/professional portfolio | Low |
| Business Website | Multi-page business site | Medium |
| Government Portal | Official government website | High |
| School Website | Educational institution site | Medium |
| Hospital Website | Healthcare facility site | Medium |
| NGO Website | Non-profit organization site | Medium |
| E-commerce | Product listing + cart | High |

---

## Features

| Feature | Description |
|---------|-------------|
| Responsive Design | Mobile-first, works on all devices |
| SEO Optimized | Meta tags, structured data, sitemap |
| Accessibility | ARIA labels, keyboard navigation, contrast |
| PWA | Installable, offline capable |
| Performance | Optimized images, lazy loading, minified assets |
| Dark Mode | Toggle between light/dark themes |
| Animations | Smooth transitions, micro-interactions |
| i18n | Hindi/English bilingual support |

---

## Input Schema

```javascript
WebsiteInputSchema = z.object({
  type: z.enum(['landing', 'portfolio', 'business', 'government', 'school', 'hospital', 'ngo', 'ecommerce']),
  name: z.string(),                         // Business/site name
  description: z.string(),                  // What the site is about
  pages: z.array(z.string()).optional(),     // ['home', 'about', 'contact', ...]
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
  features: z.array(z.string()).optional(),  // ['contact_form', 'gallery', 'blog', ...]
  language: z.enum(['hi', 'en', 'bilingual']).default('en'),
  framework: z.enum(['html', 'react', 'nextjs']).default('html'),
});
```

---

## Deployment Integration

Generated websites can be auto-deployed to:
- Render (via `deploy-production.sh`)
- Vercel (via Vercel CLI)
- Firebase Hosting
- Netlify
- GitHub Pages
- Docker container
