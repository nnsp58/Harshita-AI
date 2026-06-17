import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Camera, Upload, Crop, Maximize, Settings2, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackToolUsage } from '../utils/analytics';

const PassportPhotoMaker = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    ratio: 3.5 / 4.5,
    bgColor: '#ffffff',
    copies: 8,
    brightness: 100,
    contrast: 100,
    mode: 'lite'
  });
  const cropperRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setIsCropping(true);
    };
    if (files && files[0]) {
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const croppedDataUrl = cropperRef.current?.cropper.getCroppedCanvas({
        maxWidth: 1200,
        maxHeight: 1200,
        imageSmoothingQuality: 'high'
      }).toDataURL('image/jpeg', 0.92);
      
      setCroppedImage(croppedDataUrl);
      setIsCropping(false);
    }
  };

  const generateSheet = () => {
    if (!croppedImage) return;
    setIsProcessing(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = croppedImage;

      img.onload = () => {
        // 1. Process temp image for brightness/contrast
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tctx = tempCanvas.getContext('2d');
        tctx.filter = \`brightness(\${settings.brightness}%) contrast(\${settings.contrast}%)\`;
        tctx.drawImage(img, 0, 0);
        tctx.filter = 'none';

        setProcessedImage(tempCanvas.toDataURL());

        // 2. Setup grid based on ratio
        const isLandscape = settings.ratio > 1;
        let pw, ph, cols;
        if (isLandscape) {
          pw = 450;
          ph = Math.round(450 / settings.ratio);
          cols = 3;
        } else {
          pw = 350;
          ph = Math.round(350 / settings.ratio);
          cols = 4;
        }

        const rows = Math.ceil(settings.copies / cols);
        const gutter = 30;

        canvas.width = cols * (pw + gutter) + gutter;
        canvas.height = rows * (ph + gutter) + gutter;

        // 3. Draw background sheet
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 4. Draw photos
        for (let i = 0; i < settings.copies; i++) {
          const x = gutter + (i % cols) * (pw + gutter);
          const y = gutter + Math.floor(i / cols) * (ph + gutter);

          // BG Color
          ctx.fillStyle = settings.bgColor;
          ctx.fillRect(x, y, pw, ph);

          // Draw Photo
          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, x, y, pw, ph);

          // Border
          ctx.strokeStyle = '#444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x - 1, y - 1, pw + 2, ph + 2);
        }

        setIsProcessing(false);
      };
    }, 100);
  };

  const downloadSheet = () => {
    if (!canvasRef.current) return;
    trackToolUsage('PassportPhotoMaker', true);
    const link = document.createElement('a');
    link.download = `Passport_Sheet_${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6" /> Passport Photo Maker
          </h2>
          <p className="text-blue-100 text-sm mt-1">Create professional photo sheets instantly</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Step 1: Upload */}
        {!image && !croppedImage && (
          <div 
            className="border-3 border-dashed border-blue-200 rounded-xl p-12 text-center hover:bg-blue-50 transition cursor-pointer group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileChange}
            onClick={() => document.getElementById('photoUpload').click()}
          >
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Upload Photo</h3>
            <p className="text-slate-500 mt-2">Drag and drop, or click to browse</p>
            <input type="file" id="photoUpload" hidden accept="image/*" onChange={handleFileChange} />
          </div>
        )}

        {/* Step 2: Cropper */}
        {isCropping && image && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Crop className="w-5 h-5"/> Crop Image</h3>
              <div className="flex gap-2 bg-white p-1 rounded-md border border-slate-200">
                <button 
                  className={\`px-4 py-1 rounded \${settings.ratio === 3.5/4.5 ? 'bg-blue-600 text-white' : 'text-slate-600'}\`}
                  onClick={() => setSettings({...settings, ratio: 3.5/4.5})}
                >Portrait</button>
                <button 
                  className={\`px-4 py-1 rounded \${settings.ratio === 4.5/3.5 ? 'bg-blue-600 text-white' : 'text-slate-600'}\`}
                  onClick={() => setSettings({...settings, ratio: 4.5/3.5})}
                >Landscape</button>
              </div>
            </div>
            <div className="h-[400px] w-full bg-slate-900 rounded-xl overflow-hidden">
              <Cropper
                ref={cropperRef}
                src={image}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={settings.ratio}
                guides={true}
                viewMode={1}
                autoCropArea={1}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setImage(null); setIsCropping(false); }}
                className="px-6 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
              >Cancel</button>
              <button 
                onClick={handleCrop}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md"
              >Apply Crop</button>
            </div>
          </div>
        )}

        {/* Step 3: Settings & Generate */}
        {!isCropping && croppedImage && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-sm font-medium text-slate-500 mb-3">Preview</p>
                <img src={croppedImage} className="mx-auto max-h-[250px] rounded-lg shadow-md border border-slate-200" alt="Cropped" />
                <button 
                  onClick={() => setIsCropping(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
                ><RefreshCw className="w-4 h-4"/> Edit Crop</button>
              </div>

              {/* Controls */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Settings2 className="w-5 h-5"/> Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Copies</label>
                    <select 
                      className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={settings.copies}
                      onChange={e => setSettings({...settings, copies: parseInt(e.target.value)})}
                    >
                      <option value="4">4 Photos</option>
                      <option value="8">8 Photos</option>
                      <option value="12">12 Photos</option>
                      <option value="16">16 Photos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Background</label>
                    <input 
                      type="color" 
                      className="w-full h-10 rounded-lg cursor-pointer"
                      value={settings.bgColor}
                      onChange={e => setSettings({...settings, bgColor: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brightness ({settings.brightness}%)</label>
                  <input type="range" min="50" max="150" value={settings.brightness} 
                    className="w-full accent-blue-600"
                    onChange={e => setSettings({...settings, brightness: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contrast ({settings.contrast}%)</label>
                  <input type="range" min="50" max="150" value={settings.contrast} 
                    className="w-full accent-blue-600"
                    onChange={e => setSettings({...settings, contrast: e.target.value})} />
                </div>
              </div>
            </div>

            <button 
              onClick={generateSheet}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isProcessing ? 'Generating Sheet...' : 'Generate HD Sheet'}
            </button>
          </div>
        )}

        {/* Step 4: Result */}
        <div className={\`mt-8 space-y-4 transition-all duration-500 \${processedImage ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}\`}>
          <div className="h-px bg-slate-200 w-full my-6"></div>
          <h3 className="text-xl font-bold text-slate-800 text-center">Your Photo Sheet</h3>
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
             <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-md bg-white"></canvas>
          </div>
          <div className="text-center">
            <button 
              onClick={downloadSheet}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Download for Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportPhotoMaker;
