// frontend/src/data/faqContent.js

const GENERAL_FAQS = [
  // 1. Legal Draft Category
  {
    category: 'Legal Draft FAQ',
    q: 'What is an Affidavit and when is it legally required?',
    a: 'An affidavit is a written statement of facts voluntarily made by an affiant under an oath or affirmation administered by a person authorized by law (like a Notary Public or Oath Commissioner). It is legally required to verify identity, declare loss of documents (like marksheet or Aadhaar), record name changes, or present evidence in judicial and administrative proceedings in India.'
  },
  {
    category: 'Legal Draft FAQ',
    q: 'What is the difference between a Gift Deed and a Will?',
    a: 'A Gift Deed transfers property ownership immediately during the donor\'s lifetime without any consideration, and is irrevocable once registered. A Will transfers property ownership only after the death of the testator, can be changed or revoked multiple times during the testator\'s lifetime, and does not require mandatory registration, though registration is highly recommended.'
  },
  {
    category: 'Legal Draft FAQ',
    q: 'Why is it important to register a Rent Agreement in India?',
    a: 'Under Section 17 of the Registration Act, 1908, rent agreements for a period of 12 months or more must be registered with the Sub-Registrar. A registered agreement is legally admissible as evidence in court during disputes. Rent agreements for 11 months are common because they do not mandate registration, saving stamp duty and registration fees.'
  },
  {
    category: 'Legal Draft FAQ',
    q: 'What is a Power of Attorney (PoA) and what are its types?',
    a: 'A Power of Attorney is a legal document giving one person (the agent or attorney-in-fact) the authority to act on behalf of another person (the principal). The two main types are: 1) General Power of Attorney (GPA), which grants broad powers for financial and property management, and 2) Special Power of Attorney (SPA), which restricts the agent\'s authority to a single, specific transaction or act.'
  },
  {
    category: 'Legal Draft FAQ',
    q: 'What is a No Objection Certificate (NOC) and how is it used?',
    a: 'A No Objection Certificate (NOC) is a legal certificate issued by an organization, agency, or individual stating that they do not object to the covenant details contained within the document. It is widely used in property transfers, vehicle registry transitions, building constructions, and employee transitions to verify clean titles and authorizations.'
  },

  // 2. Notice FAQ Category
  {
    category: 'Notice FAQ',
    q: 'What steps should I take if a Cheque bounces in India?',
    a: 'If a cheque bounces, you must: 1) Obtain the Cheque Return Memo from the bank within 30 days of presentation, 2) Send a formal Legal Notice to the drawer within 30 days of receiving the memo demanding payment within 15 days, 3) If they fail to pay within 15 days, file a criminal complaint under Section 138 of the Negotiable Instruments Act, 1881 within 30 days in the court of the Judicial Magistrate.'
  },
  {
    category: 'Notice FAQ',
    q: 'How do I legally recover outstanding money from a debtor?',
    a: 'To recover money: 1) Send a formal Legal Notice through an advocate demanding repayment within a specified timeline (usually 15 days), 2) If unanswered, file a Summary Suit under Order XXXVII (37) of the Civil Procedure Code (CPC) for swift recovery, or 3) File an ordinary civil recovery suit within 3 years (limitation period) from the date the debt became due.'
  },
  {
    category: 'Notice FAQ',
    q: 'What is a Cause of Action in a Legal Notice?',
    a: 'A cause of action refers to the set of facts or legal grounds that entitle a person to seek a judicial remedy against another. In a legal notice, the cause of action must outline exactly when the contract was breached, when the money was lent, when the cheque bounced, or when the dispute occurred, demonstrating why the notice sender has the right to sue.'
  },
  {
    category: 'Notice FAQ',
    q: 'What happens if a Tenant refuses to vacate my property?',
    a: 'If a tenant refuses to vacate, you must: 1) Send a formal Eviction Notice under Section 106 of the Transfer of Property Act, terminating the tenancy and giving 15 days (or as per agreement), 2) If they don\'t comply, file an Eviction Suit in the Civil Court or Rent Tribunal. Do not lock the property or cut electricity/water, as landlords cannot take law into their own hands.'
  },

  // 3. Government Application FAQ Category
  {
    category: 'Government Application FAQ',
    q: 'How do I write a Prarthna Patra (प्रार्थना पत्र) to a District Magistrate (DM)?',
    a: 'A Prarthna Patra to a DM must be structured as follows: 1) Addressee block ("सेवा में, श्रीमान जिलाधिकारी महोदय"), 2) Subject line outlining the problem concisely, 3) Introduction of the applicant, 4) Detailed facts of the issue (encroachment, public nuisance, road repairs), 5) Clear prayer clause requesting action ("अतः श्रीमान जी से निवेदन है..."), and 6) Signatures of the applicant.'
  },
  {
    category: 'Government Application FAQ',
    q: 'What is the process to apply for a Duplicate Marksheet in India?',
    a: 'To apply: 1) File a Lost Document Complaint or FIR online or at the local police station, 2) Draft a Lost Marksheet Affidavit on stamp paper notarized by a notary public, 3) Publish a small classified ad in a local newspaper about the lost marksheet, and 4) Submit the application form, FIR copy, affidavit, newspaper cutting, and fee to the respective educational board or university.'
  },
  {
    category: 'Government Application FAQ',
    q: 'How do I file a complaint with the Electricity Board regarding high bills?',
    a: 'To file an electricity complaint: 1) Write a formal representation to the Sub-Divisional Officer (SDO) or Executive Engineer (EE) stating the consumer number, meter number, and bill details, 2) Request meter testing if you suspect meter faults, 3) If unresolved within 15 days, escalate the complaint to the Consumer Grievance Redressal Forum (CGRF) of your state utility.'
  },
  {
    category: 'Government Application FAQ',
    q: 'What is the procedure to apply for a Central/State Pension Scheme?',
    a: 'To apply for a pension: 1) Verify eligibility (Old Age, Widow, or Disability criteria), 2) Gather documents: Aadhaar card, Income Certificate, Age Proof (school certificate/voter ID), Bank Passbook, and Passport photos, 3) Fill out the application form online via the state social security portal or offline at Block/Tehsil office, and 4) Get verification from Gram Vikas Adhikari (GVO) or Lekhpal.'
  },

  // 4. Resume FAQ Category
  {
    category: 'Resume FAQ',
    q: 'What is the difference between a Resume and a Biodata?',
    a: 'A Resume is a 1-2 page professional summary of education, work experience, and skills tailored for specific corporate job applications. A Biodata (Biography Data) is a document commonly used in India that contains personal and demographic details (date of birth, gender, marital status, religion, family background, physical attributes) used for government jobs or matrimonial alliances.'
  },
  {
    category: 'Resume FAQ',
    q: 'What key sections must be included in a professional Resume?',
    a: 'A professional resume must include: 1) Full name and contact information (mobile, email, LinkedIn, location), 2) Professional Summary or Objective, 3) Education (degrees, institutions, graduation years), 4) Work Experience (roles, company names, key achievements), 5) Core Skills (technical, soft skills), and 6) Projects or Certifications.'
  }
];

