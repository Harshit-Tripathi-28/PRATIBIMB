import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bot, Database, Share2, Sliders, Brain,
  Target, Flame, User, Camera, ArrowRight, Sparkles, History, Compass
} from 'lucide-react';
import { api } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onRefreshTwin: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'COGNITION' | 'MEMORY' | 'SIMULATION' | 'ACTION';
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onRefreshTwin,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      setActionFeedback(null);
    }
  }, [isOpen]);

  const actions: PaletteAction[] = [
    {
      id: 'portal',
      title: 'Open PRATIBIMB Portal',
      category: 'NAVIGATION',
      description: 'Primary product gateway and living digital twin hero',
      icon: Sparkles,
      shortcut: '⌘0',
      action: () => {
        onNavigateTab('portal');
        onClose();
      },
    },
    {
      id: 'chat-general',
      title: 'Ask AI Core Cognitive Question',
      category: 'COGNITION',
      description: 'Consult your digital twin multi-hop reasoning orchestrator',
      icon: Bot,
      shortcut: '⌘1',
      action: () => {
        onNavigateTab('intelligence', 'Synthesize my top priorities and optimal focus trajectory.');
        onClose();
      },
    },
    {
      id: 'insights',
      title: 'Inspect Cognitive Insights & Signals',
      category: 'COGNITION',
      description: 'View grounded causal context and signal attributions',
      icon: Brain,
      shortcut: '⌘2',
      action: () => {
        onNavigateTab('insights');
        onClose();
      },
    },
    {
      id: 'lifegraph',
      title: 'Explore Personal World Model',
      category: 'NAVIGATION',
      description: 'Navigate multidimensional semantic network and GNN graph',
      icon: Share2,
      shortcut: '⌘3',
      action: () => {
        onNavigateTab('lifegraph');
        onClose();
      },
    },
    {
      id: 'simulation',
      title: 'Run Future State Simulation',
      category: 'SIMULATION',
      description: 'Forecast goal progress, velocity, and burnout risk',
      icon: Sliders,
      shortcut: '⌘4',
      action: () => {
        onNavigateTab('simulation');
        onClose();
      },
    },
    {
      id: 'memory-search',
      title: 'Search Neural Memory Vault',
      category: 'MEMORY',
      description: 'Search episodic, semantic, and 2D projected space',
      icon: Database,
      shortcut: '⌘5',
      action: () => {
        onNavigateTab('memory');
        onClose();
      },
    },
    {
      id: 'goals',
      title: 'Manage Goals & Trajectory',
      category: 'NAVIGATION',
      description: 'Track horizons, milestones, and execution velocity',
      icon: Target,
      action: () => {
        onNavigateTab('goals');
        onClose();
      },
    },
    {
      id: 'focus-log',
      title: 'Log Focus Session',
      category: 'ACTION',
      description: 'Record a deep work interval and cognitive rhythm',
      icon: Flame,
      action: () => {
        onNavigateTab('focus');
        onClose();
      },
    },
    {
      id: 'timeline',
      title: 'Open Temporal Twin Timeline',
      category: 'NAVIGATION',
      description: 'View computational state evolution and state history',
      icon: History,
      action: () => {
        onNavigateTab('timeline');
        onClose();
      },
    },
    {
      id: 'capture-snapshot',
      title: 'Capture Instant State Anchor',
      category: 'ACTION',
      description: 'Record current 64D vector and operational state to history',
      icon: Camera,
      action: async () => {
        try {
          setActionFeedback('Capturing state anchor...');
          await api.triggerStateSnapshot('Command Palette Trigger');
          setActionFeedback('✓ State anchor recorded.');
          onRefreshTwin();
          setTimeout(() => onClose(), 800);
        } catch (e) {
          setActionFeedback('Failed to capture snapshot.');
        }
      },
    },
    {
      id: 'inspect-twin',
      title: 'Inspect Digital Twin Identity',
      category: 'NAVIGATION',
      description: 'Examine 64D latent representation, entropy, and coherence',
      icon: User,
      action: () => {
        onNavigateTab('twin');
        onClose();
      },
    },
    {
      id: 'command-center',
      title: 'Open Spatial Command Center',
      category: 'NAVIGATION',
      description: 'Deep operational layer and neural environment',
      icon: Compass,
      action: () => {
        onNavigateTab('core');
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((act) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      act.title.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020307]/85 backdrop-blur-md flex items-start justify-center pt-20 px-4 sm:px-6 font-sans">
      <div 
        className="w-full max-w-2xl bg-[#070A12] border border-[#E51D48]/30 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
        onKeyDown={handleKeyDown}
      >
        {/* Command Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#0B132B]/80">
          <Search className="w-4 h-4 text-[#FF365C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search subsystem (e.g. 'simulate', 'memory', 'goals')..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-black/40 text-[9px] font-mono text-slate-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="px-4 py-2 bg-[#8B0F24]/30 border-b border-[#E51D48]/30 text-xs font-mono text-[#FF365C]">
            {actionFeedback}
          </div>
        )}

        {/* Command Actions List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No matching command found. Press ESC to exit.
            </div>
          ) : (
            filteredActions.map((act, idx) => {
              const Icon = act.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={act.id}
                  onClick={() => act.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E51D48]/15 text-white shadow-sm border border-[#E51D48]/40'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#E51D48]/30 text-white' : 'bg-[#0B132B] text-slate-300'}`}>
                      <Icon className="w-4 h-4 text-[#FF365C]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                        <span>{act.title}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0B132B] text-[#FF365C] border border-[#E51D48]/20">
                          {act.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate font-sans">
                        {act.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {act.shortcut && (
                      <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0B132B] text-slate-400 border border-white/10">
                        {act.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#1E7BFF] animate-pulse" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#04060C] text-[10px] font-mono text-slate-500">
          <span>Navigate: ↑ ↓ • Select: ↵</span>
          <span className="text-[#FF365C]">PRATIBIMB OS // NEURAL INTERFACE</span>
        </div>
      </div>
    </div>
  );
};
