import React, { useState } from 'react';

// ── Helper: today's date as DD/MM/YYYY ──────────────────────────────
const getToday = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// ── Sample Presets for Legal Notice ─────────────────────────────────
const NOTICE_PRESETS = [
  {
    id: 'cheque_bounce',
    label: '💸 चेक बाउंस (Sec 138 NI Act)',
    senderName: 'रमेश चंद्र अग्रवाल (Ramesh Chandra Agarwal)',
    senderAddress: 'दुकान नं. 12, न्यू मार्केट, सिविल लाइंस, कानपुर (उ.प्र.) - 208001',
    receiverName: 'सुरेश कुमार वर्मा (Suresh Kumar Verma, Prop. M/s Verma Enterprises)',
    receiverAddress: 'मकान नं. 78, विकास नगर, जीटी रोड, कानपुर (उ.प्र.) - 208024',
    reason: `That in discharge of your legally enforceable debt, you issued Cheque No. 452189 dated 10/08/2026 for an amount of ₹1,50,000 drawn on State Bank of India, Civil Lines Branch, Kanpur.
That upon presentation of the said cheque by my client, the same was returned dishonoured by the bank on 14/08/2026 with the endorsement 'Funds Insufficient'.
That the said dishonour is a serious criminal offence punishable under Section 138 of the Negotiable Instruments Act, 1881.`,
    demand: `1. Pay the entire cheque amount of ₹1,50,000/- along with interest @ 18% p.a. within 15 days of receipt of this notice.
2. Failing which, my client shall file a Criminal Complaint against you under Section 138 of N.I. Act before the competent Magistrate Court at Kanpur.`,
    timeLimit: '15 Days',
    amount: '₹1,50,000/-',
  },
  {
    id: 'money_recovery',
    label: '💰 बकाया भुगतान (Money Recovery)',
    senderName: 'मैसर्स गुप्ता ट्रेडर्स (M/s Gupta Traders through Prop. Amit Gupta)',
    senderAddress: 'बी-14, ट्रांसपोर्ट नगर, चारबाग, लखनऊ (उ.प्र.) - 226004',
    receiverName: 'रवि प्रकाश सिंह (Ravi Prakash Singh, Director, Sunrise Buildcon)',
    receiverAddress: 'प्लॉट नं. 102, विभूति खंड, गोमती नगर, लखनऊ (उ.प्र.) - 226010',
    reason: `That my client supplied building construction materials against Tax Invoices No. 204 and 205 dated 15/05/2026 totaling ₹2,85,000/- which were duly received and acknowledged by you.
That despite multiple written reminders, emails and telephone calls, an outstanding balance of ₹1,40,000/- remains unpaid without any valid reason.`,
    demand: `1. Release the outstanding payment of ₹1,40,000/- immediately within 15 days.
2. Pay ₹10,000/- towards legal expenses for issuing this notice.`,
    timeLimit: '15 Days',
    amount: '₹1,40,000/-',
  },
  {
    id: 'tenant_eviction',
    label: '🏠 दुकान / मकान खाली करना (Eviction)',
    senderName: 'श्रीमती सुनीता देवी (Smt. Sunita Devi)',
    senderAddress: 'मकान नं. 23, राजाजीपुरम, लखनऊ (उ.प्र.) - 226017',
    receiverName: 'आलोक कुमार त्रिपाठी (Alok Kumar Tripathi, Tenant)',
    receiverAddress: 'दुकान नं. 4, ग्राउंड फ्लोर, मेन मार्केट, राजाजीपुरम, लखनऊ (उ.प्र.) - 226017',
    reason: `That you were inducted as a monthly tenant in the scheduled premises vide Rent Agreement dated 01/06/2025 at a monthly rent of ₹12,000/-.
That the tenancy period of 11 months has expired, and you have also defaulted in paying rent for the last 4 months (Total rent arrears: ₹48,000/-).
That my client requires the premises for personal bona fide use and has terminated your tenancy.`,
    demand: `1. Vacate and deliver peaceful, vacant possession of the premises within 30 days.
2. Clear the entire arrears of rent amounting to ₹48,000/- along with pending electricity bills.`,
    timeLimit: '30 Days',
    amount: '₹48,000/-',
  }
];

