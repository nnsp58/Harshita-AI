# Technical Debt Register

This document tracks all known technical debt, specifically categorized from the 211 lint errors discovered during the v1.0 Launch validation phase.

## Categorization Rules
- **Critical**: Must be fixed before Launch. (e.g., memory leaks, security vulnerabilities, infinite loops)
- **Major**: Must be fixed before Version 1.1. (e.g., `setState` in `useEffect` causing cascading renders)
- **Minor**: Can be deferred to Version 2.0. (e.g., unused variables, missing PropTypes)
- **Deferred**: Ignored for now but documented.

---

## 1. Critical Debt (Fix Before Launch)
*Currently, no critical infinite loop or security lint errors were detected in the 211 count. If any emerge, they will be logged here.*

## 2. Major Debt (Fix Before v1.1)

### Issue: Cascading Renders (`react-hooks/set-state-in-effect`)
**Impact**: Medium-High. Calling `setState` synchronously in an effect causes performance degradation and double-renders.
**Owner**: AI Agent / Dev Team
**Status**: Pending

**Affected Files**:
- `src/pages/admin/DeveloperCenter.jsx` (loadStatus)
- `src/pages/admin/SelfHealingCenter.jsx` (loadReport)
- `src/pages/admin/SkillsControl.jsx` (loadSkills)
- `src/pages/SimpleDashboard.jsx` (legacy initialization)

**Future Fix**: Refactor `useEffect` to use async fetch patterns without triggering immediate synchronous layout jumps, or use `Suspense`/`React Query`.

## 3. Minor Debt (Fix Before v2.0)

### Issue: Unused Variables (`no-unused-vars`)
**Impact**: Low. Bloats the bundle slightly and reduces code readability.
**Owner**: AI Agent / Dev Team
**Status**: Pending

**Affected Files**:
- `src/pages/public/Pricing.jsx` ('user' is never used)
- `src/services/socket.js` ('room' is never used)
- `src/pages/admin/DeveloperCenter.jsx` ('useRef' is never used)
- `src/pages/admin/SelfHealingCenter.jsx` ('motion' is never used)
- *...and approx 190 other instances across legacy components.*

**Future Fix**: Run `eslint --fix` or manually strip out unused imports during a dedicated refactoring sprint.
