import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Upload, CheckCircle, ArrowRight, Sparkles, FileText, Send, Building2, UserCircle, Briefcase } from 'lucide-react';
import { useStore } from '../../store';

export default function ITRWorkspace() {
  const { user } = useStore();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Namaste.\nMain Harshita AI Chartered Accountant hoon.\nMain aapka Income Tax Return tayyar karunga.\nSabse pehle aapka PAN Number bataye.'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [currentStage, setCurrentStage] = useState('ASK_PAN'); // ASK_PAN, ASK_AADHAAR, ASK_INCOME, UPLOAD_DOCS, ANALYZING, SUMMARY, DONE
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, sender, components = null) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender, components }]);
  };

  const handleSend = (text = inputValue) => {
    if (!text.trim() && currentStage !== 'ASK_INCOME' && currentStage !== 'UPLOAD_DOCS') return;
    
    // Add user message
    if (text) {
      addMessage(text, 'user');
    }
    setInputValue('');

    // Flow Logic
    setTimeout(() => {
      switch (currentStage) {
        case 'ASK_PAN':
          addMessage('Dhanyavaad.\nAadhaar Number bataye.', 'ai');
          setCurrentStage('ASK_AADHAAR');
          break;
        case 'ASK_AADHAAR':
          addMessage('Income Source bataye.', 'ai', 'INCOME_OPTIONS');
          setCurrentStage('ASK_INCOME');
          break;
        case 'UPLOAD_DOCS':
          addMessage('Main document padh raha hoon...', 'ai', 'ANALYZING');
          setCurrentStage('ANALYZING');
          setTimeout(() => {
            addMessage('Aapke liye ITR-1 suitable hai.\nEstimated Refund: ₹12,450', 'ai', 'SUMMARY_CARD');
            setCurrentStage('SUMMARY');
          }, 3500);
          break;
        default:
          if (currentStage === 'DONE') {
             addMessage('Aapka kaam ho chuka hai. Portal par final check karke submit karein.', 'ai');
          } else {
             addMessage('Kripya diye gaye options ka chayan karein.', 'ai');
          }
      }
    }, 1000);
  };

  const handleIncomeSelect = (source) => {
    addMessage(source, 'user');
    setCurrentStage('UPLOAD_DOCS');
    setTimeout(() => {
      addMessage('Kripya Form 16 upload kariye.', 'ai', 'UPLOAD_BUTTON');
    }, 1000);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addMessage(`Form 16 (${file.name}) Uploaded ✅`, 'user');
      handleSend('');
    }
  };

  const handleOpenPortal = () => {
    addMessage('Portal Khol Raha Hoon...', 'user');
    setCurrentStage('DONE');
    setTimeout(() => {
      addMessage('Main verified details ke hisaab se portal me madad karunga. Final submission aapko khud approve karna hoga.', 'ai', 'PORTAL_DONE');
    }, 1000);
  };

  // Render specific UI components within chat bubbles
  const renderCustomComponent = (type) => {
    switch (type) {
      case 'INCOME_OPTIONS':
        return (
          <div className="flex flex-col gap-2 mt-3 w-48">
            <button onClick={() => handleIncomeSelect('Salary')} className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 flex items-center gap-2 transition-colors"><UserCircle size={16}/> Salary</button>
            <button onClick={() => handleIncomeSelect('Pension')} className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 flex items-center gap-2 transition-colors"><Building2 size={16}/> Pension</button>
            <button onClick={() => handleIncomeSelect('Business')} className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 flex items-center gap-2 transition-colors"><Briefcase size={16}/> Business</button>
          </div>
        );
      case 'UPLOAD_BUTTON':
        return (
          <label className="mt-3 bg-white text-indigo-700 border-2 border-dashed border-indigo-300 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 flex items-center justify-center gap-2 cursor-pointer transition-colors w-max">
            <Upload size={18} /> Upload Form 16
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleUpload} />
          </label>
        );
      case 'ANALYZING':
        return (
          <div className="mt-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2 text-xs font-bold text-slate-500">
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle size={14}/> Employer Detect</p>
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle size={14}/> Salary Detect</p>
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle size={14}/> TDS Detect</p>
          </div>
        );
      case 'SUMMARY_CARD':
        return (
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-800 w-64 md:w-80">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ITR Summary</p>
              <div className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded-md">ITR-1</div>
            </div>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Income</span>
                <span className="font-bold">₹8,50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TDS Deducted</span>
                <span className="font-bold">₹45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Liability</span>
                <span className="font-bold text-rose-600">₹32,550</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Est. Refund</span>
                <span className="font-black text-emerald-600 text-base">₹12,450</span>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2 font-medium">Official Income Tax Portal kholne ke liye Ready.</p>
              <button onClick={handleOpenPortal} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md">
                Open Portal <ArrowRight size={16} />
              </button>
            </div>
          </div>
        );
      case 'PORTAL_DONE':
         return (
           <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                Portal automation active. Please review your details and confirm submission on the portal. ✅
              </p>
           </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-none md:rounded-[2rem] overflow-hidden flex flex-col h-screen md:h-[85vh] border border-slate-100 relative">
        
        {/* Chat Header */}
        <div className="bg-indigo-600 p-5 flex items-center gap-4 z-10 shadow-sm shrink-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
            <Bot size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">Harshita AI</h1>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Chartered Accountant</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 relative">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot size={16} className="text-indigo-600" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.text && (
                      <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                    {msg.components && renderCustomComponent(msg.components)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all"
          >
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={currentStage === 'ASK_INCOME' || currentStage === 'UPLOAD_DOCS'}
              placeholder={
                currentStage === 'ASK_INCOME' ? 'Select from options above...' : 
                currentStage === 'UPLOAD_DOCS' ? 'Upload document above...' : 
                'Type your message...'
              }
              className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || currentStage === 'ASK_INCOME' || currentStage === 'UPLOAD_DOCS'}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
