import React, { useState, useRef } from 'react';
import { FileText, FileImage, Upload, Download, RefreshCw, FileCode2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DocumentConverter = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('pdf2word');

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-emerald-100">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-6 h-6" /> Document Converter
          </h2>
          <p className="text-emerald-100 text-sm mt-1">Convert PDF to Word, PDF to Image, and Image to PDF</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('pdf2word')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'pdf2word' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><FileText className="w-5 h-5"/> PDF Extract</button>
        <button 
          onClick={() => setActiveTab('img2pdf')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'img2pdf' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><FileImage className="w-5 h-5"/> Image to PDF</button>
      </div>

      <div className="p-6">
        {activeTab === 'pdf2word' && <PdfExtractor />}
        {activeTab === 'img2pdf' && <ImageToPdf />}
      </div>
    </div>
  );
};

// --- PDF Extractor (PDF to Word & PDF to Image) ---
const PdfExtractor = () => {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('docx');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [previewImages, setPreviewImages] = useState([]);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setStatus('');
      setPreviewImages([]);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleConversion = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus('Processing... Please wait.');
    setPreviewImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (outputFormat === 'docx') {
        setStatus(\`Extracting text from \${pdf.numPages} pages...\`);
        const paragraphs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');

          if (pageText.trim()) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: pageText, size: 24 })],
              spacing: { after: 200 }
            }));
          }
        }

        if (paragraphs.length === 0) {
          throw new Error("No text found. This might be a scanned image PDF.");
        }

        const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, file.name.replace(/\\.pdf$/i, '') + '.docx');
        setStatus('Conversion Successful! ✅ DOCX Downloaded.');
      } else {
        // PDF to Image
        setStatus(\`Rendering \${pdf.numPages} pages as \${outputFormat.toUpperCase()}...\`);
        const images = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          const imgUrl = canvas.toDataURL(\`image/\${outputFormat === 'jpg' ? 'jpeg' : 'png'}\`);
          images.push({ url: imgUrl, name: \`Page_\${i}.\${outputFormat}\` });
        }
        
        setPreviewImages(images);
        setStatus(\`Successfully rendered \${images.length} pages. ✅\`);
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Error during conversion.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div 
        className="border-3 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:bg-emerald-50 transition cursor-pointer"
        onClick={() => document.getElementById('pdfInput').click()}
      >
        <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">{file ? file.name : 'Upload PDF Document'}</h3>
        <p className="text-slate-500 text-sm mt-1">{file ? \`\${(file.size/1024/1024).toFixed(2)} MB\` : 'Click to select (max 20MB)'}</p>
        <input type="file" id="pdfInput" hidden accept="application/pdf" onChange={handleFile} />
      </div>

      {file && (
        <>
          <div className="flex gap-4 justify-center">
            <button 
              className={\`px-6 py-2 rounded-lg font-medium border-2 \${outputFormat === 'docx' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'}\`}
              onClick={() => setOutputFormat('docx')}
            >Extract to Word</button>
            <button 
              className={\`px-6 py-2 rounded-lg font-medium border-2 \${outputFormat === 'jpg' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'}\`}
              onClick={() => setOutputFormat('jpg')}
            >Convert to JPG</button>
            <button 
              className={\`px-6 py-2 rounded-lg font-medium border-2 \${outputFormat === 'png' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'}\`}
              onClick={() => setOutputFormat('png')}
            >Convert to PNG</button>
          </div>

          <button 
            onClick={handleConversion}
            disabled={isProcessing}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow flex justify-center items-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileCode2 className="w-5 h-5" />}
            {isProcessing ? 'Processing...' : 'Start Extraction'}
          </button>
        </>
      )}

      {status && (
        <div className={\`p-4 rounded-lg text-center font-medium \${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}\`}>
          {status}
        </div>
      )}

      {previewImages.length > 0 && (
        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-slate-700">Generated Images</h4>
          {previewImages.map((img, i) => (
            <div key={i} className="flex flex-col items-center p-4 border border-slate-200 rounded-lg bg-slate-50">
              <img src={img.url} alt={img.name} className="max-h-60 mb-3 shadow-md border border-slate-200" />
              <button 
                onClick={() => saveAs(img.url, img.name)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg flex gap-2 items-center text-sm"
              ><Download className="w-4 h-4"/> Download {img.name}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Image to PDF ---
const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(f => f.type.startsWith('image/'));
    
    Promise.all(validImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ file, url: e.target.result, id: Math.random() });
        reader.readAsDataURL(file);
      });
    })).then(newImgs => {
      setImages(prev => [...prev, ...newImgs]);
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF({ format: 'a4', unit: 'mm' });
        
        images.forEach((imgObj, index) => {
          if (index > 0) doc.addPage();
          
          const img = new Image();
          img.src = imgObj.url;
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 10;
          
          const maxW = pageWidth - (margin * 2);
          const maxH = pageHeight - (margin * 2);
          
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(maxW / w, maxH / h);
          
          w = w * ratio;
          h = h * ratio;
          
          const x = (pageWidth - w) / 2;
          const y = (pageHeight - h) / 2;
          
          doc.addImage(imgObj.url, 'JPEG', x, y, w, h);
        });

        doc.save(\`Document_\${Date.now()}.pdf\`);
      } catch(err) {
        alert("Error generating PDF.");
      }
      setIsProcessing(false);
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div 
        className="border-3 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:bg-emerald-50 transition cursor-pointer"
        onClick={() => document.getElementById('imgInput').click()}
      >
        <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">Select Images</h3>
        <p className="text-slate-500 text-sm mt-1">JPG, PNG, WebP (Multi-select allowed)</p>
        <input type="file" id="imgInput" hidden accept="image/*" multiple onChange={handleImages} />
      </div>

      {images.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">{images.length} Images Selected</span>
            <button onClick={() => setImages([])} className="text-red-500 text-sm">Clear All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map(img => (
              <div key={img.id} className="relative flex-shrink-0 w-24 h-24 border border-slate-300 rounded overflow-hidden">
                <img src={img.url} className="w-full h-full object-cover" alt="thumb"/>
                <button 
                  onClick={() => setImages(images.filter(i => i.id !== img.id))}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <button 
          onClick={generatePDF}
          disabled={isProcessing}
          className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow flex justify-center items-center gap-2"
        >
          {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isProcessing ? 'Merging into PDF...' : 'Download PDF'}
        </button>
      )}
    </div>
  );
};

export default DocumentConverter;
