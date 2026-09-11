import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Send,
    Upload,
    Mic,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Plus,
    Menu,
    X,
    Settings,
    Share2,
    Download,
    Paperclip,
    Code,
    Table as TableIcon,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Premium AI Assistant ChatGPT Style Component
export default function AIAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: `Hello! I'm **Harshita AI**, your personal assistant. I can help you with:

- **Legal Services**: Drafting notices, affidavits, agreements
- **Tax & Finance**: ITR filing, GST calculations, tax planning
- **Government Services**: Passport, PAN, ration cards, pensions
- **Business Tools**: Resume building, business registration
- **Media AI**: Image generation, video creation, photo editing
- **Documents**: OCR scanning, format conversion, QR codes

What would you like me to help you with today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                content: `I understand you want help with "${input}". Let me assist you with that. You can continue the conversation or use one of the quick actions below.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedPrompts = [
        'Generate a legal notice for my property dispute',
        'Help me file my ITR for FY 2024-25',
        'Create a professional resume for software engineer',
        'Calculate GST for my business turnover',
        'Check eligibility for government schemes',
        'Generate passport application form'
    ];

    const renderMessageContent = (content) => {
        // Simple markdown-like rendering
        let html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/\n/g, '<br />');

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="flex h-screen bg-[#020617]">
            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="lg:hidden fixed left-0 top-0 h-full w-72 bg-slate-950/90 backdrop-blur-xl z-50 p-4"
                        >
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white mb-4"
                            >
                                <X size={20} />
                            </button>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white"
                                >
                                    ← Back to Dashboard
                                </button>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-14 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Bot className="text-white" size={18} />
                            </div>
                            <h1 className="text-lg font-semibold text-white">Harshita AI Assistant</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.type === 'ai' && (
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                                            <Bot className="text-white" size={20} />
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] group ${message.type === 'user' ? 'order-first' : ''}`}>
                                        <div className={`rounded-2xl px-5 py-4 ${message.type === 'user'
                                                ? 'bg-indigo-500/20 text-white ml-auto'
                                                : 'bg-slate-800/50 text-slate-200'
                                            }`}>
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                {renderMessageContent(message.content)}
                                            </div>
                                        </div>

                                        {message.type === 'ai' && (
                                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white">
                                                    <Copy size={14} />
                                                </button>
                                                <button className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white">
                                                    <Download size={14} />
                                                </button>
                                                <button className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-emerald-400">
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-rose-400">
                                                    <ThumbsDown size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {message.type === 'user' && (
                                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                                            <span className="text-white font-medium text-sm">U</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="text-white" size={20} />
                                </div>
                                <div className="bg-slate-800/50 rounded-2xl px-5 py-4">
                                    <div className="flex items-center gap-1">
                                        <motion.span
                                            className="w-2 h-2 rounded-full bg-slate-400"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                        />
                                        <motion.span
                                            className="w-2 h-2 rounded-full bg-slate-400"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                        />
                                        <motion.span
                                            className="w-2 h-2 rounded-full bg-slate-400"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Suggested Prompts (when no messages or empty) */}
                {messages.length === 1 && messages[0].type === 'ai' && (
                    <div className="px-4 lg:px-6 pb-4">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs text-slate-500 mb-2">Suggested prompts:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(prompt);
                                            handleSend();
                                        }}
                                        className="text-left px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 lg:p-6 border-t border-slate-800/50 bg-slate-900/30">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative flex items-end gap-3">
                            <button className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50">
                                <Paperclip size={20} />
                            </button>

                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message... / हिंदी में लिखें..."
                                    className="w-full min-h-[52px] max-h-32 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                                    rows={1}
                                />
                            </div>

                            <button className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50">
                                <Mic size={20} />
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={`p-3 rounded-xl transition-all ${input.trim()
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                        : 'bg-slate-800/50 text-slate-500'
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}