// ── Small info icon (ⓘ) with hover tooltip ─────────────────────────
function InfoIcon({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', marginLeft: '6px' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        role="img"
        aria-label={text}
        title={text}
        style={{ color: '#2563eb', fontSize: '14px', cursor: 'help', lineHeight: 1, userSelect: 'none' }}
      >
        ⓘ
      </span>
      {show && (
        <span
          style={{
            position: 'absolute',
            bottom: '140%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            lineHeight: '1.4',
            width: '240px',
            zIndex: 50,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            whiteSpace: 'normal',
            textAlign: 'left',
            border: '1px solid #334155',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

function FieldLabel({ children, tooltip, required }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', margin: '14px 0 5px', fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
      <span>
        {children}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </span>
      {tooltip && <InfoIcon text={tooltip} />}
    </label>
  );
}

function HelpText({ children }) {
  return <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{children}</div>;
}

function ErrorText({ children }) {
  if (!children) return null;
  return <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '3px', fontWeight: 600 }}>⚠️ {children}</div>;
}

export default function NoticeWorkspace() {
  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    reason: '',
    demand: '',
    noticeDate: getToday(),
    timeLimit: '15 Days',
    amount: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const baseInput = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#0f172a',
  };

  const inputStyle = (hasError) => ({
    ...baseInput,
    border: hasError ? '1px solid #ef4444' : '1px solid #cbd5e1',
  });

  const areaStyle = (hasError) => ({
    ...inputStyle(hasError),
    resize: 'vertical',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData({
      senderName: preset.senderName,
      senderAddress: preset.senderAddress,
      receiverName: preset.receiverName,
      receiverAddress: preset.receiverAddress,
      reason: preset.reason,
      demand: preset.demand,
      noticeDate: getToday(),
      timeLimit: preset.timeLimit,
      amount: preset.amount,
    });
    setErrors({});
  };

  const loadGeneralSample = () => {
    applyPreset(NOTICE_PRESETS[0]);
  };

  const clearForm = () => {
    setActivePreset(null);
    setFormData({
      senderName: '',
      senderAddress: '',
      receiverName: '',
      receiverAddress: '',
      reason: '',
      demand: '',
      noticeDate: getToday(),
      timeLimit: '15 Days',
      amount: '',
    });
    setAttachments([]);
    setErrors({});
    setDraft('');
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files.map((f) => f.name));
  };

  const validate = () => {
    const e = {};
    if (!formData.senderName.trim()) e.senderName = 'कृपया भेजने वाले का नाम भरें / Please enter sender name';
    if (!formData.senderAddress.trim()) e.senderAddress = 'कृपया भेजने वाले का पता भरें / Please enter sender address';
    if (!formData.receiverName.trim()) e.receiverName = 'कृपया विपक्षी का नाम भरें / Please enter receiver name';
    if (!formData.receiverAddress.trim()) e.receiverAddress = 'कृपया विपक्षी का पता भरें / Please enter receiver address';
    if (!formData.reason.trim()) e.reason = 'कृपया नोटिस का कारण भरें / Please describe the reason for notice';
    return e;
  };

  const generateDraft = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsDrafting(true);
    const timeLimit = (formData.timeLimit || '15 Days').toUpperCase();
    const amountLine = formData.amount ? `\n4. That an amount of ${formData.amount} is due and payable by you to my client.` : '';
    const demandBlock = formData.demand
      ? `\nDEMAND / RELIEF SOUGHT:\n${formData.demand}\n`
      : '';
    const attachmentBlock = attachments.length
      ? `\nENCLOSURES / ATTACHMENTS:\n${attachments.map((a, i) => `   ${i + 1}. ${a}`).join('\n')}\n`
      : '';

    const content = `═══════════════════════════════════════════════════════════════
                    ADVOCATE LEGAL NOTICE FORMAT
═══════════════════════════════════════════════════════════════
SPEED POST WITH A.D. / REGD. POST

From the Office of:
RAMESH PRASAD SHARMA & ASSOCIATES
Advocates, High Court of Judicature
Chamber No. 42, Lawyers Complex, Civil Court
Contact: advocate@legalnotice.in | Mo: +91-9876543210

Date: ${formData.noticeDate || getToday()}

To,
${formData.receiverName || '[OPPOSITE PARTY / ADDRESSEE NAME]'}
${formData.receiverAddress || '[FULL ADDRESS OF OPPOSITE PARTY]'}

SUBJECT: STATUTORY LEGAL NOTICE UNDER APPLICABLE LAWS

Sir / Madam,

Under instructions from and on behalf of my client:
${formData.senderName || '[CLIENT / SENDER NAME]'}, 
residing / having office at: ${formData.senderAddress || '[SENDER ADDRESS]'}
(hereinafter referred to as 'My Client'), I do hereby serve upon you this formal Legal Notice:

1. That my client is a law-abiding citizen and carries on business/resides at the aforementioned address.

2. FACTS OF THE CASE & CAUSE OF ACTION:
${formData.reason || '[DETAILED REASON / FACTS]'}

3. That despite repeated requests, oral demands, and reminders, you have deliberately failed, neglected, and refused to comply with your lawful obligations.${amountLine}
${demandBlock}
I, THEREFORE, by means of this Statutory Legal Notice, call upon you to strictly comply with the aforesaid demands of my client within ${timeLimit} from the date of receipt of this notice.

PLEASE TAKE NOTICE that in the event of your failure to comply within the stipulated time period of ${timeLimit}, my client has given me clear and unequivocal instructions to initiate appropriate Civil, Criminal, and Commercial legal proceedings against you before the Competent Courts of Law, at your sole risk, cost, and legal consequences.

${attachmentBlock}
Copy retained in our chamber records for future legal proceedings.

Yours faithfully,

                                                (Advocate Signature)
                                            Advocate for the Client
                                            Enrollment No: UP/12458/2015
`;

    setTimeout(() => {
      setDraft(content.trim());
      setIsDrafting(false);
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    alert('✅ लीगल नोटिस क्लिपबोर्ड में कॉपी हो गया है!');
  };

  const printDraft = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Notice Draft</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 15px; line-height: 1.8; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${draft}</pre>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚖️ Harshita AI — Legal Notice Workspace
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            भेजने वाले और विपक्षी की जानकारी भरें या नीचे दिए गए 1-क्लिक उदाहरण चुनें, AI एडवोकेट लेटरहेड स्टाइल में लीगल नोटिस तैयार कर देगा।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadGeneralSample}
            style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(37,99,235,0.3)' }}
          >
            ⚡ उदाहरण लोड करें (Sample Auto-Fill)
          </button>
          <button
            onClick={clearForm}
            style={{ padding: '8px 14px', background: '#334155', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div style={{ marginBottom: '20px', background: '#1e293b', padding: '14px 18px', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🎯 त्वरित नोटिस प्रकार चुनें (Quick Notice Templates — 1-Click Fill):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NOTICE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                border: activePreset === p.id ? '1px solid #3b82f6' : '1px solid #475569',
                background: activePreset === p.id ? '#1d4ed8' : '#0f172a',
                color: activePreset === p.id ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Form Card */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 1. क्लाइंट विवरण (Sender Info)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>* अनिवार्य</span>
          </div>

          <FieldLabel required tooltip="यह नाम नोटिस पर 'भेजने वाले' के रूप में छपेगा। | Full legal name of sender">
            भेजने वाले का नाम (Sender Name)
          </FieldLabel>
          <input
            type="text"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            placeholder="उदा. रमेश चंद्र अग्रवाल (Ramesh Chandra Agarwal)"
            style={inputStyle(errors.senderName)}
          />
          <ErrorText>{errors.senderName}</ErrorText>

          <FieldLabel required tooltip="जहाँ से नोटिस भेजा जा रहा है। | Full registered address">
            भेजने वाले का पता (Sender Address)
          </FieldLabel>
          <textarea
            name="senderAddress"
            value={formData.senderAddress}
            onChange={handleChange}
            rows="2"
            placeholder="उदा. दुकान नं. 12, न्यू मार्केट, सिविल लाइंस, कानपुर (उ.प्र.) - 208001"
            style={areaStyle(errors.senderAddress)}
          />
          <ErrorText>{errors.senderAddress}</ErrorText>

          <div style={{ margin: '22px 0 16px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚨 2. विपक्षी विवरण (Opposite Party Info)
            </h3>
          </div>

          <FieldLabel required tooltip="जिसको नोटिस भेजा जा रहा है उसका सही नाम। | Full name of opposite party">
            विपक्षी का नाम (Opposite Party Name)
          </FieldLabel>
          <input
            type="text"
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            placeholder="उदा. सुरेश कुमार वर्मा (Prop. M/s Verma Enterprises)"
            style={inputStyle(errors.receiverName)}
          />
          <ErrorText>{errors.receiverName}</ErrorText>

          <FieldLabel required tooltip="जहाँ नोटिस डिलीवर होगा। | Address for speed post delivery">
            विपक्षी का पूरा पता (Receiver Address)
          </FieldLabel>
          <textarea
            name="receiverAddress"
            value={formData.receiverAddress}
            onChange={handleChange}
            rows="2"
            placeholder="उदा. मकान नं. 78, विकास नगर, जीटी रोड, कानपुर (उ.प्र.) - 208024"
            style={areaStyle(errors.receiverAddress)}
          />
          <ErrorText>{errors.receiverAddress}</ErrorText>

          <div style={{ margin: '22px 0 16px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 3. नोटिस का कारण व मांग (Facts & Demand)
            </h3>
          </div>

          <FieldLabel required tooltip="विवाद के मुख्य तथ्य (चेक बाउंस तारीख, बकाया बिल, मकान खाली न करना)।">
            नोटिस का कारण व तथ्य (Reason for Notice)
          </FieldLabel>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder="उदा. विपक्षी द्वारा जारी चेक नं. 452189 ₹1,50,000 बैंक द्वारा अपर्याप्त राशि के कारण अस्वीकृत हो गया..."
            style={areaStyle(errors.reason)}
          />
          <ErrorText>{errors.reason}</ErrorText>

          <FieldLabel tooltip="विपक्षी से स्पष्ट मांग (भुगतान, दुकान खाली, माफीनामा आदि)।">
            मांग / राहत (Demand / Relief Sought)
          </FieldLabel>
          <textarea
            name="demand"
            value={formData.demand}
            onChange={handleChange}
            rows="2"
            placeholder="उदा. 15 दिन में कुल बकाया ₹1,50,000 मय 18% ब्याज अदा करें अन्यथा कोर्ट केस किया जाएगा।"
            style={areaStyle(false)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <FieldLabel tooltip="विवाद से जुड़ी कुल धनराशि">
                राशि (Amount)
              </FieldLabel>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="उदा. ₹1,50,000/-"
                style={inputStyle(false)}
              />
            </div>
            <div>
              <FieldLabel tooltip="विपक्षी को पालन के लिए दी गई समय-सीमा (मानक 15 दिन)">
                समय-सीमा (Time Limit)
              </FieldLabel>
              <input
                type="text"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                placeholder="15 Days"
                style={inputStyle(false)}
              />
            </div>
          </div>

          <FieldLabel tooltip="चेक कॉपी, बिल, रसीद आदि संलग्नक">
            संलग्नक (Attachments / Enclosures)
          </FieldLabel>
          <input type="file" multiple onChange={handleFiles} style={{ ...baseInput, padding: '7px' }} />
          {attachments.length > 0 && (
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '500' }}>
              📎 {attachments.length} फाइलें: {attachments.join(', ')}
            </div>
          )}

          <button
            onClick={generateDraft}
            style={{ marginTop: '20px', width: '100%', padding: '13px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(220,38,38,0.2)' }}
          >
            {isDrafting ? '🔄 नोटिस तैयार हो रहा है...' : '✍️ एडवोकेट लीगल नोटिस जेनरेट करें'}
          </button>
        </div>

        {/* Right Preview Card */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📄 विलेख पूर्वावलोकन (Live Advocate Notice)
            </h3>
            {draft && (
              <span style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                ✓ Advocate Notice Ready
              </span>
            )}
          </div>

          {draft ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                style={{
                  flex: 1,
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.7',
                  borderLeft: '4px solid #dc2626',
                  fontFamily: '"Courier New", Courier, monospace',
                  color: '#0f172a',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '600px',
                  overflowY: 'auto',
                }}
              >
                {draft}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={printDraft}
                  style={{ flex: 1, padding: '11px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  🖨️ Print / Download PDF
                </button>
                <button
                  onClick={copyToClipboard}
                  style={{ flex: 1, padding: '11px', background: '#475569', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  📋 Copy Notice
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚖️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                फॉर्म भरें या त्वरित उदाहरण चुनें
              </div>
              <p style={{ fontSize: '13px', margin: 0, maxWidth: '280px', color: '#64748b' }}>
                ऊपर दिए गए 'उदाहरण लोड करें' या चिप्स पर क्लिक करके देखें कि एडवोकेट लीगल नोटिस कैसा ड्राफ्ट होता है।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
