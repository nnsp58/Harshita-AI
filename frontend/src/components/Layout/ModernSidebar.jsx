import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Scale, 
  Briefcase, 
  Building2, 
  FileText, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store';

const SECTIONS = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
      { name: 'AI Assistant', icon: Bot, route: '/service/ai-assistant' },
    ]
  },
  {
    title: 'Services',
    items: [
      { name: 'Legal Tools', icon: Scale, route: '/legal-draft' },
      { name: 'Career Tools', icon: Briefcase, route: '/resume-builder' },
      { name: 'Business Tools', icon: Building2, route: '/service/business' },
      { name: 'Government', icon: FileText, route: '/service/form-filling' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', icon: Settings, route: '/settings' },
      { name: 'Support', icon: HelpCircle, route: '/contact' },
    ]
  }
];

export default function ModernSidebar({ isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen }) {
  const { logout } = useStore();

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <img src="/harshita ai.png" alt="Harshita AI" className="w-8 h-8 rounded-lg" />
            <span className="text-white tracking-wide">N-Dizi AI</span>
          </div>
        )}
        {isCollapsed && (
          <img src="/harshita ai.png" alt="Harshita AI" className="w-8 h-8 rounded-lg mx-auto" />
        )}
        <button 
          onClick={toggleSidebar} 
          className="hidden lg:block text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <button 
          onClick={() => setMobileOpen(false)} 
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6 px-3">
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'hover:bg-slate-800 hover:text-white'
                        }`
                      }
                      title={isCollapsed ? item.name : ''}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={20} className={`shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className={isCollapsed ? '' : 'mr-3'} />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 z-20 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-sm h-full flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
