import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Download, FileText, Trash2, GripVertical, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, Reorder } from 'framer-motion';

export default function ImageToPDFWorkspace() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('p');
  const [margin, setMargin] = useState(0);

  const handleFileUpload = (e) => {
    e.preventDefault();
    let files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files)
        .filter(f => f.type.startsWith('image/'))
        .map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file)
        }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    setTimeout(async () => {
      try {
        const doc = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: pageSize
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        for (let i = 0; i < images.length; i++) {
          if (i > 0) doc.addPage();
          
          const img = new Image();
          img.src = images[i].preview;
          await new Promise(r => img.onload = r);
          
          // Calculate scale to fit within page while maintaining aspect ratio
          const targetWidth = pageWidth - (margin * 2);
          const targetHeight = pageHeight - (margin * 2);
          const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
          
          const w = img.width * ratio;
          const h = img.height * ratio;
          const x = margin + (targetWidth - w) / 2;
          const y = margin + (targetHeight - h) / 2;
          
          // Convert to jpeg to ensure compatibility and reduce size
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          doc.addImage(imgData, 'JPEG', x, y, w, h);
        }
        
        doc.save('converted_document.pdf');
      } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Failed to generate PDF. Check console for details.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">3. Image to PDF</h1>
          </div>
          {images.length > 0 && (
            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
              Add More Images
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          )}
        </header>

        {images.length === 0 ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileUpload}
            className="bg-[#0f172a] rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center min-h-[400px]"
          >
            <UploadCloud size={64} className="text-indigo-500 mb-6" />
            <h2 className="text-xl font-semibold mb-2">Upload Images</h2>
            <p className="text-gray-400 mb-6">Drag & Drop multiple images here</p>
            <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors shadow-lg shadow-indigo-500/20">
              Select Files
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Page Order ({images.length} pages)</h2>
                <span className="text-xs text-gray-500">Drag to reorder</span>
              </div>
              
              <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img, index) => (
                  <Reorder.Item key={img.id} value={img} className="flex items-center gap-4 bg-[#020617] p-3 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="text-gray-600" />
                    <span className="text-gray-500 font-mono w-6 text-sm">{index + 1}.</span>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 truncate text-sm text-gray-300">
                      {img.file.name}
                    </div>
                    <button onClick={() => removeImage(img.id)} className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6 flex-1">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Settings size={16} /> PDF Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Page Size</label>
                    <select 
                      value={pageSize} onChange={e => setPageSize(e.target.value)}
                      className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white"
                    >
                      <option value="a4">A4 (210 x 297 mm)</option>
                      <option value="letter">US Letter (8.5 x 11 in)</option>
                      <option value="legal">US Legal (8.5 x 14 in)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Orientation</label>
                    <select 
                      value={orientation} onChange={e => setOrientation(e.target.value)}
                      className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white"
                    >
                      <option value="p">Portrait</option>
                      <option value="l">Landscape</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Margin</span>
                      <span>{margin} mm</span>
                    </div>
                    <input 
                      type="range" min="0" max="50" step="5" value={margin} onChange={e => setMargin(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={generatePDF}
                disabled={isProcessing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>Processing {images.length} pages...</>
                ) : (
                  <><FileText size={18} /> Create PDF ({images.length} pages)</>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
