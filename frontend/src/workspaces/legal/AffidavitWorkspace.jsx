import React, { useState } from 'react';

// ── Sample Presets for Affidavit ──────────────────────────────────────
const AFFIDAVIT_PRESETS = [
  {
    id: 'name_correction',
    label: '📝 नाम संशोधन (Name Correction)',
    deponentName: 'राजेश कुमार शर्मा (Rajesh Kumar Sharma)',
    fatherHusbandName: 'श्री रामप्रकाश शर्मा (Shri Ramprakash Sharma)',
    ageOccupation: '35 वर्ष, व्यवसाय / स्वरोजगार',
    address: 'मकान नं. 45, गांधी नगर, पोस्ट- सदर, जिला- लखनऊ (उ.प्र.) 226001',
    purpose: 'शैक्षिक प्रमाण पत्र व आधार कार्ड में नाम की भिन्नता स्पष्ट करने हेतु',
    clauses: `1. यह कि मेरी हाईस्कूल अंकतालिका में मेरा नाम 'राजेश कुमार' तथा आधार कार्ड में 'राजेश शर्मा' दर्ज है।
2. यह कि 'राजेश कुमार' और 'राजेश शर्मा' दोनों एक ही व्यक्ति अर्थात् मेरे ही नाम हैं।
3. यह कि भविष्य में मुझे सभी सरकारी व गैर-सरकारी अभिलेखों में 'राजेश कुमार शर्मा' के नाम से ही जाना व पहचाना जाए।`,
  },
  {
    id: 'lost_document',
    label: '📄 गुमशुदा दस्तावेज (Lost Marksheet / RC)',
    deponentName: 'अमित कुमार वर्मा (Amit Kumar Verma)',
    fatherHusbandName: 'श्री दिनेश चंद्र वर्मा (Shri Dinesh Chandra Verma)',
    ageOccupation: '24 वर्ष, छात्र / Student',
    address: 'ग्राम व पोस्ट- बक्शी का तालाब, सीतापुर रोड, लखनऊ (उ.प्र.) 226201',
    purpose: 'इंटरमीडिएट मूल अंकतालिका (Original Marksheet) गुम होने बाबत द्वितीय प्रति हेतु',
    clauses: `1. यह कि मैंने वर्ष 2022 में यूपी बोर्ड से इंटरमीडिएट (अनुक्रमांक 2341562) उत्तीर्ण किया था।
2. यह कि यात्रा के दौरान मेरी मूल अंकतालिका खो/गुम हो गई है, जिसकी सूचना संबंधित थाने में दे दी गई है।
3. यह कि उक्त दस्तावेज का कोई गलत उपयोग नहीं किया गया है। मुझे द्वितीय प्रति जारी की जाए।`,
  },
  {
    id: 'income_declaration',
    label: '💰 आय घोषणा (Income Certificate)',
    deponentName: 'सुरेश कुमार पाल (Suresh Kumar Pal)',
    fatherHusbandName: 'स्व. श्री रामलाल पाल (Late Shri Ramlal Pal)',
    ageOccupation: '48 वर्ष, कृषि एवं मजदूरी',
    address: 'ग्राम- रामपुर, तहसील- सदर, जिला- उन्नाव (उ.प्र.) 209801',
    purpose: 'छात्रवृत्ति व सरकारी योजना हेतु पारिवारिक वार्षिक आय प्रमाणित करने बाबत',
    clauses: `1. यह कि मेरे परिवार का मुख्य व्यवसाय कृषि एवं दैनिक मजदूरी है।
2. यह कि समस्त स्रोतों से मेरे संपूर्ण परिवार की कुल वार्षिक आय ₹60,000 (साठ हजार रुपये मात्र) है।
3. यह कि मेरे परिवार में कोई भी सदस्य आयकरदाता अथवा सरकारी सेवा में नहीं है।`,
  },
  {
    id: 'gap_certificate',
    label: '🎓 गैप सर्टिफिकेट (Education Gap)',
    deponentName: 'प्रिया सिंह (Priya Singh)',
    fatherHusbandName: 'पुत्री श्री महेंद्र प्रताप सिंह (D/o Shri Mahendra Pratap Singh)',
    ageOccupation: '21 वर्ष, छात्रा / Student',
    address: 'फ्लैट नं. 204, अवध एन्क्लेव, गोमती नगर, लखनऊ (उ.प्र.) 226010',
    purpose: 'ग्रेजुएशन में प्रवेश हेतु 2 वर्ष के अध्ययन अंतराल (Gap) के संबंध में',
    clauses: `1. यह कि मैंने वर्ष 2024 में 12वीं कक्षा प्रथम श्रेणी से उत्तीर्ण की थी।
2. यह कि वर्ष 2024 से 2026 के मध्य मैं प्रतियोगी परीक्षाओं की तैयारी कर रही थी, इस कारण किसी अन्य संस्था में प्रवेश नहीं लिया।
3. यह कि उक्त अंतराल की अवधि में मैं किसी भी प्रकार की आपराधिक अथवा अनुचित गतिविधि में लिप्त नहीं रही हूँ।`,
  }
];

