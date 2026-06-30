# PRD 15 — Self-Healing & Security Engine

## Overview

The Self-Healing Engine and Security Engine work together to ensure Harshita AI remains stable, secure, and continuously improving.

---

## Self-Healing Engine

### Existing Implementation
- `src/core/selfEvolutionAgent.js` — Prompt-patch based self-evolution
- `src/skills/SelfHealingSkill.js` — Manual trigger for self-healing
- `src/core/reasoningEngine.js` — Thought → Action → Observation loop

### v2.0 Self-Healing Pipeline

```
Error Detected
    ↓
[1] Retry (exponential backoff, max 3 attempts)
    ↓ (if still failing)
[2] Switch Tool (try fallback tool/API)
    ↓ (if still failing)
[3] Switch Agent (rotate AI provider: Groq → Gemini → OpenAI)
    ↓ (if still failing)
[4] Rollback (restore pre-execution state)
    ↓
[5] Report Error (log to Analytics + LearningEngine)
    ↓
[6] Store Learning (record failure pattern for future prevention)
```

### Auto-Recovery Actions

| Action | Trigger | Recovery |
|--------|---------|----------|
| Retry | Timeout, network error | Exponential backoff |
| Switch Tool | Tool-specific error | Use fallback tool |
| Switch Agent | AI provider error | Rotate to next provider |
| Restart Service | Service crash | Auto-restart via PM2 |
| Rollback | Data corruption | Restore backup |
| Clean Cache | Memory overflow | Clear expired cache |
| Optimize Build | Build failure | Clean + rebuild |
| Fix Dependency | Missing module | Auto-install |

---

## Security Engine

### Existing Implementation
- `src/skills/SecuritySkill.js` — Input scanning for dangerous queries
- `src/api/middleware/auth.js` — JWT authentication
- `helmet` — HTTP security headers
- `express-rate-limit` — Rate limiting
- `bcrypt` — Password hashing
- `jsonwebtoken` — JWT tokens

### Security Layers

```
[Layer 1] Rate Limiting (express-rate-limit)
    ↓
[Layer 2] HTTP Security (helmet)
    ↓
[Layer 3] Authentication (JWT)
    ↓
[Layer 4] Authorization (role-based)
    ↓
[Layer 5] Input Validation (Zod schemas)
    ↓
[Layer 6] Security Scan (SecuritySkill — block illegal/dangerous queries)
    ↓
[Layer 7] Audit Logging (every action recorded)
    ↓
[Layer 8] Secret Management (.env, no hardcoded keys)
```

### Security Rules

| Rule | Implementation |
|------|---------------|
| Authentication | JWT tokens with expiry |
| Authorization | Role-based (admin, user, guest) |
| Encryption | Passwords hashed with bcrypt |
| Secret Management | All keys in .env, never in code |
| API Keys | Rotatable, per-service keys |
| Permission Control | Skill-level access control |
| Audit Logs | Every API call logged with user, action, timestamp |
| Rate Limiting | Per-IP and per-user limits |
| Input Sanitization | Zod validation on all inputs |
| XSS Prevention | Helmet CSP headers |
| CSRF Protection | Token-based CSRF prevention |
| SQL Injection | Prisma parameterized queries |

---

## Deployment Security

- Environment-specific configs (.env.production)
- Docker containerization for isolation
- HTTPS enforcement via Nginx
- CORS whitelist (not wildcard in production)
- Health check endpoints for monitoring
