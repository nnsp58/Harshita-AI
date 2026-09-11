import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Bell,
    Shield,
    Moon,
    Sun,
    Globe,
    Mic,
    Database,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Volume2,
    VolumeX,
    Bot,
    Key
} from 'lucide-react';

// Premium Settings Page Component
export default function HarshitaAISettings() {
    const [settings, setSettings] = useState({
        darkMode: true,
        notifications: true,
        aiProvider: 'default',
        voiceEnabled: true,
        language: 'English',
        autoSave: true,
        dataCollection: false,
    });

    const SettingToggle = ({ icon: Icon, label, value, onChange }) => {
        return (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center">
                        <Icon className="text-indigo-400" size={20} />
                    </div>
                    <span className="text-white font-medium">{label}</span>
                </div>
                <button
                    onClick={() => onChange(!value)}
                    className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-indigo-500' : 'bg-slate-600'
                        }`}
                >
                    <motion.div
                        animate={{ x: value ? 24 : 0 }}
                        className="w-5 h-5 rounded-full bg-white absolute top-0.5"
                    />
                </button>
            </div>
        );
    };

    const SettingSelect = ({ icon: Icon, label, value, options, onChange }) => {
        return (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center">
                        <Icon className="text-indigo-400" size={20} />
                    </div>
                    <span className="text-white font-medium">{label}</span>
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white focus:outline-none focus:border-indigo-500/50"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="text-indigo-400" size={32} />
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-2">Customize your Harshita AI experience</p>
                </div>

                {/* Appearance Section */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
                    <div className="space-y-3">
                        <SettingToggle
                            icon={Moon}
                            label="Dark Mode"
                            value={settings.darkMode}
                            onChange={(val) => setSettings({ ...settings, darkMode: val })}
                        />
                        <SettingSelect
                            icon={Globe}
                            label="Language"
                            value={settings.language}
                            options={[
                                { value: 'English', label: 'English' },
                                { value: 'Hindi', label: 'Hindi (हिंदी)' },
                                { value: 'Marathi', label: 'Marathi (मराठी)' },
                            ]}
                            onChange={(val) => setSettings({ ...settings, language: val })}
                        />
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                    <div className="space-y-3">
                        <SettingToggle
                            icon={Bell}
                            label="Push Notifications"
                            value={settings.notifications}
                            onChange={(val) => setSettings({ ...settings, notifications: val })}
                        />
                        <SettingToggle
                            icon={Bot}
                            label="AI Suggestions"
                            value={settings.notifications}
                            onChange={(val) => setSettings({ ...settings, notifications: val })}
                        />
                    </div>
                </section>

                {/* AI Provider Section */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">AI Provider</h2>
                    <SettingSelect
                        icon={Bot}
                        label="Primary AI Engine"
                        value={settings.aiProvider}
                        options={[
                            { value: 'default', label: 'Harshita AI (Default)' },
                            { value: 'openai', label: 'OpenAI GPT-4' },
                            { value: 'gemini', label: 'Google Gemini' },
                            { value: 'anthropic', label: 'Anthropic Claude' },
                        ]}
                        onChange={(val) => setSettings({ ...settings, aiProvider: val })}
                    />
                </section>

                {/* Voice Settings */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Voice & Audio</h2>
                    <div className="space-y-3">
                        <SettingToggle
                            icon={Mic}
                            label="Voice Input Enabled"
                            value={settings.voiceEnabled}
                            onChange={(val) => setSettings({ ...settings, voiceEnabled: val })}
                        />
                        <SettingSelect
                            icon={Volume2}
                            label="Voice Output"
                            value="female"
                            options={[
                                { value: 'female', label: 'Female Voice' },
                                { value: 'male', label: 'Male Voice' },
                                { value: 'disabled', label: 'Disabled' },
                            ]}
                            onChange={() => { }}
                        />
                    </div>
                </section>

                {/* Privacy & Data */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Privacy & Data</h2>
                    <div className="space-y-3">
                        <SettingToggle
                            icon={Database}
                            label="Auto Save Documents"
                            value={settings.autoSave}
                            onChange={(val) => setSettings({ ...settings, autoSave: val })}
                        />
                        <SettingToggle
                            icon={Shield}
                            label="Data Collection for Improvement"
                            value={settings.dataCollection}
                            onChange={(val) => setSettings({ ...settings, dataCollection: val })}
                        />
                    </div>
                </section>

                {/* Account Section */}
                <section className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-left hover:bg-slate-800/50 transition-all">
                            <div className="flex items-center gap-3">
                                <Key className="text-indigo-400" size={20} />
                                <span className="text-white font-medium">Change Password</span>
                            </div>
                            <span className="text-slate-400 text-sm">Last changed 3 months ago</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-left hover:bg-slate-800/50 transition-all">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="text-indigo-400" size={20} />
                                <span className="text-white font-medium">Reset All Settings</span>
                            </div>
                            <span className="text-slate-400 text-sm">Restore defaults</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}