import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, HelpCircle, History, Settings, FileText, 
  Download, Share2, Edit, Play, RotateCcw, Zap, BookOpen 
} from 'lucide-react';
import { useStore } from '../../store';

export default function AgentStudioPanel({ agent, onGenerate, onEditInWorkspace }) {
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const currentDocument = useStore((state) => state.currentDocument);

  // Pre-fill sample data
  const handleSampleFill = () => {
    if (!agent || !agent.inputs) return;
    const sampleData = {};
    agent.inputs.forEach(input => {
      sampleData[input.id] = input.placeholder || 'Sample data';
    });
    setFormData(sampleData);
  };

  const handleReset = () => {
    setFormData({});
  };

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agent) return;

    setIsGenerating(true);
    
    // Construct the prompt from inputs
    let promptParts = [`I need help from the ${agent.name}.`];
    if (agent.inputs && agent.inputs.length > 0) {
      promptParts.push("Here are the details:");
      agent.inputs.forEach(input => {
        if (formData[input.id]) {
          promptParts.push(`${input.label.split('/')[0].trim()}: ${formData[input.id]}`);
        }
      });
    } else {
      promptParts.push("Please guide me.");
    }

    onGenerate(promptParts.join('\n'));

    // Simulation timeout to stop loading state (in real scenario, handled by socket response)
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  if (!agent) return null;

  const Icon = agent.icon;

  return (
    <div className="h-full flex flex-col bg-[#0b0e17] overflow-hidden">
      {/* Top Breadcrumb & Actions */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0f111a]">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          <span className="hover:text-white cursor-pointer">Home</span>
          <ChevronRight size={12} />
          <span className="text-amber-400">{agent.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <BookOpen size={14} /> Guide
          </button>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <FileText size={14} /> Example
          </button>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <History size={14} /> History
          </button>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Settings size={14} /> Settings
          </button>
          {agent.isPremium && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-[10px] font-bold border border-amber-500/30">
              ⭐ Premium
            </span>
          )}
        </div>
      </div>

      {/* Agent Header */}
      <div className="px-6 py-5 flex items-center gap-4 bg-[#0a0c14] border-b border-white/5 shadow-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${agent.color}`}>
          {Icon && <Icon size={24} className="text-white" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">{agent.name}</h1>
          <p className="text-xs text-gray-400 mt-1">{agent.description} • {agent.nameHi}</p>
        </div>
      </div>

      {/* Split Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Input Details Form */}
        <div className="w-1/2 border-r border-white/5 bg-[#0b0e17] flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="text-sm font-bold text-white mb-6 border-b border-white/10 pb-2">Input Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {agent.inputs && agent.inputs.length > 0 ? (
                agent.inputs.map(input => (
                  <div key={input.id} className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-[11px] font-medium text-gray-400 text-right">
                      {input.label}
                    </label>
                    {input.type === 'textarea' ? (
                      <textarea
                        className="w-full bg-[#111421] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                        placeholder={input.placeholder}
                        value={formData[input.id] || ''}
                        onChange={(e) => handleChange(input.id, e.target.value)}
                      />
                    ) : (
                      <input
                        type={input.type}
                        className="w-full bg-[#111421] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                        placeholder={input.placeholder}
                        value={formData[input.id] || ''}
                        onChange={(e) => handleChange(input.id, e.target.value)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                  <Zap size={24} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500">This agent requires no structured inputs.<br/>You can simply generate or chat with it.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 bg-transparent text-gray-400 text-xs font-medium rounded-lg hover:bg-white/5 transition-colors border border-gray-600/30">
                  <RotateCcw size={14} /> Reset
                </button>
                <button 
                  type="button" 
                  onClick={handleSampleFill}
                  className="flex items-center gap-1.5 px-4 py-2 bg-transparent text-gray-300 text-xs font-medium rounded-lg hover:bg-white/5 transition-colors border border-gray-500">
                  <FileText size={14} /> Sample Fill
                </button>
                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                  {isGenerating ? 'Generating...' : (
                    <><Zap size={14} /> Generate</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Preview (A4 Document) */}
        <div className="w-1/2 bg-[#12151c] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-[#12151c] to-transparent z-10 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Preview (A4 Document)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-12 pb-24 custom-scrollbar">
            {/* A4 Paper Container */}
            <div className="bg-white mx-auto shadow-2xl rounded-sm text-black relative"
                 style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', padding: '25.4mm' }}>
              
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Drafting document...</p>
                </div>
              ) : currentDocument && currentDocument.content ? (
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 font-medium">
                  {currentDocument.content}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <FileText size={48} className="text-gray-400 mb-4" />
                  <p className="text-base font-semibold">Generated output will appear here</p>
                  <p className="text-sm text-gray-500 mt-1">Fill the details and click generate</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar over Preview */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-3">
            <button 
              onClick={onEditInWorkspace}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1d27] border border-gray-600 hover:bg-[#252a36] text-white text-[11px] font-bold rounded-lg shadow-lg">
              <Edit size={14} /> Edit in Workspace
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1d27] border border-gray-600 hover:bg-[#252a36] text-white text-[11px] font-bold rounded-lg shadow-lg">
              <Download size={14} /> Download PDF
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1d27] border border-gray-600 hover:bg-[#252a36] text-white text-[11px] font-bold rounded-lg shadow-lg">
              <Download size={14} /> Download DOCX
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg shadow-lg">
              <Share2 size={14} /> Share on WhatsApp
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
