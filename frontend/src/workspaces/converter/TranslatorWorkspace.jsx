import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Copy, Volume2, History, RotateCcw, Check } from 'lucide-react';

export default function TranslatorWorkspace() {
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const LANGUAGES = {
    'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French',
    'de': 'German', 'zh': 'Chinese', 'ja': 'Japanese', 'ru': 'Russian',
    'ar': 'Arabic', 'pt': 'Portuguese', 'bn': 'Bengali', 'ur': 'Urdu'
  };

  const mockTranslate = () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    
    // Simulating API call
    setTimeout(() => {
      let result = `[${LANGUAGES[targetLang]}] ${sourceText}`;
      if (targetLang === 'hi') result = `नमस्ते, यह एक अनुवाद है: ${sourceText.substring(0,20)}...`;
      if (targetLang === 'es') result = `Hola, esta es una traducción: ${sourceText.substring(0,20)}...`;

      setTranslatedText(result);
      setIsTranslating(false);
      
      setHistory(prev => [{
        original: sourceText,
        translated: result,
        from: sourceLang,
        to: targetLang,
        time: new Date()
      }, ...prev].slice(0, 10));
    }, 800);
  };

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleSpeak = (text, lang) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // basic mapping for SpeechSynthesis
    const voiceLang = lang === 'en' ? 'en-US' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.lang = voiceLang;
    synthRef.current.speak(utterance);
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">9. Universal Translator</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          {/* Swap Button (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button onClick={handleSwap} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg transition-transform hover:scale-110">
              <ArrowRightLeft size={20} />
            </button>
          </div>

          {/* Source Panel */}
          <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col h-[450px]">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-[#020617] border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none text-white w-48 font-medium"
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={`src-${code}`} value={code}>{name}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button onClick={() => handleSpeak(sourceText, sourceLang)} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <Volume2 size={18} />
                </button>
                <button onClick={() => { setSourceText(''); setTranslatedText(''); }} className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
            
            <textarea 
              value={sourceText}
              onChange={(e) => {
                setSourceText(e.target.value);
                if (e.target.value.trim() === '') setTranslatedText('');
              }}
              onBlur={() => mockTranslate()}
              placeholder="Enter text to translate..."
              className="flex-1 w-full bg-transparent resize-none outline-none text-xl leading-relaxed text-gray-200 placeholder-gray-600 custom-scrollbar"
            />
            
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button 
                onClick={mockTranslate}
                disabled={!sourceText.trim() || isTranslating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>

          {/* Swap Button (Mobile) */}
          <div className="flex lg:hidden justify-center my-2">
            <button onClick={handleSwap} className="p-3 bg-indigo-600 rounded-full shadow-lg">
              <ArrowRightLeft size={20} className="rotate-90" />
            </button>
          </div>

          {/* Target Panel */}
          <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col h-[450px]">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <select 
                value={targetLang} 
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  setTimeout(mockTranslate, 100);
                }}
                className="bg-[#020617] border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none text-emerald-400 font-medium w-48"
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={`tgt-${code}`} value={code}>{name}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button onClick={() => handleSpeak(translatedText, targetLang)} disabled={!translatedText} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <Volume2 size={18} />
                </button>
                <button onClick={copyToClipboard} disabled={!translatedText} className="p-2 text-gray-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full bg-transparent overflow-y-auto text-xl leading-relaxed text-emerald-300 custom-scrollbar">
              {isTranslating ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  Translating...
                </div>
              ) : (
                translatedText || <span className="text-gray-600 italic">Translation will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <History size={16} /> Recent Translations
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No recent translations</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#020617] border border-white/5 group hover:border-indigo-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-medium">
                    <span>{LANGUAGES[item.from]} → {LANGUAGES[item.to]}</span>
                    <span>{item.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2 truncate">{item.original}</div>
                  <div className="text-sm text-emerald-400 font-medium truncate">{item.translated}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
