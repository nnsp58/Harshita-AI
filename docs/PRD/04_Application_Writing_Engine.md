# PRD 04 — Application Writing Engine

## Overview

The Application Writing Engine specializes in generating formal applications, letters, and petitions for various Indian government and institutional contexts. It serves as the "letter writer" for citizens who need official documents in Hindi and English.

---

## Existing Implementation

### ApplicationSkill
**File:** `src/skills/ApplicationSkill.js`

Currently handles basic application writing triggered by intents like "application likhni hai principal ko" or "chutti ka application".

---

## v2.0 Scope — Complete Application Types

### Government Applications
| Application Type | Hindi Name | Template Key |
|-----------------|------------|--------------|
| Electricity Complaint | बिजली शिकायत | `app_electricity` |
| Water Supply Complaint | पानी शिकायत | `app_water` |
| Road Repair Request | सड़क मरम्मत | `app_road` |
| Pension Application | पेंशन आवेदन | `app_pension` |
| Scholarship Application | छात्रवृत्ति | `app_scholarship` |
| Ration Card Application | राशन कार्ड | `app_ration` |
| Income Certificate | आय प्रमाण पत्र | `app_income` |
| Caste Certificate | जाति प्रमाण पत्र | `app_caste` |
| Residence Certificate | निवास प्रमाण पत्र | `app_residence` |
| Character Certificate | चरित्र प्रमाण पत्र | `app_character` |

### Institutional Applications
| Application Type | Hindi Name | Template Key |
|-----------------|------------|--------------|
| School Leave | विद्यालय अवकाश | `app_school_leave` |
| College Leave | कॉलेज अवकाश | `app_college_leave` |
| TC Request | स्थानांतरण प्रमाण पत्र | `app_tc` |
| Fee Concession | शुल्क छूट | `app_fee` |
| Exam Re-evaluation | पुनर्मूल्यांकन | `app_reeval` |
| Admission Application | प्रवेश आवेदन | `app_admission` |

### Employment Applications
| Application Type | Hindi Name | Template Key |
|-----------------|------------|--------------|
| Job Application | नौकरी आवेदन | `app_job` |
| Leave Application | छुट्टी आवेदन | `app_leave` |
| Resignation | त्यागपत्र | `app_resign` |
| Transfer Request | स्थानांतरण | `app_transfer` |
| Salary Slip Request | वेतन पर्ची | `app_salary` |
| Experience Certificate | अनुभव प्रमाण पत्र | `app_experience` |

### Gram Panchayat / Rural
| Application Type | Hindi Name | Template Key |
|-----------------|------------|--------------|
| Tubewell Complaint | ट्यूबवेल शिकायत | `app_tubewell` |
| Village Mapping | गाँव मैपिंग | `app_village_map` |
| Gram Sabha Complaint | ग्राम सभा शिकायत | `app_gram_sabha` |
| PM Awas Yojana | पीएम आवास | `app_pmay` |

---

## Input Schema

```javascript
ApplicationInputSchema = z.object({
  applicationType: z.string(),         // Template key
  applicantName: z.string(),
  fatherName: z.string().optional(),
  address: z.string(),
  recipientDesignation: z.string(),    // "प्रधानाचार्य", "जिलाधिकारी", etc.
  recipientOrganization: z.string(),
  subject: z.string(),
  body: z.string(),                    // Main content / reason
  date: z.string().optional(),         // Auto-filled if missing
  language: z.enum(['hi', 'en', 'bilingual']).default('hi'),
  attachments: z.array(z.string()).optional(),
});
```

---

## Smart Features

### 1. Auto-Detection
When user says: "principal ko chutti ka application likho"
- **Detect:** `applicationType = app_school_leave`
- **Detect:** `recipientDesignation = प्रधानाचार्य`
- **Ask only missing:** applicant name, school name, dates, reason

### 2. Hindi-First Formatting
- Proper Hindi letter format: "सेवा में", "विषय:", "महोदय/महोदया"
- Auto-add date in Hindi: "दिनांक: ०१/०७/२०२६"
- Respectful closings: "आपका आज्ञाकारी शिष्य/शिष्या"

### 3. Multi-Format Export
- **On-screen display** — Formatted markdown
- **PDF** — Professional print-ready layout
- **DOCX** — Editable Word document
- **Print** — Direct print with proper margins

---

## Verification Rules

```javascript
validationRules: [
  'recipient_present',           // To address must exist
  'subject_present',             // Subject line required
  'body_min_50_chars',           // Body must be meaningful
  'date_present',                // Date auto-filled if missing
  'respectful_language',         // Check for appropriate language
  'no_placeholders_remaining',   // All blanks filled
  'format_correct',              // Hindi letter format followed
]
```

---

## Integration Points

- **LegalDraftSkill** — For formal legal applications (affidavits, petitions)
- **PDFReportService** — For PDF/DOCX generation
- **TranslationSkill** — For bilingual applications
- **MemoryEngine** — Remember applicant details for future applications
