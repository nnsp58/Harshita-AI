import React, { useState } from 'react';

export default function GSTWorkspace() {
  const [formData, setFormData] = useState({
    businessName: '',
    turnover: '',
    purchases: '',
    sales: '',
    gstRate: '18', // Default 18%
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sales = parseFloat(formData.sales) || 0;
  const purchases = parseFloat(formData.purchases) || 0;
  const rate = parseFloat(formData.gstRate) / 100;

  // Calculation
  const outputGST = sales * rate;
  const inputGST = purchases * rate;
  const netGSTPayable = outputGST - inputGST;
  
  const cgst = netGSTPayable > 0 ? (netGSTPayable / 2).toFixed(2) : 0;
  const sgst = netGSTPayable > 0 ? (netGSTPayable / 2).toFixed(2) : 0;
  const isRefundable = netGSTPayable < 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>📊 Harshita AI — GST Calculator & Returns Workspace</h2>
      <p style={{ color: '#666' }}>व्यापार का विवरण भरें और GSTR-1 / GSTR-3B की रीयल-टाइम समरी देखें।</p>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: '0' }}>🏢 व्यापार का विवरण (Business Info)</h3>
          
          <label style={{ display: 'block', margin: '10px 0 5px' }}>व्यापार का नाम (Business Name):</label>
          <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>सालाना टर्नओवर (Annual Turnover - ₹):</label>
          <input type="number" name="turnover" value={formData.turnover} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

          <h3 style={{ marginTop: '0' }}>💼 खरीदी - बिक्री (Purchase & Sales)</h3>

          <label style={{ display: 'block', margin: '10px 0 5px' }}>कुल खरीदी (Inward Supply/Purchases - ₹):</label>
          <input type="number" name="purchases" value={formData.purchases} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>कुल बिक्री (Outward Supply/Sales - ₹):</label>
          <input type="number" name="sales" value={formData.sales} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ display: 'block', margin: '10px 0 5px' }}>लागू GST दर (Applicable GST Rate):</label>
          <select name="gstRate" value={formData.gstRate} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div style={{ flex: '1.2', minWidth: '350px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📈 GST Returns Live Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Tax Calculation Card */}
            <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>कर गणना (Tax Calculation)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Output GST (Tax on Sales):</span>
                <strong>₹ {outputGST.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#28a745' }}>
                <span>Input Tax Credit (ITC on Purchases):</span>
                <strong>- ₹ {inputGST.toFixed(2)}</strong>
              </div>
              <hr style={{ borderTop: '1px solid #dee2e6', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: isRefundable ? '#28a745' : '#dc3545' }}>
                <span>{isRefundable ? 'Refund / ITC C/F:' : 'Net GST Payable:'}</span>
                <span>₹ {Math.abs(netGSTPayable).toFixed(2)}</span>
              </div>
            </div>

            {/* Breakup Card */}
            {!isRefundable && netGSTPayable > 0 && (
              <div style={{ background: '#fff', border: '1px solid #17a2b8', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>GST Breakup (Intra-State)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST ({(formData.gstRate / 2).toFixed(1)}%):</span>
                  <strong>₹ {cgst}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  <span>SGST ({(formData.gstRate / 2).toFixed(1)}%):</span>
                  <strong>₹ {sgst}</strong>
                </div>
              </div>
            )}

            {/* Forms Summary */}
            <div style={{ background: '#e9ecef', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>रिपोर्ट (Filing Summary)</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>GSTR-1:</strong> Total Outward Supply reported: ₹ {sales.toFixed(2)}</p>
              <p style={{ margin: '0', fontSize: '14px' }}><strong>GSTR-3B:</strong> Net Tax Liability to be paid: ₹ {(isRefundable ? 0 : netGSTPayable).toFixed(2)}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => alert('PDF Downloading...')} style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 Download Summary PDF
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
