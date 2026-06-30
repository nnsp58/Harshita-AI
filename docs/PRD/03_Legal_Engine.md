# PRD 03 — Legal Engine

## Overview

The Legal Engine provides comprehensive legal document drafting, review, and generation capabilities. It is one of the most mature skill areas in Harshita AI, already handling affidavits, legal notices, agreements, and court petitions.

---

## Existing Skills (Already Implemented)

### LegalDraftSkill
**File:** `src/skills/LegalDraftSkill.js` (40,760 bytes — most comprehensive skill)

**Capabilities:**
- Affidavit drafting (शपथपत्र)
- Agreement generation (अनुबंध)
- Rent Agreement (किराया पत्र)
- Sale Agreement (विक्रय पत्र)
- Lease Agreement (पट्टा)
- Court Petition (याचिका)
- RTI Application
- Government Forms
- Legal Draft Review
- PDF Generation
- DOCX Export
- Print Layout

**Intents:** `legal_draft`, `affidavit`, `agreement`, `rent_agreement`, `sale_agreement`, `lease`, `petition`, `rti`, `govt_form`

---

### LegalNoticeSkill
**File:** `src/skills/LegalNoticeSkill.js` (24,779 bytes)

**Capabilities:**
- Legal Notice drafting (कानूनी नोटिस)
- Complaint letters
- Demand notices
- Cease & desist
- Property dispute notices
- Employment dispute notices

**Intents:** `legal_notice`, `complaint`, `demand_notice`

---

### ApplicationSkill
**File:** `src/skills/ApplicationSkill.js` (10,939 bytes)

**Capabilities:**
- Application writing (प्रार्थना पत्र)
- School applications
- Leave applications
- Government applications
- Complaint applications

**Intents:** `application_writer`, `leave_application`, `complaint_application`

---

## v2.0 Enhancements Required

### 1. Legal Verification Rules

Every legal document must pass through the VerificationEngine with:

```javascript
validationRules: [
  'no_empty_placeholders',    // No ______ left unfilled
  'date_format_valid',        // DD/MM/YYYY format
  'party_names_present',      // All parties identified
  'legal_sections_cited',     // Relevant IPC/CrPC sections
  'notary_format_compliant',  // If notary, correct format
  'signature_blocks_present', // Sign lines for all parties
  'language_consistency',     // Don't mix Hindi/English randomly
]
```

### 2. Input Schema (Zod)

```javascript
LegalInputSchema = z.object({
  docType: z.enum(['affidavit', 'notice', 'agreement', 'petition', 'rti', ...]),
  parties: z.array(z.object({
    name: z.string(),
    role: z.enum(['applicant', 'respondent', 'witness', ...]),
    address: z.string().optional(),
    father_name: z.string().optional(),
  })).min(1),
  subject: z.string(),
  facts: z.array(z.string()),
  language: z.enum(['hi', 'en', 'bilingual']).default('hi'),
  court: z.string().optional(),
  section: z.string().optional(),
});
```

### 3. Template Library

Maintain pre-built templates in `data/legal-templates/`:
- `affidavit_general.md`
- `affidavit_name_change.md`
- `affidavit_lost_document.md`
- `notice_tenant_eviction.md`
- `notice_money_recovery.md`
- `agreement_rent.md`
- `agreement_sale.md`
- `petition_court.md`

### 4. PDF Generation

- Professional legal formatting (margins, fonts, numbering)
- Court stamp paper simulation
- Notary section with seal placeholder
- Bilingual support (Hindi + English)
- QR code for verification (optional)

---

## Skill Persona Rules

The Legal Engine must behave as:
1. **Senior Advocate** — Legal reasoning, not template generation
2. **Legal Drafting Expert** — Professional language, correct citations
3. **Court Clerk** — Proper formatting, filing requirements
4. **Notary Assistant** — Notary formats, oath language
5. **Government Application Writer** — Correct addressing, protocol

### Cognitive Rules:
- **Fact Extraction** — Parse user input for parties, dates, amounts
- **Auto Capitalization** — Proper nouns, legal terms
- **Conflict Detection** — Flag contradictory facts
- **Entity Normalization** — Standardize names, addresses
- **Legal Reasoning** — Apply relevant sections/acts
- **Cause of Action** — Identify legal basis
- **Professional Formatting** — Court standards
