import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Bot,
    Scale,
    Briefcase,
    Building2,
    FileText,
    Image,
    Video,
    Mic,
    Calculator,
    Settings,
    HelpCircle,
    LogOut,
    Search,
    Bell,
    User,
    CreditCard,
    Moon,
    Sun,
    Globe,
    ChevronLeft,
    ChevronRight,
    Pin,
    Clock,
    Star,
    Activity,
    TrendingUp,
    QrCode,
    FileStack,
    Languages,
    ArrowRight,
    Sparkles,
    Heart,
    Share2,
    Download,
    RefreshCw,
    AlertTriangle,
    Menu,
    X,
    MessageSquare,
    Send,
    Upload,
    Paperclip,
    Copy,
    ExternalLink
} from 'lucide-react';
import { useStore } from '../store';

// ========================================
// Premium Design System Constants
// ========================================

const APPLICATIONS = [
    { id: 'ai-assistant', name: 'AI Assistant', icon: Bot, category: '🤖', description: 'Chat with advanced AI for any query', route: '/workspace/ai-assistant', gradient: 'from-violet-500 to-purple-600', status: 'active' },
    { id: 'legal-notice', name: 'Legal Notice', icon: Scale, category: '⚖', description: 'Generate legal notices instantly', route: '/workspace/legal/notice', gradient: 'from-blue-500 to-indigo-600', status: 'active' },
    { id: 'affidavit', name: 'Affidavit', icon: FileText, category: '⚖', description: 'Create affidavits with AI assistance', route: '/workspace/legal/affidavit', gradient: 'from-indigo-500 to-blue-600', status: 'active' },
    { id: 'agreement-draft', name: 'Agreement Draft', icon: FileText, category: '⚖', description: 'Draft legal agreements and contracts', route: '/workspace/legal/agreement', gradient: 'from-purple-500 to-violet-600', status: 'active' },
    { id: 'itr-filing', name: 'ITR Filing', icon: FileText, category: '💰', description: 'File income tax returns easily', route: '/workspace/tax/itr', gradient: 'from-emerald-500 to-teal-600', status: 'active' },
    { id: 'gst-calculator', name: 'GST Calculator', icon: Calculator, category: '💰', description: 'Calculate GST with smart tools', route: '/workspace/tax/gst', gradient: 'from-green-500 to-emerald-600', status: 'active' },
    { id: 'ta-da', name: 'TA/DA', icon: FileText, category: '💰', description: 'Travel allowance calculations', route: '/workspace/ta-da', gradient: 'from-teal-500 to-cyan-600', status: 'active' },
    { id: 'passport', name: 'Passport Services', icon: FileText, category: '🏛', description: 'Passport application assistance', route: '/workspace/government/passport', gradient: 'from-amber-500 to-orange-600', status: 'active' },
    { id: 'pan-services', name: 'PAN Services', icon: CreditCard, category: '🏛', description: 'PAN card related services', route: '/workspace/government/pan', gradient: 'from-orange-500 to-amber-600', status: 'active' },
    { id: 'resume-builder', name: 'Resume Builder', icon: Briefcase, category: '🧰', description: 'Create professional resumes', route: '/workspace/resume-builder', gradient: 'from-sky-500 to-blue-600', status: 'active' },
    { id: 'land-measurement', name: 'Land Measurement', icon: FileText, category: '🏛', description: 'Land area calculations and records', route: '/workspace/land-measurement', gradient: 'from-cyan-500 to-sky-600', status: 'active' },
    { id: 'govt-schemes', name: 'Government Schemes', icon: Building2, category: '🏛', description: 'Check eligibility for govt schemes', route: '/workspace/government/schemes', gradient: 'from-rose-500 to-pink-600', status: 'active' },
    { id: 'ration-card', name: 'Ration Card', icon: CreditCard, category: '🏛', description: 'Ration card services and updates', route: '/workspace/government/ration', gradient: 'from-pink-500 to-rose-600', status: 'active' },
    { id: 'pension', name: 'Pension', icon: Heart, category: '🏛', description: 'Pension services and claims', route: '/workspace/government/pension', gradient: 'from-red-500 to-rose-600', status: 'active' },
    { id: 'business-registration', name: 'Business Registration', icon: Building2, category: '🧰', description: 'Register your business easily', route: '/workspace/business/registration', gradient: 'from-indigo-500 to-purple-600', status: 'active' },
    { id: 'ocr-scanner', name: 'OCR Scanner', icon: FileText, category: '📄', description: 'Extract text from images', route: '/workspace/ocr-scanner', gradient: 'from-violet-500 to-purple-600', status: 'active' },
    { id: 'photo-maker', name: 'Photo Maker', icon: Image, category: '🖼', description: 'AI-powered photo generation', route: '/workspace/media/photo-maker', gradient: 'from-purple-500 to-fuchsia-600', status: 'active' },
    { id: 'video-generator', name: 'Video Generator', icon: Video, category: '🎥', description: 'Generate videos with AI', route: '/workspace/media/video-generator', gradient: 'from-fuchsia-500 to-pink-600', status: 'active' },
    { id: 'image-generator', name: 'Image Generator', icon: Image, category: '🖼', description: 'Create AI images and art', route: '/workspace/media/image-generator', gradient: 'from-violet-500 to-purple-600', status: 'active' },
    { id: 'translator', name: 'Translator', icon: Languages, category: '🎙', description: 'Translate between languages', route: '/workspace/translator', gradient: 'from-sky-500 to-indigo-600', status: 'active' },
    { id: 'calculator', name: 'Calculator', icon: Calculator, category: '🧮', description: 'Advanced calculator tools', route: '/workspace/calculator', gradient: 'from-amber-500 to-yellow-600', status: 'active' },
    { id: 'doc-converter', name: 'Document Converter', icon: FileStack, category: '📄', description: 'Convert between document formats', route: '/workspace/document-converter', gradient: 'from-emerald-500 to-green-600', status: 'active' },
    { id: 'qr-generator', name: 'QR Generator', icon: QrCode, category: '🧮', description: 'Generate QR codes instantly', route: '/workspace/qr-generator', gradient: 'from-teal-500 to-cyan-600', status: 'active' },
];

