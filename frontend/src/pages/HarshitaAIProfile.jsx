import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Globe,
    Moon,
    Sun,
    FileText,
    Download,
    Settings,
    Shield,
    CreditCard,
    Calendar,
    MapPin,
    Edit,
    Check,
    X as XIcon
} from 'lucide-react';

// Premium Profile Page Component
export default function HarshitaAIProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        language: 'English',
        theme: 'dark',
        avatar: '',
    });

    const savedDocuments = [
        { id: 1, name: 'Affidavit_Template.docx', size: '2.4 MB', date: '2 days ago' },
        { id: 2, name: 'ITR_2024.pdf', size: '1.2 MB', date: '1 week ago' },
        { id: 3, name: 'Resume_Professional.pdf', size: '845 KB', date: '2 weeks ago' },
    ];

    const history = [
        { id: 1, action: 'Generated Legal Notice', time: '3 hours ago' },
        { id: 2, action: 'Calculated GST', time: '5 hours ago' },
        { id: 3, action: 'Created Resume', time: '1 day ago' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Profile</h1>
                        <p className="text-slate-400 mt-1">Manage your personal information and preferences</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium"
                    >
                        <CreditCard size={18} />
                        Upgrade to Pro
                    </motion.button>
                </div>

                {/* Profile Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                                    J
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                                    <p className="text-sm text-slate-400">Pro Plan</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                                    <Mail className="text-slate-400" size={18} />
                                    <span className="text-sm text-slate-300">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                                    <Phone className="text-slate-400" size={18} />
                                    <span className="text-sm text-slate-300">{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                                    <Globe className="text-slate-400" size={18} />
                                    <span className="text-sm text-slate-300">{profile.language}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                <Edit size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Settings className="text-indigo-400" size={20} />
                                Preferences
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Theme</label>
                                    <div className="flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 border border-slate-700/50">
                                            <Moon size={16} /> Dark
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 border border-slate-700/50">
                                            <Sun size={16} /> Light
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Language</label>
                                    <select className="w-full py-2.5 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-indigo-500/50">
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Marathi</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
                                    <span className="text-sm text-slate-300">Notifications</span>
                                    <button className="w-10 h-5 rounded-full bg-indigo-500 relative">
                                        <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield className="text-indigo-400" size={20} />
                                Security
                            </h3>

                            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/30 text-left hover:bg-slate-800/50 transition-all">
                                <span className="text-sm text-white">Change Password</span>
                                <span className="text-xs text-slate-400">Last changed 3 months ago</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Documents */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-indigo-400" size={22} />
                        Saved Documents
                    </h2>
                    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 overflow-hidden">
                        <div className="divide-y divide-slate-800/50">
                            {savedDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center">
                                            <FileText className="text-indigo-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{doc.name}</p>
                                            <p className="text-xs text-slate-400">{doc.size} • {doc.date}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white">
                                        <Download size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-indigo-400" size={22} />
                        Recent History
                    </h2>
                    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 overflow-hidden">
                        <div className="divide-y divide-slate-800/50">
                            {history.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-all">
                                    <p className="text-sm text-white">{item.action}</p>
                                    <p className="text-xs text-slate-400">{item.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}