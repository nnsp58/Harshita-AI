import React, { useRef, useState } from 'react';
import { Printer, Download, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const LegalDocumentEditor = ({ initialContent = '', documentTitle = 'Legal Document' }) => {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(12);

  // Set initial content
  React.useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Apply formatting
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    document.execCommand('fontSize', false, '7'); // 7 = 12px in execCommand
    editorRef.current.focus();
  };

  // Print Document
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = editorRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: white;
              margin: 0;
              padding: 20px;
            }
            .legal-document {
              max-width: 100%;
              margin: 0 auto;
            }
            h1, h2, h3 { text-align: center; margin-bottom: 20px; }
            .parties { margin: 20px 0; }
            .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="legal-document">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Export as PDF (using browser print as PDF)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const content = editorRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            @page { size: A4; margin: 1.5cm; }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: white;
            }
            .legal-document { max-width: 100%; }
          </style>
        </head>
        <body>
          <div class="legal-document">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print(); // User can choose "Save as PDF"
    }, 500);
  };

  const handleCopy = () => {
    const text = editorRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('Document copied to clipboard!');
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-1 border-r pr-3 mr-2">
          <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-gray-100 rounded" title="Bold">
            <Bold size={16} />
          </button>
          <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-gray-100 rounded" title="Italic">
            <Italic size={16} />
          </button>
          <button onClick={() => applyFormat('underline')} className="p-2 hover:bg-gray-100 rounded" title="Underline">
            <Underline size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-3 mr-2">
          <button onClick={() => applyFormat('justifyLeft')} className="p-2 hover:bg-gray-100 rounded" title="Align Left">
            <AlignLeft size={16} />
          </button>
          <button onClick={() => applyFormat('justifyCenter')} className="p-2 hover:bg-gray-100 rounded" title="Align Center">
            <AlignCenter size={16} />
          </button>
          <button onClick={() => applyFormat('justifyRight')} className="p-2 hover:bg-gray-100 rounded" title="Align Right">
            <AlignRight size={16} />
          </button>
          <button onClick={() => applyFormat('justifyFull')} className="p-2 hover:bg-gray-100 rounded" title="Justify">
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-r pr-3 mr-2">
          <select
            value={fontSize}
            onChange={(e) => changeFontSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 11, 12, 13, 14, 16, 18, 20].map(size => (
              <option key={size} value={size}>{size}pt</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            <Download size={16} /> Export PDF
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
          >
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      {/* A4 Paper Preview Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-200 flex justify-center">
        <div
          className="bg-white shadow-2xl border border-gray-300"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm',
            fontFamily: "'Times New Roman', serif",
            fontSize: '12pt',
            lineHeight: '1.6',
            color: '#000',
            boxShadow: '0 0 15px rgba(0,0,0,0.15)',
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[200mm] outline-none legal-content"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {/* Default content will be injected via initialContent prop */}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-gray-300 text-xs px-4 py-1 flex justify-between items-center">
        <div>Page 1 of 1 • A4 • Legal Draft Mode</div>
        <div>Ready • Auto-saved</div>
      </div>
    </div>
  );
};

export default LegalDocumentEditor;
