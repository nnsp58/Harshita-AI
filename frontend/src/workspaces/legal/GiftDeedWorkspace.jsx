import React, { useState } from 'react';

const GIFT_PRESETS = [
  {
    id: 'wife_gift',
    label: '❤️ पत्नी को उपहार (Gift to Wife)',
    donorName: 'रमेश कुमार श्रीवास्तव (Ramesh Kumar Srivastava)',
    donorAge: '52',
    donorAddress: 'मकान नं. 14, सिविल लाइंस, प्रयागराज (उ.प्र.) 211001',
    doneeName: 'श्रीमती सीमा श्रीवास्तव (Smt. Seema Srivastava)',
    doneeAge: '48',
    doneeRelation: 'धर्मपत्नी (Wife)',
    doneeAddress: 'मकान नं. 14, सिविल लाइंस, प्रयागराज (उ.प्र.) 211001',
    propertyDetails: 'आवासीय भूखंड संख्या 104, क्षेत्रफल 150 वर्ग मीटर (1615 वर्ग फीट), स्थित मौजा- झलवा, परगना व तहसील- सदर, जिला- प्रयागराज। चौहद्दी: पूरब- 30 फीट चौड़ा रास्ता, पश्चिम- भूखंड नं. 105, उत्तर- पार्क, दक्षिण- भूखंड नं. 103।',
    propertyValue: '₹25,00,000/- (पच्चीस लाख रुपये)',
  },
  {
    id: 'son_gift',
    label: '👨‍👦 पुत्र को उपहार (Gift to Son)',
    donorName: 'महेन्द्र प्रताप सिंह (Mahendra Pratap Singh)',
    donorAge: '65',
    donorAddress: 'ग्राम व पोस्ट- सराय मीरा, जिला- कन्नौज (उ.प्र.) 209725',
    doneeName: 'अतुल प्रताप सिंह (Atul Pratap Singh)',
    doneeAge: '32',
    doneeRelation: 'सुपुत्र (Son)',
    doneeAddress: 'ग्राम व पोस्ट- सराय मीरा, जिला- कन्नौज (उ.प्र.) 209725',
    propertyDetails: 'दुकान संख्या 5, ग्राउंड फ्लोर, व्यावसायिक कॉम्प्लेक्स, जी.टी. रोड, कन्नौज। क्षेत्रफल 200 वर्ग फीट। चौहद्दी: पूरब- मुख्य जीटी रोड, पश्चिम- गली 10 फीट, उत्तर- दुकान नं. 6, दक्षिण- दुकान नं. 4।',
    propertyValue: '₹15,00,000/- (पंद्रह लाख रुपये)',
  }
];