const METRICS = [
    { title: 'Applications', value: '22', icon: LayoutDashboard, trend: '+2', gradient: 'from-blue-500 to-indigo-500' },
    { title: 'Documents Generated', value: '142', icon: FileText, trend: '+18%', gradient: 'from-emerald-500 to-teal-500' },
    { title: 'Government Forms', value: '36', icon: Building2, trend: '+5', gradient: 'from-purple-500 to-violet-500' },
    { title: "Today's Tasks", value: '8', icon: Activity, trend: '3 due', gradient: 'from-amber-500 to-orange-500' },
    { title: 'Saved Templates', value: '12', icon: Star, trend: '+4', gradient: 'from-pink-500 to-rose-500' },
    { title: 'Subscription', value: 'Pro', icon: CreditCard, trend: 'Active', gradient: 'from-indigo-500 to-purple-500' },
    { title: 'Storage Used', value: '2.4GB', icon: FileStack, trend: 'of 10GB', gradient: 'from-sky-500 to-cyan-500' },
    { title: 'Recent Activity', value: '15', icon: Clock, trend: 'Last hour', gradient: 'from-fuchsia-500 to-purple-500' },
];

const SIDEbar_SECTIONS = [
    {
        id: 'main',
        title: 'Main',
        icon: LayoutDashboard,
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', emoji: '🏠' },
        ]
    },
    {
        id: 'ai',
        title: 'AI Assistant',
        icon: Bot,
        items: [
            { name: 'AI Assistant', icon: Bot, route: '/workspace/ai-assistant', emoji: '🤖' },
        ]
    },
    {
        id: 'legal',
        title: 'Legal Services',
        icon: Scale,
        items: [
            { name: 'Legal Notice', icon: Scale, route: '/workspace/legal/notice', emoji: '⚖' },
            { name: 'Affidavit', icon: FileText, route: '/workspace/legal/affidavit', emoji: '⚖' },
            { name: 'Agreement Draft', icon: FileText, route: '/workspace/legal/agreement', emoji: '⚖' },
        ]
    },
    {
        id: 'tax',
        title: 'Tax & Finance',
        icon: Calculator,
        items: [
            { name: 'ITR Filing', icon: FileText, route: '/workspace/tax/itr', emoji: '💰' },
            { name: 'GST Calculator', icon: Calculator, route: '/workspace/tax/gst', emoji: '💰' },
            { name: 'TA/DA', icon: FileText, route: '/workspace/ta-da', emoji: '💰' },
        ]
    },
    {
        id: 'government',
        title: 'Government Services',
        icon: Building2,
        items: [
            { name: 'Passport', icon: FileText, route: '/workspace/government/passport', emoji: '🏛' },
            { name: 'PAN Services', icon: CreditCard, route: '/workspace/government/pan', emoji: '🏛' },
            { name: 'Land Measurement', icon: FileText, route: '/workspace/land-measurement', emoji: '🏛' },
            { name: 'Government Schemes', icon: Building2, route: '/workspace/government/schemes', emoji: '🏛' },
            { name: 'Ration Card', icon: CreditCard, route: '/workspace/government/ration', emoji: '🏛' },
            { name: 'Pension', icon: Heart, route: '/workspace/government/pension', emoji: '🏛' },
        ]
    },
    {
        id: 'documents',
        title: 'Documents',
        icon: FileText,
        items: [
            { name: 'OCR Scanner', icon: FileText, route: '/workspace/ocr-scanner', emoji: '📄' },
        ]
    },
    {
        id: 'business',
        title: 'Business Tools',
        icon: Briefcase,
        items: [
            { name: 'Resume Builder', icon: Briefcase, route: '/workspace/resume-builder', emoji: '🧰' },
            { name: 'Business Registration', icon: Building2, route: '/workspace/business/registration', emoji: '🧰' },
        ]
    },
    {
        id: 'media',
        title: 'Media AI',
        icon: Image,
        items: []
    },
    {
        id: 'voice',
        title: 'Voice AI',
        icon: Mic,
        items: []
    },
    {
        id: 'utility',
        title: 'Utility Tools',
        icon: Calculator,
        items: []
    },
    {
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        items: [
            { name: 'Settings', icon: Settings, route: '/settings', emoji: '⚙' },
        ]
    },
    {
        id: 'help',
        title: 'Help',
        icon: HelpCircle,
        items: [
            { name: 'Help', icon: HelpCircle, route: '/help', emoji: '❓' },
        ]
    },
];

