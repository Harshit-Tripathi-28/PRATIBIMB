import React, { useState } from 'react';
import { 
  Sparkles, Home, Bot, User, Database, Target, Flame, LogOut, ChevronDown 
} from 'lucide-react';
import type { AvatarConfig } from '../types';
import { CanonicalAvatar } from './CanonicalAvatar';

export type MainTabType = 'dashboard' | 'chat' | 'twin' | 'memory' | 'goals' | 'habits' | 'avatar';

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
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Core', icon: Bot },
    { id: 'twin', label: 'Digital Twin', icon: User },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Focus', icon: Flame },
    { id: 'avatar', label: 'Avatar', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#030712]/95 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        {/* =========================================
            LEFT: PRATIBIMB Brand & Core Identity
           ========================================= */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-base tracking-wide text-white">
                PRATIBIMB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-tight">Personal AI Operating Layer</p>
          </div>
        </div>

        {/* =========================================
            CENTER: Unified Streamlined Navigation
           ========================================= */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MainTabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold shadow-inner shadow-white/5 border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =========================================
            RIGHT: Compact User Identity & Status
           ========================================= */}
        <div className="flex items-center gap-2 relative">
          {/* User Pill with live indicator */}
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
          >
            <CanonicalAvatar config={avatarConfig} size="xs" mode="2d" showAura={false} />
            <span className="font-semibold text-slate-200">{userName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Twin Live" />
            <span className="text-[10px] font-mono text-cyan-300/80 hidden sm:inline">Lvl {twinEvolutionLevel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Compact Dropdown Menu */}
          {showUserMenu && (
            <div 
              className="absolute right-0 top-12 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn text-xs space-y-1"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button
                onClick={() => {
                  setActiveTab('avatar');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Customize Avatar</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('twin');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-violet-400" />
                <span>My Digital Twin</span>
              </button>

              {onSignOut && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 flex items-center gap-2 cursor-pointer border-t border-slate-800 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Row */}
      <div className="md:hidden flex items-center justify-start gap-1 px-4 py-1.5 bg-[#030712] border-t border-slate-800/80 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MainTabType)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
