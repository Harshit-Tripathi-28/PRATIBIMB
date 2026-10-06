import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Share2,
  Database,
  Target,
  Flame,
  Sliders,
  Brain,
  History,
  User,
  Compass,
  Command,
  LogOut,
} from 'lucide-react';
import type { AvatarConfig } from '../types';

export type OSViewTab =
  | 'portal'
  | 'intelligence'
  | 'lifegraph'
  | 'memory'
  | 'goals'
  | 'focus'
  | 'simulation'
  | 'insights'
  | 'timeline'
  | 'twin'
  | 'core';

interface NavigationRailProps {
  activeTab: OSViewTab;
  setActiveTab: (tab: OSViewTab) => void;
  onOpenCommandPalette: () => void;
  userName?: string;
  avatarConfig?: AvatarConfig;
  operationalState?: string;
  onSignOut?: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  userName = 'Harshit',
  operationalState = 'ACTIVE',
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // All 11 PRATIBIMB Navigation Modules
  const primaryNavItems: { id: OSViewTab; label: string; icon: React.ElementType; tag: string }[] = [
    { id: 'portal', label: 'Portal Home', icon: Sparkles, tag: 'PORTAL' },
    { id: 'intelligence', label: 'AI Cognition', icon: Bot, tag: 'AI' },
    { id: 'lifegraph', label: 'World Model', icon: Share2, tag: 'WORLD' },
    { id: 'memory', label: 'Memory Vault', icon: Database, tag: 'MEMORY' },
    { id: 'goals', label: 'Goals / Trajectory', icon: Target, tag: 'GOALS' },
    { id: 'focus', label: 'Focus / Rituals', icon: Flame, tag: 'FOCUS' },
    { id: 'simulation', label: 'Simulation Lab', icon: Sliders, tag: 'SIM' },
    { id: 'insights', label: 'Insights', icon: Brain, tag: 'INSIGHTS' },
    { id: 'timeline', label: 'Timeline', icon: History, tag: 'TIMELINE' },
    { id: 'twin', label: 'Digital Twin', icon: User, tag: 'TWIN' },
    { id: 'core', label: 'Command Center', icon: Compass, tag: 'CORE' },
  ];

  return (
    <>
      {/* =========================================================================
          DESKTOP PERSISTENT NAVIGATION RAIL (LEFT)
         ========================================================================= */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 hover:w-56 bg-[#05050a]/95 hover:bg-[#070812] backdrop-blur-2xl border-r border-white/10 z-40 transition-all duration-300 flex-col justify-between py-4 px-2.5 group select-none shadow-2xl overflow-y-auto overflow-x-hidden scrollbar-none">
        
        {/* Top: Brand Symbol & Command Palette */}
        <div className="space-y-3.5">
          <div 
            onClick={() => setActiveTab('portal')}
            className="flex items-center gap-3 px-1.5 py-1 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c33cff] to-[#6c4dff] p-0.5 shadow-lg shadow-violet-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0c0a1a] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#c33cff]" />
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
              <div className="font-extrabold text-xs tracking-wider text-white uppercase font-sans">PRATIBIMB</div>
              <div className="text-[9px] font-mono text-violet-400 uppercase">DIGITAL TWIN</div>
            </div>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#140f2d]/60 hover:bg-[#140f2d] border border-white/5 hover:border-violet-500/30 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Command Palette (⌘K)"
          >
            <Command className="w-4 h-4 text-[#c33cff] shrink-0 mx-auto group-hover:mx-0" />
            <div className="hidden group-hover:flex items-center justify-between flex-1 text-xs font-mono text-slate-300">
              <span>Command</span>
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-violet-300">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Center: All 11 Navigation Modules */}
        <nav className="space-y-1 my-3">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-all relative group/item ${
                  isActive
                    ? 'bg-violet-500/15 text-[#f5f7ff] font-medium border border-violet-500/30 shadow-md shadow-violet-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="w-7 flex justify-center shrink-0">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#c33cff]' : 'text-slate-400 group-hover/item:text-slate-200'}`} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-between flex-1 pr-1 text-xs font-sans">
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>

                {/* Subtle active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-[#c33cff] shadow-[0_0_8px_#c33cff]" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: User Persona Status */}
        <div className="space-y-2 pt-2.5 border-t border-white/5 relative">
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#c33cff] to-[#22d3ee] flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-950">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-xs">
              <div className="font-medium text-slate-200 truncate">{userName}</div>
              <div className="text-[9px] font-mono text-[#22d3ee] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                <span>{operationalState}</span>
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          {showUserDropdown && (
            <div className="absolute left-14 bottom-2 w-48 bg-[#0c0a1a] border border-violet-500/30 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-3xl animate-fadeIn">
              <div
                onClick={() => {
                  setActiveTab('twin');
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#c33cff]" />
                <span>Twin Identity</span>
              </div>
              {onSignOut && (
                <div
                  onClick={() => {
                    setShowUserDropdown(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </div>
              )}
            </div>
          )}
        </div>

      </aside>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (FOR PHONES / TABLETS)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#05050a]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2">
        {primaryNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#c33cff]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-mono">{item.tag}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
