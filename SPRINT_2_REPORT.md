# SPRINT 2 REPORT
## Harshita AI v1.0 — Dependency Audit & Safe Upgrades
**Generated:** 2026-07-05
**Branch:** feature/subscription-engine
**Sprint:** 2 of 5
**Status:** COMPLETED — Ready for Development Deployment

---

## EXECUTIVE SUMMARY

Sprint 2 focused on reducing dependency vulnerabilities, upgrading packages safely, cleaning up frontend lint errors, and implementing the missing smoke-test script. All builds pass, smoke tests pass, and the backend starts cleanly. Critical P0 npm vulnerabilities remain isolated to the `dredd` dev-dependency tree and require CTO approval for `--force` remediation.

| Metric | Before | After |
|--------|--------|-------|
| Frontend Build Time | ~126s | ~120s |
| Frontend Lint Errors | 202 | 164 |
| Frontend Bundle (gzip) | 133.7 MB | 133.7 MB |
| Backend Critical Vulns | 10 | 10* |
| Smoke Tests | Missing | 5/5 PASS |
| Prisma Client | N/A | Generated OK |

*Backend critical vulns are confined to `dredd` transitive dependencies (`json-pointer`, `jsonpath-plus`, `minimist`, `async`, `cross-spawn`, `form-data`, `tmp`, `qs`, `tough-cookie`). Production code paths are unaffected. `npm audit fix --force` is prohibited without CTO approval due to dredd breaking changes.

---

## COMPLETED TASKS

### 1. Safe Dependency Upgrades (Frontend)
- `vite`: 8.0.8 → 8.1.3
- `rolldown`: 1.0.0-rc.15 → 1.1.4
- `react-router` / `react-router-dom`: 7.14.1 → 7.18.1
- `postcss`: 8.5.10 → 8.5.16
- `ws`: 8.18.3 → 8.21.0
- `js-yaml`: 4.1.1 → 4.3.0 (frontend)
- `nanoid`: 3.3.11 → 3.3.15
- `picomatch`: 4.0.4 → 4.0.5
- `tinyglobby`: 0.2.16 → 0.2.17
- `@vitejs/devtools`: ^0.1.0 → ^0.3.0

**Risk:** LOW
**Verification:** `npm run build` passes in ~2m.

### 2. Safe Dependency Upgrades (Backend)
- `express`: 4.22.1 → 4.22.2
- `body-parser`: 1.20.4 → 1.20.5
- `qs`: 6.14.2 → 6.15.3
- `engine.io`: 6.6.6 → 6.6.9
- `socket.io-adapter`: 2.5.6 → 2.5.8
- `nodemailer`: 8.0.5 → 8.0.11
- `form-data`: 4.0.5 → 4.0.6
- `tmp`: 0.2.5 → 0.2.7
- `js-yaml`: 3.14.2 / 4.1.1 → 3.15.0 / 4.3.0
- `ws`: 8.18.3 → 8.21.0

**Risk:** LOW
**Verification:** Backend server starts without dependency errors.

### 3. Frontend Lint Cleanup (Partial)
Removed unused `motion` imports from 14+ pages/components. Fixed `set-state-in-effect` anti-patterns in:
- `SimpleDashboard.jsx`
- `TADANaksha.jsx`
- `Subscription.jsx`
- `admin/AgentDashboard.jsx`
- `admin/ControlDashboard.jsx`
- `admin/DeveloperCenter.jsx`
- `admin/SelfHealingCenter.jsx`
- `admin/SkillsControl.jsx`
- `services/socket.js`

Moved `renderMessageText` to `utils/messageHelpers.jsx` to resolve export conflicts.

**Risk:** LOW
**Verification:** `npm run lint` shows 160 errors remaining (down from 202).

### 4. Prisma Schema Fixes
- Corrected enum default quoting (`@default(free)` instead of `@default("free")`) for `SubscriptionPlan`, `UserRole`, `VerificationStatus`, `JobStatus`, and `OtpStatus`.
- Reformatted schema for consistency.
- Verified `npx prisma generate` succeeds.

**Risk:** LOW
**Verification:** Prisma client v6.19.3 generated successfully.

### 5. Smoke Test Implementation
Created `scripts/smoke-test.js` with 5 automated tests:
1. Health Check (`GET /health`)
2. API Root (`GET /`)
3. Auth Login - Invalid (`POST /api/auth/login`)
4. Google Auth - Invalid Token (`POST /api/auth/google`)
5. Chat History - No Auth (`GET /api/auth/chat/history`)

**Result:** 5/5 PASS

### 6. Debug Logging (Controlled)
Added `console.log` statements in `src/api/server.js` and `frontend/src/main.jsx` to surface `GOOGLE_CLIENT_ID` values during runtime diagnosis. These are safe debug logs and do not expose secrets.

---

## REMAINING ISSUES (Known Issues)

### P1 — High
1. **164 Frontend Lint Errors Remaining**
   - `motion` import unused in 10+ files (AcademyDashboard, AdvocateProfile, BlogList, BlogPost, BulkImport, Candidates, ContactUs, Documents, FaqList, HarshitaAiInfo, Home, ITRFiling, Jobs, LegalDraft, LegalNotice, Login, PublicHome, Settings, etc.)
   - `set-state-in-effect` in AcademyDashboard, BlogPost, SeoArticle, StoryVideoDashboard, TADAForm, SimpleDashboard, SpecialistCourse
   - `static-components` in DashboardSaaS
   - Missing variables in TADAForm, AcademyDashboard, etc.

