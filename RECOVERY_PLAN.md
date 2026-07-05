# RECOVERY PLAN
## Harshita AI v1.0 — Production Recovery
**Generated:** 2026-07-05  
**Based On:** PROJECT_HEALTH_REPORT.md  
**CTO Approval Required:** Yes  

---

## EXECUTIVE SUMMARY

| Priority | Count | Estimated Total Time |
|----------|-------|----------------------|
| P0 | 5 | 4-6 hours |
| P1 | 3 | 8-12 hours |
| P2 | 4 | 12-18 hours |
| P3 | 4 | 20-30 hours |
| **Total** | **16** | **44-66 hours** |

**Blocking Rule:** No feature development until all P0 and P1 items are resolved.

---

## P0 — CRITICAL (BLOCK PRODUCTION)

### 1. Google OAuth Client Secret is Dummy

**Reason:**  
Authentication broken locally and in production. Google Login returns 401/403/invalid_client.

**Impact:**  
Users cannot sign in with Google. OAuth flow fails completely.

**Files Affected:**
- `.env` (line 37: `GOOGLE_CLIENT_SECRET=dummy_client_secret`)
- `frontend/src/pages/Login.jsx` (if Google button wired)
- `src/api/routes/auth.js` (Google OAuth strategy)

**Estimated Fix:** 20 minutes

**Risk:** LOW — Configuration change only, no code modification.

**Rollback:**  
Revert `.env` to previous value. No database or build changes.

**Verification:**
1. Open browser → Login page
2. Click "Sign in with Google"
3. Network tab → `/api/auth/google/callback` returns 200 with user JSON
4. Backend log shows `Google OAuth successful for email: ...`
5. Dashboard loads without auth error

---

### 2. Redis Not Installed

**Reason:**  
`redis-cli` not recognized. BullMQ queues, caching, and session management will fail at runtime.

**Impact:**  
Queue-based jobs (document processing, bulk import, notifications) fail silently or crash. Socket.IO adapter may fail in multi-process deployments.