// ========================================
// Components
// ========================================

const ModernSidebar = ({ isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const { logout } = useStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="fixed left-0 top-0 h-screen bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 z-30 hidden lg:block"
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="h-16 border-b border-slate-800/50 flex items-center px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-white font-bold text-lg">Harshita AI</h1>
                                <p className="text-slate-400 text-xs">One AI. Every Service.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
                    {SIDEbar_SECTIONS.map((section) => (
                        <div key={section.id} className="mb-6">
                            {!isCollapsed && (
                                <div className="px-3 mb-2">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <section.icon size={14} />
                                        {section.title}
                                    </h3>
                                </div>
                            )}
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.name}>
                                        <NavLink
                                            to={item.route}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                }`
                                            }
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            <span className="text-lg">{item.emoji}</span>
                                            {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all w-full"
                    >
                        <span className="text-lg">🚪</span>
                        {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};

const TopNavigation = ({ theme, setTheme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    return (
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="lg:hidden text-slate-400 hover:text-white"
                >
                    <Menu size={20} />
                </button>

                {/* Global Search */}
                <div className="relative hidden sm:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="search"
                        placeholder="Search applications, documents, services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Switch */}
                <div className="relative">
                    <button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Theme"
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <AnimatePresence>
                        {showThemeMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-12 w-40 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2"
                            >
                                <button
                                    onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50"
                                >
                                    <Moon size={14} /> Dark Mode
                                </button>
                                <button
                                    onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50"
                                >
                                    <Sun size={14} /> Light Mode
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Language */}
                <button className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all" title="Language">
                    <Globe size={18} />
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all" title="Notifications">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
                </button>

                {/* Subscription */}
                <button
                    onClick={() => navigate('/subscription')}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-sm font-medium text-white"
                >
                    <CreditCard size={16} />
                    <span>Pro</span>
                </button>

                {/* Profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                        U
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white">User</span>
                </button>
            </div>
        </header>
    );
};

const ApplicationCard = ({ app, index }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
            onClick={() => navigate(app.route)}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg`}>
                        <app.icon className="text-white" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${app.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <button className="p-1.5 rounded-lg bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pin size={14} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                <h3 className="font-semibold text-white mb-1">{app.name}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{app.description}</p>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Ready to use</span>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </motion.div>
    );
};

const MetricCard = ({ metric, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 group hover:border-indigo-500/30 transition-all"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center`}>
                    <metric.icon className="text-white" size={20} />
                </div>
                <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.trend}</p>
                <p className="text-xs text-slate-500 mt-1">{metric.title}</p>
            </div>
        </motion.div>
    );
};