const SKILL_NAMES_MAP = {
  application_writer: { name: 'Application Writer', hi: 'प्रार्थना पत्र एजेंट', type: 'Government Application FAQ' },
  bulk_import: { name: 'Bulk Data Import', hi: 'बल्क इम्पोर्ट', type: 'Resume FAQ' },
  deploy_manager: { name: 'Render Deploy Agent', hi: 'रेंडर डिप्लॉयमेंट', type: 'Government Application FAQ' },
  document_ocr: { name: 'Document OCR', hi: 'दस्तावेज़ OCR', type: 'Government Application FAQ' },
  eligibility_check: { name: 'Eligibility Checker', hi: 'पात्रता जाँच', type: 'Government Application FAQ' },
  file_processor: { name: 'File Processor', hi: 'फाइल प्रोसेसर', type: 'Government Application FAQ' },
  form_fill: { name: 'Auto Form Filling', hi: 'फॉर्म ऑटो-भरना', type: 'Government Application FAQ' },
  general_chat: { name: 'General Chat Bot', hi: 'सामान्य बातचीत', type: 'Government Application FAQ' },
  job_search: { name: 'Job Search Finder', hi: 'नौकरी खोज', type: 'Resume FAQ' },
  land_record: { name: 'Land Record Scraper', hi: 'भूलेख रिकॉर्ड', type: 'Government Application FAQ' },
  language_translator: { name: 'Universal Translator', hi: 'यूनिवर्सल ट्रांसलेटर', type: 'Government Application FAQ' },
  legal_draft: { name: 'Legal Drafting Engine', hi: 'कानूनी ड्राफ्ट', type: 'Legal Draft FAQ' },
  legal_notice: { name: 'Legal Notice Generator', hi: 'कानूनी नोटिस', type: 'Notice FAQ' },
  media_converter: { name: 'Media Converter', hi: 'मीडिया कन्वर्टर', type: 'Government Application FAQ' },
  network_monitor: { name: 'Network Monitor', hi: 'नेटवर्क मॉनitor', type: 'Government Application FAQ' },
  notepad: { name: 'Smart Notepad', hi: 'नोटपैड', type: 'Government Application FAQ' },
  photo_maker: { name: 'Passport Photo Maker', hi: 'पासपोर्ट फोटो मेकर', type: 'Resume FAQ' },
  project_report: { name: 'Project Report Generator', hi: 'प्रोजेक्ट रिपोर्ट', type: 'Legal Draft FAQ' },
  ration_card: { name: 'Ration Card Helper', hi: 'राशन कार्ड', type: 'Government Application FAQ' },
  result_generator: { name: 'Result Checker', hi: 'रिजल्ट ट्रैकर', type: 'Government Application FAQ' },
  resume_maker: { name: 'Resume & CV Builder', hi: 'रिज्यूमे मेकर', type: 'Resume FAQ' },
  security_guardrail: { name: 'Suraksha Security Guardrail', hi: 'सुरक्षा गार्डरेल', type: 'Government Application FAQ' },
  self_healing: { name: 'Self-Evolution Engine', hi: 'सेल्फ हीलिंग', type: 'Government Application FAQ' },
  tada_process: { name: 'TA/DA Claim Processor', hi: 'TA/DA प्रोसेसर', type: 'Legal Draft FAQ' },
  ticket_booking: { name: 'Ticket Booking Assistant', hi: 'टिकट बुकिंग', type: 'Government Application FAQ' },
  ui_builder: { name: 'Dynamic UI Builder', hi: 'UI बिल्डर', type: 'Government Application FAQ' },
  utility_tools: { name: 'Utility Helper Tools', hi: 'यूटिलिटी टूल्स', type: 'Government Application FAQ' },
  validator: { name: 'Data Validator Audit', hi: 'डेटा वैलिडेटर', type: 'Government Application FAQ' },
  voice_agent: { name: 'Voice Command Assistant', hi: 'आवाज़ सहायक', type: 'Government Application FAQ' },
  web_learning: { name: 'Web Portal Learning', hi: 'वेब लर्निंग', type: 'Government Application FAQ' },
  whatsapp: { name: 'WhatsApp Bot Integration', hi: 'व्हाट्सएप एजेंट', type: 'Notice FAQ' }
};

