import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

export default function QRWorkspace() {
  const navigate = useNavigate();
  const [type, setType] = useState('text');
  const [value, setValue] = useState('Harshita AI - Your AI Assistant');
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const qrRef = useRef();

  const handleDownload = (format) => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;

    if (format === 'png') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    } else if (format === 'svg') {
      const svg = document.getElementById('qr-svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.svg';
      a.click();
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'text': return 'Enter text...';
      case 'website': return 'https://example.com';
      case 'upi': return 'upi://pay?pa=name@upi&pn=Name';
      case 'wifi': return 'WIFI:S:NetworkName;T:WPA;P:Password;;';
      case 'email': return 'mailto:someone@example.com';
      case 'phone': return 'tel:+919876543210';
      case 'vcard': return 'BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nTEL:+919876543210\\nEND:VCARD';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">5. QR Code Generator</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 bg-[#0f172a] rounded-2xl p-4 border border-white/5 space-y-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Type</h2>
            {['Text', 'Website', 'WiFi', 'Email', 'UPI', 'vCard', 'Phone'].map(t => (
              <button 
                key={t}
                onClick={() => { setType(t.toLowerCase()); setValue(''); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${type === t.toLowerCase() ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">{type}</label>
              {type === 'vcard' ? (
                <textarea 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  placeholder={getPlaceholder()}
                  rows={6}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none resize-none font-mono"
                />
              ) : (
                <input 
                  type="text" 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  placeholder={getPlaceholder()}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none"
                />
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Options</h2>
              <div className="flex justify-between items-center text-sm">
                <span>Size</span>
                <span className="font-mono text-indigo-400">{size}</span>
              </div>
              <input 
                type="range" min="100" max="600" value={size} onChange={e => setSize(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Foreground</label>
                  <div className="flex items-center gap-2 bg-[#020617] p-2 rounded-xl border border-white/10">
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <span className="text-sm font-mono text-gray-300 uppercase">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Background</label>
                  <div className="flex items-center gap-2 bg-[#020617] p-2 rounded-xl border border-white/10">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <span className="text-sm font-mono text-gray-300 uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0f172a] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-2xl flex items-center justify-center">
              <QRCodeCanvas 
                id="qr-canvas"
                value={value || ' '} 
                size={Math.min(size, 250)} 
                fgColor={fgColor} 
                bgColor={bgColor} 
                level="Q"
              />
              <div className="hidden">
                <QRCodeSVG 
                  id="qr-svg"
                  value={value || ' '} 
                  size={size} 
                  fgColor={fgColor} 
                  bgColor={bgColor} 
                  level="Q"
                />
              </div>
            </div>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => handleDownload('png')}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                Download PNG
              </button>
              <button 
                onClick={() => handleDownload('svg')}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