**Files Affected:**
- `.env` (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
- `src/api/server.js` (BullMQ queue initialization)
- `src/core/BillingEngine.js` (if using Redis for locks)
- `src/core/notificationHub.js` (queue-based notifications)

**Estimated Fix:** 30 minutes

**Risk:** LOW — Infrastructure installation only.

**Rollback:**  
Uninstall Redis. Application falls back to in-memory queues (not recommended for production, but reversible).

**Verification:**
```bash
redis-cli ping
# Expected: PONG
```
```bash
npm run start
# Expected: No Redis connection errors in logs
```

---

### 3. Critical npm Vulnerabilities (10 Critical)

**Reason:**  
Backend has 10 critical vulnerabilities (json-pointer, jsonpath-plus, minimist, form-data, async, cross-spawn, tmp, qs, tough-cookie). Attack vectors include Prototype Pollution, RCE, Path Traversal, CRLF Injection.

**Impact:**  
Potential security breach, data exfiltration, arbitrary file write, remote code execution.

**Files Affected:**
- `package.json` (dependency versions)
- `node_modules/` (vulnerable packages)
- All backend modules (indirect dependency impact)

**Estimated Fix:** 1-2 hours

**Risk:** MEDIUM — `npm audit fix --force` introduces breaking changes via dredd. Manual patching required.

**Rollback:**  
`git checkout package.json package-lock.json` then `npm install`.

**Verification:**
```bash
npm audit --audit-level=critical
# Expected: 0 critical vulnerabilities
```
```bash
npm run start
# Expected: Server starts without dependency errors
```

---

### 4. Smoke Test Script Missing

**Reason:**  
`npm run test:smoke` fails with `Cannot find module 'scripts/smoke-test.js'`.

**Impact:**  
CI/CD pipeline broken. No automated smoke tests for API endpoints.

**Files Affected:**
- `package.json` (script definition)
- `scripts/smoke-test.js` (missing file)

**Estimated Fix:** 2-4 hours

**Risk:** LOW — New file creation, no existing code modified.

**Rollback:**  
Remove `scripts/smoke-test.js` and revert `package.json` script.

**Verification:**
```bash
npm run test:smoke
# Expected: All smoke tests pass or fail with clear error messages
```

---

### 5. Database Not Migration-Managed

**Reason:**  
Prisma reports "No migration found" and "current database is not managed by Prisma Migrate."

**Impact:**  
Production deployment risky. Schema changes cannot be tracked, rolled back, or deployed reproducibly.

**Files Affected:**
- `prisma/schema.prisma`
- `prisma/migrations/` (missing directory)
- `prisma/dev.db` (existing SQLite database)

**Estimated Fix:** 1 hour

**Risk:** MEDIUM — Baseline migration must not corrupt existing data.

**Rollback:**  
Delete `prisma/migrations/` directory. Database remains as-is.

**Verification:**
```bash
npx prisma migrate status
# Expected: "Your database is now in sync with your schema."
```
```bash
npx prisma migrate dev --name init
# Expected: Migration created and applied successfully
```

---

## P1 — HIGH (BEFORE FEATURE DEVELOPMENT)

### 6. 202 Frontend Lint Errors

**Reason:**  
Unused variables, `set-state-in-effect` anti-patterns, missing dependencies in useEffect, impure function in render.

**Impact:**  
Code quality degraded. Potential runtime bugs from stale closures. Cascading renders hurt performance.

**Files Affected:**
- `frontend/src/pages/SimpleDashboard.jsx` (multiple errors)
- `frontend/src/pages/TADANaksha.jsx` (multiple errors)
- `frontend/src/pages/TADAForm.jsx`
- `frontend/src/pages/Subscription.jsx`
- `frontend/src/pages/StoryVideoDashboard.jsx`
- `frontend/src/pages/ToolLanding.jsx`
- `frontend/src/pages/admin/*.jsx` (AgentDashboard, ControlDashboard, DeveloperCenter, SelfHealingCenter, SkillsControl)
- `frontend/src/pages/SpecialistCourse.jsx`
- `frontend/src/pages/public/Pricing.jsx`
- `frontend/src/services/socket.js`

**Estimated Fix:** 8-10 hours

**Risk:** LOW — Lint fixes are mechanical. Behavior should remain identical.

**Rollback:**  
`git checkout frontend/src/pages/ frontend/src/services/socket.js`

**Verification:**
```bash
cd frontend && npm run lint
# Expected: 0 errors, 0 warnings
```

---

### 7. Missing Backend Linting

**Reason:**  
No ESLint configuration for `src/` directory. Backend code quality unchecked.

**Impact:**  
Inconsistent code style, potential bugs undetected, harder code reviews.

**Files Affected:**
- `package.json` (add lint script)
- `.eslintrc.js` or `eslint.config.js` (new file)
- All `src/**/*.js` files (future linting)

**Estimated Fix:** 2 hours

**Risk:** LOW — Additive configuration only.

**Rollback:**  
Remove ESLint config and scripts from `package.json`.

**Verification:**
```bash
npm run lint
# Expected: All backend files pass ESLint
```

---

### 8. Bundle Size >150 kB Gzipped (Dashboard Routes)

**Reason:**  
`SimpleDashboard-BMTOVO0g.js`: 482.64 kB (151.17 kB gzip)  
`WorkspaceDashboard-pUki_RT3.js`: 379.66 kB (107.76 kB gzip)  
`AnalyticsDashboard-1_8SLJxG.js`: 372.53 kB (108.22 kB gzip)

**Impact:**  
Slow initial load, poor UX on mobile/slow networks. Fails PRD-041 Rule 15 (Dashboard <2s).

**Files Affected:**
- `frontend/src/pages/SimpleDashboard.jsx`
- `frontend/src/pages/WorkspaceDashboard.jsx` (if exists)
- `frontend/src/pages/AnalyticsDashboard.jsx`
- `frontend/vite.config.js` (code splitting config)

**Estimated Fix:** 4-6 hours

**Risk:** MEDIUM — Code splitting may introduce loading states or require lazy loading refactor.

**Rollback:**  
Revert Vite config and component imports.

**Verification:**
```bash
npm run build
# Check dist/assets/*.js gzip sizes
# Expected: All route chunks <100 kB gzipped
```

---

## P2 — MEDIUM (STABILITY IMPROVEMENTS)

### 9. Duplicate SkillRegistry and IntentDetector

**Reason:**  
`src/core/SkillRegistry.js` and `src/skills/SkillRegistry.js` both exist. Same for `IntentDetector`.

**Impact:**  
Maintenance burden, confusion about which is canonical, risk of divergent behavior.

**Files Affected:**
- `src/core/SkillRegistry.js`
- `src/skills/SkillRegistry.js`
- `src/core/IntentDetector.js`
- `src/skills/IntentDetector.js`
- All files importing from either location

**Estimated Fix:** 3-4 hours

**Risk:** MEDIUM — Must update all imports carefully. Risk of breaking skill resolution.

**Rollback:**  
Restore duplicate files from git history.

**Verification:**
```bash
grep -r "SkillRegistry" src/ | wc -l
# Expected: Single canonical import path
```
```bash
npm run start
# Expected: All skills load without errors
```

---

### 10. Build Time 126 Seconds

**Reason:**  
Vite build takes >2 minutes. Plugin overhead in vite:prepare-out-dir (36%) and vite:css-post (21%).

**Impact:**  
Slow CI/CD, developer productivity loss.

**Files Affected:**
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `frontend/src/index.css`

**Estimated Fix:** 2-3 hours

**Risk:** LOW — Configuration optimization only.

**Rollback:**  
Revert Vite and Tailwind config changes.

**Verification:**
```bash
time npm run build
# Expected: <60 seconds
```

---

### 11. No CI/CD Pipeline

**Reason:**  
No GitHub Actions or similar CI configured. No automated build, lint, test on PR.

**Impact:**  
Bugs merge to main, no quality gate, manual deployment process.

**Files Affected:**
- `.github/workflows/` (new directory)
- `render.yaml` (if using Render)
- `Dockerfile` (if containerized)

**Estimated Fix:** 3-4 hours

**Risk:** LOW — Additive configuration.

**Rollback:**  
Remove `.github/workflows/` files.

**Verification:**
1. Push a test branch
2. GitHub Actions triggers
3. Build, lint, test jobs run and pass

---

### 12. No Performance Monitoring

**Reason:**  
No APM, error tracking, or performance budgets configured.

**Impact:**  
Production issues undetected until users report. No visibility into API response times, error rates.

**Files Affected:**
- `frontend/vite.config.js` (performance budgets)
- `src/api/server.js` (request logging)
- New monitoring integration files

**Estimated Fix:** 3-4 hours

**Risk:** LOW — Additive instrumentation.

**Rollback:**  
Remove monitoring code and config.

**Verification:**
1. Trigger an API endpoint
2. Check monitoring dashboard shows request
3. Check error tracking captures intentional test error

---

## P3 — LOW (EXCELLENCE IMPROVEMENTS)

### 13. TypeScript Migration (Backend)

**Reason:**  
Backend is plain JavaScript. No type safety for API contracts, database models, or skill interfaces.

**Impact:**  
Runtime type errors, harder refactoring, poor IDE support.

**Files Affected:**
- All `src/**/*.js` files (backend)
- `tsconfig.json` (new)
- `package.json` (TypeScript dependencies)

**Estimated Fix:** 20-30 hours

**Risk:** HIGH — Large scope change. Risk of breaking runtime behavior.

**Rollback:**  
Revert all `.ts` files to `.js` from git history.

**Verification:**
```bash
npx tsc --noEmit
# Expected: 0 type errors
```

---

### 14. Microservices Split

**Reason:**  
Monolithic `server.js` and route files. Hard to scale independently.

**Impact:**  
Deployment all-or-nothing, resource contention, hard to debug.

**Files Affected:**
- `src/api/server.js`
- `src/api/routes/*.js`
- `docker-compose.yml`
- `render.yaml`

**Estimated Fix:** 30-40 hours

**Risk:** HIGH — Architectural change. Requires extensive testing.

**Rollback:**  
Revert to monolithic server.js.

**Verification:**
1. Each service starts independently
2. API Gateway routes correctly
3. End-to-end tests pass

---

### 15. Error Tracking Integration (Sentry)

**Reason:**  
No centralized error tracking. Production errors only visible in logs.

**Impact:**  
Slow incident response, no error aggregation, no alerting.

**Files Affected:**
- `frontend/src/main.jsx`
- `src/api/server.js`
- `.env` (SENTRY_DSN)

**Estimated Fix:** 2-3 hours

**Risk:** LOW — Additive SDK integration.

**Rollback:**  
Remove Sentry SDK and config.

**Verification:**
1. Trigger a test error in backend
2. Check Sentry dashboard shows error
3. Verify alert fires

---

### 16. Performance Budgets in Vite

**Reason:**  
No automated bundle size enforcement. Bundles can grow unbounded.

**Impact:**  
Gradual performance degradation, no early warning.

**Files Affected:**
- `frontend/vite.config.js`
- `frontend/package.json` (vite-plugin-bundle-visualizer optional)

**Estimated Fix:** 1 hour

**Risk:** LOW — Configuration only.

**Rollback:**  
Remove Vite config changes.

**Verification:**
```bash
npm run build
# Expected: Build fails if budget exceeded
```

---

## SUMMARY TABLE

| # | Issue | Priority | Auto Fix | Manual Fix | Estimated Time |
|---|-------|----------|----------|------------|----------------|
| 1 | Google OAuth dummy secret | P0 | No | Yes | 20 min |
| 2 | Redis not installed | P0 | No | Yes | 30 min |
| 3 | 10 critical npm vulns | P0 | Partial | Yes | 1-2 hrs |
| 4 | Smoke test script missing | P0 | No | Yes | 2-4 hrs |
| 5 | DB not migration-managed | P0 | No | Yes | 1 hr |
| 6 | 202 frontend lint errors | P1 | No | Yes | 8-10 hrs |
| 7 | Missing backend linting | P1 | No | Yes | 2 hrs |
| 8 | Bundle size >150 kB gzip | P1 | No | Yes | 4-6 hrs |
| 9 | Duplicate SkillRegistry/IntentDetector | P2 | No | Yes | 3-4 hrs |
| 10 | Build time 126s | P2 | No | Yes | 2-3 hrs |
| 11 | No CI/CD pipeline | P2 | No | Yes | 3-4 hrs |
| 12 | No performance monitoring | P2 | No | Yes | 3-4 hrs |
| 13 | TypeScript migration | P3 | No | Yes | 20-30 hrs |
| 14 | Microservices split | P3 | No | Yes | 30-40 hrs |
| 15 | Sentry integration | P3 | No | Yes | 2-3 hrs |
| 16 | Performance budgets | P3 | No | Yes | 1 hr |

---

## EXECUTION ORDER

### Phase 1: P0 Blockers (4-6 hours)
1. Fix Google OAuth secret
2. Install Redis
3. Patch critical npm vulnerabilities
4. Baseline Prisma migrations
5. Create smoke test script

### Phase 2: P1 Quality (14-18 hours)
6. Fix 202 lint errors
7. Add backend linting
8. Optimize bundle sizes

### Phase 3: P2 Stability (11-15 hours)
9. Remove duplicates
10. Optimize build time
11. Add CI/CD
12. Add monitoring

### Phase 4: P3 Excellence (23-34 hours)
13. TypeScript migration
14. Microservices split
15. Sentry integration
16. Performance budgets

---

## RISK MITIGATION

| Phase | Risk | Mitigation |
|-------|------|------------|
| P0 | OAuth secret exposure | Rotate secret after fixing, audit Google Cloud Console |
| P0 | npm audit fix breaks app | Test on separate branch, use `--force` only if necessary |
| P1 | Lint fixes introduce bugs | Run full test suite after each batch of fixes |
| P2 | Duplicate removal breaks imports | Use grep to find all imports before refactoring |
| P3 | TypeScript migration scope creep | Migrate one module at a time, keep JS fallback |

---

## ROLLBACK STRATEGY

**For all phases:**
1. Create feature branch before starting: `git checkout -b recovery/phase-N`
2. Commit after each issue fix
3. If issue arises: `git revert <commit-hash>`
4. For P0 issues: Keep `.env` backup before changes
5. For database: `prisma/dev.db` backup before migrations

**Emergency Rollback:**
```bash
git reset --hard ba26ad2
# Restores to last known good state
```

---

## VERIFICATION CHECKLIST

### Before Starting Recovery
- [ ] CTO approval obtained
- [ ] `.env` backed up
- [ ] `prisma/dev.db` backed up
- [ ] Feature branch created: `recovery/phase-N`
- [ ] Staging environment available for testing

### After Each Phase
- [ ] All verification commands pass
- [ ] No new lint errors introduced
- [ ] Application starts successfully
- [ ] Critical user flows work (Login, Dashboard, Document upload)
- [ ] No console errors in browser
- [ ] No backend errors in logs

### Before Production Deploy
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] P2 issues resolved or accepted as technical debt
- [ ] Full regression test completed
- [ ] Performance benchmarks met
- [ ] Security scan passes
- [ ] CTO approval for production

---

## ESTIMATED TOTAL EFFORT

| Phase | Duration | Team Size | Calendar Days |
|-------|----------|-----------|---------------|
| P0 | 4-6 hours | 1 developer | 1 day |
| P1 | 14-18 hours | 1 developer | 2-3 days |
| P2 | 11-15 hours | 1 developer | 2 days |
| P3 | 23-34 hours | 1 developer | 3-5 days |
| **Total** | **52-73 hours** | **1 developer** | **8-11 days** |

**With 2 developers:** 4-6 calendar days

---

*Recovery Plan generated in compliance with PRD-041 and PRD-042. No code has been modified. No commits have been made. No pushes have been executed. Awaiting CTO approval to proceed.*