// Generate 200+ total FAQs by creating specific questions for each of the 31 skills
function generateAllFaqs() {
  const list = [...GENERAL_FAQS];

  Object.entries(SKILL_NAMES_MAP).forEach(([key, meta]) => {
    // FAQ 1: What is it
    list.push({
      category: meta.type,
      q: `What is the role of the ${meta.name} (${meta.hi}) skill?`,
      a: `The ${meta.name} agent is a specialized tool in Harshita AI designed to automate workflows related to ${meta.name.toLowerCase()}. It utilizes advanced intelligence to parse requirements, check validation rules, and output print-ready formats instantly, significantly reducing manual operator entry times at CSC/VLE centers.`
    });

    // FAQ 2: How it works
    list.push({
      category: meta.type,
      q: `How does the ${meta.name} agent ensure accurate results?`,
      a: `The ${meta.name} agent operates using custom logic gates, entity normalizations, and specific form schemas. It automatically reviews input fields, capitalizes proper nouns, and screens for formatting issues. If any check fails, the self-healing and validation sub-agents proactively suggest fixes or adjust drafts to prevent errors.`
    });

    // FAQ 3: Security & Privacy
    list.push({
      category: meta.type,
      q: `Is the data processed by the ${meta.name} assistant secure?`,
      a: `Yes, all processing within the ${meta.name} skill is handled in strict compliance with privacy standards. Text extractions, inputs, and documents are kept securely in memory during generation. Files are deleted from temporary storage immediately after download, and no personal client records are ever shared or logged permanently.`
    });

    // FAQ 4: Language support
    list.push({
      category: meta.type,
      q: `Does the ${meta.name} tool support Hindi and English bilingual drafting?`,
      a: `Absolutely! The ${meta.name} agent is fully bilingual, supporting English, Devnagari script (Hindi), and Hinglish commands. It automatically structures letters, drafts, and headers in the appropriate regional government formatting standard required for sub-registrar offices, block tehsils, or police stations.`
    });

    // FAQ 5: Limitations and Guidelines
    list.push({
      category: meta.type,
      q: `What documents are required to use the ${meta.name} agent?`,
      a: `Requirements depend on the exact application, but typically you need basic identity documents (Aadhaar or PAN) and relevant fact details (dates, names, addresses). The built-in Document OCR agent can extract this data automatically from uploads and pre-fill fields for the ${meta.name} process.`
    });

    // FAQ 6: Customizations
    list.push({
      category: meta.type,
      q: `Can I customize the output templates generated by the ${meta.name} skill?`,
      a: `Yes! Users can customize output formatting inside the Harshita AI Control Center settings tab. You can scale font sizes, modify print margins (A4 standard), toggle signature blocks, adjust wording tone (simple, advocate level, or court ready), and review full diagnostic logs.`
    });

    // FAQ 7: Common use-cases
    list.push({
      category: meta.type,
      q: `What is a common example query for the ${meta.name} assistant?`,
      a: `Common queries include using the chat command panel to request specific automated workflows. For example, you can tell the bot: "Help me run ${meta.name.toLowerCase()} for my registration form" or ask "Draft details for ${meta.hi}." The Intent Detector will instantly parse your message and boot up the correct helper widget.`
    });
  });

  return list;
}

export const ALL_FAQS = generateAllFaqs();
