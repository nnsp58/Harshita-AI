import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Download, Image as ImageIcon, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import Cropper from 'react-cropper';

export default function PassportWorkspace() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  
  // Settings
  const [size, setSize] = useState('indian'); // indian (35x45), us (2x2), custom
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const SIZES = {
    indian: { width: 350, height: 450, ratio: 35/45, label: 'Indian (35x45mm)' },
    us: { width: 600, height: 600, ratio: 1, label: 'US Visa (2x2 inch)' },
    uk: { width: 413, height: 531, ratio: 35/45, label: 'UK (35x45mm)' }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      if (!uploadedFile.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleCrop = () => {
    if (typeof cropper !== 'undefined' && cropper !== null) {
      setIsProcessing(true);
      // Wait a tick to show loader
      setTimeout(() => {
        const targetSize = SIZES[size] || SIZES['indian'];
        
        // Get cropped canvas
        const canvas = cropper.getCroppedCanvas({
          width: targetSize.width,
          height: targetSize.height,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        if (!canvas) {
          setIsProcessing(false);
          return;
        }

        // Apply filters
        const filteredCanvas = document.createElement('canvas');
        filteredCanvas.width = canvas.width;
        filteredCanvas.height = canvas.height;
        const ctx = filteredCanvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(canvas, 0, 0);

        setPreviewURL(filteredCanvas.toDataURL('image/jpeg', 1.0));
        setIsProcessing(false);
      }, 100);
    }
  };

  // Re-crop when settings change
  useEffect(() => {
    if (image && cropper) {
      handleCrop();
    }
  }, [size, brightness, contrast, cropper]);

  const handleDownload = (format) => {
    if (!previewURL) return;
    const a = document.createElement('a');
    a.href = previewURL;
    a.download = `passport_photo.${format}`;
    a.click();
  };

  const handlePrintSheet = () => {
    if (!previewURL) return;
    // Create an A4 print sheet
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // A4 at 300 DPI
    canvas.width = 2480; 
    canvas.height = 3508;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      // Draw a grid of passport photos (4x6 layout)
      const cols = 4;
      const rows = 6;
      const paddingX = 150;
      const paddingY = 200;
      
      const targetSize = SIZES[size] || SIZES['indian'];
      // Scale to approx print size on 300dpi (35mm = ~413px)
      const pw = targetSize.width;
      const ph = targetSize.height;
      
      const spacingX = (canvas.width - (2 * paddingX) - (cols * pw)) / (cols - 1);
      const spacingY = (canvas.height - (2 * paddingY) - (rows * ph)) / (rows - 1);

      for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
          const x = paddingX + c * (pw + spacingX);
          const y = paddingY + r * (ph + spacingY);
          
          ctx.drawImage(img, x, y, pw, ph);
          // Add cut guides
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, pw, ph);
        }
      }
      
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.9);
      a.download = 'passport_sheet_A4.jpg';
      a.click();
    };
    img.src = previewURL;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">1. Passport Photo Maker</h1>
          </div>
        </header>

        {!image ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileUpload}
            className="bg-[#0f172a] rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center min-h-[400px]"
          >
            <UploadCloud size={64} className="text-indigo-500 mb-6" />
            <h2 className="text-xl font-semibold mb-2">Upload Portrait Image</h2>
            <p className="text-gray-400 mb-6">Drag & Drop or Click to browse</p>
            <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors">
              Select File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cropper View */}
            <div className="lg:col-span-6 bg-[#0f172a] rounded-2xl p-4 border border-white/5 flex flex-col">
              <div className="flex justify-between items-center px-2 mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Crop Area</span>
                <button onClick={() => { setImage(null); setPreviewURL(''); }} className="text-xs text-red-400 hover:text-red-300">
                  Change Image
                </button>
              </div>
              <div className="flex-1 bg-[#020617] rounded-xl overflow-hidden min-h-[400px]">
                <Cropper
                  src={image}
                  style={{ height: '100%', width: '100%' }}
                  aspectRatio={SIZES[size].ratio}
                  guides={true}
                  viewMode={1}
                  onInitialized={(instance) => setCropper(instance)}
                  cropend={handleCrop}
                />
              </div>
            </div>

            {/* Settings & Preview */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 space-y-3 flex flex-col items-center text-center">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-full text-left">Final Output</h3>
                  
                  <div className="flex-1 flex items-center justify-center py-4">
                    {isProcessing ? (
                      <RefreshCw size={32} className="animate-spin text-indigo-500" />
                    ) : previewURL ? (
                      <div className="bg-white p-2 rounded-lg shadow-2xl">
                        <img 
                          src={previewURL} 
                          alt="Preview" 
                          className="object-contain" 
                          style={{ maxHeight: '200px' }} 
                        />
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Adjust crop to preview</div>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <button onClick={() => handleDownload('png')} disabled={!previewURL} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                      Download PNG
                    </button>
                    <button onClick={() => handleDownload('jpg')} disabled={!previewURL} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                      Download JPG
                    </button>
                    <button onClick={handlePrintSheet} disabled={!previewURL} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      <Layers size={16} /> Download A4 Print Sheet
                    </button>
                  </div>
                </div>

                {/* Adjustments */}
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 flex flex-col space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Passport Size</h3>
                    <div className="space-y-2">
                      {Object.keys(SIZES).map(s => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${size === s ? 'bg-indigo-600 text-white' : 'bg-[#020617] text-gray-400 hover:bg-white/5 border border-white/5'}`}
                        >
                          {SIZES[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={contrast} onChange={e => setContrast(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
