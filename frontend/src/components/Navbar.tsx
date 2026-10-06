import React, { useState } from 'react';
import { 
  Sparkles, Home, Bot, User, Database, Target, Flame, 
  LogOut, ChevronDown, Share2, Sliders, History, Brain 
} from 'lucide-react';
import type { AvatarConfig } from '../types';
import { CanonicalAvatar } from './CanonicalAvatar';

export type MainTabType = 'dashboard' | 'chat' | 'lifegraph' | 'insights' | 'simulation' | 'timeline' | 'twin' | 'memory' | 'goals' | 'habits' | 'avatar';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  twinEvolutionLevel?: number;
  userName?: string;
  avatarConfig?: AvatarConfig;
  onResetDemo?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  twinEvolutionLevel = 1,
  userName = 'Harshit',
  avatarConfig = {},
  onSignOut
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: Home },
    { id: 'chat', label: 'AI Core', icon: Bot },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'lifegraph', label: 'Life Graph', icon: Share2 },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'twin', label: 'Digital Twin', icon: User },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Focus', icon: Flame },
    { id: 'avatar', label: 'Avatar', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#05050A]/90 backdrop-blur-2xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        {/* LEFT: PRATIBIMB Brand & Core Identity */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#c33cff] to-[#8b5cf6] p-[1px] shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#05050A] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#8B5CFF] group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-black text-sm tracking-widest text-white">
                PRATIBIMB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-tight">Personal AI Operating Layer</p>
          </div>
        </div>

        {/* CENTER: Streamlined Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MainTabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-violet-500/15 border border-violet-500/30 shadow-sm shadow-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B5CFF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Compact User Identity */}
        <div className="flex items-center gap-2 relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0c0a1a] border border-white/10 hover:border-white/20 cursor-pointer transition-all"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-900 border border-white/20 flex items-center justify-center">
              <CanonicalAvatar config={avatarConfig} size="sm" mode="2d" showAura={false} />
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">{userName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">L{twinEvolutionLevel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 rounded-2xl bg-[#0c0a1a] border border-white/10 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onSignOut?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
