# PRD 02 — Skill Engine

## Overview

The Skill Engine is the **central nervous system** of Harshita AI. Every capability — from calculating land area to drafting legal notices — is represented as a **Skill** that follows a standardized schema, can be auto-discovered, and is routed to automatically.

---

## Components

### 1. BaseSkill (v2)

**File:** `src/skills/BaseSkill.js`

The abstract base class that every skill extends. v2 adds:

```javascript
// New v2 fields (backward compatible — all have defaults)
this.skillId = crypto.randomUUID();
this.inputSchema = null;           // Zod schema for input validation
this.outputSchema = null;          // Zod schema for output validation
this.validationRules = [];         // Post-execution verification rules
this.confidenceThreshold = 0.8;    // Min confidence to auto-execute
this.fallbackAgent = null;         // Backup agent name
this.dependencies = [];            // Other skill names required
this.testCases = [];               // Built-in test inputs/outputs
this.examplePrompts = [];          // Example user messages
this.learningRules = {};           // Skill-specific learning config
```

**Key Methods:**
- `execute(context)` — Main execution (must be implemented)
- `verify(result)` — Post-execution verification (optional override)
- `validateInput(params)` — Zod-based input validation
- `getInputSchema()` — Return Zod schema for UI generation
- `canHandle(intent)` — Check if skill handles this intent
- `matchKeywords(text)` — Keyword-based confidence scoring
- `_reply()` / `_error()` — Standardized response builders
- `_remember()` / `_getContext()` / `_findSimilarPast()` — Learning helpers

---

### 2. SkillRegistry (v2)

**File:** `src/skills/SkillRegistry.js`

Auto-discovers and manages all skills.

**New Capabilities:**
- `searchSkills(query)` — Fuzzy search across names, descriptions, keywords
- `enableSkill(name)` / `disableSkill(name)` — Runtime toggle
- `getSkillLogs(name, limit)` — Per-skill execution history
- `getExecutionHistory(limit)` — Global execution log
- `skillCategories` Map — Category-based organization
- Event emission on registration/execution (for Analytics)

**Auto-Load Rules:**
1. Scan `src/skills/` for files matching `*Skill.js`
2. Skip `BaseSkill.js`
3. Find exported class extending `BaseSkill`
4. Instantiate, initialize, and register
5. Map all `intents[]` to the skill
6. Higher `priority` wins if two skills claim same intent

---

### 3. SkillSchema

**File:** `src/skills/SkillSchema.js`

Centralized Zod schemas for validation:

```javascript
// Skill metadata validation
SkillMetadataSchema = z.object({
  name: z.string().min(1),
  category: z.enum([...categories]),
  intents: z.array(z.string()).min(1),
  // ...
});

// Category-specific input schemas
GeometryInputSchema = z.object({
  shape: z.enum(['rectangle', 'triangle', 'circle', ...]),
  measurements: z.record(z.string(), z.number()),
  unit: z.enum(['ft', 'm', 'yard', ...]).default('ft'),
});

// Standard output schema
SkillOutputSchema = z.object({
  type: z.enum(['ai', 'error', 'data']),
  message: z.string(),
  data: z.any().optional(),
  action: z.any().optional(),
  skill: z.string(),
});
```

---

### 4. IntentDetector (v2)

**File:** `src/skills/IntentDetector.js`

Multi-strategy intent detection with confidence-tiered routing.

**Detection Pipeline:**
1. **Security Pre-Scan** — Block dangerous queries immediately
2. **Pattern Detection** — Regex patterns (numbers → geometry, legal terms → legal)
3. **AI Detection** — LLM-based intent classification
4. **Keyword Fallback** — Word matching when AI unavailable
5. **Learning Boost** — Adjust confidence using learned patterns

**Confidence Tiers:**

| Range | Action | UX |
|-------|--------|-----|
| 95-100% | Execute directly | No confirmation, instant result |
| 80-95% | Execute + Verify | Show result with verification badge |
| 60-80% | Ask clarification | "Did you mean X or Y?" |
| Below 60% | Suggest skills | "I found these related skills..." |

**Config-Driven Overrides:**
- Move hardcoded regex overrides to `data/intent-overrides.json`
- Supports multi-intent detection (e.g., "calculate area and convert to bigha")

---

## Skill Categories & Registry

### Complete Skill Catalog

#### Mathematics
| Skill | Intent | Offline | Priority |
|-------|--------|---------|----------|
| Basic Arithmetic | `math_arithmetic` | ✅ | 7 |
| Percentage | `math_percentage` | ✅ | 7 |
| Average | `math_average` | ✅ | 7 |
| Ratio | `math_ratio` | ✅ | 7 |
| Statistics | `math_statistics` | ✅ | 6 |
| Financial Math | `math_financial` | ✅ | 7 |
| Scientific Calculator | `math_scientific` | ✅ | 6 |
| EMI Calculator | `math_emi` | ✅ | 7 |
| Tax Calculator | `math_tax` | ✅ | 7 |
| Interest Calculator | `math_interest` | ✅ | 7 |

#### Geometry
| Skill | Intent | Offline | Priority |
|-------|--------|---------|----------|
| Rectangle Area | `geo_rectangle` | ✅ | 8 |
| Triangle Area | `geo_triangle` | ✅ | 8 |
| Circle Area | `geo_circle` | ✅ | 8 |
| Trapezium Area | `geo_trapezium` | ✅ | 8 |
| Cylinder Volume | `geo_cylinder` | ✅ | 7 |
| Cone Volume | `geo_cone` | ✅ | 7 |
| Irregular Plot | `geo_irregular` | ✅ | 8 |
| Land Measurement | `geo_land` | ✅ | 9 |
| Building Measurement | `geo_building` | ✅ | 8 |
| Farm Measurement | `geo_farm` | ✅ | 8 |
| Plot Division | `geo_plot_division` | ✅ | 7 |
| Map Scaling | `geo_map_scale` | ✅ | 6 |

#### Unit Conversion
| Skill | Intent | Offline | Priority |
|-------|--------|---------|----------|
| Area Conversion | `convert_area` | ✅ | 7 |
| Length Conversion | `convert_length` | ✅ | 7 |
| Bigha/Acre/Hectare | `convert_land` | ✅ | 8 |

---

## Skill Lifecycle

```
[Create Skill File]
      ↓
[Extend BaseSkill]
      ↓
[Define: name, intents, keywords, execute()]
      ↓
[Server Restart → SkillRegistry.autoLoad()]
      ↓
[Auto-register + Intent Map]
      ↓
[Available for Routing]
      ↓
[Execute → Verify → Learn]
      ↓
[Analytics Track]
```

---

## Adding a New Skill (Developer Guide)

1. Create `src/skills/MyNewSkill.js`
2. Extend `BaseSkill`
3. Set `name`, `displayName`, `intents`, `keywords`, `category`
4. Implement `execute(context)`
5. (Optional) Define `inputSchema`, `testCases`, `verify()`
6. Restart server — **done!** SkillRegistry auto-discovers it.

```javascript
const { BaseSkill } = require('./BaseSkill');

class MyNewSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'my_new_skill';
    this.displayName = 'मेरी नई स्किल';
    this.displayNameEn = 'My New Skill';
    this.intents = ['my_intent'];
    this.keywords = {
      hi: ['कीवर्ड'],
      en: ['keyword'],
      hinglish: ['keyword']
    };
    this.category = 'utility';
    this.priority = 5;
  }

  async execute(context) {
    const { message } = context;
    // ... your logic ...
    return this._reply('Result message', { data: 'here' });
  }
}

module.exports = { MyNewSkill };
```
