import React, { useState } from 'react';
import { QrCode, KeyRound, Calculator, Copy, RefreshCw, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UtilityTools = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('qr');

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-purple-100">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-6 h-6" /> Quick Utilities
          </h2>
          <p className="text-purple-100 text-sm mt-1">QR Generator • Password Creator • Smart Calculator</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('qr')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'qr' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><QrCode className="w-5 h-5"/> QR Generator</button>
        <button 
          onClick={() => setActiveTab('password')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'password' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><KeyRound className="w-5 h-5"/> Passwords</button>
        <button 
          onClick={() => setActiveTab('calc')}
          className={\`flex-1 py-4 font-semibold flex justify-center items-center gap-2 transition-colors \${activeTab === 'calc' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'}\`}
        ><Calculator className="w-5 h-5"/> Calculator</button>
      </div>

      <div className="p-6">
        {activeTab === 'qr' && <QRGenerator />}
        {activeTab === 'password' && <PasswordGenerator />}
        {activeTab === 'calc' && <SmartCalculator />}
      </div>
    </div>
  );
};

// --- QR Generator Component ---
const QRGenerator = () => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  
  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = \`QRCode_\${Date.now()}.png\`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Enter Text or URL</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 rounded-xl border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
            placeholder="https://example.com or any text..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">QR Color</label>
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        {text ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-200">
              <QRCodeSVG id="qr-code-svg" value={text} size={200} fgColor={color} level="H" includeMargin={true} />
            </div>
            <button 
              onClick={downloadQR}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow flex gap-2 items-center"
            >
              <Download className="w-4 h-4"/> Download PNG
            </button>
          </>
        ) : (
          <div className="text-slate-400 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Enter text to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Password Generator Component ---
const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const generate = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let res = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
        res += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(res);
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group">
        <div className="font-mono text-2xl text-green-400 font-bold tracking-wider break-all pr-12">
          {password || 'Click Generate'}
        </div>
        <button 
          onClick={copy}
          disabled={!password}
          className="absolute right-2 top-2 bottom-2 w-12 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 disabled:opacity-50 transition"
        >
          <Copy className="w-5 h-5"/>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
            <span>Password Length</span>
            <span className="text-purple-600 font-bold">{length}</span>
          </label>
          <input 
            type="range" min="8" max="64" value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <input type="checkbox" checked={useUpper} onChange={e=>setUseUpper(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-5 h-5" />
            <span className="text-sm font-medium">A-Z</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <input type="checkbox" checked={useNumbers} onChange={e=>setUseNumbers(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-5 h-5" />
            <span className="text-sm font-medium">0-9</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <input type="checkbox" checked={useSymbols} onChange={e=>setUseSymbols(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-5 h-5" />
            <span className="text-sm font-medium">!@#$</span>
          </label>
        </div>
      </div>

      <button 
        onClick={generate}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2"
      >
        <RefreshCw className="w-5 h-5"/> Generate Secure Password
      </button>
    </div>
  );
};

// --- Smart Calculator Component ---
const SmartCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleInput = (val) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const calculate = () => {
    try {
      // Safe eval equivalent
      const result = new Function('return ' + display)();
      setEquation(display + ' =');
      setDisplay(String(result));
    } catch (err) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const del = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    { label: 'C', action: clear, type: 'action' },
    { label: 'DEL', action: del, type: 'action' },
    { label: '%', action: () => handleInput('/100'), type: 'op' },
    { label: '/', action: () => handleInput('/'), type: 'op' },
    
    { label: '7', action: () => handleInput('7'), type: 'num' },
    { label: '8', action: () => handleInput('8'), type: 'num' },
    { label: '9', action: () => handleInput('9'), type: 'num' },
    { label: '*', action: () => handleInput('*'), type: 'op' },
    
    { label: '4', action: () => handleInput('4'), type: 'num' },
    { label: '5', action: () => handleInput('5'), type: 'num' },
    { label: '6', action: () => handleInput('6'), type: 'num' },
    { label: '-', action: () => handleInput('-'), type: 'op' },
    
    { label: '1', action: () => handleInput('1'), type: 'num' },
    { label: '2', action: () => handleInput('2'), type: 'num' },
    { label: '3', action: () => handleInput('3'), type: 'num' },
    { label: '+', action: () => handleInput('+'), type: 'op' },
    
    { label: '00', action: () => handleInput('00'), type: 'num' },
    { label: '0', action: () => handleInput('0'), type: 'num' },
    { label: '.', action: () => handleInput('.'), type: 'num' },
    { label: '=', action: calculate, type: 'equal' },
  ];

  return (
    <div className="max-w-xs mx-auto bg-slate-900 p-4 rounded-3xl shadow-2xl">
      <div className="bg-slate-800 rounded-2xl p-4 mb-4 text-right">
        <div className="text-slate-400 h-6 text-sm mb-1 font-mono">{equation}</div>
        <div className="text-white text-4xl font-light tracking-wider overflow-hidden">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {buttons.map((btn, i) => (
          <button 
            key={i}
            onClick={btn.action}
            className={\`h-14 rounded-xl font-bold text-lg transition active:scale-95 flex items-center justify-center
              \${btn.type === 'num' ? 'bg-slate-700 text-white hover:bg-slate-600' : ''}
              \${btn.type === 'op' ? 'bg-purple-600 text-white hover:bg-purple-500' : ''}
              \${btn.type === 'action' ? 'bg-slate-600 text-pink-400 hover:bg-slate-500' : ''}
              \${btn.type === 'equal' ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg' : ''}
            \`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UtilityTools;