export default function AffidavitWorkspace() {
  const [formData, setFormData] = useState({
    deponentName: '',
    fatherHusbandName: '',
    ageOccupation: '',
    address: '',
    purpose: '',
    clauses: '',
    stampValue: '50',
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData(prev => ({
      ...prev,
      deponentName: preset.deponentName,
      fatherHusbandName: preset.fatherHusbandName,
      ageOccupation: preset.ageOccupation,
      address: preset.address,
      purpose: preset.purpose,
      clauses: preset.clauses,
    }));
  };

  const loadGeneralSample = () => {
    applyPreset(AFFIDAVIT_PRESETS[0]);
  };

  const clearForm = () => {
    setActivePreset(null);
    setFormData({
      deponentName: '',
      fatherHusbandName: '',
      ageOccupation: '',
      address: '',
      purpose: '',
      clauses: '',
      stampValue: '50',
    });
    setDraft('');
  };

  const generateDraft = () => {
    setIsDrafting(true);
    const today = new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const clausesText = formData.clauses.trim() ? formData.clauses.trim() : `1. यह कि मैं उपरोक्त पते का स्थायी निवासी हूँ।\n2. यह कि यह शपथ पत्र मैं निम्नलिखित उद्देश्य से प्रस्तुत कर रहा/रही हूँ: ${formData.purpose || '[शपथ का उद्देश्य]'}\n3. यह कि मेरे द्वारा दी गई सभी जानकारी मेरी व्यक्तिगत जानकारी में सत्य और सही है।`;

    const content = `[₹${formData.stampValue || '50'} NOTARY NON-JUDICIAL STAMP PAPER]

═══════════════════════════════════════════════════════════════
                      शपथ पत्र (AFFIDAVIT)
═══════════════════════════════════════════════════════════════

समक्ष: सक्षम अधिकारी / नोटरी पब्लिक महोदय, ___________________

मैं, ${formData.deponentName || '[शपथकर्ता का नाम]'}, 
${formData.fatherHusbandName ? `पुत्र/पुत्री/पत्नी: ${formData.fatherHusbandName},` : 'पुत्र/पुत्री/पत्नी: [पिता/पति का नाम],'}
${formData.ageOccupation ? `उम्र व पेशा: ${formData.ageOccupation},` : ''}
निवासी: ${formData.address || '[पूरा स्थायी पता]'},

ईश्वर की शपथ लेकर निम्नलिखित सत्य कथन करता/करती हूँ:

${clausesText}

४. यह कि इस शपथ पत्र में उल्लिखित कोई भी तथ्य असत्य नहीं है और न ही कोई आवश्यक तथ्य छुपाया गया है।

ईश्वर मेरी मदद करे।

स्थान: ___________________
दिनांक: ${today}

                                                हस्ताक्षर शपथकर्ता
                                           (Signature of Deponent)

═══════════════════════════════════════════════════════════════
                      सत्यापन (VERIFICATION)
═══════════════════════════════════════════════════════════════

मैं, उपरोक्त शपथकर्ता, आज दिनांक ${today} को स्थान ____________ पर सत्यापित करता/करती हूँ कि इस शपथ पत्र के सभी प्रस्तर (पैरा) में वर्णित कथन मेरे निजी ज्ञान एवं विश्वास के अनुसार पूर्णतः सत्य एवं सही हैं। इसका कोई भी अंश असत्य अथवा भ्रामक नहीं है।

सत्यापितकर्ता / शपथकर्ता: 
नाम: ${formData.deponentName || '[शपथकर्ता का नाम]'}

                                                हस्ताक्षर शपथकर्ता
                                           (Signature of Deponent)
`;

    setTimeout(() => {
      setDraft(content.trim());
      setIsDrafting(false);
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    alert('✅ ड्राफ्ट क्लिपबोर्ड में कॉपी हो गया है!');
  };

  const printDraft = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Affidavit Draft</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 16px; line-height: 1.8; color: #000; }
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
            📜 Harshita AI — Affidavit Workspace
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            शपथकर्ता की जानकारी भरें या नीचे दिए गए उदाहरण चुनें, AI तुरंत कोर्ट एवं नोटरी मान्य फ़ॉर्मेट में ड्राफ्ट तैयार कर देगा।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadGeneralSample}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}
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

      {/* Quick Purpose Chips */}
      <div style={{ marginBottom: '20px', background: '#1e293b', padding: '14px 18px', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🎯 त्वरित उद्देश्य चुनें (Quick Template Chips — 1-Click Fill):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {AFFIDAVIT_PRESETS.map((p) => (
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
        {/* Left: Input Form Card */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 शपथकर्ता का विवरण (Deponent Details)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>* अनिवार्य फ़ील्ड्स</span>
          </div>

          {/* Stamp Value */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              स्टाम्प पेपर मूल्य (Stamp Paper Value):
            </label>
            <select
              name="stampValue"
              value={formData.stampValue}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', color: '#0f172a' }}
            >
              <option value="10">₹10 (सामान्य सरकारी प्रार्थना पत्र / General)</option>
              <option value="50">₹50 (नोटरी शपथ पत्र / मानक Notary Standard)</option>
              <option value="100">₹100 (कोर्ट / अनुबंध शपथ पत्र / Court Declaration)</option>
            </select>
          </div>

          {/* Deponent Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              शपथकर्ता का नाम (Deponent Name) <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <input
              type="text"
              name="deponentName"
              value={formData.deponentName}
              onChange={handleChange}
              placeholder="उदा. राजेश कुमार शर्मा (Rajesh Kumar Sharma)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>आधार कार्ड या पहचान पत्र अनुसार पूरा नाम दर्ज करें</div>
          </div>

          {/* Father/Husband Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              पिता / पति का नाम (Father/Husband Name) <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <input
              type="text"
              name="fatherHusbandName"
              value={formData.fatherHusbandName}
              onChange={handleChange}
              placeholder="उदा. श्री रामप्रकाश शर्मा / W/o श्री राजेश शर्मा"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>

          {/* Age & Occupation */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              उम्र व पेशा (Age & Occupation):
            </label>
            <input
              type="text"
              name="ageOccupation"
              value={formData.ageOccupation}
              onChange={handleChange}
              placeholder="उदा. उम्र 35 वर्ष, पेशा: व्यवसाय / कृषि / नौकरी"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              पूरा स्थायी पता (Full Address) <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="उदा. मकान नं. 45, गांधी नगर, पोस्ट- सदर, थाना- कोतवाली, जिला- लखनऊ (उ.प्र.) 226001"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Purpose */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              शपथ का उद्देश्य (Purpose of Affidavit) <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="उदा. नाम संशोधन / गुमशुदा मार्कशीट / आय प्रमाण पत्र बाबत"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>

          {/* Specific Declaration Clauses */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
              मुख्य घोषणा बिंदु (Declaration Clauses / Points):
            </label>
            <textarea
              name="clauses"
              value={formData.clauses}
              onChange={handleChange}
              rows="4"
              placeholder="उदा. 1. यह कि मेरा सही नाम राजेश कुमार शर्मा है...&#10;2. यह कि मेरे सभी दस्तावेज वैध एवं सत्य हैं..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.5', background: '#ffffff', color: '#0f172a', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>यदि खाली छोड़ेंगे, तो उद्देश्य के आधार पर मानक बिंदु स्वतः तैयार हो जाएंगे।</div>
          </div>

          {/* Submit Button */}
          <button
            onClick={generateDraft}
            style={{ width: '100%', padding: '13px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}
          >
            {isDrafting ? '🔄 ड्राफ्ट तैयार हो रहा है...' : '✍️ कानूनी ड्राफ्ट जेनरेट करें'}
          </button>
        </div>

        {/* Right: Live Preview Card */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📄 विलेख पूर्वावलोकन (Live Legal Preview)
            </h3>
            {draft && (
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                ✓ Ready for Stamp
              </span>
            )}
          </div>

          {draft ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                style={{
                  flex: 1,
                  background: '#fefce8',
                  padding: '20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  border: '1px solid #fef08a',
                  fontFamily: '"Courier New", Courier, monospace',
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '520px',
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
                  📋 Copy Text
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
                ऊपर दिए गए 'उदाहरण लोड करें' बटन पर क्लिक करके देखें कि कोर्ट फ़ॉर्मेट में ड्राफ्ट कैसा बनता है।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
