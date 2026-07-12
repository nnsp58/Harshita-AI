import React, { useState } from 'react';

export default function RefundWorkspace() {
  const [formData, setFormData] = useState({
    ackNumber: '',
    assessmentYear: '2023-24',
    expectedRefund: '',
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkStatus = () => {
    if (!formData.ackNumber) {
      alert('कृपया Acknowledgement Number दर्ज करें।');
      return;
    }
    
    // Mocking status logic based on input length or value for demo
    const statuses = ['PROCESSED', 'STUCK'];
    const mockStatus = formData.ackNumber.length > 12 ? 'PROCESSED' : 'STUCK';
    setStatus(mockStatus);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>💸 Harshita AI — Tax Refund Status & Grievance Workspace</h2>
      <p style={{ color: '#666' }}>अपना Acknowledgement Number दर्ज करें, मास्टर AI लाइव रिफंड स्टेटस बताएगा और जरूरत पड़ने पर शिकायत (Grievance) ड्राफ्ट करेगा।</p>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: '0' }}>🔍 रिफंड खोजें (Track Refund)</h3>
          
          <label style={{ display: 'block', margin: '10px 0 5px' }}>Acknowledgement Number:</label>
          <input type="text" name="ackNumber" value={formData.ackNumber} onChange={handleChange} placeholder="e.g. 123456789012345" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>Assessment Year (AY):</label>
          <select name="assessmentYear" value={formData.assessmentYear} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
          </select>

          <label style={{ display: 'block', margin: '10px 0 5px' }}>अपेक्षित रिफंड राशि (Expected Refund - ₹):</label>
          <input type="number" name="expectedRefund" value={formData.expectedRefund} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <button onClick={checkStatus} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            🔎 रिफंड स्टेटस चेक करें
          </button>
        </div>

        <div style={{ flex: '1.2', minWidth: '350px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📊 लाइव स्टेटस (Live Tracker)</h3>
          
          {status ? (
            <div>
              {/* Progress Bar Mockup */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                <span style={{ color: '#28a745' }}>Applied ✓</span>
                <span style={{ color: '#28a745' }}>Processed by CPC ✓</span>
                <span style={{ color: status === 'PROCESSED' ? '#28a745' : '#dc3545' }}>{status === 'PROCESSED' ? 'Sent to Bank ✓' : 'Stuck / Delayed ❌'}</span>
                <span style={{ color: status === 'PROCESSED' ? '#28a745' : '#ccc' }}>Credited</span>
              </div>
              
              <div style={{ width: '100%', background: '#e9ecef', borderRadius: '10px', height: '10px', marginBottom: '30px' }}>
                <div style={{ 
                  width: status === 'PROCESSED' ? '75%' : '60%', 
                  background: status === 'PROCESSED' ? '#28a745' : '#dc3545', 
                  height: '100%', 
                  borderRadius: '10px',
                  transition: 'width 0.5s ease-in-out'
                }}></div>
              </div>

              {status === 'STUCK' && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ आपका रिफंड अटका हुआ है!</h4>
                  <p style={{ fontSize: '14px', color: '#856404', margin: '0 0 10px 0' }}>
                    Centralized Processing Center (CPC) द्वारा आपका रिटर्न प्रोसेस हो चुका है, लेकिन बैंक को रिफंड जारी नहीं हुआ है। आप आयकर विभाग को ऑनलाइन शिकायत (Grievance) दर्ज करा सकते हैं।
                  </p>
                  
                  <div style={{ background: '#fff', padding: '15px', border: '1px dashed #ccc', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>✉️ Auto-Drafted Grievance Email</h5>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', color: '#444', margin: 0 }}>
To: refunds@incometax.gov.in
Subject: Delay in Income Tax Refund for AY {formData.assessmentYear} - Ack No. {formData.ackNumber}

Respected Sir/Madam,

I have filed my Income Tax Return for Assessment Year {formData.assessmentYear} vide Acknowledgement Number {formData.ackNumber}. I am expecting a refund of Rs. {formData.expectedRefund || '[Amount]'}/-.
As per the portal, my ITR has been processed, but the refund has not been credited to my bank account yet.

I request you to kindly look into the matter and release the refund at the earliest.

Thank you.
(Taxpayer)
                    </pre>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => alert('Grievance Draft Copied!')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      📋 Copy Grievance Draft
                    </button>
                  </div>
                </div>
              )}

              {status === 'PROCESSED' && (
                <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '15px', borderRadius: '8px', textAlign: 'center', color: '#155724' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>🎉 रिफंड बैंक को भेज दिया गया है!</h4>
                  <p style={{ margin: 0 }}>आपका रिफंड (Rs. {formData.expectedRefund}) State Bank of India (SBI) को भेजा जा चुका है। कृपया 2-3 कार्य दिवसों का इंतज़ार करें।</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', height: '80%', alignItems: 'center', justifyContent: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '6px', padding: '40px', textAlign: 'center' }}>
              स्टेटस चेक करने के लिए बाईं ओर विवरण दर्ज करें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
