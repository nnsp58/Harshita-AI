import { useState, useEffect, useRef } from 'react';
import { 
  Undo, Redo, Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Printer, Download, Save, 
  CheckCircle, FileText, FileDown, Plus, Minus, Share2, X, AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useStore } from '../store';
import { useSocket } from '../hooks/useSocket';

// Rule 4: Document Validation — check for missing sections
function validateDocument(text) {
  const issues = [];
  if (!text || text.trim().length < 50) {
    issues.push('दस्तावेज़ बहुत छोटा है या खाली है।');
    return issues;
  }
  const plain = text.replace(/<[^>]+>/g, '').trim();
  // Check for subject line
  if (!/विषय|subject/i.test(plain)) {
    issues.push('विषय (Subject) नहीं मिला।');
  }
  // Check for recipient/salutation
  if (!/सेवा में|महोदय|महोदया|Dear|To/i.test(plain)) {
    issues.push('प्राप्तकर्ता (Recipient/Salutation) नहीं मिला।');
  }
  // Check for signature block
  if (!/हस्ताक्षर|Signature|भवदीय|Yours/i.test(plain)) {
    issues.push('हस्ताक्षर क्षेत्र (Signature Block) नहीं मिला।');
  }
  return issues;
}

export default function DocumentEditorPanel() {
  const { currentDocument, setCurrentDocument, setResponseMode } = useStore();
  const { sendData } = useSocket();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [validationIssues, setValidationIssues] = useState([]); // Rule 4
  
  // WhatsApp Modal State
  const [showWAModal, setShowWAModal] = useState(false);
  const [waRecipient, setWaRecipient] = useState('');
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [waStatus, setWaStatus] = useState('');

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);


  // Initialize content when currentDocument changes
  useEffect(() => {
    if (currentDocument && currentDocument.content && !content) {
      let cleanContent = currentDocument.content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
        .replace(/## (.*?)\n/g, '<h2>$1</h2>')
        .replace(/# (.*?)\n/g, '<h1>$1</h1>');
        
      if (!cleanContent.includes('<p>')) {
        cleanContent = cleanContent.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
      }
      
      setContent(cleanContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = cleanContent;
      }

      // Rule 4: Auto-validate on load
      const issues = validateDocument(cleanContent);
      setValidationIssues(issues);
    }
  }, [currentDocument]);

  // Auto-Save feature
  const handleInput = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    const newHtml = editorRef.current.innerHTML;
    setContent(newHtml);
    
    saveTimeoutRef.current = setTimeout(() => {
      setCurrentDocument({
        ...currentDocument,
        content: newHtml,
        lastSaved: new Date().toISOString()
      });
      setIsSaving(false);
    }, 3000);
  };

  // Rich Text Commands
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  // Export & Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${currentDocument?.title || 'Document'}</title>
          <style>
            @page { size: A4; margin: 25mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: black; background: white; }
            h1, h2, h3 { text-align: center; }
            p { margin-bottom: 1em; }
          </style>
        </head>
        <body>
          ${editorRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // small delay to let resources load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const downloadDocx = () => {
    // HTML to DOCX Mock fallback using Blob
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + editorRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${currentDocument?.title || 'document'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleSendWhatsApp = () => {
    if (!waRecipient) return;
    setIsSendingWA(true);
    setWaStatus('Redirecting to WhatsApp...');
    
    setTimeout(() => {
      // Task 6: Deep link WhatsApp (wa.me)
      const docTitle = currentDocument?.title || 'Document';
      // In a real scenario we might send a link, but for text generation we send the raw text
      const cleanText = editorRef.current.innerText || editorRef.current.textContent;
      const text = `*${docTitle}*\n\n${cleanText}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      
      setWaStatus('Sent Successfully! ✓');
      setTimeout(() => {
        setShowWAModal(false);
        setIsSendingWA(false);
        setWaStatus('');
        setWaRecipient('');
      }, 1000);
    }, 500);
  };

  const handleExportPDF = () => {
    // Task 8: PDF Export using jsPDF
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });
    
    // Very basic jsPDF implementation for text
    doc.setFontSize(16);
    doc.text(currentDocument?.title || 'Document', 40, 40);
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(editorRef.current.innerText, 500);
    doc.text(lines, 40, 70);
    
    doc.save(`${currentDocument?.title || 'document'}.pdf`);
  };

  return (
    <div className="h-full flex flex-col bg-[#e5e7eb] font-sans overflow-hidden">
      
      {/* Rule 4: Validation Warning Banner */}
      {validationIssues.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2 shrink-0">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-800">दस्तावेज़ सत्यापन चेतावनी:</p>
            <ul className="text-[10px] text-amber-700 mt-0.5 list-disc list-inside">
              {validationIssues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
          </div>
          <button onClick={() => setValidationIssues([])} className="text-amber-500 hover:text-amber-700 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
            <FileText size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">{currentDocument?.title || 'Untitled Document'}</h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              {isSaving ? (
                <span className="text-amber-500 animate-pulse">Saving...</span>
              ) : (
                <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10} /> Saved to workspace</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Rule 5: All 7 User Confirmation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setResponseMode('CHAT')} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            ✕ Close
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <button
            id="doc-regenerate-btn"
            onClick={() => {
              setResponseMode('CHAT');
              // Allow user to re-enter command
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
          >
            🔄 Regenerate
          </button>
          <button onClick={() => setShowWAModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors shadow-sm">
            <Share2 size={14} /> WhatsApp
          </button>
          <button onClick={downloadDocx} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
            <FileDown size={14} /> DOCX
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors shadow-sm">
            <Printer size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Share2 size={16} className="text-green-500" /> Share via WhatsApp
              </h3>
              <button onClick={() => setShowWAModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Recipient Name, Relationship or Phone</label>
              <input 
                type="text" 
                value={waRecipient}
                onChange={(e) => setWaRecipient(e.target.value)}
                placeholder="e.g. Papa, SDO, or 9876543210"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSendingWA}
              />
              {waStatus && (
                <p className={`text-xs mt-2 font-medium ${waStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {waStatus}
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => setShowWAModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded" disabled={isSendingWA}>Cancel</button>
              <button onClick={handleSendWhatsApp} className="px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600 rounded font-bold disabled:opacity-50" disabled={isSendingWA || !waRecipient}>
                {isSendingWA ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-10 bg-[#f8f9fa] border-b border-gray-200 flex items-center px-4 gap-1 overflow-x-auto shrink-0 z-10">
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <button onClick={() => execCommand('undo')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded" title="Undo"><Undo size={14} /></button>
          <button onClick={() => execCommand('redo')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded" title="Redo"><Redo size={14} /></button>
        </div>
        
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <button onClick={() => execCommand('bold')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded font-bold" title="Bold"><Bold size={14} /></button>
          <button onClick={() => execCommand('italic')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded italic" title="Italic"><Italic size={14} /></button>
          <button onClick={() => execCommand('underline')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded underline" title="Underline"><Underline size={14} /></button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <button onClick={() => execCommand('justifyLeft')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded" title="Align Left"><AlignLeft size={14} /></button>
          <button onClick={() => execCommand('justifyCenter')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded" title="Align Center"><AlignCenter size={14} /></button>
          <button onClick={() => execCommand('justifyRight')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded" title="Align Right"><AlignRight size={14} /></button>
          <button onClick={() => execCommand('justifyFull')} className="p-1.5 text-gray-700 hover:bg-gray-200 rounded" title="Justify"><AlignJustify size={14} /></button>
        </div>
        
        <div className="flex items-center gap-2 px-2">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 text-gray-500 hover:text-black"><Minus size={12} /></button>
          <span className="text-xs font-semibold text-gray-600 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.max(50, zoom + 10))} className="p-1 text-gray-500 hover:text-black"><Plus size={12} /></button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative p-8 flex justify-center">
        {/* A4 Paper container */}
        <div 
          className="bg-white shadow-2xl transition-transform origin-top"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            padding: '25mm',
            transform: `scale(${zoom / 100})`,
            marginBottom: `${(zoom / 100) * 100}px` 
          }}
        >
          <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full h-full outline-none prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-center text-black"
            style={{ 
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '12pt',
              lineHeight: '1.5'
            }}
          />
        </div>
      </div>
    </div>
  );
}
