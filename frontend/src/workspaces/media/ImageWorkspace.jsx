import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Download, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';

export default function ImageWorkspace() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewOriginal, setPreviewOriginal] = useState(null);
  const [previewCompressed, setPreviewCompressed] = useState(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState(null);

  const canvasRef = useRef(document.createElement('canvas'));

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (!uploadedFile.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewOriginal(url);
    setFormat(uploadedFile.type === 'image/png' ? 'image/png' : 'image/jpeg');
  };

  const processImage = () => {
    if (!file || !previewOriginal) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const compUrl = URL.createObjectURL(blob);
          setPreviewCompressed(compUrl);
          
          setStats({
            origSize: file.size,
            compSize: blob.size,
            ratio: ((1 - (blob.size / file.size)) * 100).toFixed(1),
            width: img.width,
            height: img.height,
            blob: blob
          });
          setIsProcessing(false);
        },
        format,
        quality
      );
    };
    img.src = previewOriginal;
  };

  useEffect(() => {
    if (file) {
      const timer = setTimeout(processImage, 300);
      return () => clearTimeout(timer);
    }
  }, [file, quality, format]);

  const handleDownload = () => {
    if (!stats || !stats.blob) return;
    const a = document.createElement('a');
    a.href = previewCompressed;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    a.download = `compressed_${file.name.split('.')[0]}.${ext}`;
    a.click();
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
            <h1 className="text-xl font-bold tracking-tight uppercase">2. Image Compressor</h1>
          </div>
        </header>

        {!file ? (
          <div className="bg-[#0f172a] rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <UploadCloud size={64} className="text-indigo-500 mb-6" />
            <h2 className="text-xl font-semibold mb-2">Upload an Image</h2>
            <p className="text-gray-400 mb-6">JPG, PNG, WebP supported</p>
            <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors">
              Select File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Original</span>
                    <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">{formatBytes(stats?.origSize || file.size)}</span>
                  </div>
                  <div className="aspect-[4/3] bg-[#020617] rounded-xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                    <img src={previewOriginal} alt="Original" className="object-contain w-full h-full" />
                  </div>
                </div>

                {/* Compressed */}
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      Compressed {isProcessing && <RefreshCw size={12} className="animate-spin" />}
                    </span>
                    <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                      {stats ? formatBytes(stats.compSize) : '...'}
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-[#020617] rounded-xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                    {previewCompressed ? (
                      <img src={previewCompressed} alt="Compressed" className="object-contain w-full h-full" />
                    ) : (
                      <ImageIcon className="text-gray-600 w-12 h-12" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#0f172a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Compression Settings</h2>
              
              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Quality</span>
                    <span className="font-mono text-indigo-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Low Size</span>
                    <span>High Quality</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-xs text-gray-400 uppercase">Format</label>
                  <select 
                    value={format} onChange={e => setFormat(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png) - No lossy compression</option>
                    <option value="image/webp">WebP (.webp)</option>
                  </select>
                </div>

                {stats && stats.ratio > 0 && (
                  <div className="pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Space Saved</div>
                      <div className="text-xl font-bold text-emerald-400">{stats.ratio}%</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setFile(null); setPreviewOriginal(null); setPreviewCompressed(null); setStats(null); }}
                  className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!previewCompressed || isProcessing}
                  className="py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
