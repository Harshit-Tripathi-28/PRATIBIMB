import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  X,
  Target,
  Database,
  Sliders,
  Send,
  Cpu,
  Share2,
  Flame,
  Maximize2,
} from 'lucide-react';
import type {
  DigitalTwin,
  LatentStateVector,
  CognitiveInsight,
} from '../types';
import { api } from '../services/api';
import { ChakraCore3D } from './ChakraCore3D';
import { NeuralCoreInspector } from './NeuralCoreInspector';

interface SpatialCommandCenterProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onOpenCalibration: () => void;
}

export const SpatialCommandCenter: React.FC<SpatialCommandCenterProps> = ({
  twin,
  onRefresh,
  onNavigateTab,
  onOpenCalibration: _onOpenCalibration,
}) => {
  const [commandInput, setCommandInput] = useState<string>('');
  const [isConsoleFocused, setIsConsoleFocused] = useState<boolean>(false);
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [cognitiveInsights, setCognitiveInsights] = useState<CognitiveInsight[]>([]);
  const [showEnergyModal, setShowEnergyModal] = useState<boolean>(false);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(twin.state.energy_level);
  const [updatingEnergy, setUpdatingEnergy] = useState<boolean>(false);
  const [hoveredSubsystem, setHoveredSubsystem] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [stateVec, insights] = await Promise.all([
          api.getLatentStateVector().catch(() => null),
          api.getCognitiveInsights().catch(() => []),
        ]);
        if (stateVec) setLatentState(stateVec);
        if (insights && insights.length > 0) setCognitiveInsights(insights);
      } catch (e) {
        console.error('Failed to load command center state', e);
      }
    };
    loadState();
  }, [twin.state.last_updated]);

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

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const prompt = commandInput.trim();
    setCommandInput('');
    onNavigateTab('intelligence', prompt);
  };

  const operationalState = twin.state.operational_state || 'ACTIVE';
  const dominantCluster = latentState?.dominant_cluster || 'Active Synthesis';
  const coherencePct = latentState ? Math.round(latentState.semantic_coherence * 100) : 88;
  const primaryGoal = twin.goals.find((g) => g.progress < 100) || twin.goals[0];
  const activeTask = twin.tasks.find((t) => t.status === 'in_progress') || twin.tasks.find((t) => t.status !== 'completed');

  const topInsight = cognitiveInsights.length > 0
    ? cognitiveInsights[0]
    : {
        id: 'default',
        title: 'Focus Alignment Optimal',
        statement: 'Current focus cadence aligns with primary architectural milestones.',
        category: 'FOCUS',
        confidence: 0.92,
        epistemic_level: 'OBSERVATION' as const,
        explanation: {
          observed_change: 'Sustained focus cadence',
          supporting_signals: [],
          related_context: '',
          interpretation: '',
          confidence: 0.92,
        },
        evidence_signals: [],
        affected_entities: [],
        timestamp: 'Just now',
      };

  const quickPrompts = [
    'Synthesize current priorities',
    'Simulate next week trajectory',
    'Diagnose focus bottlenecks',
    'Review neural memory clusters',
  ];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] md:h-screen flex flex-col justify-between select-none bg-[#020307] text-[#F4F7FF] overflow-hidden font-sans">
      
      {/* Background illumination */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 30%, rgba(229, 29, 72, 0.07) 0%, rgba(18, 59, 115, 0.05) 40%, rgba(2, 3, 7, 0) 80%),
            radial-gradient(circle at 15% 40%, rgba(30, 123, 255, 0.04) 0%, rgba(2, 3, 7, 0) 50%),
            radial-gradient(circle at 85% 40%, rgba(255, 54, 92, 0.035) 0%, rgba(2, 3, 7, 0) 50%)
          `,
        }}
      />

      {/* ZONE 1: FIXED SYSTEM HEADER */}
      <header className="h-14 sm:h-16 shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-white/10 bg-[#070A12]/90 backdrop-blur-2xl z-30">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF365C] animate-pulse shadow-sm shadow-red-500" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-widest text-white uppercase font-sans">
              PRATIBIMB
            </span>
            <span className="text-[9px] font-mono tracking-wider text-[#FF365C] uppercase font-bold">
              NEURAL COMMAND LAYER
            </span>
          </div>
        </div>

        {/* Center: Neural Core Status */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#04060C] border border-[#E51D48]/30 text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase">NEURAL CORE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF365C] animate-pulse" />
          <span className="text-[#FF365C] font-bold text-[10px]">{operationalState}</span>
        </div>

        {/* Right: Telemetry & Energy Check-in */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px]">
            <span>COHERENCE <strong className="text-[#48D7FF]">{coherencePct}%</strong></span>
            <span className="text-slate-700">•</span>
            <span>DOMINANT <strong className="text-white">{dominantCluster}</strong></span>
          </div>

          <button
            onClick={() => setIsInspectorOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect Core</span>
          </button>

          <button
            onClick={() => setShowEnergyModal(true)}
            className="px-2.5 py-1 rounded-xl bg-[#070A12] hover:bg-[#0c0a1a] border border-[#E51D48]/30 text-[#FF365C] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Update Mental Bandwidth"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{twin.state.energy_level}%</span>
          </button>
        </div>
      </header>

      {/* ZONE 2: MAIN STAGE */}
      <div className="flex-1 w-full relative grid grid-cols-1 lg:grid-cols-12 items-center px-4 sm:px-6 lg:px-8 py-2 overflow-hidden gap-4 z-10">
        
        {/* LEFT CONTEXT COLUMN */}
        <div className="hidden lg:flex flex-col gap-3 justify-center z-20 col-span-3 max-w-[280px]">
          
          {/* Current State Glass Panel */}
          <div className="p-4 rounded-3xl bg-[#070A12]/90 border border-white/10 hover:border-[#E51D48]/30 backdrop-blur-2xl shadow-2xl space-y-3 transition-all duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E51D48]/15 border border-[#E51D48]/30 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#FF365C]" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">STATE TENSOR</div>
                  <div className="text-xs font-bold text-white">{twin.profile.name}</div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#E51D48]/15 text-[#FF365C] font-bold">
                {operationalState}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Active Focus:</span>
                <span className="text-[#48D7FF] font-medium truncate max-w-[130px]">{twin.state.current_focus}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Latent Cluster:</span>
                <span className="text-slate-200">{dominantCluster}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Entropy:</span>
                <span className="text-[#FF365C] font-bold">{Math.round((latentState?.entropy ?? 0.22) * 100)}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>64D EMBEDDING DIMS</span>
              <button 
                onClick={() => setIsInspectorOpen(true)}
                className="text-[#FF365C] hover:underline cursor-pointer font-bold"
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Active Goal / Trajectory */}
          {primaryGoal && (
            <div 
              onClick={() => onNavigateTab('goals')}
              className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 hover:border-[#E51D48]/30 backdrop-blur-2xl shadow-2xl space-y-2 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                <span className="flex items-center gap-1.5 text-[#FF365C] font-bold">
                  <Target className="w-3 h-3" />
                  PRIMARY TRAJECTORY
                </span>
                <span className="text-white font-bold">{primaryGoal.progress}%</span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#FF365C] transition-colors truncate">
                {primaryGoal.title}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] rounded-full transition-all duration-500"
                  style={{ width: `${primaryGoal.progress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* CENTER STAGE: 3D LIVING DIGITAL TWIN & CHAKRA */}
        <div className="col-span-1 lg:col-span-6 relative flex flex-col items-center justify-center h-full min-h-[380px] sm:min-h-[460px]">
          
          <div className="w-full h-[360px] sm:h-[440px]">
            <ChakraCore3D
              operationalState={operationalState}
              latentState={latentState}
              activeStageIndex={0}
              hoveredLayerId={hoveredSubsystem}
              className="w-full h-full"
            />
          </div>

          {/* Quick Subsystem Selector Under Core */}
          <div className="flex items-center gap-2 mt-2 z-20">
            {[
              { id: 'memory', label: 'Memory', tab: 'memory', icon: Database },
              { id: 'goals', label: 'Goals', tab: 'goals', icon: Target },
              { id: 'world', label: 'World', tab: 'lifegraph', icon: Share2 },
              { id: 'behavior', label: 'Rhythm', tab: 'focus', icon: Flame },
              { id: 'simulation', label: 'Sim', tab: 'simulation', icon: Sliders },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onMouseEnter={() => setHoveredSubsystem(s.id)}
                  onMouseLeave={() => setHoveredSubsystem(null)}
                  onClick={() => onNavigateTab(s.tab)}
                  className="px-2.5 py-1 rounded-xl bg-[#070A12]/80 hover:bg-[#0c0a1a] border border-white/10 hover:border-[#E51D48]/40 text-xs font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xl"
                >
                  <Icon className="w-3 h-3 text-[#FF365C]" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT CONTEXT COLUMN */}
        <div className="hidden lg:flex flex-col gap-3 justify-center z-20 col-span-3 max-w-[280px]">
          
          {/* Top Cognitive Signal */}
          <div 
            onClick={() => onNavigateTab('insights')}
            className="p-4 rounded-3xl bg-[#070A12]/90 border border-white/10 hover:border-[#1E7BFF]/40 backdrop-blur-2xl shadow-2xl space-y-2.5 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="flex items-center gap-1.5 text-[#1E7BFF] font-bold uppercase">
                <Cpu className="w-3 h-3" />
                NEURAL SIGNAL
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#1E7BFF]/15 text-[#48D7FF] font-bold">
                {topInsight.epistemic_level}
              </span>
            </div>
            <div className="text-xs font-bold text-white group-hover:text-[#48D7FF] transition-colors leading-snug">
              {topInsight.title}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
              {topInsight.statement}
            </p>
          </div>

          {/* Next Action / Priority Task */}
          {activeTask && (
            <div 
              onClick={() => onNavigateTab('goals')}
              className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 hover:border-[#E51D48]/30 backdrop-blur-2xl shadow-2xl space-y-2 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                <span className="text-[#FF365C] font-bold">NEXT ACTION</span>
                <span className="text-amber-400 font-bold uppercase">{activeTask.priority}</span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#FF365C] transition-colors truncate">
                {activeTask.title}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Category: {activeTask.category || 'Deep Work'}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ZONE 3: COMMAND CONSOLE & QUICK PROMPTS DOCK */}
      <footer className="shrink-0 p-4 sm:px-8 border-t border-white/10 bg-[#070A12]/90 backdrop-blur-2xl z-30 space-y-2">
        <form onSubmit={handleCommandSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onFocus={() => setIsConsoleFocused(true)}
              onBlur={() => setIsConsoleFocused(false)}
              placeholder="Ask, simulate, or instruct your Neural Core (e.g. 'Synthesize today's focus and goal velocity')..."
              className={`w-full bg-[#04060C] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner border ${
                isConsoleFocused ? 'border-[#E51D48] shadow-lg shadow-red-950/30' : 'border-white/10'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={!commandInput.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs shadow-md shadow-red-950/40 disabled:opacity-30 cursor-pointer flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Execute</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onNavigateTab('intelligence', p)}
              className="px-2.5 py-0.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-400 hover:text-white border border-white/5 hover:border-[#E51D48]/30 transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </footer>

      {/* Energy Check-in Modal */}
      {showEnergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase">Calibrate Cognitive Energy</h3>
              </div>
              <button onClick={() => setShowEnergyModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Current Bandwidth:</span>
                <span className="text-amber-400 font-bold text-sm">{selectedEnergy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(Number(e.target.value))}
                className="w-full accent-[#E51D48] bg-[#04060C] rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEnergyModal(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateEnergy(selectedEnergy)}
                disabled={updatingEnergy}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] to-[#E51D48] text-white font-bold text-xs shadow-md shadow-red-950/40 cursor-pointer"
              >
                {updatingEnergy ? 'Updating...' : 'Save Energy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neural Core Inspector Modal */}
      <NeuralCoreInspector
        twin={twin}
        latentState={latentState}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onNavigateTab={onNavigateTab}
      />

    </div>
  );
};
