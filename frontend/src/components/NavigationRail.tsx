import React, { useState } from 'react';
import {
  Cpu,
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
  Sparkles,
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
    { id: 'memory', label: 'Memory Field', icon: Database, tag: 'MEMORY' },
    { id: 'goals', label: 'Goals / Trajectory', icon: Target, tag: 'GOALS' },
    { id: 'focus', label: 'Focus / Rituals', icon: Flame, tag: 'FOCUS' },
    { id: 'simulation', label: 'Simulation Lab', icon: Sliders, tag: 'SIM' },
    { id: 'insights', label: 'Cognitive Signals', icon: Brain, tag: 'INSIGHTS' },
    { id: 'timeline', label: 'Temporal Continuum', icon: History, tag: 'TIMELINE' },
    { id: 'twin', label: 'Identity Matrix', icon: User, tag: 'TWIN' },
    { id: 'core', label: 'Command Center', icon: Compass, tag: 'CORE' },
  ];

  return (
    <>
      {/* =========================================================================
          DESKTOP PERSISTENT NAVIGATION RAIL (LEFT)
         ========================================================================= */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 hover:w-56 bg-[#04060C]/95 hover:bg-[#070A12] backdrop-blur-2xl border-r border-white/10 z-40 transition-all duration-300 flex-col justify-between py-4 px-2.5 group select-none shadow-2xl overflow-y-auto overflow-x-hidden scrollbar-none font-sans">
        
        {/* Top: Brand Symbol & Command Palette */}
        <div className="space-y-3.5">
          <div 
            onClick={() => setActiveTab('portal')}
            className="flex items-center gap-3 px-1.5 py-1 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] p-0.5 shadow-lg shadow-red-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#04060C] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#FF365C]" />
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
              <div className="font-extrabold text-xs tracking-wider text-white uppercase font-sans">PRATIBIMB</div>
              <div className="text-[9px] font-mono text-[#FF365C] uppercase font-bold">NEURAL COSMOS</div>
            </div>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#070A12] hover:bg-[#0c0a1a] border border-white/5 hover:border-[#E51D48]/30 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Command Palette (⌘K)"
          >
            <Command className="w-4 h-4 text-[#FF365C] shrink-0 mx-auto group-hover:mx-0" />
            <div className="hidden group-hover:flex items-center justify-between flex-1 text-xs font-mono text-slate-300">
              <span>Command</span>
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Center: Module Navigation Links */}
        <nav className="space-y-1 my-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E51D48]/15 border border-[#E51D48]/40 text-white font-bold shadow-md shadow-red-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={item.label}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF365C] rounded-r-full shadow-sm shadow-red-500" />
                )}
                
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#FF365C]' : 'text-slate-400 group-hover:text-slate-300'
                }`} />

                <div className="hidden group-hover:flex items-center justify-between flex-1 text-xs whitespace-nowrap overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  <span className={`text-[8px] font-mono px-1 rounded ${
                    isActive ? 'bg-[#E51D48]/20 text-[#FF365C]' : 'text-slate-500'
                  }`}>
                    {item.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: User Identity & Operational State */}
        <div className="pt-2 border-t border-white/10 space-y-2 relative">
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-2xl bg-[#070A12] border border-white/5 hover:border-white/15 cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#8B0F24] to-[#1E7BFF] p-0.5 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#04060C] rounded-[9px] flex items-center justify-center font-bold text-xs text-white">
                {userName.charAt(0)}
              </div>
            </div>

            <div className="hidden group-hover:block overflow-hidden flex-1 leading-tight font-mono text-[11px]">
              <div className="font-bold text-white truncate">{userName}</div>
              <div className="text-[9px] text-[#FF365C] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF365C] animate-pulse" />
                <span>{operationalState}</span>
              </div>
            </div>
          </div>

          {/* User popup menu */}
          {showUserDropdown && (
            <div className="absolute left-14 bottom-0 w-44 rounded-2xl bg-[#070A12] border border-white/10 p-2 shadow-2xl z-50 animate-fadeIn backdrop-blur-2xl">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-500 border-b border-white/5 mb-1">
                {userName} • {operationalState}
              </div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onSignOut?.();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION DOCK
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#04060C]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2 shadow-2xl">
        {[
          { id: 'portal', label: 'Portal', icon: Sparkles },
          { id: 'intelligence', label: 'AI', icon: Bot },
          { id: 'lifegraph', label: 'World', icon: Share2 },
          { id: 'memory', label: 'Memory', icon: Database },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'core', label: 'Core', icon: Compass },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as OSViewTab)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#FF365C]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-mono font-bold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
