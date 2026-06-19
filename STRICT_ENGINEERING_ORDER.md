# STRICT ENGINEERING ORDER – HARSHITA AI

This is a mandatory implementation order for the Harshita AI system. All modules must adhere strictly to these critical rules.

## Critical Rules

### CRITICAL RULE 1: Fact-Driven Generation
Never generate output directly from a selected category. Always follow this pipeline:
`User Input → Fact Extraction → Matter Detection → Validation → Confidence Score → Draft Generation`.
The user facts are the source of truth, NOT the selected category.

### CRITICAL RULE 2: Adaptive Output Type
Never force user facts into a template. If the facts indicate a contract breach, route to Contract Breach Notice; if a lost marksheet is detected, route to an Affidavit/Application.

### CRITICAL RULE 3: Category Segregation
Every category must have separate prompts, skills, validation rules, examples, help text, placeholders, and draft engines. Do not reuse a single prompt across categories.

### CRITICAL RULE 4: Dynamic Example Engine
Ensure that when a category changes, the examples, placeholders, help texts, and validation rules update dynamically in the interface without requiring a page refresh.

### CRITICAL RULE 5: Dynamic Prompt Routing
When a category changes, clear the previous prompt, draft, entities, and validation state before loading the new category.

### CRITICAL RULE 6: Confidence Gate
Implement matter detection prior to generation and calculate a confidence score. If confidence is below 80%, halt generation and ask the user for clarification.

### CRITICAL RULE 7: Auto Capitalization & Normalization
Proper names and locations must be capitalized and normalized (e.g. `nar narayan singh` → `Nar Narayan Singh`, `meer singh` → `Meer Singh`, `sikhera` → `Sikhera`). Never copy raw names exactly as typed.

### CRITICAL RULE 8: Placeholder Elimination
Final drafts must never contain raw placeholders (like `[CLIENT NAME]` or `[RESPONDENT NAME]`). Auto-fill available details, and prompt the user for any missing information.

### CRITICAL RULE 9: Professional Drafting Engine
All output must be of premium drafting quality suitable for professional advocates, notaries, courts, tehsil officials, SDM/DM offices, and government departments.

### CRITICAL RULE 10: Structural Integrity of Applications
Every formal application (प्रार्थना पत्र) must contain:
1. Authority (Addressee)
2. Subject
3. Facts
4. Request
5. Closing Prayer ("अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए आवश्यक कार्यवाही करने की कृपा करें।")
6. Applicant Details
7. Signature Area

### CRITICAL RULE 11: Legal Reasoning Engine
The AI must identify the *Who, What, When, Where, Why, How much*, and *Requested Relief* before generating the draft.

### CRITICAL RULE 12: Quality Gate
Verify the following parameters before returning any draft:
- Correct matter detected
- Correct document selected
- Correct facts extracted
- Names normalized
- No placeholders left in the output
- No duplicate template structures
- Highly professional legal language (Hindi / English / Bilingual)
- Print-ready format

If any check fails, automatically regenerate the document.

### CRITICAL RULE 13: Rigorous Testing
Do not mark tasks complete without verifying all categories, examples, routing, prompts, validations, and print preview features.

## Final Persona Rule
Harshita AI must behave like an experienced **Senior Advocate, Legal Drafting Expert, Court Clerk, Government Application Writer, and Legal Reviewer**, and NEVER like a generic template generator.
