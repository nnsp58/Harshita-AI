import React, { useState, useEffect, useRef } from 'react';
import { Languages, Volume2, Mic, ArrowRightLeft, Copy, RefreshCw, Trash2 } from 'lucide-react';

const TranslatorTool = ({ onClose }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ar', name: 'Arabic' }
  ];

  useEffect(() => {
    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSourceText(prev => prev ? prev + ' ' + transcript : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser doesn't support Speech Recognition.");
      }
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const translation = data[0].map(item => item[0]).join('');
      setTranslatedText(translation);
    } catch (err) {
      console.error(err);
      setTranslatedText('Error: Translation failed. Please check your connection.');
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Languages className="w-6 h-6" /> Universal AI Translator
          </h2>
          <p className="text-blue-100 text-sm mt-1">Translate, Speak, and Listen in 80+ Languages</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
            ✕
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          
          {/* Source Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col h-full">
            <select 
              value={sourceLang} 
              onChange={e => setSourceLang(e.target.value)}
              className="w-full mb-3 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="auto">Auto Detect Language</option>
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            
            <textarea 
              className="w-full flex-1 min-h-[200px] p-4 rounded-lg border-none bg-white shadow-inner resize-none focus:ring-2 focus:ring-blue-200"
              placeholder="Type or paste text here..."
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-3 text-slate-500">
              <span className="text-xs">{sourceText.length} / 5000</span>
              <div className="flex gap-2">
                <button onClick={() => setSourceText('')} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Clear">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={toggleListening} className={\`p-2 rounded-lg transition \${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-blue-50 hover:text-blue-600'}\`} title="Voice Input">
                  <Mic className="w-5 h-5" />
                </button>
                <button onClick={() => speakText(sourceText, sourceLang === 'auto' ? 'en' : sourceLang)} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition" title="Listen">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button 
            onClick={swapLanguages}
            className="w-12 h-12 rounded-full bg-indigo-100 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-md mx-auto md:rotate-0 rotate-90"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </button>

          {/* Target Panel */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col h-full">
            <select 
              value={targetLang} 
              onChange={e => setTargetLang(e.target.value)}
              className="w-full mb-3 rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-indigo-900 bg-white"
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            
            <textarea 
              className="w-full flex-1 min-h-[200px] p-4 rounded-lg border-none bg-white shadow-inner resize-none focus:ring-2 focus:ring-indigo-200 text-indigo-950 font-medium"
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
            />
            
            <div className="flex justify-end items-center mt-3 text-indigo-500">
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(translatedText)} className="p-2 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition flex items-center gap-1 font-medium text-sm" title="Copy">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={() => speakText(translatedText, targetLang)} className="p-2 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition" title="Listen to Translation">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
          >
            {isTranslating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
            {isTranslating ? 'Translating...' : 'Translate Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslatorTool;
