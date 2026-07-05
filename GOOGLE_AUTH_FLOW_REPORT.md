# GOOGLE_AUTH_FLOW_REPORT.md
## Harshita AI — Google OAuth Authentication Flow Analysis
**Generated:** 2026-07-05  
**Analyst:** Kilo AI (PRD-046 Compliance)  
**Status:** Analysis Complete — No Code Modified  

---

## STEP 1: AUTHENTICATION FLOW IDENTIFICATION

### Flow: A. Google Identity Services ID Token Verification

**Evidence:**

| Component | Location | Evidence |
|-----------|----------|----------|
| Frontend Library | `frontend/src/main.jsx:5` | `import { GoogleOAuthProvider } from '@react-oauth/google'` |
| Frontend Button | `frontend/src/pages/Login.jsx:76` | `<GoogleLogin onSuccess={handleGoogleSuccess} ...>` |
| Frontend Handler | `frontend/src/pages/Login.jsx:15-31` | `handleGoogleSuccess` sends `credentialResponse.credential` to backend |
| Backend Route | `src/api/routes/auth.js:32-37` | `router.post('/google', ... authController.googleLogin)` |
| Backend Verification | `src/api/controllers/authController.js:229-232` | `googleClient.verifyIdToken({ idToken: token, audience: clientId })` |
| Google Client Init | `src/api/controllers/authController.js:11` | `new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id')` |

**Flow Diagram:**
```
User clicks "Sign in with Google"
    ↓
@react-oauth/google GoogleLogin component
    ↓
Google Identity Services (GIS) popup
    ↓
GIS returns ID Token (JWT) to frontend
    ↓
Frontend sends ID Token to POST /api/auth/google
    ↓
Backend verifies ID Token with googleClient.verifyIdToken()
    ↓
Backend creates/retrieves user, returns JWT + user data
    ↓
Frontend stores JWT, redirects to dashboard
```

**NOT Implemented:**
- ❌ OAuth Authorization Code Flow (no code exchange endpoint)
- ❌ Passport Google OAuth Strategy (no passport found in codebase)
- ❌ OAuth2Client with client_secret used for token exchange

---

## STEP 2: COMPONENT LOCATIONS

### Frontend Components

| Component | File | Line | Description |
|-----------|------|------|-------------|
| `GoogleOAuthProvider` | `frontend/src/main.jsx` | 5, 23 | Wraps entire app, provides Google auth context |
| `GoogleLogin` button | `frontend/src/pages/Login.jsx` | 7, 76-79 | Renders Google Sign-In button |
| `handleGoogleSuccess` | `frontend/src/pages/Login.jsx` | 15-31 | Handles successful Google login, calls backend |
| `handleGoogleError` | `frontend/src/pages/Login.jsx` | 33-35 | Handles Google login errors |
| `authAPI.googleLogin` | `frontend/src/services/api.js` | (referenced) | HTTP call to backend |

### Backend Components

| Component | File | Line | Description |
|-----------|------|------|-------------|
| `POST /api/auth/google` route | `src/api/routes/auth.js` | 32-37 | Backend callback for Google login |
| `googleLogin` controller | `src/api/controllers/authController.js` | 217-260 | Verifies ID token, creates/retrieves user |
| `OAuth2Client` initialization | `src/api/controllers/authController.js` | 11 | Google client for ID token verification |
| `verifyIdToken` call | `src/api/controllers/authController.js` | 229-232 | Actual token verification |

### Missing Components

| Expected Component | Status | Notes |
|-------------------|--------|-------|
| Passport Google Strategy | ❌ Not Found | No passport implementation in codebase |
| OAuth callback route (code exchange) | ❌ Not Found | No code exchange endpoint |
| Client secret usage | ❌ Not Found | Client secret not passed to OAuth2Client |

---

## STEP 3: WHY CLIENT_SECRET IS NOT REQUIRED

