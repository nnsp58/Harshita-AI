# PRD 07 — Memory Engine

## Overview

The Memory Engine provides persistent, per-user memory that survives across sessions. It enables Harshita AI to remember user preferences, project context, coding style, past interactions, and successful solutions — making the AI smarter with every use.

---

## Architecture

```
MemoryEngine
├── Short-Term Memory (conversation context — in RAM)
├── Working Memory (current task state — in RAM)
├── Long-Term Memory (persistent — on disk)
│   ├── User Profiles
│   ├── Project History
│   ├── Coding Preferences
│   ├── Skill Usage Patterns
│   └── Successful Solutions
└── Shared Memory (cross-user patterns — analytics)
```

---

## Storage Structure

```
data/memory/
├── users/
│   ├── user_abc123.json
│   ├── user_def456.json
│   └── ...
├── projects/
│   ├── project_xyz.json
│   └── ...
└── shared/
    ├── common_patterns.json
    └── skill_preferences.json
```

---

## User Profile Schema

```javascript
UserMemorySchema = {
  userId: string,
  created: ISO date,
  lastActive: ISO date,

  // Preferences
  preferences: {
    language: 'hi' | 'en' | 'hinglish',
    units: 'metric' | 'imperial' | 'indian',  // for geometry/conversion
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  },

  // Personal Info (voluntarily provided)
  profile: {
    name: string,
    location: string,        // District, State
    occupation: string,
    organization: string,
  },

  // Skill Usage History
  skillUsage: {
    mostUsed: [{ skill: string, count: number }],
    lastUsed: [{ skill: string, timestamp: ISO }],
    favorites: string[],
  },

  // Coding Preferences
  coding: {
    preferredLanguage: string,     // 'javascript', 'python', etc.
    framework: string,             // 'react', 'nextjs', etc.
    indentation: 'spaces' | 'tabs',
    indentSize: 2 | 4,
    style: 'functional' | 'oop' | 'mixed',
    lintRules: string,
  },

  // Legal Preferences
  legal: {
    defaultLanguage: 'hi' | 'en' | 'bilingual',
    defaultCourt: string,
    savedParties: object[],       // Frequently used party details
  },

  // Successful Fixes (for self-healing)
  fixes: [{
    skill: string,
    problem: string,
    solution: string,
    timestamp: ISO,
  }],

  // Custom key-value store
  custom: Record<string, any>,
}
```

---

## API

```javascript
class MemoryEngine {
  // Core CRUD
  remember(userId, key, value)       // Store a value
  recall(userId, key)                // Retrieve a value
  forget(userId, key)                // Delete a value

  // User Profile
  getUserProfile(userId)             // Full profile
  updatePreference(userId, key, val) // Update single pref
  getPreferredLanguage(userId)       // Quick access

  // Skill Memory
  recordSkillUsage(userId, skill)    // Track usage
  getMostUsedSkills(userId, limit)   // Top skills
  getLastUsedSkills(userId, limit)   // Recent skills

  // Project Memory
  saveProject(userId, projectId, data)  // Save project state
  getProject(userId, projectId)         // Recall project
  listProjects(userId)                  // All projects

  // Coding Memory
  getCodingStyle(userId)             // Coding preferences
  saveCodingStyle(userId, style)     // Update coding prefs

  // Fix Memory (Self-Healing)
  saveFix(userId, skill, problem, solution)  // Record fix
  findSimilarFix(skill, problem)             // Find past fix

  // Cleanup
  cleanup(maxAgeDays)                // Remove old memories
  exportMemory(userId)               // Export all user data
  deleteUserMemory(userId)           // GDPR delete
}
```

---

## Integration Points

| Engine | How Memory Helps |
|--------|-----------------|
| IntentDetector | Bias toward user's frequently used skills |
| MasterAgent | Inject user preferences into context |
| LegalDraftSkill | Remember saved party details |
| GeometrySkill | Remember preferred units |
| CodingAgent | Remember coding style |
| SelfHealingEngine | Recall past successful fixes |
| TranslationSkill | Remember preferred languages |

---

## Privacy & Security

- All memory stored locally (no cloud sync unless opted-in)
- `deleteUserMemory(userId)` for full data deletion (GDPR)
- `exportMemory(userId)` for data portability
- No sensitive data (passwords, API keys) stored in memory
- Auto-cleanup: memories older than 90 days are purged
- Encrypted at rest (optional, via `cryptoHelper.js`)

---

## Existing Components to Extend

- `src/core/conversationMemory.js` — Short-term conversation history (keep as-is)
- `src/core/learningEngine.js` — Pattern learning (integrate with Memory)
- `src/core/knowledgeStore.js` — Knowledge base (complement with user memory)
