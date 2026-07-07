import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, UploadCloud, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export default function AudioWorkspace() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('wav');
  const [quality, setQuality] = useState('320k');
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
    // In production, host these files locally
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch(e) {
      console.log('FFmpeg failed to load, you might need SharedArrayBuffer headers');
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
    if (!uploadedFile.type.startsWith('audio/') && !uploadedFile.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) {
      alert('Please upload a valid audio file');
      return;
    }
    setFile(uploadedFile);
    setOutputUrl(null);
    setProgress(0);
  };

  const convertAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) await load();
      
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputName = `output.${format}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Basic FFmpeg command
      await ffmpeg.exec(['-i', inputName, '-b:a', quality, outputName]);
      
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: `audio/${format}` });
      setOutputUrl(URL.createObjectURL(blob));
      setProgress(100);
      
    } catch (error) {
      console.error(error);
      alert('Conversion failed. Make sure you are using a modern browser (SharedArrayBuffer required) or run it locally with correct headers.');
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
            <h1 className="text-xl font-bold tracking-tight uppercase">6. Audio Converter</h1>
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
                <h2 className="text-xl font-semibold mb-2">Upload Audio File</h2>
                <p className="text-gray-400 mb-6">MP3, WAV, OGG, AAC supported</p>
                <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  Select File
                  <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <Music size={48} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold truncate max-w-sm">{file.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{formatBytes(file.size)}</p>
                </div>
                
                {isProcessing && (
                  <div className="w-full max-w-md space-y-2 pt-6">
                    <div className="flex justify-between text-xs text-indigo-400">
                      <span>Converting audio...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                
                {outputUrl && !isProcessing && (
                  <div className="flex flex-col items-center text-emerald-500 pt-4">
                    <CheckCircle size={32} className="mb-2" />
                    <span className="font-medium">Conversion Successful!</span>
                    <audio src={outputUrl} controls className="mt-6 w-full max-w-sm custom-audio" />
                  </div>
                )}
                
                <button 
                  onClick={() => { setFile(null); setOutputUrl(null); }}
                  className="text-sm text-gray-500 hover:text-white transition-colors underline pt-4"
                >
                  Choose a different file
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6 flex-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Conversion Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Convert To</label>
                  <select 
                    value={format} onChange={e => setFormat(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white font-medium"
                  >
                    <option value="mp3">MP3 (.mp3)</option>
                    <option value="wav">WAV (.wav)</option>
                    <option value="ogg">OGG (.ogg)</option>
                    <option value="aac">AAC (.aac)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Audio Quality</label>
                  <select 
                    value={quality} onChange={e => setQuality(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white font-medium"
                  >
                    <option value="320k">High (320 kbps)</option>
                    <option value="192k">Medium (192 kbps)</option>
                    <option value="128k">Standard (128 kbps)</option>
                    <option value="64k">Low (64 kbps)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-[#020617] border-white/10 text-indigo-500 focus:ring-0" />
                    <span className="text-sm text-gray-300">Normalize Audio Volume</span>
                  </label>
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
                onClick={convertAudio}
                disabled={!file || isProcessing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-gray-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <><RefreshCw size={18} className="animate-spin" /> Converting...</>
                ) : (
                  <><RefreshCw size={18} /> Convert File</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