const AIAssistantPreview = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', text: 'Hello! How can I help you today?', time: '2 min ago' },
        { id: 2, type: 'user', text: 'I need help with ITR filing', time: '1 min ago' },
    ]);

    const suggestedPrompts = [
        'File my ITR for this year',
        'Generate a legal notice',
        'Create my resume',
        'Calculate GST for my business'
    ];

    return (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Bot className="text-indigo-400" size={20} />
                    AI Assistant
                </h3>
                <button
                    onClick={() => navigate('/workspace/ai-assistant')}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                    Open Full
                </button>
            </div>

            <div className="space-y-3 mb-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 text-sm ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.type === 'user'
                                ? 'bg-indigo-500/20 text-white'
                                : 'bg-slate-800/50 text-slate-300'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-xs text-slate-500">Suggested prompts:</p>
                {suggestedPrompts.map((prompt, idx) => (
                    <button key={idx} className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/30 text-xs text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const RecentActivity = () => {
    const activities = [
        { id: 1, icon: FileText, text: 'Generated Affidavit.pdf', time: '10 min ago', color: 'text-blue-400' },
        { id: 2, icon: Download, text: 'Downloaded GST Report', time: '1 hour ago', color: 'text-emerald-400' },
        { id: 3, icon: Upload, text: 'Uploaded 3 documents', time: '2 hours ago', color: 'text-purple-400' },
    ];

    return (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="text-indigo-400" size={20} />
                Recent Activity
            </h3>
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center ${activity.color}`}>
                            <activity.icon size={16} />
                        </div>
                        <div>
                            <p className="text-sm text-white">{activity.text}</p>
                            <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RightPanel = () => {
    const todayTasks = [
        { id: 1, title: 'ITR Filing Deadline', due: 'Today, 5PM', priority: 'high' },
        { id: 2, title: 'GST Quarterly Return', due: 'Tomorrow', priority: 'medium' },
    ];

    return (
        <aside className="w-80 border-l border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 hidden xl:block">
            <div className="space-y-6">
                {/* Today's Tasks */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-indigo-400" />
                        Today's Tasks
                    </h3>
                    <div className="space-y-2">
                        {todayTasks.map((task) => (
                            <div key={task.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <p className="text-sm text-white">{task.title}</p>
                                <p className="text-xs text-slate-400">{task.due}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Star size={16} className="text-amber-400" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="p-3 rounded-xl bg-slate-800/30 text-xs text-slate-300 hover:bg-slate-800/50">
                            New Document
                        </button>
                        <button className="p-3 rounded-xl bg-slate-800/30 text-xs text-slate-300 hover:bg-slate-800/50">
                            Upload File
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// ========================================
// Main Dashboard Component
// ========================================

export default function HarshitaAIDashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Sidebar */}
            <ModernSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-slate-950/90 backdrop-blur-xl z-50"
                        >
                            <ModernSidebar isCollapsed={false} setIsCollapsed={() => { }} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
                {/* Top Navigation */}
                <TopNavigation theme={theme} setTheme={setTheme} />

                {/* Dashboard Content */}
                <main className="p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Hero Section */}
                        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/20 via-slate-900 to-purple-900/20 border border-slate-800/50 p-8 lg:p-12">
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                                    Welcome Back
                                </h1>
                                <p className="text-xl text-slate-300 mb-2">
                                    One AI. Every Service. Zero Complexity.
                                </p>
                                <p className="text-slate-400 max-w-2xl">
                                    Access 22 powerful applications powered by advanced AI. From legal documents to tax filing, from business tools to creative media generation.
                                </p>
                            </div>
                        </section>

                        {/* Metrics Grid */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity className="text-indigo-400" size={20} />
                                Dashboard Metrics
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {METRICS.map((metric, idx) => (
                                    <MetricCard key={metric.title} metric={metric} index={idx} />
                                ))}
                            </div>
                        </section>

                        {/* Application Grid */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <LayoutDashboard className="text-indigo-400" size={20} />
                                    Applications
                                </h2>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800">
                                        Recent
                                    </button>
                                    <button className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800">
                                        Favorites
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {APPLICATIONS.map((app, idx) => (
                                    <ApplicationCard key={app.id} app={app} index={idx} />
                                ))}
                            </div>
                        </section>

                        {/* Bottom Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AIAssistantPreview />
                            <RecentActivity />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}