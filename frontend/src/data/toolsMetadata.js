// frontend/src/data/toolsMetadata.js

export const TOOLS_METADATA = {
  'affidavit-generator': {
    name: 'Affidavit Generator',
    slug: 'affidavit-generator',
    icon: '⚖️',
    serviceRoute: '/service/legal_draft',
    targetType: 'affidavit',
    title: 'Professional Online Affidavit Generator',
    desc: 'Generate legally valid, court-ready affidavits in under 2 minutes. Our AI agent formats proper oaths, checks notary guidelines, normalizes name cases, and eliminates bracket placeholders automatically.',
    benefits: [
      'Save time and money by drafting without manual attorney fees.',
      'Supports all major configurations: lost marksheet, name change, lost passport, income declaration.',
      'Bilingual format (Hindi & English) ready for Sub-Registrar stamp offices.',
      'Instant A4 preview with aligned signature and witness block spacing.'
    ],
    steps: [
      'Select your specific Affidavit template (e.g. Name Change, Lost Marksheet).',
      'Input the declarant\'s name, father\'s name, age, and complete address.',
      'Our Auto Normalization engine cleans names (e.g., lowercase to Title Case) and formats dates.',
      'Preview the generated declaration, verify details, and click download PDF.'
    ],
    examples: [
      { label: 'Name Correction Affidavit', text: 'I, Rahul Kumar, son of Shri Ramesh Kumar, resident of Village Sikhera, District Bulandshahr, State Uttar Pradesh, do hereby solemnly affirm and state as under...' },
      { label: 'Lost Document Affidavit', text: 'I, Priya Singh, daughter of Shri Dev Singh, do hereby solemnly declare that I have lost my original Class 10th marksheet (Roll No: 1234567) on or about 10-05-2026...' }
    ],
    faqs: [
      { q: 'What stamp paper value is required for an affidavit?', a: 'Standard affidavits for lost documents or minor name corrections typically require a ₹10 non-judicial stamp paper in most states, while declaration affidavits or lease agreements may require ₹50 or ₹100. Please verify with your local Tehsil.' },
      { q: 'Is a notarized online affidavit legally valid?', a: 'Yes. Once our system generates the PDF, you must print it on the appropriate value stamp paper and get it signed and registered by a licensed Notary Public or Oath Commissioner.' },
      { q: 'What details are validated by the quality gate?', a: 'Our Quality Gate checks for empty brackets, ensures all key facts are extracted, normalizes all proper noun casing, and reformats currency values to Indian standard format.' }
    ]
  },
  'legal-notice-generator': {
    name: 'Legal Notice Generator',
    slug: 'legal-notice-generator',
    icon: '✉️',
    serviceRoute: '/service/legal_notice',
    targetType: 'legal_notice',
    title: 'AI Legal Notice Drafting Agent',
    desc: 'Send professional legal notices through qualified advocate formats. Draft demand notices for money recovery, cheque bounce (Section 138 NI Act), eviction, or contract breaches.',
    benefits: [
      'Ensures clear, chronological cause-of-action recitals.',
      'Mandatory pre-litigation compliance formatting including timeline demands.',
      'Automatically structures relief, legal consequences, and advocate address blocks.',
      'Excludes duplicate template patterns for 100% unique notice filings.'
    ],
    steps: [
      'Choose the dispute category (Cheque Bounce, Money Recovery, Land Tenant Dispute).',
      'Enter names, addresses, transaction dates, and specific amount details.',
      'Define the demand timeline (standard 15 days for cheque bounce, or 30 days for others).',
      'Review and export the completed legal notice formatted on advocate letterhead layout.'
    ],
    examples: [
      { label: 'Section 138 Cheque Bounce Notice', text: 'Under instructions from my client, I hereby serve you this legal notice under Section 138 of Negotiable Instruments Act due to bounce of Cheque No 987654 return bank memo dated...' },
      { label: 'Unpaid Dues Recovery Notice', text: 'You are hereby called upon to pay the outstanding balance of ₹75,000 along with accrued interest of 18% p.a. within 15 days of receipt of this notice, failing which civil suit...' }
    ],
    faqs: [
      { q: 'Is it mandatory to send a legal notice through an advocate?', a: 'While a legal notice can be sent by an individual directly, sending it on an advocate\'s letterhead increases credibility and shows serious intent to initiate legal proceedings, encouraging fast settlement.' },
      { q: 'What is the limitation period for sending notice for money recovery?', a: 'A civil suit for money recovery must be initiated within 3 years from the date the cause of action occurred. The legal notice must be served within this limitation period.' }
    ]
  },
  'prarthna-patra-writer': {
    name: 'Prarthna Patra (Application) Agent',
    slug: 'prarthna-patra-writer',
    icon: '📝',
    serviceRoute: '/service/application_writer',
    targetType: 'application_writer',
    title: 'Government Application Drafting Assistant',
    desc: 'Draft formal Hindi applications (प्रार्थना पत्र) to tehsildars, block officials, SDMs, police stations, or schools. Includes traditional formats and prayer clauses.',
    benefits: [
      'Enforces correct addressing officer blocks and hierarchy greetings.',
      'Auto-generates clear subject lines matching standard Hindi letter styles.',
      'Automatically structures the concluding prayer clause ("अतः श्रीमान जी से सविनय निवेदन है...").',
      'Provides print-ready layout margins suitable for official receipts.'
    ],
    steps: [
      'Select the target official ( जिलाधिकारी (DM), थाना प्रभारी (SHO), उपजिलाधिकारी (SDM) ).',
      'Provide your specific grievance details and facts (e.g. electrical bill issue, road repairs).',
      'Select writing style (simple Hindi, professional, or formal government format).',
      'Download and print the application, and obtain a file-receipt at the block office.'
    ],
    examples: [
      { label: 'DM Office Complaint', text: 'सेवा में, श्रीमान जिलाधिकारी महोदय, जनपद बुलंदशहर। विषय: ग्राम सभा की भूमि पर अवैध कब्जे को हटाने के संबंध में। महोदय, प्रार्थी सूचित करना चाहता है...' }
    ],
    faqs: [
      { q: 'Why is the prayer clause mandatory in a Prarthna Patra?', a: 'Traditional Hindi application formatting requires a clear, formal prayer section requesting the officer to grant relief. Without this structure, official petitions are considered incomplete.' }
    ]
  },
  'rent-agreement-generator': {
    name: 'Rent Agreement Generator',
    slug: 'rent-agreement-generator',
    icon: '🏠',
    serviceRoute: '/service/legal_draft',
    targetType: 'rent_agreement',
    title: 'Tenant-Landlord Rental Lease Builder',
    desc: 'Create secure rental lease agreements. Covers security deposits, maintenance duties, eviction timelines, and local state stamp parameters.',
    benefits: [
      'Differentiate clearly between 11-month non-registered and long-term registered leases.',
      'Enforces standard landlord protective clauses and tenant duties.',
      'Ensures clean witness alignment and notarized spacing structures.',
      '100% editable online text editor integration.'
    ],
    steps: [
      'Enter landlord details, tenant details, and rented property address.',
      'Set financial rules: monthly rent, security deposit amount, and due dates.',
      'Choose termination terms: notice period (1 month standard) and lock-in period.',
      'Compile, review the draft, and export to printable stamp paper format.'
    ],
    examples: [
      { label: '11-Month Tenancy Clause', text: 'This rent agreement is made for a period of 11 months commencing from 01-07-2026. The Tenant shall pay a monthly rent of ₹12,000 to the Landlord on or before...' }
    ],
    faqs: [
      { q: 'Is a registered lease safer than an 11-month agreement?', a: 'Yes. A registered lease deed is legally binding and stands as absolute proof of tenancy in court. An 11-month agreement is suitable for short-term residential tenancies.' }
    ]
  },
  'gift-deed-generator': {
    name: 'Gift Deed Generator',
    slug: 'gift-deed-generator',
    icon: '🎁',
    serviceRoute: '/service/legal_draft',
    targetType: 'gift_deed',
    title: 'Property Transfer Gift Deed Generator',
    desc: 'Transfer ownership of property to family members or relatives without any monetary exchange. Draft registered gift deed agreements matching land laws.',
    benefits: [
      'Explicitly declares no consideration exchange (zero money transfer) for tax exemption compliance.',
      'Includes mandatory delivery of possession and acceptance recitals.',
      'Subsidized stamp duty calculations for blood relative transfers.',
      'Aligned witness declaration blocks for Sub-Registrar submissions.'
    ],
    steps: [
      'Enter donor (giver) and donee (receiver) details and relationship status.',
      'Detail the property specifications (survey numbers, boundaries, values).',
      'Confirm the voluntary transfer of title and acceptance signatures.',
      'Download draft, print on appropriate stamp paper, and register at the Sub-Registrar\'s office.'
    ],
    examples: [
      { label: 'Subsidized Blood Relative Gift', text: 'The Donor, out of natural love and affection for the Donee (being the daughter of the Donor), hereby gifts, grants and conveys the property described below...' }
    ],
    faqs: [
      { q: 'Is a Gift Deed taxable in India?', a: 'Gifts of property received from immediate relatives (parents, spouse, siblings, children) are exempt from income tax. Registration and stamp duty are still required.' }
    ]
  },
  'partition-deed-generator': {
    name: 'Partition Deed Generator',
    slug: 'partition-deed-generator',
    icon: '🗺️',
    serviceRoute: '/service/legal_draft',
    targetType: 'partition_deed',
    title: 'Family Property Partition Deed Builder',
    desc: 'Draft partition deeds to divide joint family property among co-owners or legal heirs. Establish individual clear titles.',
    benefits: [
      'Enforces clean schedule mapping for each property share.',
      'Covers mutual agreement recitals to prevent family disputes.',
      'Includes legal relinquishment covenants of undivided joint shares.',
      'Enforces formal registrar layouts.'
    ],
    steps: [
      'Describe the joint undivided property details (dimensions, location, registration entry).',
      'Add all co-owners and legal heirs details.',
      'List the specific schedules showing property division mapped to each shareholder.',
      'Export the finished Partition Deed for notarization and sub-registrar registration.'
    ],
    examples: [
      { label: 'Schedule Share Partition', text: 'The parties hereto have mutually agreed to partition the joint family property. Schedule A shall belong exclusively to Party 1, and Schedule B to Party 2...' }
    ],
    faqs: [
      { q: 'Is registration of a Partition Deed mandatory?', a: 'Yes. A partition of immovable property must be executed through a registered partition deed to transfer the legal title of individual shares.' }
    ]
  },
  'power-of-attorney-generator': {
    name: 'Power of Attorney (GPA/SPA) Builder',
    slug: 'power-of-attorney-generator',
    icon: '🤝',
    serviceRoute: '/service/legal_draft',
    targetType: 'poa',
    title: 'General & Special Power of Attorney Builder',
    desc: 'Grant representation and transaction authorities. Draft GPA for overall property/finance operations or SPA for specific registration tasks.',
    benefits: [
      'Explicitly boundaries agent authority limits to prevent misuse.',
      'Provides clean principal ratification clauses.',
      'Supports registration-ready formats for RTO and sub-registrar offices.',
      'Includes revocability conditions and timeline limits.'
    ],
    steps: [
      'Select GPA (General Power) or SPA (Special/Specific transaction Power).',
      'Provide principal and agent (attorney) names and addresses.',
      'Select authorized powers (property sale, banking, court filing, RTO registration).',
      'Review, print, and register/notarize to activate representation powers.'
    ],
    examples: [
      { label: 'RTO Vehicle Sale SPA', text: 'I hereby appoint the Agent as my Special Attorney to represent me before the RTO for transfer of ownership, signing RTO Form 29 and 30 for Vehicle No...' }
    ],
    faqs: [
      { q: 'Does a GPA remain valid after the death of the principal?', a: 'No. A Power of Attorney is automatically revoked and becomes legally null and void upon the death of the principal.' }
    ]
  },
  'will-generator': {
    name: 'Will (Wasiyat) Generator',
    slug: 'will-generator',
    icon: '📜',
    serviceRoute: '/service/legal_draft',
    targetType: 'will',
    title: 'Legal Last Will & Testament Generator',
    desc: 'Secure your family\'s future by drafting a legally valid Will (वसीयत). Detail asset distributions, appoint executors, and add witness blocks.',
    benefits: [
      'Clean declaration of sound mental health condition.',
      'Specific listing of movable and immovable property scopes.',
      'Executor appointment blocks for administration of assets.',
      'Supports amendment declarations and revoking previous Wills.'
    ],
    steps: [
      'Enter testator details (name, father\'s name, address, age).',
      'Declare sound state of mind and revoke all previous Wills or codicils.',
      'List properties (homes, bank accounts, jewellery) and map them to heirs.',
      'Appoint an independent executor, add witness details, and download for signature.'
    ],
    examples: [
      { label: 'Sound Mind Declaration', text: 'I, Ramesh Chand, aged 68 years, resident of Delhi, do hereby declare this to be my last Will. I state that I am in sound health and fully competent to...' }
    ],
    faqs: [
      { q: 'Is it mandatory to register a Will?', a: 'No. A Will written on plain paper and signed by the testator in the presence of two witnesses is legally valid. Registration is optional but recommended to prevent disputes.' }
    ]
  },
  'noc-generator': {
    name: 'No Objection Certificate Builder',
    slug: 'noc-generator',
    icon: '✅',
    serviceRoute: '/service/legal_draft',
    targetType: 'noc',
    title: 'Standard No Objection Certificate Builder',
    desc: 'Generate authorization NOC letters for property, vehicles, and company transitions instantly.',
    benefits: [
      'Universal format suitable for banks, municipal offices, and RTOs.',
      'Clear declaration of no objection to covenant terms.',
      'Includes corporate/organizational letterhead format alignment.',
      'Saves time on administrative correspondence.'
    ],
    steps: [
      'Enter the details of the issuing authority or individual.',
      'Describe the beneficiary and the specific transaction being permitted.',
      'Select the standard NOC template type.',
      'Preview, download, and sign/stamp the document.'
    ],
    examples: [
      { label: 'Landlord Rent NOC', text: 'I, [Landlord Name], owner of Property [Address], state that I have no objection to the Tenant using this address for commercial registration...' }
    ],
    faqs: [
      { q: 'Can an NOC be challenged in court?', a: 'An NOC is a voluntary declaration. It can only be challenged if the issuer proves it was obtained by fraud, coercion, or misrepresentation.' }
    ]
  },
  'resume-builder': {
    name: 'Resume & CV Builder',
    slug: 'resume-builder',
    icon: '👔',
    serviceRoute: '/resume-builder',
    targetType: 'resume',
    title: 'Professional Resume & Biodata Builder',
    desc: 'Build outstanding, ATS-friendly resumes and biodatas. Input job experiences, skills, and academic qualifications, and download clean PDF templates.',
    benefits: [
      'ATS-compliant layouts designed for corporate screening.',
      'Includes specific biodata formatting formats for government applications.',
      'Clean PDF generation with compact margins.',
      'Provides smart suggestions for skill listings.'
    ],
    steps: [
      'Choose the layout style (Professional Resume or Traditional Biodata).',
      'Fill in personal info, career summary, work history, and academic scores.',
      'List key skills, certs, projects, and reference contacts.',
      'Verify details on the live preview screen and download the PDF.'
    ],
    examples: [
      { label: 'Software Engineer Summary', text: 'Detail-oriented Front-End Developer with 3+ years of experience building responsive React applications and optimizing client performance...' }
    ],
    faqs: [
      { q: 'Is this resume builder ATS friendly?', a: 'Yes. Our templates use standard font families and single-column structures that are easily parsed by Application Tracking Systems (ATS).' }
    ]
  },
  'pdf-tools': {
    name: 'PDF Processor Agent',
    slug: 'pdf-tools',
    icon: '🗂️',
    serviceRoute: '/service/file_processor',
    targetType: 'pdf_tools',
    title: 'PDF Document Compression & Conversions',
    desc: 'Compress, merge, split, or convert PDF files. Keep documents optimized and clean for official uploads.',
    benefits: [
      'Compress PDF file sizes down without losing text clarity.',
      'Client-side processing: files are processed in the browser to keep them private.',
      'Convert scanned PDFs using built-in OCR tools.',
      'No registration or payment required.'
    ],
    steps: [
      'Upload your PDF file.',
      'Select target action: Compress, Merge, Convert to Word.',
      'Process file on our client-side container.',
      'Download your optimized output file instantly.'
    ],
    examples: [
      { label: 'PDF Compress Action', text: 'Reduced PDF file size from 12MB to 1.8MB for official portal upload compliance.' }
    ],
    faqs: [
      { q: 'Do you upload my PDF to a remote server?', a: 'No. File processing is done inside your local browser sandbox to guarantee absolute data privacy and confidentiality.' }
    ]
  },
  'image-tools': {
    name: 'Passport Photo & Image Tools',
    slug: 'image-tools',
    icon: '📷',
    serviceRoute: '/service/photo_maker',
    targetType: 'image_tools',
    title: 'Passport Size Photo & Crop Utilities',
    desc: 'Crop images, remove backgrounds, adjust brightness, and create standard passport-size grids ready for printing.',
    benefits: [
      'Standard cropping presets for Indian passport, PAN, and visa formats.',
      'Smart background removal tools.',
      'Create 8-photo print sheet grids in one click.',
      'Image compression helper for upload portals.'
    ],
    steps: [
      'Upload your portrait photo.',
      'Apply background removal or adjust cropping area (3.5 x 4.5 cm).',
      'Select layout quantity (single photo or a sheet of 8 photos).',
      'Click print or save as JPEG/PNG.'
    ],
    examples: [
      { label: 'PAN Card Photo Crop', text: 'Correctly cropped portrait image to exact 3.5cm x 2.5cm size matching NSDL portal rules.' }
    ],
    faqs: [
      { q: 'What is the standard size of a passport photo in India?', a: 'The standard size is 3.5 cm in width by 4.5 cm in height, with a light background (white or off-white).' }
    ]
  }
};

export default TOOLS_METADATA;
