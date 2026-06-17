import React, { useState, useRef, useEffect } from 'react';
import { Video, Music, Upload, Download, RefreshCw, Film } from 'lucide-react';
import { trackToolUsage } from '../utils/analytics';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const MediaConverter = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef('');

  const loadFFmpeg = async () => {
    setIsLoading(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      messageRef.current = message;
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(\`\${baseURL}/ffmpeg-core.js\`, 'text/javascript'),
      wasmURL: await toBlobURL(\`\${baseURL}/ffmpeg-core.wasm\`, 'application/wasm'),
    });
    
    setIsLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-rose-100">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6" /> Media Converter
          </h2>
          <p className="text-rose-100 text-sm mt-1">Convert Video & Audio formats securely in your browser</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('video')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'video' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><Video className="w-5 h-5"/> Video Converter</button>
        <button 
          onClick={() => setActiveTab('audio')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'audio' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><Music className="w-5 h-5"/> Audio Converter</button>
      </div>

      <div className="p-6">
        {!isLoaded ? (
          <div className="text-center py-12">
            <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Loading Media Engine...</h3>
            <p className="text-slate-500 text-sm mt-2">This happens only once and may take a few seconds.</p>
          </div>
        ) : (
          <>
            {activeTab === 'video' && <Converter type="video" ffmpegRef={ffmpegRef} />}
            {activeTab === 'audio' && <Converter type="audio" ffmpegRef={ffmpegRef} />}
          </>
        )}
      </div>
    </div>
  );
};

const Converter = ({ type, ffmpegRef }) => {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState(type === 'video' ? 'mp4' : 'mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);

  const formats = type === 'video' 
    ? ['mp4', 'avi', 'mkv', 'mov', 'webm']
    : ['mp3', 'wav', 'ogg', 'aac', 'flac'];

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith(type + '/')) {
      setFile(selected);
      setResultUrl(null);
      setProgress(0);
    } else {
      alert(\`Please upload a valid \${type} file.\`);
    }
  };

  const processMedia = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = \`input.\${file.name.split('.').pop()}\`;
      const outputName = \`output.\${targetFormat}\`;

      // Listen to progress
      ffmpeg.on('progress', ({ progress, time }) => {
        setProgress(Math.round(progress * 100));
      });

      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Execute FFmpeg command
      const args = ['-i', inputName];
      if (type === 'video' && targetFormat === 'mp4') {
         // Fast preset for web
         args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28');
      }
      args.push(outputName);
      
      await ffmpeg.exec(args);

      // Read output
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([data.buffer], { type: \`\${type}/\${targetFormat}\` }));
      setResultUrl(url);
      setProgress(100);
      trackToolUsage('MediaConverter');

    } catch (err) {
      console.error(err);
      alert('Error during conversion. The file might be too large or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div 
        className="border-3 border-dashed border-rose-200 rounded-xl p-8 text-center hover:bg-rose-50 transition cursor-pointer"
        onClick={() => document.getElementById(\`\${type}Input\`).click()}
      >
        <Upload className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">{file ? file.name : \`Upload \${type.charAt(0).toUpperCase() + type.slice(1)} File\`}</h3>
        <p className="text-slate-500 text-sm mt-1">{file ? \`\${(file.size/1024/1024).toFixed(2)} MB\` : 'Click to select (max 100MB)'}</p>
        <input type="file" id={\`\${type}Input\`} hidden accept={\`\${type}/*\`} onChange={handleFile} />
      </div>

      {file && !resultUrl && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-3">Select Output Format</h4>
            <div className="flex flex-wrap gap-3">
              {formats.map(fmt => (
                <button 
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={\`px-6 py-2 rounded-full font-medium border-2 transition-all \${targetFormat === fmt ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'}\`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={processMedia}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2 relative overflow-hidden"
          >
            {isProcessing && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300" 
                style={{ width: \`\${progress}%\` }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
              {isProcessing ? \`Converting... \${progress}%\` : \`Convert to \${targetFormat.toUpperCase()}\`}
            </span>
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
          <h3 className="text-xl font-bold text-green-700 mb-2">Conversion Successful!</h3>
          <p className="text-green-600 mb-6">Your file has been converted to {targetFormat.toUpperCase()}.</p>
          
          <div className="flex gap-4 justify-center">
            <a 
              href={resultUrl} 
              download={\`converted_\${Date.now()}.\${targetFormat}\`}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Download File
            </a>
            <button 
              onClick={() => { setFile(null); setResultUrl(null); }}
              className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 hover:bg-green-100 rounded-xl font-bold transition-all"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaConverter;
