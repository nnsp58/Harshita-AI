# PRD 17 — Deployment Engine

## Overview

The Deployment Engine automates the build, test, and deployment pipeline for projects created or managed by Harshita AI.

---

## Existing Implementation

- `src/skills/DeploySkill.js` — Deployment trigger skill
- `src/core/gitDeployManager.js` — Git operations and deployment
- `deploy-production.sh` — Production deployment script
- `render.yaml` — Render.com configuration
- `Dockerfile` — Docker containerization
- `docker-compose.yml` — Multi-service Docker setup
- `ecosystem.config.js` — PM2 process management

---

## Supported Platforms

| Platform | Method | Config File |
|----------|--------|-------------|
| Render | Git push + render.yaml | `render.yaml` |
| Vercel | Vercel CLI / Git | `vercel.json` |
| Firebase | Firebase CLI | `firebase.json` |
| Netlify | Git push / CLI | `netlify.toml` |
| Docker | Dockerfile build | `Dockerfile` |
| Railway | Railway CLI | `railway.json` |
| GitHub Pages | Git push to gh-pages | GitHub Actions |

---

## Deployment Pipeline

```
Code Changes
    ↓
[1] Lint Check (ESLint)
    ↓
[2] Build (npm run build)
    ↓
[3] Test (npm test)
    ↓
[4] Security Scan
    ↓
[5] Docker Build (if containerized)
    ↓
[6] Deploy to Platform
    ↓
[7] Health Check (verify deployment)
    ↓
[8] Notify (success/failure via email/telegram)
    ↓
[9] Rollback (if health check fails)
```

---

## Input Schema

```javascript
DeployInputSchema = z.object({
  platform: z.enum(['render', 'vercel', 'firebase', 'netlify', 'docker', 'railway', 'github-pages']),
  projectPath: z.string().optional(),
  branch: z.string().default('main'),
  environment: z.enum(['development', 'staging', 'production']).default('production'),
  autoRollback: z.boolean().default(true),
  notify: z.array(z.enum(['email', 'telegram', 'whatsapp'])).optional(),
});
```
