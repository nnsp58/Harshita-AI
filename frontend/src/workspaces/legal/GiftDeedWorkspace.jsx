import React, { useState } from 'react';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateGiftDeedDraft = () => {
    setIsDrafting(true);
    // Harshita AI Legal Automation Engine Engine Template
    const draft = `
=========================================
            UPHAAR VILEKH (GIFT DEED)
=========================================

यह उपहार विलेख आज दिनांक को श्री/श्रीमती ${formData.donorName || '[DONOR NAME]'}, 
आयु लगभग ${formData.donorAge || '[AGE]'} वर्ष, निवासी ${formData.donorAddress || '[ADDRESS]'} (जिन्हें आगे "दाता/Donor" कहा गया है) 
के द्वारा श्री/श्रीमती ${formData.doneeName || '[DONEE NAME]'}, 
आयु लगभग ${formData.doneeAge || '[AGE]'} वर्ष, निवासी ${formData.doneeAddress || '[ADDRESS]'} 
जो कि दाता के/की ${formData.doneeRelation || '[RELATION]'} हैं (जिन्हें आगे "ग्रहीता/Donee" कहा गया है) के पक्ष में निष्पादित किया जाता है।

यह कि दाता अपनी अचल संपत्ति जिसका विवरण निम्न है:
${formData.propertyDetails || '[PROPERTY DETAILS AND BOUNDARIES]'}
जिसका अनुमानित बाज़ार मूल्य रु. ${formData.propertyValue || '[VALUE]'} है, उसे बिना किसी प्रतिफल (Consideration) के, 
केवल स्वाभाविक प्रेम और स्नेह के कारण ग्रहीता को पूर्ण रूप से उपहार/दान स्वरूप देता है।

यह कि ग्रहीता ने इस उपहार को और इस संपत्ति के पूर्ण स्वामित्व व कब्ज़े को आज ही स्वीकार कर लिया है।

गवाहान की उपस्थिति में दोनों पक्षों ने इस विलेख पर हस्ताक्षर किए हैं।

गवाह 1: _____________________               दाता (Donor): _____________________
गवाह 2: _____________________               ग्रहीता (Donee): _____________________
    `;
    
    setTimeout(() => {
      setGeneratedTemplate(draft.trim());
      setIsDrafting(false);
    }, 800);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>📜 Harshita AI — Gift Deed Workspace</h2>
      <p style={{ color: '#666' }}>दाता (Donor) और ग्रहीता (Donee) की जानकारी भरें, Master AI ऑटोमेटिकली कानूनी मसौदा (Draft) तैयार कर देगा。</p>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
        {/* Input Form Column */}
        <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: '0' }}>👥 पक्षकारों का विवरण (Parties Info)</h3>
          
          <label style={{ display: 'block', margin: '10px 0 5px' }}>दाता का नाम (Donor Name):</label>
          <input type="text" name="donorName" value={formData.donorName} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', margin: '10px 0 5px' }}>उम्र (Age):</label>
              <input type="number" name="donorAge" value={formData.donorAge} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: '2' }}>
              <label style={{ display: 'block', margin: '10px 0 5px' }}>पता (Address):</label>
              <input type="text" name="donorAddress" value={formData.donorAddress} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

          <h3>👤 ग्रहीता का विवरण (Donee Info)</h3>
          <label style={{ display: 'block', margin: '10px 0 5px' }}>ग्रहीता का नाम (Donee Name):</label>
          <input type="text" name="doneeName" value={formData.doneeName} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', margin: '10px 0 5px' }}>दाता से सम्बंध:</label>
              <input type="text" name="doneeRelation" value={formData.doneeRelation} onChange={handleInputChange} placeholder="उदा. भाई, पुत्री" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', margin: '10px 0 5px' }}>उम्र (Age):</label>
              <input type="number" name="doneeAge" value={formData.doneeAge} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          
          <label style={{ display: 'block', margin: '10px 0 5px' }}>ग्रहीता का पता (Address):</label>
          <input type="text" name="doneeAddress" value={formData.doneeAddress} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

          <h3>🏠 संपत्ति का विवरण (Property Details)</h3>
          <label style={{ display: 'block', margin: '10px 0 5px' }}>संपत्ति का पूरा विवरण और चौहद्दी (Boundaries):</label>
          <textarea name="propertyDetails" value={formData.propertyDetails} onChange={handleInputChange} rows="3" placeholder="उदा. प्लॉट नं, खाता/खसरा नंबर, पूरब, पश्चिम, उत्तर, दक्खिन की सीमाएं..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>

          <label style={{ display: 'block', margin: '10px 0 5px' }}>संपत्ति का मूल्यांकन (Circle Rate / Market Value Rs.):</label>
          <input type="text" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <button onClick={generateGiftDeedDraft} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            {isDrafting ? '🔄 ड्राफ्ट तैयार हो रहा है...' : '✍️ कानूनी ड्राफ्ट जेनरेट करें'}
          </button>
        </div>

        {/* Live Preview Column */}
        <div style={{ flex: '1.2', minWidth: '350px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📄 विलेख पूर्वावलोकन (Live Legal Preview)</h3>
          {generatedTemplate ? (
            <div>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f6f8', padding: '15px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6', borderLeft: '4px solid #007bff', fontFamily: 'monospace' }}>
                {generatedTemplate}
              </pre>
              <button onClick={() => alert('PDF Download logic triggers here!')} style={{ marginTop: '10px', padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 PDF डाउनलोड करें
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '80%', alignItems: 'center', justifyContent: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '6px', padding: '40px', textAlign: 'center' }}>
              बाएँ हाथ पर फ़ॉर्म में डेटा भरें और विलेख का कानूनी ड्राफ्ट रीयल-टाइम में देखने के लिए बटन पर क्लिक करें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
