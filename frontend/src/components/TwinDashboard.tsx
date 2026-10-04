import React, { useState } from 'react';
import { 
  Target, CheckCircle2, Database, Flame, 
  Sparkles, User, MessageSquare, Zap
} from 'lucide-react';
import type { DigitalTwin } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface TwinDashboardProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onOpenCalibration: () => void;
}

export const TwinDashboard: React.FC<TwinDashboardProps> = ({
  twin,
  onRefresh,
  onNavigateTab,
}) => {
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(twin.state.energy_level);
  const [updatingEnergy, setUpdatingEnergy] = useState(false);

  const handleUpdateEnergy = async (newVal: number) => {
    try {
      setUpdatingEnergy(true);
      await api.updateEnergy(newVal);
      setSelectedEnergy(newVal);
      setShowEnergyModal(false);
      onRefresh();
    } catch (e) {
      console.error('Failed to update energy level', e);
    } finally {
      setUpdatingEnergy(false);
    }
  };

  const { profile, state, goals, tasks, habits, memories } = twin;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const activeGoals = goals.filter((g) => g.progress < 100);
  const avatarConfig = profile.avatar_config || {};

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Real Twin Signals derived exclusively from actual data
  const getRealTwinSignals = () => {
    const signals: { id: string; label: string; detail: string; actionTab?: string; actionPrompt?: string }[] = [];
    
    if (state.current_focus) {
      signals.push({
        id: 'focus-sig',
        label: 'Current Primary Focus',
        detail: `Your cognitive direction is currently aligned with ${state.current_focus}.`,
        actionTab: 'chat',
        actionPrompt: `Let's discuss my focus on: ${state.current_focus}`,
      });
    }

    if (activeGoals.length > 0) {
      signals.push({
        id: 'goal-sig',
        label: `${activeGoals.length} Active ${activeGoals.length === 1 ? 'Goal' : 'Goals'}`,
        detail: `Working toward "${activeGoals[0].title}" (${activeGoals[0].progress}% complete).`,
        actionTab: 'goals',
      });
    } else {
      signals.push({
        id: 'no-goal-sig',
        label: 'No Strategic Goals Defined',
        detail: 'Define your first goal to help your Digital Twin align tasks and insights.',
        actionTab: 'goals',
      });
    }

    if (pendingTasks.length > 0) {
      signals.push({
        id: 'task-sig',
        label: `${pendingTasks.length} Pending ${pendingTasks.length === 1 ? 'Task' : 'Tasks'}`,
        detail: `Next in queue: "${pendingTasks[0].title}" (~${pendingTasks[0].estimated_minutes || 30} min).`,
        actionTab: 'goals',
      });
    } else {
      signals.push({
        id: 'no-task-sig',
        label: 'Task Queue Clear',
        detail: 'All tasks are completed. You can define new priorities or start a focus block.',
        actionTab: 'goals',
      });
    }

    if (memories.length > 0) {
      signals.push({
        id: 'mem-sig',
        label: `${memories.length} Memory ${memories.length === 1 ? 'Node' : 'Nodes'} Indexed`,
        detail: `Latest reflection: "${memories[0].content.substring(0, 65)}..."`,
        actionTab: 'memory',
      });
    }

    return signals.slice(0, 3);
  };

  const realSignals = getRealTwinSignals();
  const currentFocusText = state.current_focus || profile.title || 'General Knowledge & Flow';

  // Handle interactive 3D constellation node clicks
  const handleConstellationNodeClick = (nodeType: 'goals' | 'tasks' | 'memory' | 'habits' | 'avatar' | 'chat') => {
    if (nodeType === 'goals' || nodeType === 'tasks') onNavigateTab('goals');
    else if (nodeType === 'memory') onNavigateTab('memory');
    else if (nodeType === 'habits') onNavigateTab('habits');
    else if (nodeType === 'avatar') onNavigateTab('avatar');
    else if (nodeType === 'chat') onNavigateTab('chat');
  };

  return (
    <div className="space-y-14 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-20">
      
      {/* ========================================================
          1. HERO CENTERPIECE: OPEN CINEMATIC DIGITAL TWIN ENVIRONMENT
         ======================================================== */}
      <div className="relative pt-1 sm:pt-3 pb-6 lg:pb-8 overflow-visible">
        {/* Deep Spatial Glow Fields (Focused Behind Digital Twin) */}
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-violet-600/6 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Hero Narrative & Actions (50% desktop width) */}
          <div className="space-y-5 max-w-xl text-center lg:text-left z-10">
            
            {/* Identity Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-md shadow-cyan-950/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span>DIGITAL TWIN • PERSONAL AI</span>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.1rem] font-black tracking-tight text-white leading-[1.12]">
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent">
                  {profile.name}
                </span>.
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                Your living AI reflection that models your goals, memories, habits, and cognitive focus in real time.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-normal max-w-md mx-auto lg:mx-0">
                Connected to your personal AI Core — reasoning over who you are and what you aim to achieve.
              </p>
            </div>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => onNavigateTab('chat', 'What should I focus on next?')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Talk to AI Core</span>
              </button>

              <button
                onClick={() => onNavigateTab('twin')}
                className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-violet-400" />
                <span>Open Digital Twin</span>
              </button>

              <button
                onClick={() => onNavigateTab('avatar')}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                title="Customize Avatar"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Customize</span>
              </button>
            </div>

            {/* Quick Context Bar */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Twin Synced</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span className="text-slate-500">Focus:</span>{' '}
                <span className="text-slate-300 font-medium">{state.current_focus || 'General Exploration'}</span>
              </div>
            </div>

          </div>

          {/* Right Centerpiece: Large 3D Digital Twin with Spatial HUD Panels (50% desktop width) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
            
            {/* Floating Top-Right HUD Badge: Twin Focus & Energy */}
            <div className="hidden sm:flex absolute -top-1 right-6 z-20 items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl animate-fadeIn">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Twin Capacity</div>
                <div className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{state.energy_level}% Energy</span>
                </div>
              </div>
              <button
                onClick={() => setShowEnergyModal(true)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-semibold cursor-pointer transition-colors"
              >
                Check in
              </button>
            </div>

            {/* Floating Bottom-Left HUD Badge: Active Direction */}
            <div className="hidden sm:flex absolute bottom-6 -left-1 z-20 flex-col gap-0.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl max-w-[200px] animate-fadeIn">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                <span>Strategic Alignment</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {activeGoals.length > 0 ? activeGoals[0].title : 'Defining priorities'}
              </div>
              <div className="text-[10px] text-slate-400">
                {activeGoals.length > 0 ? `${activeGoals[0].progress}% completion` : 'Ready to set goals'}
              </div>
            </div>

            {/* 3D Canvas Container */}
            <div className="w-full h-80 sm:h-96 lg:h-[460px] relative flex items-center justify-center">
              <CanonicalAvatar
                config={avatarConfig}
                size="hero"
                mode="3d"
                showAura={true}
                showNodes={true}
                nodeData={{
                  goalsCount: goals.length,
                  goalsSummary: activeGoals.length > 0 ? activeGoals[0].title : 'No active goals',
                  memoriesCount: memories.length,
                  memoriesSummary: memories.length > 0 ? `${memories.length} memories indexed` : 'Clean memory vault',
                  habitsCount: habits.length,
                  habitsSummary: habits.length > 0 ? `${habits.filter(h => h.completed_today).length}/${habits.length} habits done today` : 'No habits tracked',
                  tasksCount: pendingTasks.length,
                  tasksSummary: pendingTasks.length > 0 ? pendingTasks[0].title : 'All tasks cleared',
                }}
                onNodeClick={handleConstellationNodeClick}
              />
            </div>
            
            {/* Identity Subtitle Bar */}
            <div className="text-center mt-1 flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
              <span className="text-xs font-bold text-slate-200 tracking-wide">{profile.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-cyan-300 font-medium">{profile.title || 'Digital Twin'}</span>
              <span className="text-slate-600">•</span>
              <button 
                onClick={() => setShowEnergyModal(true)}
                className="text-[11px] text-amber-300 font-mono hover:text-amber-200 cursor-pointer flex items-center gap-1 transition-colors"
                title="Update Energy Level"
              >
                <Zap className="w-3 h-3" />
                <span>{state.energy_level}%</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          SECTION 1: YOUR DIGITAL STATE (Compact Intelligent Summaries)
         ======================================================== */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Your Digital State</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Goals Summary */}
          <div 
            onClick={() => onNavigateTab('goals')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-cyan-400" /> Goals
                </span>
                <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
              </div>
              <div className="text-xl font-bold text-white">
                {activeGoals.length === 0 ? 'No goals yet' : `${activeGoals.length} active`}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              {activeGoals.length > 0 ? `→ ${activeGoals[0].title}` : 'Define a goal'}
            </div>
          </div>

          {/* Tasks Summary */}
          <div 
            onClick={() => onNavigateTab('goals')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" /> Tasks
                </span>
                <span className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors">→</span>
              </div>
              <div className="text-xl font-bold text-white">
                {pendingTasks.length === 0 ? "You're all clear" : `${pendingTasks.length} pending`}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              {pendingTasks.length > 0 ? `→ ${pendingTasks[0].title}` : 'Task space clear'}
            </div>
          </div>

          {/* Memory Summary */}
          <div 
            onClick={() => onNavigateTab('memory')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-pink-400" /> Memory
                </span>
                <span className="text-xs text-slate-500 group-hover:text-pink-400 transition-colors">→</span>
              </div>
              <div className="text-xl font-bold text-white">
                {memories.length === 0 ? 'Nothing stored yet' : `${memories.length} stored`}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              {memories.length > 0 ? `Latest: ${memories[0].content.substring(0, 30)}...` : 'Log reflections'}
            </div>
          </div>

          {/* Habits Summary */}
          <div 
            onClick={() => onNavigateTab('habits')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Habits
                </span>
                <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors">→</span>
              </div>
              <div className="text-xl font-bold text-white">
                {habits.length === 0 ? 'No habits yet' : `${habits.filter(h => h.completed_today).length}/${habits.length} today`}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              {habits.length > 0 ? `Streak active` : 'Track daily rituals'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: TWIN STATE (Compact Visual Indicators)
         ======================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Twin State</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">CURRENT FOCUS</span>
            <div className="text-sm font-bold text-cyan-300 truncate">{currentFocusText}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">ENERGY</span>
            <div className="text-sm font-bold text-amber-300 font-mono">{state.energy_level}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">ACTIVE GOAL</span>
            <div className="text-sm font-bold text-emerald-300">{activeGoals.length} Active</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">TODAY</span>
            <div className="text-sm font-bold text-slate-200">
              {pendingTasks.length > 0 ? `${pendingTasks.length} tasks pending` : 'All tasks done'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 3 & 4: TWIN SIGNALS & QUICK ACTIONS
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (7 Cols): Twin Signals (Real Human-Language Observations) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Twin Signals</h2>
          <div className="space-y-3">
            {realSignals.map((sig) => (
              <div 
                key={sig.id}
                onClick={() => sig.actionTab && onNavigateTab(sig.actionTab, sig.actionPrompt)}
                className="p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {sig.label}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sig.detail}</p>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 Cols): Clean Action Row */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('chat')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Talk to AI Core</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Direct reasoning</div>
            </button>

            <button
              onClick={() => onNavigateTab('twin')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
            >
              <User className="w-4 h-4 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Open Digital Twin</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Knowledge graph</div>
            </button>

            <button
              onClick={() => onNavigateTab('avatar')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Customize Avatar</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Identity look</div>
            </button>

            <button
              onClick={() => onNavigateTab('habits')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
            >
              <Flame className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Start Focus</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Session block</div>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ENERGY MODAL
         ======================================================== */}
      {showEnergyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Energy State Check-in
              </h3>
              <button
                onClick={() => setShowEnergyModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Self-report your current cognitive capacity. Your Digital Twin uses this to adjust task recommendations.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center font-mono">
                <span className="text-xs text-slate-400">Energy Level</span>
                <span className="text-base text-amber-300 font-bold">{selectedEnergy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Low)</span>
                <span>50% (Moderate)</span>
                <span>100% (Peak Flow)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEnergyModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={updatingEnergy}
                onClick={() => handleUpdateEnergy(selectedEnergy)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                {updatingEnergy ? 'Saving...' : 'Save Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