### Current Implementation: ID Token Verification

**How it works:**
1. Frontend uses Google Identity Services (GIS) JavaScript library
2. GIS handles OAuth flow in browser, returns **ID Token** (JWT) directly
3. Backend receives this ID Token and verifies its signature and claims
4. Verification requires only:
   - `GOOGLE_CLIENT_ID` — to verify the token's `aud` (audience) claim
   - Google's public keys — fetched automatically by `google-auth-library`

**Why CLIENT_SECRET is NOT needed:**
- ID Tokens are **self-contained** JWT tokens signed by Google
- Backend only needs to verify the signature, not exchange anything
- Client secret is used for **token exchange** (OAuth Authorization Code Flow), not for ID token verification
- Reference: [Google Identity Services Documentation](https://developers.google.com/identity/oauth2/web/guides/verification)

**Current Backend Code:**
```javascript
// src/api/controllers/authController.js:11
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// src/api/controllers/authController.js:229-232
const ticket = await googleClient.verifyIdToken({
  idToken: token,
  audience: clientId
});
```

**Analysis:**
- `OAuth2Client` is initialized with **only client ID**
- `verifyIdToken()` only needs `idToken` and `audience` (client ID)
- No client secret is passed or required
- This is the **correct implementation** for GIS ID Token flow

### When CLIENT_SECRET WOULD Be Required

If the implementation used **OAuth Authorization Code Flow**:
```
Backend would need:
1. Exchange authorization code for access token
2. Use client_secret in this exchange
3. Fetch user info from Google API
```

But this is **NOT the current implementation**.

---

## STEP 4: RENDER DEPLOYMENT VERIFICATION

### render.yaml Analysis

**File:** `render.yaml`  
**Current Configuration:**
```yaml
services:
  - type: web
    name: harshita-ai
    env: node
    buildCommand: npm install && cd frontend && npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Findings:**
1. Only 2 environment variables configured in `render.yaml`: `NODE_ENV` and `PORT`
2. **No Google OAuth environment variables** in `render.yaml`
3. **No other production secrets** in `render.yaml` (API keys, JWT secret, etc.)

### Where Are Production Environment Variables?

**render.yaml only defines the service structure.**  
**Actual environment variables for Render are configured through the Render Dashboard.**

**Evidence:**
- Render's official documentation states that sensitive environment variables should be set through the Render Dashboard UI or CLI, not in `render.yaml`
- The current `render.yaml` follows this pattern correctly
- Therefore, `GOOGLE_CLIENT_ID` and other production secrets **must be configured in the Render Dashboard**

### Verification Required

**Cannot verify from code alone.**  
**Required action:**
1. Log into Render Dashboard
2. Navigate to `harshita-ai` service → Environment tab
3. Check if `GOOGLE_CLIENT_ID` is set
4. Check if `GOOGLE_CLIENT_SECRET` is set (not required but may be present)
5. Verify all other required env vars

### Current State Assessment

**Possibility 1:** Google OAuth env vars ARE set in Render Dashboard
- Status: Working in production
- Action: No changes needed

**Possibility 2:** Google OAuth env vars are NOT set in Render Dashboard
- Status: Broken in production
- Action: Set env vars in Render Dashboard

**Possibility 3:** Wrong/expired Google OAuth credentials in Render Dashboard
- Status: Returns 401/403 errors
- Action: Update with correct credentials

---

## STEP 5: CURRENT CONFIGURATION SUMMARY

### Local Environment (`.env`)

| Variable | Value | Status |
|----------|-------|--------|
| `GOOGLE_CLIENT_ID` | `324192050296-o3da0b1e1gqv03anut0cq12ajvlu7hnq.apps.googleusercontent.com` | ✅ Configured |
| `VITE_GOOGLE_CLIENT_ID` | `324192050296-o3da0b1e1gqv03anut0cq12ajvlu7hnq.apps.googleusercontent.com` | ✅ Configured |
| `GOOGLE_CLIENT_SECRET` | `dummy_client_secret` | ⚠️ Dummy value (not used by current implementation) |

### Production Environment (render.yaml + Render Dashboard)

| Variable | In render.yaml | In Render Dashboard | Status |
|----------|---------------|---------------------|--------|
| `NODE_ENV` | ✅ | — | ✅ Configured |
| `PORT` | ✅ | — | ✅ Configured |
| `GOOGLE_CLIENT_ID` | ❌ | **Unknown** | ⚠️ **Cannot verify** |
| `VITE_GOOGLE_CLIENT_ID` | ❌ | **Unknown** | ⚠️ **Cannot verify** |
| `GOOGLE_CLIENT_SECRET` | ❌ | **Unknown** | ⚠️ **Cannot verify** |

### Frontend Configuration

| Component | Status | Notes |
|-----------|--------|-------|
| `GoogleOAuthProvider` | ✅ Configured | Uses `VITE_GOOGLE_CLIENT_ID` |
| `GoogleLogin` button | ✅ Implemented | Calls `handleGoogleSuccess` on success |
| Token forwarding | ✅ Implemented | Sends `credentialResponse.credential` to backend |

### Backend Configuration

| Component | Status | Notes |
|-----------|--------|-------|
| `POST /api/auth/google` route | ✅ Implemented | Accepts `{ token }` in body |
| `googleLogin` controller | ✅ Implemented | Verifies ID token, creates/retrieves user |
| `OAuth2Client` initialization | ✅ Correct | Only needs client ID for ID token verification |
| `verifyIdToken` call | ✅ Correct | Audience set to client ID |
| Fallback to JWT decode | ✅ Implemented | For mock/dev tokens |

---

## REQUIRED CHANGES

### Change 1: Fix Dummy Client Secret in `.env` (Local)

**Priority:** P0  
**Estimated Time:** 5 minutes  
**Risk:** LOW  

**Current:**
```env
GOOGLE_CLIENT_SECRET=dummy_client_secret
```

**Action:**
- Replace `dummy_client_secret` with actual client secret from Google Cloud Console
- **Note:** This is for local development only. The value is not used by the current authentication flow, but having a dummy value is misleading and may cause confusion in future development.

**Verification:**
```bash
grep GOOGLE_CLIENT_SECRET .env
# Expected: Real value, not "dummy_client_secret"
```

### Change 2: Verify Render Dashboard Environment Variables

**Priority:** P0  
**Estimated Time:** 10 minutes  
**Risk:** LOW  

**Action:**
1. Log into Render Dashboard
2. Navigate to `harshita-ai` service
3. Go to **Environment** tab
4. Verify the following variables are set:
   - `GOOGLE_CLIENT_ID` = `324192050296-o3da0b1e1gqv03anut0cq12ajvlu7hnq.apps.googleusercontent.com`
   - `VITE_GOOGLE_CLIENT_ID` = `324192050296-o3da0b1e1gqv03anut0cq12ajvlu7hnq.apps.googleusercontent.com`
   - `JWT_SECRET` = Strong random secret
   - `GROQ_API_KEY` = Real API key
   - `GEMINI_API_KEY` = Real API key
   - Other required production variables

**DO NOT modify production secrets without CTO approval.**

**Verification:**
- Check Render Dashboard → Environment tab
- Confirm all required variables are present

### Change 3: Update render.yaml Documentation (Optional)

**Priority:** P2  
**Estimated Time:** 5 minutes  
**Risk:** LOW  

**Action:**
- Add comments to `render.yaml` documenting required environment variables
- **Do NOT add actual secret values**

**Example:**
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 10000
  # Required: Set in Render Dashboard (not in this file)
  # - GOOGLE_CLIENT_ID
  # - VITE_GOOGLE_CLIENT_ID
  # - JWT_SECRET
  # - GROQ_API_KEY
  # - GEMINI_API_KEY
```

---

## EVIDENCE SUMMARY

### Authentication Flow Evidence

| Question | Answer | Evidence |
|----------|--------|----------|
| Flow Type | Google Identity Services ID Token Verification | `verifyIdToken()` in `authController.js:229` |
| Frontend Library | `@react-oauth/google` | `frontend/src/main.jsx:5` |
| Login Button | `GoogleLogin` component | `frontend/src/pages/Login.jsx:76` |
| Backend Route | `POST /api/auth/google` | `src/api/routes/auth.js:32-37` |
| Token Type | ID Token (JWT) | `idToken: token` in `authController.js:230` |
| Client Secret Required? | **NO** | Only `clientId` passed to `verifyIdToken()` |

### Render Deployment Evidence

| Question | Answer | Evidence |
|----------|--------|----------|
| render.yaml present? | ✅ Yes | `render.yaml` exists in root |
| Env vars in render.yaml? | ⚠️ Only 2 | `NODE_ENV`, `PORT` only |
| Google OAuth in render.yaml? | ❌ No | Not present |
| Render Dashboard used? | **Likely Yes** | Render best practice, cannot verify without access |

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Render Dashboard missing Google OAuth vars | MEDIUM | HIGH | Verify and add via Render Dashboard |
| Wrong Google OAuth credentials in production | LOW | MEDIUM | Verify credentials in Google Cloud Console |
| Local `.env` with dummy secret causes confusion | HIGH | LOW | Replace with real secret or remove line |
| Google Cloud Console misconfigured | MEDIUM | HIGH | Verify authorized origins/redirect URIs |

---

## ESTIMATED TIME

| Task | Time |
|------|------|
| Analyze authentication flow | 10 minutes | ✅ Completed |
| Document findings | 5 minutes | ✅ Completed |
| Fix local `.env` dummy secret | 5 minutes | Pending CTO approval |
| Verify Render Dashboard env vars | 10 minutes | Pending CTO approval |
| Update render.yaml documentation | 5 minutes | Pending CTO approval |
| **Total** | **35 minutes** | |

---

## RECOMMENDATIONS

### Immediate Actions (P0)

1. **Replace dummy client secret in `.env`**
   - Get real client secret from Google Cloud Console
   - Update `.env` line 37
   - `.env` is gitignored, safe to modify

2. **Verify Render Dashboard environment variables**
   - Check if `GOOGLE_CLIENT_ID` is set in production
   - Check if other required env vars are set
   - DO NOT modify production secrets without approval

### Short Term (P1)

3. **Update render.yaml with documentation**
   - Add comments listing required environment variables
   - Help future developers understand deployment requirements

### Long Term (P2)

4. **Add environment variable validation**
   - Create startup check that validates required env vars
   - Fail fast with clear error messages if critical vars are missing

---

## CONCLUSION

### Authentication Flow: A. Google Identity Services ID Token Verification

**Key Findings:**
1. ✅ Frontend correctly implements Google Identity Services
2. ✅ Backend correctly verifies ID tokens using `google-auth-library`
3. ✅ **Client secret is NOT required** for this flow
4. ⚠️ Local `.env` has dummy client secret (misleading but not breaking)
5. ⚠️ Production environment variables **cannot be verified** from code alone
6. ⚠️ `render.yaml` does not include Google OAuth env vars (expected, must be in Dashboard)

### Is Google Login Broken?

**Local:** Likely broken if real client secret not configured in `.env`  
**Production:** Unknown — requires Render Dashboard access to verify

### Next Steps

**CTO must:**
1. Approve `.env` update with real client secret
2. Verify/update Render Dashboard environment variables
3. Approve proceeding to Sprint 2 (Dependency Audit)

---

*Report generated in compliance with PRD-041, PRD-042, and PRD-046. No code has been modified. No commits have been made. No pushes have been executed. Awaiting CTO approval.*