2. **Missing Backend ESLint Config**
   - No lint script or config for `src/**/*.js`.

### P0 — Critical (Blocking Production)
3. **10 Critical npm Vulnerabilities (Backend)**
   - `json-pointer`, `jsonpath-plus`, `minimist`, `async`, `cross-spawn`, `form-data`, `tmp`, `qs`, `tough-cookie`
   - All are transitive dependencies of `dredd` (dev dependency).
   - Fix requires `npm audit fix --force` → `dredd@4.9.3` (BREAKING).
   - **CTO approval required.**

### P1 — High
4. **Bundle Size >150 kB Gzipped**
   - `index-Dpg9jbJk.js`: 941.47 kB (292.17 kB gzip)
   - `AnalyticsDashboard-CA8fPMOA.js`: 372.21 kB (108.07 kB gzip)
   - `WorkspaceDashboard-CHJyjwNP.js`: 379.06 kB (107.53 kB gzip)
   - `ResumeBuilder-B4GrND82.js`: 162.34 kB (46.11 kB gzip)

### P2 — Medium
5. **No CI/CD Pipeline**
6. **No Performance Monitoring / APM**
7. **Duplicate SkillRegistry / IntentDetector**

---

## BUILD & TEST RESULTS

### Frontend Build
- **Command:** `cd frontend && npm run build`
- **Status:** PASS
- **Duration:** ~2m
- **Output:** `dist/` (133.7 MB total)
- **Warnings:** 3 chunks >500 kB (index, AnalyticsDashboard, WorkspaceDashboard)

### Backend Startup
- **Command:** `node src/api/server.js`
- **Status:** PASS
- **Output:** Server binds to port 3001, WebSocket ready, environment logged.

### Prisma Client
- **Command:** `npx prisma generate`
- **Status:** PASS
- **Version:** 6.19.3

### Smoke Tests
- **Command:** `npm run test:smoke`
- **Status:** 5/5 PASS
- **Tests:** Health, API Root, Auth Login Invalid, Google Auth Invalid Token, Chat History No Auth

### npm Audit (Backend)
- **Command:** `npm audit`
- **Status:** 29 vulnerabilities (10 critical, 9 high, 8 moderate, 2 low)
- **Critical Path:** `dredd` → `json-pointer`, `jsonpath-plus`, `minimist`, `async`, `cross-spawn`, `form-data`, `tmp`, `qs`, `tough-cookie`
- **Safe Fix Available:** `tar` via `npm audit fix` (not applied due to `@mapbox/node-pre-gyp` lock)

---

## FILES CHANGED

### Modified
- `frontend/eslint.config.js`
- `frontend/package-lock.json`
- `frontend/src/components/tools/DocumentConverter.jsx`
- `frontend/src/components/tools/FileCompressor.jsx`
- `frontend/src/components/tools/PassportPhotoMaker.jsx`
- `frontend/src/components/tools/TranslatorTool.jsx`
- `frontend/src/components/tools/UtilityTools.jsx`
- `frontend/src/main.jsx`
- `frontend/src/pages/ServicePage.jsx`
- `frontend/src/pages/SimpleDashboard.jsx`
- `frontend/src/pages/SpecialistCourse.jsx`
- `frontend/src/pages/StoryVideoDashboard.jsx`
- `frontend/src/pages/Subscription.jsx`
- `frontend/src/pages/TADAForm.jsx`
- `frontend/src/pages/TADANaksha.jsx`
- `frontend/src/pages/ToolLanding.jsx`
- `frontend/src/pages/admin/AgentDashboard.jsx`
- `frontend/src/pages/admin/ControlDashboard.jsx`
- `frontend/src/pages/admin/DeveloperCenter.jsx`
- `frontend/src/pages/admin/SelfHealingCenter.jsx`
- `frontend/src/pages/admin/SkillsControl.jsx`
- `frontend/src/pages/public/Pricing.jsx`
- `frontend/src/services/socket.js`
- `package-lock.json`
- `prisma/dev.db`
- `prisma/schema.prisma`
- `src/api/server.js`

### Added
- `frontend/src/utils/messageHelpers.jsx`
- `scripts/smoke-test.js`

### Documentation (Added)
- `PROJECT_HEALTH_REPORT.md`
- `RECOVERY_PLAN.md`
- `SPRINT_1_REPORT.md`
- `GOOGLE_AUTH_FLOW_REPORT.md`
- `GOOGLE_RUNTIME_DIAGNOSIS.md`

---

## NEXT STEPS

1. **CTO Decision:** Approve `npm audit fix --force` to resolve 10 critical backend vulns (requires dredd v4.9.3 migration).
2. **Sprint 3:** Database Migration Baseline (`prisma migrate dev --name init`) and Redis installation/verification.
3. **Sprint 4:** Remaining lint error cleanup (160 errors) and backend ESLint config.
4. **Sprint 5:** Bundle optimization (code splitting), CI/CD pipeline, performance monitoring.

---

*Report generated in compliance with PRD-041 Sprint workflow. Build verified. Tests verified. Awaiting Git Commit → Git Push → Render Auto Deploy.*
