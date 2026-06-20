# HARSHITA AI V5 - CRITICAL IMPROVEMENT PRD

This document specifies the mandatory requirements and quality criteria for Harshita AI's intelligence, routing, and real draft generation engine.

## Core Phases & Requirements

### PHASE 1: Real Output Testing Engine
The test/audit suite must verify actual AI output/draft text, not just source code existence. An audit passes only if generated documents contain correct facts, valid structures, and no placeholders.

### PHASE 2: Legal Matter Detection Engine
The AI must programmatically identify matters:
- Lost Documents
- Money Recovery / Cheque Bounce
- Consumer Complaint / Defamation
- Property Dispute / Eviction / Construction Dispute / Contract Breach
- Government Application / Pension Matter / Electricity, Water, or Road Complaint
- Educational / Family / Revenue Matter
- RTI

Each matter must calculate a confidence score.

### PHASE 3: Wrong Category Rejection Engine
If the user selects a category (e.g. Defamation) but the actual detected matter is different (e.g. Money Recovery), the AI must reject the category, display the detected matter, selected matter, confidence score, and recommend the correct category.

### PHASE 4: Prarthna Patra Intelligence Engine
Every application (प्रार्थना पत्र), representation, request letter, or complaint must contain:
1. Authority (Addressee)
2. Subject (professionally auto-generated)
3. Facts & Problem
4. Request
5. Prayer Clause
6. Applicant Details
7. Signature block
Traditional government formatting is mandatory.

### PHASE 5: Placeholder Elimination Engine
No raw placeholders like `[CLIENT NAME]`, `[RESPONDENT NAME]`, `[ADVOCATE NAME]`, `[SPECIFIC ACTION]`, or `[ADDRESS]` are allowed in the final draft.

### PHASE 6: Auto Capitalization Engine
Automatically capitalize proper nouns (e.g. `nar narayan singh` → `Nar Narayan Singh`, `meer singh` → `Meer Singh`, `sikhera` → `Sikhera`).

### PHASE 7: Fact Extraction Engine
Extract and display all key entities: Name, Father Name, Village, District, State, Pin, Mobile, Email, Property, Institution, Dates, Amounts, Relationships, and Witnesses.

### PHASE 8: Dynamic Example Engine
Each document category must have a unique example, unique placeholder, unique help text, and unique validation rules updating dynamically without a page refresh.

### PHASE 9: Prompt Routing Engine
Ensure all states (prompts, drafts, entities, validation, examples) are cleared when a new category is loaded.

### PHASE 10: Legal Notice Quality Engine
Every notice must contain: Parties, Facts, Cause of Action, Demand, Relief, Timeline, Legal Consequences, and Signature. No duplicate templates allowed.

### PHASE 11: Skill Discovery Engine
When asked "Apni sabhi skills batao", the AI must display Categories, Sub Skills, Skill Count, and Examples.

### PHASE 12: Print & PDF Engine
Ensure A4 layout, margins, headers, footers, signature blocks, proper Hindi/English formatting, page breaks, and PDF preview compatibility.

### PHASE 13: Legal Reasoning Engine
The AI must answer the core questions (*Who, What happened, When, Where, How much, What relief is requested, Which document is required*) before generating drafts.

### PHASE 14: Quality Gate
Automatic validation: Correct matter, correct category, correct facts, correct amounts, correct dates, normalized names, no placeholders, no duplicate templates, professional formatting, and print-ready. Automatically regenerate if validation fails.

### PHASE 15: Audit Reporting
Provide a detailed PASS, FAIL, WARNING status report containing Critical, High, Medium, and Low priority bugs, recommendations, and confidence scores.

---
## Final Order
Do not change the UI structure, theme, or navigation. Focus 100% on **intelligence, routing, validation, reasoning, and draft quality**.
