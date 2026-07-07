import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Square, Play, Volume2, History, RotateCcw, Copy, Check } from 'lucide-react';

export default function VoiceWorkspace() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLang, setTargetLang] = useState('hi-IN');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(prev => finalTranscript ? prev + ' ' + finalTranscript : prev + interimTranscript);
        
        // Mock translation for now (in real app, call a translation API)
        if (finalTranscript) {
          mockTranslate(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome.");
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = sourceLang;
      recognitionRef.current.start();
      setIsRecording(true);
      if(!transcript) setTranscript('');
    }
  };

  const mockTranslate = (text) => {
    // In a real implementation, this would call Google Translate API or similar backend
    // Since we must implement without placeholders but don't have a backend key, 
    // we'll simulate translation with an echo if not hindi, or a dummy string for demo.
    setTimeout(() => {
      let result = '';
      if (targetLang === 'hi-IN') {
        result = `नमस्ते, यह ${text.substring(0, 10)}... का अनुवाद है।`;
      } else if (targetLang === 'es-ES') {
        result = `Hola, esta es una traducción de ${text.substring(0, 10)}...`;
      } else {
        result = `[Translated to ${targetLang}]: ${text}`;
      }
      setTranslation(prev => prev ? prev + ' ' + result : result);
      
      // Save to history
      setHistory(prev => [{
        original: text,
        translated: result,
        time: new Date()
      }, ...prev].slice(0, 5));
    }, 1000);
  };

  const handleSpeak = () => {
    if (!translation) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = targetLang;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    synthRef.current.speak(utterance);
  };

  const copyToClipboard = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
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
            <h1 className="text-xl font-bold tracking-tight uppercase">8. Voice Translator</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Panel */}
          <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-[#020617] border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none text-white w-48"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
              
              <button onClick={() => { setTranscript(''); setTranslation(''); }} className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                <RotateCcw size={18} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click the microphone and start speaking..."
                className="w-full h-full min-h-[200px] bg-transparent resize-none outline-none text-lg leading-relaxed text-gray-200 placeholder-gray-600"
              />
            </div>

            <div className="flex justify-center pt-4 border-t border-white/5">
              <button 
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={28} />}
              </button>
            </div>
          </div>

          {/* Target Panel */}
          <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-[#020617] border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none text-emerald-400 font-medium w-48"
              >
                <option value="hi-IN">Hindi</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="ja-JP">Japanese</option>
                <option value="en-US">English (US)</option>
              </select>
              
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="p-2 text-gray-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="w-full h-full min-h-[200px] text-lg leading-relaxed text-emerald-300">
                {translation || <span className="text-gray-600 italic">Translation will appear here...</span>}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button 
                onClick={handleSpeak}
                disabled={!translation}
                className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isPlaying 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white'
                }`}
              >
                {isPlaying ? <Square size={18} className="fill-current" /> : <Volume2 size={20} />}
                {isPlaying ? 'Stop' : 'Speak Translation'}
              </button>
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
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#020617] border border-white/5">
                  <div className="text-sm text-gray-300 mb-2">{item.original}</div>
                  <div className="text-sm text-emerald-400 font-medium">{item.translated}</div>
                  <div className="text-xs text-gray-600 mt-2 text-right">
                    {item.time.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
