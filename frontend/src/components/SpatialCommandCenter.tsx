import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  User,
  X,
  Target,
  Database,
  Brain,
  Sliders,
  Send,
} from 'lucide-react';
import type {
  DigitalTwin,
  LatentStateVector,
  CognitiveInsight,
} from '../types';
import { api } from '../services/api';
import { NeuralSpatialEnvironment } from './NeuralSpatialEnvironment';

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
  onOpenCalibration,
}) => {
  const [commandInput, setCommandInput] = useState<string>('');
  const [isConsoleFocused, setIsConsoleFocused] = useState<boolean>(false);
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [cognitiveInsights, setCognitiveInsights] = useState<CognitiveInsight[]>([]);
  const [showTwinModal, setShowTwinModal] = useState<boolean>(false);
  const [showEnergyModal, setShowEnergyModal] = useState<boolean>(false);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(twin.state.energy_level);
  const [updatingEnergy, setUpdatingEnergy] = useState<boolean>(false);
  const [isTwinHovered, setIsTwinHovered] = useState<boolean>(false);
  const [isLeftPanelHovered, setIsLeftPanelHovered] = useState<boolean>(false);

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
  const dominantCluster = latentState?.dominant_cluster || 'Engineering Focus';
  const coherencePct = latentState ? Math.round(latentState.semantic_coherence * 100) : 72;
  const primaryGoal = twin.goals.find((g) => g.progress < 100) || twin.goals[0];
  const activeTask = twin.tasks.find((t) => t.status === 'in_progress') || twin.tasks.find((t) => t.status !== 'completed');
  const activeGoalsCount = twin.goals.filter((g) => g.progress < 100).length;

  const topInsight = cognitiveInsights.length > 0
    ? cognitiveInsights[0]
    : {
        id: 'default',
        title: 'Focus Alignment Aligned',
        statement: 'Your current focus pattern is progressing active architecture goals.',
        category: 'FOCUS',
        confidence: 0.94,
        epistemic_level: 'CONFIRMED',
        evidence_signals: [
          { metric_name: 'Focus Depth', delta_pct: 18, direction: 'increasing' },
          { metric_name: 'Task Velocity', delta_pct: 12, direction: 'increasing' },
          { metric_name: 'Goal Consistency', delta_pct: 0, direction: 'stable' },
        ],
        affected_entities: [],
      };

  const quickPrompts = [
    'What changed today?',
    'Synthesize current priorities',
    'Simulate my next week',
    'What should I focus on?',
  ];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] md:h-screen flex flex-col justify-between select-none bg-[#05050a] text-slate-100 overflow-hidden font-sans">
      
      {/* Background illumination */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 50% 25%, rgba(195, 60, 255, 0.06) 0%, rgba(108, 77, 255, 0.04) 35%, rgba(5, 5, 10, 0) 80%),
            radial-gradient(circle at 15% 35%, rgba(108, 77, 255, 0.03) 0%, rgba(5, 5, 10, 0) 50%),
            radial-gradient(circle at 85% 35%, rgba(34, 211, 238, 0.025) 0%, rgba(5, 5, 10, 0) 50%)
          `,
        }}
      />

      {/* ZONE 1: FIXED SYSTEM HEADER */}
      <header className="h-14 sm:h-16 shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-white/10 bg-[#05050a]/90 backdrop-blur-2xl z-30">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c33cff] animate-pulse shadow-sm shadow-violet-500" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-white uppercase font-sans">
              PRATIBIMB
            </span>
            <span className="text-[9px] font-mono tracking-wider text-violet-400 uppercase">
              OPERATIONAL LAYER
            </span>
          </div>
        </div>

        {/* Center: Digital Twin Live Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#140f2d]/80 border border-violet-500/20 text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase">DIGITAL TWIN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
          <span className="text-[#22d3ee] font-bold text-[10px]">ONLINE</span>
        </div>

        {/* Right: Telemetry & Energy Check-in */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="text-[#22d3ee] font-semibold">{operationalState}</span>
            <span className="text-slate-700">•</span>
            <span>COHERENCE <strong className="text-white">{coherencePct}%</strong></span>
            <span className="text-slate-700">•</span>
            <span>ENERGY <strong className="text-amber-300">{twin.state.energy_level}%</strong></span>
          </div>

          <button
            onClick={() => setShowEnergyModal(true)}
            className="px-2.5 py-1 rounded-xl bg-[#140f2d] hover:bg-[#1a133d] border border-white/10 hover:border-amber-400/40 text-amber-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Update Mental Bandwidth"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{twin.state.energy_level}%</span>
          </button>
        </div>
      </header>

      {/* ZONE 2: MAIN STAGE */}
      <div className="flex-1 w-full relative grid grid-cols-1 lg:grid-cols-12 items-center px-4 sm:px-6 lg:px-8 py-2 overflow-hidden gap-4 z-10">
        
        {/* LEFT CONTEXT COLUMN */}
        <div 
          onMouseEnter={() => setIsLeftPanelHovered(true)}
          onMouseLeave={() => setIsLeftPanelHovered(false)}
          className="hidden lg:flex flex-col gap-3 justify-center z-20 col-span-3 max-w-[280px]"
        >
          
          {/* Current State Glass Panel */}
          <div className={`p-4 rounded-3xl bg-[#0c0a1a]/85 border backdrop-blur-2xl shadow-2xl space-y-3 transition-all duration-300 ${
            (isTwinHovered || isLeftPanelHovered)
              ? 'border-violet-500/50 shadow-violet-500/10'
              : 'border-white/10 hover:border-violet-500/30'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#c33cff]" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">DIGITAL TWIN</div>
                  <div className="text-xs font-bold text-white">{twin.profile.name}</div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-[9px] font-mono text-violet-300">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">CURRENT STATE</span>
                <span className="text-[#22d3ee] font-semibold">{operationalState}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">FOCUS DOMAIN</span>
                <span className="text-white font-medium truncate max-w-[120px] text-right font-sans">
                  {dominantCluster}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">MOMENTUM</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  ↗ (+14%)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">COHERENCE</span>
                <span className="text-white font-semibold">{coherencePct}%</span>
              </div>
            </div>

            {/* Flowing State Waveform SVG */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase">
                <span>STATE TRAJECTORY</span>
                <span className="text-cyan-400 font-semibold">T-1 → T0</span>
              </div>
              <div className="h-7 w-full rounded-xl bg-[#140f2d]/60 border border-white/5 p-1 flex items-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveformGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c33cff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#c33cff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 18 Q 10 12, 20 15 T 40 8 T 60 14 T 80 6 T 100 4 L 100 24 L 0 24 Z"
                    fill="url(#waveformGrad)"
                  />
                  <path
                    d="M 0 18 Q 10 12, 20 15 T 40 8 T 60 14 T 80 6 T 100 4"
                    fill="none"
                    stroke="#c33cff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="4" r="2.5" fill="#ffffff" />
                  <circle cx="100" cy="4" r="5" fill="#c33cff" opacity="0.4" className="animate-ping" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowTwinModal(true)}
              className="w-full py-1.5 rounded-xl bg-[#140f2d] hover:bg-[#1a133d] border border-white/5 text-[10px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Inspect Detailed State</span>
              <ArrowRight className="w-3 h-3 text-[#22d3ee]" />
            </button>
          </div>

          {/* Recent Change Chip */}
          <div 
            onClick={() => onNavigateTab('lifegraph')}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0c0a1a]/85 border border-white/5 hover:border-violet-500/30 backdrop-blur-xl shadow-lg cursor-pointer transition-all group"
          >
            <Database className="w-3.5 h-3.5 text-[#c33cff] shrink-0" />
            <div className="text-xs truncate">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">RECENT CHANGE</span>
              <span className="text-slate-300 group-hover:text-cyan-300 transition-colors font-medium truncate block text-[11px]">
                World Model graph synchronized
              </span>
            </div>
          </div>

        </div>

        {/* CENTER STAGE: DIGITAL TWIN CANVAS */}
        <div className="relative w-full h-full min-h-[360px] flex flex-col items-center justify-center overflow-hidden z-10 col-span-12 lg:col-span-6">
          <NeuralSpatialEnvironment
            twin={twin}
            latentState={latentState}
            onNavigateTab={onNavigateTab}
            onInspectTwin={() => setShowTwinModal(true)}
            isHoveredFromParent={isLeftPanelHovered}
            onHoverTwinChange={setIsTwinHovered}
            className="w-full h-full"
          />

          <div className="absolute bottom-2 z-10 text-center space-y-0.5 pointer-events-none">
            <div className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              DIGITAL REFLECTION
            </div>
            <div className="text-sm font-bold text-white tracking-wide font-sans">
              {twin.profile.name}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="text-[#22d3ee] font-medium">{operationalState}</span>
              <span>•</span>
              <span className="text-slate-300">{dominantCluster}</span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTEXT COLUMN */}
        <div className="hidden lg:flex flex-col gap-3 justify-center z-20 col-span-3 max-w-[290px] ml-auto">
          
          {/* Cognitive Context Glass Panel */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/85 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3 transition-all hover:border-violet-500/40">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#c33cff]" />
                <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                  COGNITIVE CONTEXT
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  CONFIRMED
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              "{topInsight.statement}"
            </p>

            {/* Supporting Signals */}
            <div className="space-y-1 pt-1 border-t border-white/5 font-mono text-[10px]">
              <div className="text-[9px] text-slate-500 uppercase">SUPPORTING SIGNALS</div>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                <div className="p-1 rounded-xl bg-[#140f2d] border border-white/5 text-center">
                  <div className="text-slate-400 text-[8px]">FOCUS</div>
                  <div className="text-emerald-400 font-bold text-[10px]">↑ +18%</div>
                </div>
                <div className="p-1 rounded-xl bg-[#140f2d] border border-white/5 text-center">
                  <div className="text-slate-400 text-[8px]">VELOCITY</div>
                  <div className="text-emerald-400 font-bold text-[10px]">↑ +12%</div>
                </div>
                <div className="p-1 rounded-xl bg-[#140f2d] border border-white/5 text-center">
                  <div className="text-slate-400 text-[8px]">ALIGN</div>
                  <div className="text-[#22d3ee] font-bold text-[10px]">94%</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('insights')}
              className="w-full py-1.5 rounded-xl bg-[#140f2d] hover:bg-[#1a133d] border border-white/5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Insight Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Next Action Chip */}
          <div 
            onClick={() => onNavigateTab('goals')}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0c0a1a]/85 border border-white/5 hover:border-violet-500/30 backdrop-blur-xl shadow-lg cursor-pointer transition-all group text-right justify-between"
          >
            <div className="text-xs truncate text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">NEXT ACTION</span>
              <span className="text-slate-300 group-hover:text-cyan-300 transition-colors font-medium truncate block text-[11px]">
                {activeTask ? activeTask.title : (primaryGoal ? primaryGoal.title : 'Deep Architecture Flow')}
              </span>
            </div>
            <Target className="w-3.5 h-3.5 text-[#c33cff] shrink-0" />
          </div>

        </div>

      </div>

      {/* ZONE 3: COMMAND & BOTTOM TELEMETRY AREA */}
      <div className="shrink-0 w-full flex flex-col items-center z-30 pt-1 pb-2 space-y-2 bg-gradient-to-t from-[#05050a] via-[#05050a]/95 to-transparent">
        
        {/* Suggested Floating Intelligence Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-2xl no-scrollbar px-4">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab('intelligence', prompt)}
              className={`px-3 py-1 rounded-full text-[11px] backdrop-blur-md transition-all cursor-pointer whitespace-nowrap font-sans shadow-sm border ${
                isConsoleFocused
                  ? 'bg-[#140f2d] text-slate-200 border-violet-500/40 shadow-violet-500/10'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border-white/10'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Primary Command Console Bar */}
        <form
          onSubmit={handleCommandSubmit}
          className={`relative flex items-center w-full max-w-2xl h-12 sm:h-13 rounded-2xl backdrop-blur-2xl transition-all duration-300 px-4 shadow-2xl ${
            isConsoleFocused
              ? 'bg-[#0c0a1a] border border-[#c33cff] shadow-violet-500/20'
              : 'bg-[#0c0a1a]/95 hover:bg-[#140f2d] border border-white/10 hover:border-violet-500/40'
          }`}
        >
          <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-[#c33cff]">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200 hidden sm:inline">
              PRATIBIMB
            </span>
          </div>

          <input
            type="text"
            value={commandInput}
            onFocus={() => setIsConsoleFocused(true)}
            onBlur={() => setIsConsoleFocused(false)}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Ask your reflection anything or issue an instruction..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans px-3 py-1"
          />

          <button
            type="submit"
            disabled={!commandInput.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-95 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-violet-500/20"
          >
            <span>Transmit</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Anchored Bottom Telemetry Strip */}
        <div className="w-full max-w-3xl flex items-center justify-between px-6 pt-1 text-[10px] font-mono text-slate-500 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
            <span className="text-slate-400 font-semibold">TWIN // ONLINE</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>STATE: <strong className="text-[#22d3ee]">{operationalState}</strong></span>
            <span>COHERENCE: <strong className="text-white">{coherencePct}%</strong></span>
            <span>MEM: <strong className="text-white">{twin.memories.length}</strong></span>
            <span>GOALS: <strong className="text-white">{activeGoalsCount}</strong></span>
            <span>BANDWIDTH: <strong className="text-amber-400">{twin.state.energy_level}%</strong></span>
          </div>
        </div>

      </div>

      {/* DETAILED DIGITAL TWIN INSPECTOR MODAL */}
      {showTwinModal && (
        <div className="fixed inset-0 bg-[#05050a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0a1a] border border-violet-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#c33cff]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {twin.profile.name} // DIGITAL TWIN MODEL
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    LATENT 64D • STATE ENGINE 2.0 • WORLD MODEL INTEGRATED
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTwinModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500">OPERATIONAL STATE</span>
                <div className="text-[#22d3ee] font-bold">{operationalState}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500">SEMANTIC COHERENCE</span>
                <div className="text-emerald-400 font-bold">{coherencePct}% (Optimal)</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500">ACTIVE GOAL TRAJECTORY</span>
                <div className="text-slate-200 truncate">{primaryGoal ? primaryGoal.title : 'None'}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500">INDEXED MEMORIES</span>
                <div className="text-slate-200">{twin.memories.length} records</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setShowTwinModal(false);
                  onOpenCalibration();
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Calibrate Parameters</span>
              </button>

              <button
                onClick={() => {
                  setShowTwinModal(false);
                  onNavigateTab('twin');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] text-white font-bold text-xs cursor-pointer shadow-md shadow-violet-500/20"
              >
                Open Full Twin Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENERGY CHECK-IN MODAL */}
      {showEnergyModal && (
        <div className="fixed inset-0 bg-[#05050a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0a1a] border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Cognitive Bandwidth Check-in
              </h3>
              <button
                onClick={() => setShowEnergyModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Update your current cognitive energy. Your Digital Twin updates its latent representation and recommendation dynamics.
            </p>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Bandwidth Level</span>
                <span className="text-base text-amber-300 font-bold">{selectedEnergy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-900 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% Low</span>
                <span>50% Balanced</span>
                <span>100% Peak Flow</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
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
                {updatingEnergy ? 'Updating...' : 'Save Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
