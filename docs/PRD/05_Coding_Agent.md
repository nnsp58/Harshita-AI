# PRD 05 — Coding Agent

## Overview

The Coding Agent provides comprehensive software development assistance — from repository analysis and error detection to code generation, refactoring, and deployment.

---

## Skill Categories

### Repository Analysis
| Skill | Description | Offline |
|-------|-------------|---------|
| Repo Scanner | Analyze project structure, dependencies, tech stack | ✅ |
| Dependency Audit | Check for outdated/vulnerable packages | ❌ |
| Architecture Mapper | Generate architecture diagram from codebase | ❌ |

### Error Detection & Fix
| Skill | Description | Offline |
|-------|-------------|---------|
| Error Detector | Scan code for bugs, anti-patterns | ❌ |
| Auto Fix | AI-powered automatic bug fixes | ❌ |
| Security Scan | Find security vulnerabilities (XSS, SQL injection) | ❌ |
| Type Checker | TypeScript type error detection | ✅ |

### Code Generation
| Skill | Description | Offline |
|-------|-------------|---------|
| Component Generator | Generate React/Flutter components | ❌ |
| API Generator | Generate Express/Next.js API routes | ❌ |
| Schema Generator | Generate Prisma/MongoDB schemas | ❌ |
| Test Generator | Generate unit/integration tests | ❌ |

### Code Review & Refactoring
| Skill | Description | Offline |
|-------|-------------|---------|
| Code Review | AI-powered code review with suggestions | ❌ |
| Refactoring | Improve code quality, reduce complexity | ❌ |
| Performance Optimizer | Identify and fix performance bottlenecks | ❌ |

### DevOps & Deployment
| Skill | Description | Offline |
|-------|-------------|---------|
| Docker Generator | Generate Dockerfile, docker-compose | ❌ |
| CI/CD Setup | GitHub Actions, GitLab CI configuration | ❌ |
| Deploy to Render | Auto-deploy to Render.com | ❌ |
| Deploy to Vercel | Auto-deploy to Vercel | ❌ |
| Firebase Setup | Firebase configuration and deployment | ❌ |

### Supported Technologies
- **Frontend:** React, Next.js, Flutter, HTML/CSS/JS
- **Backend:** Node.js, Express, Python, FastAPI
- **Database:** Prisma, MongoDB, PostgreSQL, SQLite
- **DevOps:** Docker, GitHub Actions, Render, Vercel, Firebase
- **Version Control:** Git, GitHub

---

## Input Schema

```javascript
CodingInputSchema = z.object({
  action: z.enum(['analyze', 'fix', 'generate', 'review', 'refactor', 'deploy', ...]),
  language: z.enum(['javascript', 'typescript', 'python', 'dart', ...]),
  framework: z.enum(['react', 'nextjs', 'express', 'flutter', 'fastapi', ...]).optional(),
  code: z.string().optional(),           // Code snippet to analyze/fix
  filePath: z.string().optional(),       // File to operate on
  repoUrl: z.string().url().optional(),  // GitHub repo URL
  instructions: z.string(),             // What to do
});
```

---

## Verification Rules

```javascript
validationRules: [
  'syntax_valid',           // Code must parse without errors
  'no_console_errors',      // No console.error in output
  'lint_pass',              // ESLint/Prettier pass
  'build_success',          // npm run build succeeds (if applicable)
  'test_pass',              // npm test passes (if applicable)
  'security_scan_clean',    // No known vulnerabilities introduced
]
```

---

## Existing Components to Integrate

- `src/agents/controllerAgent.js` — Browser automation for deployment
- `src/core/gitDeployManager.js` — Git operations and deployment
- `src/skills/DeploySkill.js` — Existing deployment skill
- `src/skills/UIBuilderSkill.js` — UI component generation
