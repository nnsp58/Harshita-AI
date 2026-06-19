import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Maximize2, Minimize2, Send, Mic, Paperclip, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [ratings, setRatings] = useState({});
  const { isConnected, sendCommand, submitFeedback, messages } = useSocket();
  const messagesEndRef = useRef(null);

  const toggleWidget = () => setIsOpen(!isOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCommand(input);
    setInput('');
  };

  const handleFeedback = (interactionId, rating) => {
    if (ratings[interactionId]) return;
    submitFeedback(interactionId, rating);
    setRatings(prev => ({ ...prev, [interactionId]: rating }));
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleWidget}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40 group"
      >
        <Bot size={28} className="group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-[90vw] h-[85vh] sm:w-[600px] sm:h-[800px]' : 'w-80 sm:w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Bot size={18} className="text-indigo-400" />
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-none">N-Dizi AI</h3>
            <p className="text-xs text-slate-400 mt-1">{isConnected ? 'Online • Universal Assistant' : 'Connecting...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleExpand} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors hidden sm:block">
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={toggleWidget} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#020617]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
              <MessageSquare size={32} className="text-indigo-500/50" />
            </div>
            <p className="text-slate-400 text-sm max-w-[200px]">How can I help you today? Try asking about legal drafts or resumes.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button onClick={() => sendCommand("Draft an affidavit")} className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700">Draft an affidavit</button>
              <button onClick={() => sendCommand("Create resume")} className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700">Create resume</button>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.type === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {(msg.message || msg.text)?.replace(/^\[[^\]]*रूटिंग[^\]]*\]\s*/, '')}
              </div>
              {msg.type !== 'user' && msg.interactionId && (
                <div className="flex items-center gap-2 mt-1 ml-2 text-slate-400">
                  <button 
                    type="button" 
                    onClick={() => handleFeedback(msg.interactionId, 'positive')}
                    disabled={ratings[msg.interactionId] !== undefined}
                    className={`hover:text-green-400 transition-colors p-1 rounded ${ratings[msg.interactionId] === 'positive' ? 'text-green-400 bg-green-500/10' : ''}`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFeedback(msg.interactionId, 'negative')}
                    disabled={ratings[msg.interactionId] !== undefined}
                    className={`hover:text-red-400 transition-colors p-1 rounded ${ratings[msg.interactionId] === 'negative' ? 'text-red-400 bg-red-500/10' : ''}`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                  {ratings[msg.interactionId] && (
                    <span className="text-[10px] text-slate-500">Feedback sent</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <form onSubmit={handleSend} className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 overflow-hidden">
          <button type="button" className="pl-3 pr-2 py-3 text-slate-400 hover:text-white transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask N-Dizi AI..."
            className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none py-3"
          />
          <button type="button" className="px-2 py-3 text-slate-400 hover:text-white transition-colors">
            <Mic size={18} />
          </button>
          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`pr-3 pl-2 py-3 transition-colors ${input.trim() ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-600'}`}
          >
            <Send size={18} className={input.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