export default function GiftDeedWorkspace() {
  const [formData, setFormData] = useState({
    donorName: '',
    donorAge: '',
    donorAddress: '',
    doneeName: '',
    doneeAge: '',
    doneeRelation: '',
    doneeAddress: '',
    propertyDetails: '',
    propertyValue: '',
  });

  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData({
      donorName: preset.donorName,
      donorAge: preset.donorAge,
      donorAddress: preset.donorAddress,
      doneeName: preset.doneeName,
      doneeAge: preset.doneeAge,
      doneeRelation: preset.doneeRelation,
      doneeAddress: preset.doneeAddress,
      propertyDetails: preset.propertyDetails,
      propertyValue: preset.propertyValue,
    });
  };

  const clearForm = () => {
    setActivePreset(null);
    setFormData({
      donorName: '',
      donorAge: '',
      donorAddress: '',
      doneeName: '',
      doneeAge: '',
      doneeRelation: '',
      doneeAddress: '',
      propertyDetails: '',
      propertyValue: '',
    });
    setGeneratedTemplate('');
  };

  const generateGiftDeedDraft = () => {
    setIsDrafting(true);
    const today = new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const draft = `═══════════════════════════════════════════════════════════════
                   दान विलेख / उपहार पत्र (GIFT DEED)
═══════════════════════════════════════════════════════════════

यह दान विलेख (उपहार पत्र) आज दिनांक ${today} को निम्नलिखित पक्षों के मध्य निष्पादित किया जाता है:

प्रथम पक्ष (दाता / DONOR):
श्री/श्रीमती: ${formData.donorName || '[दाता का नाम]'}
उम्र: लगभग ${formData.donorAge || '[उम्र]'} वर्ष, 
निवासी: ${formData.donorAddress || '[दाता का पूरा पता]'}
(जिन्हें आगे इस विलेख में "दाता/Donor" कहा गया है)

एवं

द्वितीय पक्ष (ग्रहीता / DONEE):
श्री/श्रीमती: ${formData.doneeName || '[ग्रहीता का नाम]'}
उम्र: लगभग ${formData.doneeAge || '[उम्र]'} वर्ष, 
सम्बन्ध: दाता के/की ${formData.doneeRelation || '[सम्बन्ध, उदा. पत्नी/पुत्र]'},
निवासी: ${formData.doneeAddress || '[ग्रहीता का पूरा पता]'}
(जिन्हें आगे इस विलेख में "ग्रहीता/Donee" कहा गया है)

१. यह कि दाता उल्लिखित अचल संपत्ति का एकमात्र पूर्ण, वैध एवं निर्विवाद स्वामी व काबिज है।
२. यह कि ग्रहीता, दाता का सगा सम्बन्धी है तथा दोनों के मध्य प्रगाढ़ स्वाभाविक प्रेम, स्नेह एवं आदर का भाव है।
३. यह कि बिना किसी प्रतिफल (Without Monetary Consideration) तथा केवल स्वाभाविक प्रेम और स्नेह के कारण दाता अपनी उक्त अचल संपत्ति को ग्रहीता के पक्ष में पूर्ण रूप से दान/उपहार (Gift) करता है।

दान की गई संपत्ति का पूर्ण विवरण एवं चौहद्दी:
${formData.propertyDetails || '[संपत्ति का विवरण, खसरा/प्लॉट नं, क्षेत्रफल एवं चारों दिशाओं की चौहद्दी]'}

संपत्ति का अनुमानित बाज़ार मूल्य: रु. ${formData.propertyValue || '[बाज़ार मूल्य]'}

४. यह कि दाता ने आज ही उक्त संपत्ति का वास्तविक व वैधानिक कब्ज़ा ग्रहीता को सौंप दिया है तथा ग्रहीता ने इसे सहर्ष स्वीकार कर लिया है।
५. यह कि भविष्य में दाता अथवा दाता का कोई अन्य उत्तराधिकारी इस दान विलेख पर कोई आपत्ति या दावा प्रस्तुत नहीं करेगा।

साक्षियों की उपस्थिति में दोनों पक्षों ने स्वस्थ चित्त व बिना किसी दबाव के अपने-अपने हस्ताक्षर किए:

साक्षी १: _____________________               हस्ताक्षर दाता (Donor): _____________________
साक्षी २: _____________________               हस्ताक्षर ग्रहीता (Donee): ___________________
`;

    setTimeout(() => {
      setGeneratedTemplate(draft.trim());
      setIsDrafting(false);
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTemplate);
    alert('✅ दान विलेख क्लिपबोर्ड में कॉपी हो गया है!');
  };

  const printDraft = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Gift Deed Draft</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 15px; line-height: 1.8; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${generatedTemplate}</pre>
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
            📜 Harshita AI — Gift Deed Workspace
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            दाता (Donor) और ग्रहीता (Donee) की जानकारी भरें, AI तुरंत भारतीय रजिस्ट्री एक्ट अनुसार कानूनी दान विलेख तैयार कर देगा।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => applyPreset(GIFT_PRESETS[0])}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '10px' }}>
          🎯 त्वरित दान विलेख प्रकार (Quick Gift Deed Presets):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GIFT_PRESETS.map((p) => (
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
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            👥 1. दाता का विवरण (Donor Info — जो संपत्ति दान कर रहा है)
          </h3>

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
            दाता का नाम (Donor Name):
          </label>
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleInputChange}
            placeholder="उदा. रमेश कुमार श्रीवास्तव"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', marginBottom: '12px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>उम्र (Age):</label>
              <input
                type="number"
                name="donorAge"
                value={formData.donorAge}
                onChange={handleInputChange}
                placeholder="52"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>दाता का पूरा पता (Address):</label>
              <input
                type="text"
                name="donorAddress"
                value={formData.donorAddress}
                onChange={handleInputChange}
                placeholder="मकान नं, मोहल्ला, शहर, जिला"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <h3 style={{ margin: '20px 0 14px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            👤 2. ग्रहीता का विवरण (Donee Info — जिसे संपत्ति दान मिल रही है)
          </h3>

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
            ग्रहीता का नाम (Donee Name):
          </label>
          <input
            type="text"
            name="doneeName"
            value={formData.doneeName}
            onChange={handleInputChange}
            placeholder="उदा. श्रीमती सीमा श्रीवास्तव / अतुल प्रताप सिंह"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', marginBottom: '12px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>दाता से सम्बंध (Relation):</label>
              <input
                type="text"
                name="doneeRelation"
                value={formData.doneeRelation}
                onChange={handleInputChange}
                placeholder="उदा. पत्नी / पुत्र / पुत्री / भाई"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>उम्र (Age):</label>
              <input
                type="number"
                name="doneeAge"
                value={formData.doneeAge}
                onChange={handleInputChange}
                placeholder="48"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
            ग्रहीता का पता (Donee Address):
          </label>
          <input
            type="text"
            name="doneeAddress"
            value={formData.doneeAddress}
            onChange={handleInputChange}
            placeholder="पूरा स्थायी पता दर्ज करें"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          <h3 style={{ margin: '20px 0 14px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            🏠 3. संपत्ति विवरण (Property & Boundaries)
          </h3>

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
            संपत्ति का पूरा विवरण एवं चौहद्दी:
          </label>
          <textarea
            name="propertyDetails"
            value={formData.propertyDetails}
            onChange={handleInputChange}
            rows="3"
            placeholder="उदा. भूखंड संख्या 104, क्षेत्रफल 150 वर्ग मीटर, मौजा- झलवा, प्रयागराज। चौहद्दी: पूरब- रास्ता, पश्चिम- प्लॉट 105, उत्तर- पार्क, दक्षिण- प्लॉट 103"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#0f172a', resize: 'vertical', marginBottom: '12px', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
            संपत्ति का अनुमानित बाज़ार मूल्य (Estimated Value):
          </label>
          <input
            type="text"
            name="propertyValue"
            value={formData.propertyValue}
            onChange={handleInputChange}
            placeholder="उदा. ₹25,00,000/-"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', marginBottom: '18px', boxSizing: 'border-box' }}
          />

          <button
            onClick={generateGiftDeedDraft}
            style={{ width: '100%', padding: '13px', background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(124,58,237,0.2)' }}
          >
            {isDrafting ? '🔄 दान विलेख तैयार हो रहा है...' : '✍️ दान विलेख (Gift Deed) ड्राफ्ट करें'}
          </button>
        </div>

        {/* Right Preview Card */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📄 विलेख पूर्वावलोकन (Live Gift Deed Preview)
            </h3>
            {generatedTemplate && (
              <span style={{ fontSize: '12px', background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                ✓ Registry Format Ready
              </span>
            )}
          </div>

          {generatedTemplate ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                style={{
                  flex: 1,
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.7',
                  borderLeft: '4px solid #7c3aed',
                  fontFamily: '"Courier New", Courier, monospace',
                  color: '#0f172a',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '600px',
                  overflowY: 'auto',
                }}
              >
                {generatedTemplate}
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
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📜</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                फॉर्म भरें या त्वरित उदाहरण चुनें
              </div>
              <p style={{ fontSize: '13px', margin: 0, maxWidth: '280px', color: '#64748b' }}>
                ऊपर दिए गए 'उदाहरण लोड करें' पर क्लिक करके देखें कि भारतीय निबंधन (Registry) मान्य दान विलेख कैसा बनता है।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
