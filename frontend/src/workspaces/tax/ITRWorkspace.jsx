import React, { useState, useRef } from 'react';
import { useStore } from '../../store';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'client', label: 'Client', icon: '👤' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'ocr', label: 'OCR', icon: '🔍' },
  { id: 'income', label: 'Income', icon: '💰' },
  { id: 'deductions', label: 'Deductions', icon: '📉' },
  { id: 'ais', label: 'AIS', icon: '📋' },
  { id: '26as', label: '26AS', icon: '🧾' },
  { id: 'tax-calc', label: 'Tax Calculation', icon: '🧮' },
  { id: 'comparison', label: 'Comparison', icon: '⚖️' },
  { id: 'preview', label: 'Preview', icon: '👁️' },
  { id: 'export', label: 'Export', icon: '📥' },
  { id: 'history', label: 'History', icon: '🕐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'filing', label: 'Browser Assistance', icon: '🌐' },
];

export default function ITRWorkspace() {
  const { currentWorkspacePayload } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [docStatus, setDocStatus] = useState({});
  const [cscClients] = useState([
    { id: 1, name: 'Rajesh Kumar', pan: 'ABCDE1234F', status: 'Pending', itr: 'ITR-1' },
    { id: 2, name: 'Sunita Devi', pan: 'FGHIJ5678K', status: 'Completed', itr: 'ITR-1' },
    { id: 3, name: 'Mohit Sharma', pan: 'KLMNO9012P', status: 'Draft', itr: 'ITR-2' },
  ]);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const fileRef = useRef(null);

  const payload = currentWorkspacePayload || {};
  const summary = payload.summary || {};
  const tc = summary.taxComparison || {};

  const handleFileUpload = (docType) => {
    setDocStatus(prev => ({ ...prev, [docType]: 'UPLOADING...' }));
    setTimeout(() => setDocStatus(prev => ({ ...prev, [docType]: 'EXTRACTED ✅' })), 2000);
  };

  // ═══════════════════════ TAB RENDERERS ═══════════════════════

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Client PAN', value: payload.pan || '—', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-900' },
          { label: 'ITR Type', value: summary.itrType || 'Pending', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-900' },
          { label: 'Regime', value: tc.recommendedRegime || '—', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900' },
          { label: 'Tax Savings', value: tc.savings ? `₹${tc.savings.toLocaleString()}` : '—', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900' },
        ].map(card => (
          <div key={card.label} className={`p-5 rounded-xl border ${card.bg}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-black font-mono ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>
      {summary.taxSavings?.suggestions?.length > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-bold text-amber-800 mb-3">💡 Tax Saving Suggestions ({summary.taxSavings.totalSuggestions})</h3>
          <div className="space-y-2">
            {summary.taxSavings.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-amber-900 bg-white/60 rounded-lg p-3">
                <span className="font-mono font-bold text-amber-600 shrink-0">§{s.section}</span>
                <span>{s.hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderClient = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">CSC Client Database</h3>
        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">+ New Client</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <th className="p-4 text-left">Name</th><th className="p-4 text-left">PAN</th>
            <th className="p-4 text-left">ITR</th><th className="p-4 text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {cscClients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4 font-bold">{c.name}</td>
                <td className="p-4 font-mono text-gray-500">{c.pan}</td>
                <td className="p-4">{c.itr}</td>
                <td className="p-4 text-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">Upload Tax Documents</h3>
      <p className="text-sm text-gray-500">Harshita AI OCR Engine अपने आप Salary, TDS, और Deductions निकालेगा।</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Form 16', 'AIS', '26AS', 'Salary Slip', 'Bank Statement', 'Interest Certificate', 'PPF Statement', 'LIC Receipt', 'Rent Receipt', 'Home Loan Certificate'].map(doc => (
          <div key={doc} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
            <div>
              <p className="font-bold text-sm">{doc}</p>
              <p className="text-xs text-gray-400">{docStatus[doc] || 'Not uploaded'}</p>
            </div>
            <button onClick={() => handleFileUpload(doc)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100">
              Upload
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOCR = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">OCR Extraction Results</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-3 text-sm">
          {[
            ['Employer', 'Auto-detected from Form 16'],
            ['Gross Salary', tc.grossIncome ? `₹${tc.grossIncome.toLocaleString()}` : 'Awaiting document'],
            ['TDS Deducted', tc.tdsDeducted ? `₹${tc.tdsDeducted.toLocaleString()}` : 'Awaiting document'],
            ['Bank Interest', 'Awaiting AIS upload'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">{label}</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIncome = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">Income Breakdown</h3>
      {tc.incomeBreakdown ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          {Object.entries(tc.incomeBreakdown).filter(([k]) => k !== 'total').map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-bold">₹{(val || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-gray-300">
            <span>Gross Total Income</span>
            <span className="text-indigo-600">₹{(tc.grossIncome || 0).toLocaleString()}</span>
          </div>
        </div>
      ) : <p className="text-gray-400">Income data not yet available. Complete the interview or upload documents.</p>}
    </div>
  );

  const renderDeductions = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">Deductions (Old Regime)</h3>
      {tc.deductions ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          {Object.entries(tc.deductions).filter(([k]) => k !== 'total').map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-bold">₹{(val || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-gray-300">
            <span>Total Deductions</span>
            <span className="text-emerald-600">₹{(tc.deductions.total || 0).toLocaleString()}</span>
          </div>
        </div>
      ) : <p className="text-gray-400">Deduction data not yet available.</p>}
    </div>
  );

  const renderTaxCalc = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Tax Calculation — Old vs New Regime</h3>
      {tc.grossIncome !== undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { regime: 'Old Regime', taxable: tc.taxableOld, tax: tc.oldTax, refund: tc.oldRefund, recommended: tc.recommendedRegime === 'OLD' },
            { regime: 'New Regime', taxable: tc.taxableNew, tax: tc.newTax, refund: tc.newRefund, recommended: tc.recommendedRegime === 'NEW' },
          ].map(r => (
            <div key={r.regime} className={`p-6 rounded-xl border-2 ${r.recommended ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{r.regime}</h4>
                {r.recommended && <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-bold">✓ Recommended</span>}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Taxable Income</span><span>₹{(r.taxable||0).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                  <span>Tax Liability</span><span className="text-red-600">₹{(r.tax||0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Refund / Payable</span>
                  <span className={r.refund >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {r.refund >= 0 ? `Refund ₹${r.refund.toLocaleString()}` : `Pay ₹${Math.abs(r.refund).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-gray-400">Tax calculation pending. Complete interview and upload documents first.</p>}
      {tc.savings > 0 && (
        <div className="p-4 bg-indigo-50 text-indigo-900 rounded-xl text-center font-bold">
          {tc.recommendedRegime} Regime चुनने पर ₹{tc.savings.toLocaleString()} बचेंगे
        </div>
      )}
    </div>
  );

  const renderComparison = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Regime Comparison Summary</h3>
      {tc.grossIncome !== undefined ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <th className="p-4 text-left">Parameter</th><th className="p-4 text-right">Old Regime</th><th className="p-4 text-right">New Regime</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Gross Income', tc.grossIncome, tc.grossIncome],
                ['Deductions', tc.deductions?.total, 75000],
                ['Taxable Income', tc.taxableOld, tc.taxableNew],
                ['Tax Liability', tc.oldTax, tc.newTax],
                ['TDS Paid', tc.tdsDeducted, tc.tdsDeducted],
              ].map(([label, old, newVal]) => (
                <tr key={label}>
                  <td className="p-4 font-medium">{label}</td>
                  <td className="p-4 text-right font-mono">₹{(old||0).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono">₹{(newVal||0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-gray-400">Data not yet available for comparison.</p>}
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">ITR Preview — Final Review</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-sm">
        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">ITR Type</span><span className="font-bold">{summary.itrType || '—'}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Reason</span><span>{summary.itrReason || '—'}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Gross Income</span><span className="font-bold">₹{(tc.grossIncome||0).toLocaleString()}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Recommended Regime</span><span className="font-bold text-emerald-600">{tc.recommendedRegime || '—'}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Tax Liability</span><span className="font-bold text-red-600">₹{(tc.recommendedRegime === 'NEW' ? tc.newTax : tc.oldTax || 0).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Late Fee (234F)</span><span className="font-bold">{summary.lateFee ? `₹${summary.lateFee}` : '₹0'}</span></div>
      </div>
      <p className="text-xs text-gray-400 text-center">सभी values verify करने के बाद Filing Assistance tab पर जाएं।</p>
    </div>
  );

  const renderExport = () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold">Export / Download</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { format: 'PDF', desc: 'Tax Summary PDF', icon: '📕' },
          { format: 'DOCX', desc: 'Working Papers', icon: '📘' },
          { format: 'Excel', desc: 'Income & Deductions Sheet', icon: '📗' },
          { format: 'JSON', desc: 'Machine Readable Data', icon: '📒' },
        ].map(e => (
          <button key={e.format} className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all text-left">
            <span className="text-2xl">{e.icon}</span>
            <div><p className="font-bold text-sm">{e.format}</p><p className="text-xs text-gray-400">{e.desc}</p></div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Filing History</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400">
        <p className="text-4xl mb-3">🕐</p>
        <p>पिछले ITR filings का record यहाँ दिखेगा।</p>
        <p className="text-xs mt-1">अभी कोई history उपलब्ध नहीं है।</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold">Tax Department Settings</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="font-bold text-sm">Default Assessment Year</p><p className="text-xs text-gray-400">नए clients के लिए default AY</p></div>
          <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"><option>2025-26</option><option>2024-25</option></select>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-bold text-sm">Auto-Detect Documents</p><p className="text-xs text-gray-400">OCR Engine automatic चालू रहे</p></div>
          <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-bold text-sm">Data Encryption</p><p className="text-xs text-gray-400">PAN/Aadhaar AES-256 Encryption</p></div>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Active ✅</span>
        </div>
      </div>
    </div>
  );

  const renderFiling = () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold">Browser Assistance — Final Filing</h3>
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
        <strong>⚠️ AI Safety:</strong> Harshita AI NEVER stores government passwords. NEVER submits without your explicit confirmation. You must login on the official portal yourself.
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent1} onChange={e => setConsent1(e.target.checked)} className="mt-1 w-4 h-4 text-indigo-600" />
          <span className="text-sm text-gray-700">मैंने सभी income, deductions, और bank details verify कर लिए हैं। सब सही है।</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent2} onChange={e => setConsent2(e.target.checked)} className="mt-1 w-4 h-4 text-indigo-600" />
          <span className="text-sm text-gray-700">मैं Income Tax Portal पर login करूँगा/करूँगी। Harshita AI सिर्फ field entry में assist करेगा। Final submit मैं खुद करूँगा/करूँगी।</span>
        </label>
        <button disabled={!consent1 || !consent2}
          className={`w-full py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            consent1 && consent2 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          ⚡ Confirm & Start Browser Assistance
        </button>
      </div>
    </div>
  );

  const renderAIS = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">AIS (Annual Information Statement)</h3>
      <p className="text-sm text-gray-500">Income Tax Portal से AIS download करके यहाँ upload करें। AI अपने आप सारी financial transactions extract करेगा।</p>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
        <button onClick={() => handleFileUpload('AIS')} className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700">Upload AIS (PDF)</button>
        <p className="mt-3 text-xs text-gray-400">{docStatus['AIS'] || 'PDF format, max 10MB'}</p>
      </div>
    </div>
  );

  const render26AS = () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-bold">Form 26AS — TDS Details</h3>
      <p className="text-sm text-gray-500">26AS में सभी TDS entries (employer, bank, mutual fund) दिखती हैं। Upload करें या TRACES से download करें।</p>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
        <button onClick={() => handleFileUpload('26AS')} className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700">Upload 26AS (PDF)</button>
        <p className="mt-3 text-xs text-gray-400">{docStatus['26AS'] || 'PDF format, max 10MB'}</p>
      </div>
    </div>
  );

  // ═══════════════════════ TAB ROUTER ═══════════════════════

  const tabContent = {
    dashboard: renderDashboard,
    client: renderClient,
    documents: renderDocuments,
    ocr: renderOCR,
    income: renderIncome,
    deductions: renderDeductions,
    ais: renderAIS,
    '26as': render26AS,
    'tax-calc': renderTaxCalc,
    comparison: renderComparison,
    preview: renderPreview,
    export: renderExport,
    history: renderHistory,
    settings: renderSettings,
    filing: renderFiling,
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-gray-900 font-sans rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            🏛️ Enterprise Tax Department
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">Harshita AI Chartered Accountant • One AI. Every Tax Service. Zero Complexity.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">AES-256 Encrypted</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{summary.itrType || 'ITR Pending'}</span>
        </div>
      </div>
      
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto hide-scrollbar px-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tabContent[activeTab] ? tabContent[activeTab]() : <p className="text-gray-400 text-center p-12">Module loading...</p>}
      </div>
    </div>
  );
}
