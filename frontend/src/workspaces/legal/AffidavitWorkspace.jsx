import React, { useState } from 'react';

export default function AffidavitWorkspace() {
  const [formData, setFormData] = useState({
    deponentName: '',
    fatherHusbandName: '',
    address: '',
    purpose: '',
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateDraft = () => {
    setIsDrafting(true);
    const content = `
[₹50 NOTARY STAMP PAPER]

शपथ पत्र (AFFIDAVIT)

मैं, ${formData.deponentName || '[DEPONENT NAME]'}, 
पुत्र/पुत्री/पत्नी श्री ${formData.fatherHusbandName || '[FATHER/HUSBAND NAME]'},
निवासी ${formData.address || '[FULL ADDRESS]'}, 
ईश्वर की शपथ लेकर निम्नलिखित कथन करता/करती हूँ:

1. यह कि मैं उपरोक्त पते का स्थायी निवासी हूँ।
2. यह कि यह शपथ पत्र मैं निम्नलिखित उद्देश्य से प्रस्तुत कर रहा/रही हूँ: 
   ${formData.purpose || '[PURPOSE OF AFFIDAVIT]'}
3. यह कि मेरे द्वारा दी गई सभी जानकारी मेरी व्यक्तिगत जानकारी में सत्य और सही है, 
   इसमें कुछ भी छुपाया नहीं गया है।

ईश्वर मेरी मदद करे।

हस्ताक्षर शपथकर्ता
(Signature of Deponent)

सत्यापन (VERIFICATION)
मैं, उपरोक्त शपथकर्ता, आज दिनांक [CURRENT DATE] को सत्यापित करता/करती हूँ कि 
उपरोक्त शपथ पत्र के पैरा 1 से 3 में दी गई जानकारी मेरे ज्ञान और विश्वास के अनुसार 
सत्य है। इसका कोई भी अंश असत्य नहीं है।

स्थान: _______________
दिनांक: _______________

हस्ताक्षर शपथकर्ता
(Signature of Deponent)
    `;

    setTimeout(() => {
      setDraft(content.trim());
      setIsDrafting(false);
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    alert('ड्राफ्ट कॉपी हो गया है!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>📜 Harshita AI — Affidavit Workspace</h2>
      <p style={{ color: '#666' }}>शपथकर्ता की जानकारी भरें, Master AI तुरंत कोर्ट फ़ॉर्मेट में ड्राफ्ट तैयार कर देगा।</p>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: '0' }}>📝 शपथकर्ता का विवरण (Deponent Info)</h3>
          
          <label style={{ display: 'block', margin: '10px 0 5px' }}>शपथकर्ता का नाम (Name):</label>
          <input type="text" name="deponentName" value={formData.deponentName} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>पिता/पति का नाम (Father/Husband Name):</label>
          <input type="text" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>पूरा पता (Full Address):</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>

          <label style={{ display: 'block', margin: '10px 0 5px' }}>शपथ का उद्देश्य (Purpose):</label>
          <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows="3" placeholder="उदा. नाम बदलना, आय प्रमाण पत्र..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>

          <button onClick={generateDraft} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            {isDrafting ? '🔄 ड्राफ्ट तैयार हो रहा है...' : '✍️ कानूनी ड्राफ्ट जेनरेट करें'}
          </button>
        </div>

        <div style={{ flex: '1.2', minWidth: '350px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📄 विलेख पूर्वावलोकन (Live Legal Preview)</h3>
          {draft ? (
            <div>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#fefbec', padding: '20px', borderRadius: '6px', fontSize: '15px', lineHeight: '1.6', border: '1px solid #e1c070', fontFamily: 'serif', color: '#333' }}>
                {draft}
              </pre>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => alert('PDF Downloading...')} style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  📥 Download PDF
                </button>
                <button onClick={copyToClipboard} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  📋 Copy Draft
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '80%', alignItems: 'center', justifyContent: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '6px', padding: '40px', textAlign: 'center' }}>
              फ़ॉर्म भरें और ड्राफ्ट जेनरेट करें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
