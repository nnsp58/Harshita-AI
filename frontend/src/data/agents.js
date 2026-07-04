import { 
  Gavel, FileText, Scale, FileSignature, 
  Settings, PenTool, BookOpen, Calculator,
  Code, Globe, Database, FileSpreadsheet,
  Image as ImageIcon, Video, Mic, Languages,
  MessageSquare, LayoutTemplate, Briefcase, 
  Map, Monitor, Search, Stethoscope, BriefcaseBusiness
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'legal', label: 'Legal' },
  { id: 'writing', label: 'Writing' },
  { id: 'education', label: 'Education' },
  { id: 'business', label: 'Business' },
  { id: 'tools', label: 'Tools' },
  { id: 'ai', label: 'AI' },
  { id: 'utility', label: 'Utility' }
];

export const AGENTS = [
  {
    id: 'legal-draft',
    name: 'Legal Draft Agent',
    nameHi: 'कानूनी ड्राफ्ट बनाएं',
    description: 'Create legal documents, deeds, and notices.',
    icon: Gavel,
    color: 'bg-red-500',
    category: 'legal',
    isPremium: false,
    inputs: [
      { id: 'subject', label: 'Subject / विषय', type: 'text', placeholder: 'Draft property partition deed' },
      { id: 'details', label: 'Details / विवरण', type: 'textarea', placeholder: 'Party A and Party B...' }
    ]
  },
  {
    id: 'application-writer',
    name: 'Application Writer Agent',
    nameHi: 'आवेदन पत्र लिखें',
    description: 'Write formal applications for school, job, or govt.',
    icon: FileText,
    color: 'bg-blue-500',
    category: 'writing',
    isPremium: false,
    inputs: [
      { id: 'to', label: 'To / सेवा में', type: 'text', placeholder: 'Principal, XY School' },
      { id: 'subject', label: 'Subject / विषय', type: 'text', placeholder: 'Leave for 2 days' },
      { id: 'details', label: 'Details / विवरण', type: 'textarea', placeholder: 'I am sick...' }
    ]
  },
  {
    id: 'prayer-letter',
    name: 'Prayer Letter Agent',
    nameHi: 'प्रार्थना पत्र लिखें',
    description: 'Draft formal prayer letters to authorities.',
    icon: FileSignature,
    color: 'bg-purple-600',
    category: 'writing',
    isPremium: true,
    inputs: [
      { id: 'to', label: 'To / सेवा में', type: 'text', placeholder: 'अधिशासी अभियंता, विद्युत विभाग' },
      { id: 'subject', label: 'Subject / विषय', type: 'text', placeholder: 'बिजली के खंभे को बदलने के संबंध में' },
      { id: 'details', label: 'Details / विवरण', type: 'textarea', placeholder: 'खंभा बहुत पुराना है...' },
      { id: 'name', label: 'Name / प्रार्थी का नाम', type: 'text', placeholder: 'नर नारायण सिंह' },
      { id: 'address', label: 'Address / पता', type: 'text', placeholder: 'ग्राम - सिकरौड़ा...' },
      { id: 'mobile', label: 'Mobile / मोबाइल', type: 'text', placeholder: '9411246224' },
      { id: 'date', label: 'Date / दिनांक', type: 'date' }
    ]
  },
  {
    id: 'affidavit',
    name: 'Affidavit Agent',
    nameHi: 'शपथ पत्र / हलफनामा',
    description: 'Generate legal affidavits and sworn statements.',
    icon: Scale,
    color: 'bg-amber-600',
    category: 'legal',
    isPremium: false,
    inputs: [
      { id: 'subject', label: 'Purpose / उद्देश्य', type: 'text', placeholder: 'Name change affidavit' }
    ]
  },
  {
    id: 'notice-agreement',
    name: 'Notice & Agreement Agent',
    nameHi: 'नोटिस और अनुबंध',
    description: 'Draft rent agreements and legal notices.',
    icon: FileSignature,
    color: 'bg-red-600',
    category: 'legal',
    isPremium: true,
    inputs: [
      { id: 'subject', label: 'Type / प्रकार', type: 'text', placeholder: 'Rent Agreement for 11 months' }
    ]
  },
  {
    id: 'complaint-rep',
    name: 'Complaint & Representation',
    nameHi: 'शिकायत और प्रतिवेदन',
    description: 'File formal complaints to departments.',
    icon: FileText,
    color: 'bg-indigo-600',
    category: 'legal',
    isPremium: false,
    inputs: [
      { id: 'to', label: 'Authority / अधिकारी', type: 'text', placeholder: 'DM Sahab' }
    ]
  },
  {
    id: 'document-converter',
    name: 'Document Converter Agent',
    nameHi: 'डॉक्यूमेंट कन्वर्टर',
    description: 'Convert between document formats.',
    icon: Settings,
    color: 'bg-teal-500',
    category: 'tools',
    isPremium: false,
    inputs: []
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools Agent',
    nameHi: 'PDF टूल्स',
    description: 'Merge, split, compress PDF files.',
    icon: FileText,
    color: 'bg-red-500',
    category: 'tools',
    isPremium: false,
    inputs: []
  },
  {
    id: 'math-solver',
    name: 'Math Solver Agent',
    nameHi: 'गणित हल करें',
    description: 'Solve complex mathematical equations.',
    icon: Calculator,
    color: 'bg-blue-600',
    category: 'education',
    isPremium: false,
    inputs: [
      { id: 'equation', label: 'Equation / समीकरण', type: 'text', placeholder: '2x + 5 = 15' }
    ]
  },
  {
    id: 'land-measurement',
    name: 'Land Measurement Agent',
    nameHi: 'भूमि माप / क्षेत्रफल',
    description: 'Calculate land areas and unit conversions.',
    icon: Map,
    color: 'bg-green-600',
    category: 'utility',
    isPremium: false,
    inputs: []
  },
  {
    id: 'coding',
    name: 'Coding Agent',
    nameHi: 'कोड लिखें और डिबग करें',
    description: 'Write, debug, and optimize code snippets.',
    icon: Code,
    color: 'bg-purple-600',
    category: 'ai',
    isPremium: true,
    inputs: [
      { id: 'prompt', label: 'Task / कार्य', type: 'textarea', placeholder: 'Write a React component...' }
    ]
  },
  {
    id: 'website-builder',
    name: 'Website Builder Agent',
    nameHi: 'वेबसाइट बनाएं',
    description: 'Generate HTML/CSS for landing pages.',
    icon: Globe,
    color: 'bg-pink-600',
    category: 'ai',
    isPremium: true,
    inputs: []
  },
  {
    id: 'sql-database',
    name: 'SQL & Database Agent',
    nameHi: 'डेटाबेस क्वेरी',
    description: 'Write SQL queries and manage databases.',
    icon: Database,
    color: 'bg-slate-600',
    category: 'ai',
    isPremium: false,
    inputs: []
  },
  {
    id: 'excel-data',
    name: 'Excel / Data Agent',
    nameHi: 'एक्सेल फॉर्मूले',
    description: 'Generate complex Excel formulas and macros.',
    icon: FileSpreadsheet,
    color: 'bg-emerald-600',
    category: 'business',
    isPremium: false,
    inputs: []
  },
  {
    id: 'image-tools',
    name: 'Image Tools Agent',
    nameHi: 'इमेज टूल्स',
    description: 'Edit, resize, and convert images.',
    icon: ImageIcon,
    color: 'bg-orange-500',
    category: 'tools',
    isPremium: false,
    inputs: []
  },
  {
    id: 'video-tools',
    name: 'Video Tools Agent',
    nameHi: 'वीडियो टूल्स',
    description: 'Edit and convert video files.',
    icon: Video,
    color: 'bg-rose-500',
    category: 'tools',
    isPremium: true,
    inputs: []
  },
  {
    id: 'voice-ai',
    name: 'Voice AI Agent',
    nameHi: 'आवाज़ AI',
    description: 'Text to speech and voice processing.',
    icon: Mic,
    color: 'bg-cyan-500',
    category: 'ai',
    isPremium: true,
    inputs: []
  },
  {
    id: 'translation',
    name: 'Translation Agent',
    nameHi: 'अनुवादक',
    description: 'Translate documents to 50+ languages.',
    icon: Languages,
    color: 'bg-indigo-500',
    category: 'writing',
    isPremium: false,
    inputs: []
  },
  {
    id: 'whatsapp-assistant',
    name: 'WhatsApp Assistant Agent',
    nameHi: 'व्हाट्सएप सहायक',
    description: 'Automate WhatsApp campaigns.',
    icon: MessageSquare,
    color: 'bg-green-500',
    category: 'business',
    isPremium: true,
    inputs: []
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder Agent',
    nameHi: 'रिज्यूमे बनाएं',
    description: 'Create professional ATS-friendly resumes.',
    icon: LayoutTemplate,
    color: 'bg-blue-400',
    category: 'business',
    isPremium: false,
    inputs: []
  },
  {
    id: 'business-gst',
    name: 'Business & GST Agent',
    nameHi: 'व्यापार और GST',
    description: 'GST calculation and business registration guidance.',
    icon: BriefcaseBusiness,
    color: 'bg-amber-500',
    category: 'business',
    isPremium: true,
    inputs: []
  },
  {
    id: 'health-diet',
    name: 'Health & Diet Agent',
    nameHi: 'स्वास्थ्य और आहार',
    description: 'Personalized diet plans and health tips.',
    icon: Stethoscope,
    color: 'bg-emerald-500',
    category: 'utility',
    isPremium: false,
    inputs: []
  }
];

// Generate placeholder agents to reach 60 for UI completeness
for(let i = AGENTS.length + 1; i <= 60; i++) {
  AGENTS.push({
    id: \`agent-\${i}\`,
    name: \`Agent \${i} Service\`,
    nameHi: \`एजेंट \${i} सर्विस\`,
    description: 'Placeholder description for Agent.',
    icon: Settings,
    color: 'bg-gray-600',
    category: 'utility',
    isPremium: i % 5 === 0,
    inputs: []
  });
}
