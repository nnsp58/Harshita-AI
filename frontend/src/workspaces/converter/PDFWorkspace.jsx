import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Download, FileText, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFWorkspace() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ pages: 0, textLength: 0 });
  const [options, setOptions] = useState({ keepFormatting: true, extractImages: false });

  const handleFileUpload = (e) => {
    const uploadedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      return;
    }
    setFile(uploadedFile);
    setStatus('idle');
    setProgress(0);
  };

  const convertToWord = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(10);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      setStats(prev => ({ ...prev, pages: totalPages }));
      
      let fullText = [];
      
      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + Math.floor((i / totalPages) * 70));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        let lastY = -1;
        
        for (const item of textContent.items) {
          if (lastY !== item.transform[5] && lastY !== -1) {
            pageText += '\\n'; // New line if Y changes significantly
          }
          pageText += item.str + ' ';
          lastY = item.transform[5];
        }
        
        fullText.push(pageText);
      }
      
      setProgress(85);
      
      // Generate Word Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: fullText.flatMap(page => 
            page.split('\\n').map(line => 
              new Paragraph({ children: [new TextRun(line)] })
            )
          ),
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      setProgress(100);
      setStatus('complete');
      
      // Trigger Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_converted.docx`;
      a.click();
      
      setStats(prev => ({ ...prev, textLength: fullText.join(' ').length }));
      
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">4. PDF TO WORD</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            {!file ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileUpload}
                className="bg-[#0f172a] rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <UploadCloud size={64} className="text-indigo-500 mb-6" />
                <h2 className="text-xl font-semibold mb-2">Upload PDF File</h2>
                <p className="text-gray-400 mb-6">Select a PDF document to convert to Word (DOCX)</p>
                <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  Select File
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <FileText size={48} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold truncate max-w-sm">{file.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{formatBytes(file.size)}</p>
                </div>
                
                {status === 'processing' && (
                  <div className="w-full max-w-sm space-y-2 pt-6">
                    <div className="flex justify-between text-xs text-indigo-400">
                      <span>Extracting text & formatting...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                
                {status === 'complete' && (
                  <div className="flex flex-col items-center text-emerald-500 pt-4">
                    <CheckCircle size={32} className="mb-2" />
                    <span className="font-medium">Conversion Successful!</span>
                    <p className="text-xs text-gray-400 mt-2">Extracted {stats.pages} pages</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex flex-col items-center text-red-500 pt-4">
                    <AlertCircle size={32} className="mb-2" />
                    <span className="font-medium">Conversion Failed</span>
                    <p className="text-xs text-gray-400 mt-2">The PDF might be encrypted or scanned (requires OCR).</p>
                  </div>
                )}
                
                <button 
                  onClick={() => { setFile(null); setStatus('idle'); }}
                  className="text-sm text-gray-500 hover:text-white transition-colors underline pt-4"
                >
                  Choose a different file
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6 flex-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Extraction Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Output Format</label>
                  <select className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white">
                    <option value="docx">DOCX (.docx)</option>
                  </select>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded bg-[#020617] border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      checked={options.keepFormatting}
                      onChange={() => setOptions({...options, keepFormatting: !options.keepFormatting})}
                    />
                    <span className="text-sm text-gray-300">Keep Layout & Formatting</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded bg-[#020617] border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      checked={options.extractImages}
                      onChange={() => setOptions({...options, extractImages: !options.extractImages})}
                    />
                    <span className="text-sm text-gray-300">Extract Images <span className="text-xs text-gray-500">(Beta)</span></span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={convertToWord}
              disabled={!file || status === 'processing'}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-gray-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {status === 'processing' ? (
                <><RefreshCw size={18} className="animate-spin" /> Converting...</>
              ) : (
                <><Download size={18} /> Convert to Word</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
