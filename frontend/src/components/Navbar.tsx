import React from 'react';
import { 
  Sparkles, Home, Bot, User, Database, Target, Flame, LogOut 
} from 'lucide-react';
import type { AvatarConfig } from '../types';
import { CanonicalAvatar } from './CanonicalAvatar';

export type MainTabType = 'dashboard' | 'chat' | 'twin' | 'memory' | 'goals' | 'habits' | 'avatar' | 'vision';

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
  userName,
  avatarConfig = {},
  onSignOut
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, color: 'text-cyan-400' },
    { id: 'chat', label: 'AI Core', icon: Bot, color: 'text-indigo-400' },
    { id: 'twin', label: 'Digital Twin', icon: User, color: 'text-violet-400' },
    { id: 'memory', label: 'Memory', icon: Database, color: 'text-pink-400' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'text-emerald-400' },
    { id: 'habits', label: 'Focus', icon: Flame, color: 'text-amber-400' },
    { id: 'avatar', label: 'Avatar', icon: Sparkles, color: 'text-cyan-400' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#030712]/90 backdrop-blur-2xl shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xl tracking-wider bg-gradient-to-r from-white via-cyan-100 to-indigo-300 bg-clip-text text-transparent">
                PRATIBIMB
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Lvl {twinEvolutionLevel} Twin
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">Personal AI Operating Layer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MainTabType)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator, User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {userName && (
            <div 
              onClick={() => setActiveTab('avatar')}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 cursor-pointer transition-colors"
              title="View / Edit Your Avatar"
            >
              <CanonicalAvatar config={avatarConfig} size="xs" mode="2d" showAura={false} />
              <span className="font-semibold text-slate-200">{userName}</span>
            </div>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              title="Sign Out of PRATIBIMB"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline font-mono">Twin Live</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center justify-start gap-1 px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MainTabType)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                activeTab === item.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
