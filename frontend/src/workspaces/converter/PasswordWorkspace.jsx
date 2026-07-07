import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Save, History, Check, Shield } from 'lucide-react';

export default function PasswordWorkspace() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ label: 'Weak', color: 'text-red-500' });

  const generatePassword = () => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    
    let validChars = '';
    if (options.uppercase) validChars += chars.uppercase;
    if (options.lowercase) validChars += chars.lowercase;
    if (options.numbers) validChars += chars.numbers;
    if (options.symbols) validChars += chars.symbols;

    if (!validChars) return;

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += validChars[array[i] % validChars.length];
    }
    
    setPassword(newPassword);
    setHistory(prev => [{ pwd: newPassword, time: new Date() }, ...prev].slice(0, 5));
    evaluateStrength(newPassword);
    setCopied(false);
  };

  const evaluateStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 8) score += 1;
    if (pwd.length > 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 2) setStrength({ label: 'Weak', color: 'text-red-500' });
    else if (score <= 4) setStrength({ label: 'Medium', color: 'text-yellow-500' });
    else setStrength({ label: 'Strong', color: 'text-green-500' });
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (text === password) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOption = (key) => {
    const newOptions = { ...options, [key]: !options[key] };
    if (!Object.values(newOptions).some(Boolean)) return;
    setOptions(newOptions);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">10. Password Generator</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield size={14} className="text-indigo-400" />
            Local Execution
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-6 shadow-xl">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Options</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Length</span>
                <span className="bg-indigo-500/20 text-indigo-400 px-2 rounded-md font-mono">{length}</span>
              </div>
              <input 
                type="range" 
                min="6" max="64" 
                value={length} 
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3 pt-4">
              {[
                { id: 'uppercase', label: 'Uppercase (A-Z)' },
                { id: 'lowercase', label: 'Lowercase (a-z)' },
                { id: 'numbers', label: 'Numbers (0-9)' },
                { id: 'symbols', label: 'Symbols (!@#$%)' },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${options[opt.id] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 group-hover:border-indigo-500'}`}>
                    {options[opt.id] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-300 select-none">{opt.label}</span>
                  <input type="checkbox" className="hidden" checked={options[opt.id]} onChange={() => toggleOption(opt.id)} />
                </label>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 flex flex-col justify-center min-h-[160px] relative overflow-hidden group shadow-xl">
              <div className="absolute top-4 right-4 text-xs font-medium text-gray-500">Generated Password</div>
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={password} 
                  readOnly 
                  className="bg-transparent text-3xl md:text-4xl font-mono text-white outline-none w-full tracking-wider"
                />
                <button onClick={generatePassword} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                  <RefreshCw size={20} className="text-indigo-400" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Strength: <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => copyToClipboard(password)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied to Clipboard' : 'Copy Password'}
            </button>

            <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 shadow-xl">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <History size={16} /> History
              </h2>
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group cursor-pointer" onClick={() => copyToClipboard(item.pwd)}>
                    <div className="font-mono text-sm text-gray-300 truncate w-3/4">{item.pwd}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      {item.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
