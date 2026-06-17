import React, { useState, useRef } from 'react';
import { Upload, FileImage, Download, RefreshCw, Settings2, Trash2 } from 'lucide-react';
import { trackToolUsage } from '../utils/analytics';

const FileCompressor = ({ onClose }) => {
  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState({ quality: 0.7, targetSizeKB: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    e.preventDefault();
    let selectedFiles;
    if (e.dataTransfer) {
      selectedFiles = Array.from(e.dataTransfer.files);
    } else if (e.target) {
      selectedFiles = Array.from(e.target.files);
    }

    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = selectedFiles
        .filter(f => f.type.startsWith('image/'))
        .map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          status: 'pending',
          progress: 0,
          originalSize: file.size,
          processedUrl: null,
          processedSize: null,
          savings: 0
        }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const compressSingleFile = (fileObj) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const targetKB = parseFloat(settings.targetSizeKB);
        if (targetKB > 0) {
          let low = 0.1, high = 1.0, bestBlob = null;
          let iterations = 0;
          const attempt = () => {
            let q = (low + high) / 2;
            canvas.toBlob(blob => {
              iterations++;
              if (!bestBlob || Math.abs(blob.size - targetKB * 1024) < Math.abs(bestBlob.size - targetKB * 1024)) {
                bestBlob = blob;
              }
              if (iterations < 5) {
                if (blob.size > targetKB * 1024) high = q;
                else low = q;
                attempt();
              } else { resolve(bestBlob); }
            }, 'image/jpeg', q);
          };
          attempt();
        } else {
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', settings.quality);
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(fileObj.file);
    });
  };

  const compressAll = async () => {
    setIsProcessing(true);
    let updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'completed') continue;

      updatedFiles[i] = { ...updatedFiles[i], status: 'processing' };
      setFiles([...updatedFiles]);

      try {
        const blob = await compressSingleFile(updatedFiles[i]);
        const url = URL.createObjectURL(blob);
        const savings = (((updatedFiles[i].originalSize - blob.size) / updatedFiles[i].originalSize) * 100).toFixed(0);

        updatedFiles[i] = {
          ...updatedFiles[i],
          status: 'completed',
          processedUrl: url,
          processedSize: blob.size,
          savings: savings
        };
      } catch (err) {
        updatedFiles[i] = { ...updatedFiles[i], status: 'error' };
      }
      setFiles([...updatedFiles]);
    }
    setIsProcessing(false);
  };

  const downloadAll = () => {
    trackToolUsage('FileCompressor');
    files.filter(f => f.status === 'completed').forEach((file, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = file.processedUrl;
        a.download = file.file.name.replace(/\.[^.]+$/, '') + '_optimized.jpg';
        a.click();
      }, i * 400);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-orange-100">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileImage className="w-6 h-6" /> Image Compressor
          </h2>
          <p className="text-orange-100 text-sm mt-1">Batch compress images instantly without losing quality</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="p-6">
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

        {/* Upload Zone */}
        <div 
          className="border-3 border-dashed border-orange-200 rounded-xl p-12 text-center hover:bg-orange-50 transition cursor-pointer group mb-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileChange}
          onClick={() => document.getElementById('imageUpload').click()}
        >
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Upload Images</h3>
          <p className="text-slate-500 mt-2">Drag & drop multiple JPG, PNG, or WebP files</p>
          <input type="file" id="imageUpload" hidden accept="image/*" multiple onChange={handleFileChange} />
        </div>

        {files.length > 0 && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Settings2 className="w-4 h-4"/> Optimization Level
                </label>
                <select 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={settings.quality}
                  onChange={e => setSettings({...settings, quality: parseFloat(e.target.value)})}
                  disabled={isProcessing}
                >
                  <option value="0.9">Minimal (Best Quality)</option>
                  <option value="0.7">Standard (Recommended)</option>
                  <option value="0.4">Maximum (Smallest Size)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Size (KB) - Optional</label>
                <input 
                  type="number" 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="e.g. 100"
                  value={settings.targetSizeKB}
                  onChange={e => setSettings({...settings, targetSizeKB: e.target.value})}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* File List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-700">{files.length} Files Selected</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFiles([])}
                    disabled={isProcessing}
                    className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded transition"
                  >Clear All</button>
                </div>
              </div>
              <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {files.map(f => (
                  <li key={f.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FileImage className="w-5 h-5"/>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-800 truncate">{f.file.name}</p>
                        <p className="text-xs text-slate-500">{(f.originalSize / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {f.status === 'processing' && <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />}
                      {f.status === 'completed' && (
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Saved {f.savings}%
                          </span>
                          <p className="text-xs font-medium text-green-600 mt-1">
                            New: {(f.processedSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      )}
                      {f.status === 'pending' && !isProcessing && (
                        <button onClick={() => removeFile(f.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={compressAll}
                disabled={isProcessing || files.every(f => f.status === 'completed')}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Settings2 className="w-5 h-5" />}
                {isProcessing ? 'Optimizing Images...' : 'Compress All Images'}
              </button>

              {files.some(f => f.status === 'completed') && (
                <button 
                  onClick={downloadAll}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download All Optimized
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCompressor;
