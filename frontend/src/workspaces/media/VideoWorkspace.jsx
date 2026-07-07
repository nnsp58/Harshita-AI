import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, UploadCloud, Download, CheckCircle, RefreshCw, Settings2 } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export default function VideoWorkspace() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [resolution, setResolution] = useState('source');
  const [quality, setQuality] = useState('high');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState(null);
  
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100));
    });
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch(e) {
      console.log('FFmpeg load error. Check SharedArrayBuffer headers');
    }
  };

  const toBlobURL = async (url, mimeType) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!uploadedFile) return;
    if (!uploadedFile.type.startsWith('video/') && !uploadedFile.name.match(/\.(mp4|avi|mkv|mov)$/i)) {
      alert('Please upload a valid video file');
      return;
    }
    setFile(uploadedFile);
    setOutputUrl(null);
    setProgress(0);
  };

  const convertVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) await load();
      
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputName = `output.${format}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      const args = ['-i', inputName];
      
      // Add resolution scaling if needed
      if (resolution !== 'source') {
        const heights = { '1080p': 1080, '720p': 720, '480p': 480 };
        args.push('-vf', `scale=-2:${heights[resolution]}`);
      }
      
      // Add quality preset
      if (quality === 'high') {
        args.push('-preset', 'slow', '-crf', '18');
      } else if (quality === 'medium') {
        args.push('-preset', 'medium', '-crf', '23');
      } else {
        args.push('-preset', 'fast', '-crf', '28');
      }
      
      args.push(outputName);
      
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: `video/${format}` });
      setOutputUrl(URL.createObjectURL(blob));
      setProgress(100);
      
    } catch (error) {
      console.error(error);
      alert('Video conversion failed. Videos require significant memory and SharedArrayBuffer in the browser.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `${file.name.split('.')[0]}_converted.${format}`;
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
            <h1 className="text-xl font-bold tracking-tight uppercase">7. Video Converter</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {!file ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileUpload}
                className="bg-[#0f172a] rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <UploadCloud size={64} className="text-indigo-500 mb-6" />
                <h2 className="text-xl font-semibold mb-2">Upload Video File</h2>
                <p className="text-gray-400 mb-6">MP4, AVI, MKV, MOV supported (Max 100MB recommended for browser)</p>
                <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  Select File
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 h-full flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                {!outputUrl && !isProcessing && (
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <Film size={48} />
                  </div>
                )}
                
                {(!outputUrl && !isProcessing) && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold truncate max-w-sm">{file.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{formatBytes(file.size)}</p>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="w-full max-w-md space-y-2 pt-6">
                    <div className="flex justify-between text-xs text-indigo-400">
                      <span>Converting video (this may take a while)...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                
                {outputUrl && !isProcessing && (
                  <div className="flex flex-col items-center text-emerald-500 pt-4 w-full h-full">
                    <div className="flex items-center gap-2 mb-4 bg-[#020617] px-4 py-2 rounded-full border border-emerald-500/20">
                      <CheckCircle size={18} />
                      <span className="font-medium text-sm">Conversion Successful!</span>
                    </div>
                    <video src={outputUrl} controls className="w-full rounded-xl bg-black border border-white/10" style={{ maxHeight: '350px' }} />
                  </div>
                )}
                
                <button 
                  onClick={() => { setFile(null); setOutputUrl(null); }}
                  className="text-sm text-gray-500 hover:text-white transition-colors underline pt-4 z-10"
                >
                  Choose a different file
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6 flex-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Settings2 size={16} /> Conversion Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Convert To</label>
                  <select 
                    value={format} onChange={e => setFormat(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white font-medium"
                  >
                    <option value="mp4">MP4 (.mp4)</option>
                    <option value="avi">AVI (.avi)</option>
                    <option value="mkv">MKV (.mkv)</option>
                    <option value="mov">MOV (.mov)</option>
                    <option value="webm">WebM (.webm)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Resolution</label>
                  <select 
                    value={resolution} onChange={e => setResolution(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white font-medium"
                  >
                    <option value="source">Same as source</option>
                    <option value="1080p">1080p (Full HD)</option>
                    <option value="720p">720p (HD)</option>
                    <option value="480p">480p (SD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-2">Quality / Compression</label>
                  <select 
                    value={quality} onChange={e => setQuality(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white font-medium"
                  >
                    <option value="high">High (Larger File)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="low">Low (Smaller File)</option>
                  </select>
                </div>
              </div>
            </div>

            {outputUrl && !isProcessing ? (
              <button 
                onClick={handleDownload}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download size={18} /> Download {format.toUpperCase()}
              </button>
            ) : (
              <button 
                onClick={convertVideo}
                disabled={!file || isProcessing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-gray-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <><RefreshCw size={18} className="animate-spin" /> Converting...</>
                ) : (
                  <><Film size={18} /> Convert Video</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
