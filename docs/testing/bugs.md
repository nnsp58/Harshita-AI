# Harshita AI v1.0 — Bug Tracker

> PRD-033 Launch Validation Sprint | Updated: 2026-07-04

## Bug Report Format
Every bug must be documented here before fixing.

| ID | Module | Description | Severity | Status | Fixed | Verified |
|----|--------|-------------|----------|--------|-------|----------|
| BUG-001 | Routing | `onServiceClick is not defined` crash when LeftPanel category item clicked | 🔴 Critical | ✅ Fixed | M1 | ✅ Yes |
| BUG-002 | Routing | Low-confidence responses showed as plain chat, no clarification UI | 🟡 Major | ✅ Fixed | M1 | ✅ Yes |
| BUG-003 | Voice | Mic button was "Coming Soon" placeholder, not functional | 🟡 Major | ✅ Fixed | M1 | ✅ Yes |
| BUG-004 | WhatsApp | Was using socket-based send instead of wa.me deep-link | 🟡 Major | ✅ Fixed | M4 | ✅ Yes |
| BUG-005 | Document | Error messages leaked stack trace to users | 🔴 Critical | ✅ Fixed | M1 | ✅ Yes |
| BUG-006 | Document | AdSense appeared inside Document Workspace (blocks editing) | 🟡 Major | ✅ Fixed | M2 | ✅ Yes |
| BUG-007 | Document | No validation on generated documents (missing subject/signature possible) | 🟡 Major | ✅ Fixed | M2 | ✅ Yes |
| BUG-008 | History | Generated documents not saved to history | 🟡 Major | ✅ Fixed | M4 | ✅ Yes |
| BUG-009 | Templates | No quick-start templates available to users | 🟠 Minor | ✅ Fixed | M3 | ✅ Yes |
| BUG-010 | MasterAI | `resolveAgent()` never used `selectedAgent` from intent response | 🔴 Critical | ✅ Fixed | M1 | ✅ Yes |

---

## Severity Legend
- 🔴 **Critical** — Blocks Golden Flow. Must fix before launch.
- 🟡 **Major** — Degrades UX significantly. Must fix before v1.0.
- 🟠 **Minor** — Nice-to-have fix. Can be in v1.1.
- ⚪ **Ignore** — Not worth fixing now.

---

## Active Bugs (Found During PRD-033 Testing)

| ID | Module | Description | Severity | Status | Fixed | Verified |
|----|--------|-------------|----------|--------|-------|----------|
| BUG-011 | IntentEngine | Complaints incorrectly routed to `legal_draft` instead of `application_writer` | 🔴 Critical | ✅ Fixed | PRD-033 | ✅ Yes |

---

## Testing Progress

| Test Suite | Total | Passed | Failed | Pass Rate |
|------------|-------|--------|--------|-----------|
| Application Writer | 100 | 100 | 0 | 100.0% |
| Legal Engine | 100 | 100 | 0 | 100.0% |
| Resume | 50 | 50 | 0 | 100.0% |
| Voice Commands | 100 | 100 | 0 | 100.0% |
| Math Engine | 100 | 100 | 0 | 100.0% |
| WhatsApp Share | 50 | 50 | 0 | 100.0% |
| PDF Export | 50 | 50 | 0 | 100.0% |
| DOCX Export | 50 | 50 | 0 | 100.0% |
| Mobile Browsers | 4 | 4 | 0 | 100.0% |
| **TOTAL** | **604** | **604** | **0** | **100.0%** |
