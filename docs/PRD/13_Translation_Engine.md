# PRD 13 — Translation Engine

## Overview

The Translation Engine provides multi-language translation capabilities across 10+ Indian and international languages, enabling Harshita AI to serve users in their native language.

---

## Supported Languages

| # | Language | Code | Script | Status |
|---|----------|------|--------|--------|
| 1 | Hindi | `hi` | देवनागरी | ✅ Primary |
| 2 | English | `en` | Latin | ✅ Primary |
| 3 | Urdu | `ur` | نستعلیق | 🔨 New |
| 4 | Punjabi | `pa` | ਗੁਰਮੁਖੀ | 🔨 New |
| 5 | Gujarati | `gu` | ગુજરાતી | 🔨 New |
| 6 | Marathi | `mr` | देवनागरी | 🔨 New |
| 7 | Tamil | `ta` | தமிழ் | 🔨 New |
| 8 | Telugu | `te` | తెలుగు | 🔨 New |
| 9 | Bengali | `bn` | বাংলা | 🔨 New |
| 10 | Kannada | `kn` | ಕನ್ನಡ | 🔮 Future |
| 11 | Malayalam | `ml` | മലയാളം | 🔮 Future |

---

## Existing Implementation

### LanguageSkill
**File:** `src/skills/LanguageSkill.js` (2,454 bytes)
- Basic language detection
- Simple translation via AI

### LanguageEngine
**File:** `src/core/languageEngine.js` (19,199 bytes)
- Full language processing engine
- Script detection, transliteration
- Hindi ↔ English translation

---

## Translation Skills

| Skill | Description | API |
|-------|-------------|-----|
| Text Translation | Translate text between languages | Google Translate / AI |
| Document Translation | Translate entire documents | AI + PDF |
| Real-time Translation | Live translation as user types | AI |
| Transliteration | Script conversion (e.g., Hindi → Roman) | Offline rules |
| Language Detection | Auto-detect input language | AI + heuristics |
| Bilingual Output | Generate output in two languages | AI |

---

## Input Schema

```javascript
TranslationInputSchema = z.object({
  action: z.enum(['translate', 'transliterate', 'detect', 'document']),
  text: z.string(),
  sourceLanguage: z.string().optional(),   // Auto-detect if not specified
  targetLanguage: z.string(),
  format: z.enum(['text', 'pdf', 'docx']).optional(),
});
```

---

## Integration Points

- **All Skills** — Every skill output can be translated to user's preferred language
- **MemoryEngine** — Remember user's preferred language
- **ApplicationSkill** — Generate applications in regional languages
- **LegalDraftSkill** — Bilingual legal documents
- **VoiceAgentSkill** — Voice translation (speak Hindi → hear English)
