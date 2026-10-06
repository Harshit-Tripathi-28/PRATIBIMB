import React, { useState, useEffect } from 'react';
import { 
  Target, CheckCircle2, Database, Flame, 
  Sparkles, Zap, Activity, Brain,
  Sliders, Share2, TrendingUp, TrendingDown, AlertTriangle, Cpu, Play
} from 'lucide-react';
import type { 
  DigitalTwin, LatentStateVector, BehaviorForecast, 
  AnomalySignal, SpecializedAgentSpec, CognitiveInsight 
} from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface CommandCenterProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onOpenCalibration: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  twin,
  onRefresh,
  onNavigateTab,
}) => {
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(twin.state.energy_level);
  const [updatingEnergy, setUpdatingEnergy] = useState(false);

  // Deep Learning & Prediction States
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [forecasts, setForecasts] = useState<BehaviorForecast[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalySignal[]>([]);
  const [agents, setAgents] = useState<SpecializedAgentSpec[]>([]);
  const [cognitiveInsights, setCognitiveInsights] = useState<CognitiveInsight[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SpecializedAgentSpec | null>(null);
  const [agentInstruction, setAgentInstruction] = useState<string>('');
  const [agentExecuting, setAgentExecuting] = useState<boolean>(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latent state vector, behavioral forecasts, agents, and cognitive insights
    const loadDeepLearningState = async () => {
      try {
        const [stateVec, predData, agentList, cogList] = await Promise.all([
          api.getLatentStateVector().catch(() => null),
          api.getPredictions().catch(() => ({ forecasts: [], anomalies: [] })),
          api.getAgents().catch(() => []),
          api.getCognitiveInsights().catch(() => [])
        ]);
        if (stateVec) setLatentState(stateVec);
        if (predData) {
          setForecasts(predData.forecasts || []);
          setAnomalies(predData.anomalies || []);
        }
        if (agentList) {
          setAgents(agentList);
          if (agentList.length > 0) setSelectedAgent(agentList[0]);
        }
        if (cogList) {
          setCognitiveInsights(cogList);
        }
      } catch (e) {
        console.error('Failed to load deep learning state', e);
      }
    };
    loadDeepLearningState();
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

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !agentInstruction.trim()) return;
    try {
      setAgentExecuting(true);
      setAgentOutput(null);
      const res = await api.executeAgentTask({
        agent_id: selectedAgent.id,
        instruction: agentInstruction.trim()
      });
      setAgentOutput(res.result_summary);
      onRefresh();
    } catch (e) {
      setAgentOutput('Execution failed. Please check AI Core telemetry.');
    } finally {
      setAgentExecuting(false);
    }
  };

  const { profile, state, goals, tasks, habits, memories } = twin;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const activeGoals = goals.filter((g) => g.progress < 100);
  const avatarConfig = profile.avatar_config || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
        {/* Deep Spatial Glow Fields */}
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-violet-600/6 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Hero Narrative & Actions (50% desktop width) */}
          <div className="space-y-5 max-w-xl text-center lg:text-left z-10">
            
            {/* Identity Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-md shadow-cyan-950/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span>PRATIBIMB OS • NEURAL COMMAND CENTER</span>
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
                Your living AI reflection modeling your goals, memories, habits, and neural state representations in real time.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-normal max-w-md mx-auto lg:mx-0">
                Connected to your deep-learning AI Core — orchestrating perception, memory retrieval, and predictive simulations.
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
                onClick={() => onNavigateTab('lifegraph')}
                className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Life Graph</span>
              </button>

              <button
                onClick={() => onNavigateTab('simulation')}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Simulation</span>
              </button>
            </div>

            {/* Quick Context Bar */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Neural State Synced</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span className="text-slate-500">Cluster:</span>{' '}
                <span className="text-cyan-300 font-medium">{latentState?.dominant_cluster || 'Engineering Focus'}</span>
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
          SECTION 1.5: COGNITIVE INSIGHT & CAUSAL CONTEXT HIGHLIGHT
         ======================================================== */}
      {cognitiveInsights.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Brain className="w-4 h-4" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cognitive Insight & Causal Context
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                {cognitiveInsights[0].epistemic_level}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('insights')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>Explore All Insights ({cognitiveInsights.length})</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                  {cognitiveInsights[0].category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {cognitiveInsights[0].title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {cognitiveInsights[0].statement}
              </p>
              
              {/* Evidence Signals */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                {cognitiveInsights[0].evidence_signals.map((sig, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {sig.direction === 'increasing' ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : sig.direction === 'decreasing' ? (
                      <TrendingDown className="w-3 h-3 text-rose-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                    <span>{sig.metric_name}:</span>
                    <span className={sig.delta_pct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {sig.delta_pct >= 0 ? `+${sig.delta_pct}%` : `${sig.delta_pct}%`}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendation Quick Action */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Action Proposal
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {cognitiveInsights[0].recommended_action || 'Review active strategic milestones.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateTab('insights')}
                  className="w-full px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all text-center"
                >
                  Investigate & Act
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: LATENT STATE RADAR & PREDICTIVE INTELLIGENCE
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latent State Telemetry (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Latent Neural State (64D Embedding)
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              Coherence: {latentState ? intToPercent(latentState.semantic_coherence) : '88%'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">2D Projection</span>
              <div className="text-xs font-mono font-bold text-slate-200">
                [{latentState?.principal_components_2d?.[0] ?? 0.42}, {latentState?.principal_components_2d?.[1] ?? -0.18}]
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Entropy</span>
              <div className="text-xs font-mono font-bold text-indigo-300">
                {latentState?.entropy ?? 0.32} (Low)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Cluster</span>
              <div className="text-xs font-bold text-cyan-300 truncate">
                {latentState?.dominant_cluster ?? 'Engineering'}
              </div>
            </div>
          </div>

          {/* Anomaly Signal Notification */}
          {anomalies.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-amber-200">{anomalies[0].signal_type}</div>
                <div className="text-slate-400">{anomalies[0].explanation}</div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Behavioral pattern operating within baseline parameters.</span>
            </div>
          )}
        </div>

        {/* Probabilistic Forecasts (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Probabilistic Forecasts (7-30 Day Trajectory)
            </h2>
            <button
              onClick={() => onNavigateTab('simulation')}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer"
            >
              Simulate →
            </button>
          </div>

          <div className="space-y-2.5">
            {forecasts.map((fc, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200">{fc.metric_name}</div>
                  <div className="text-[10px] text-slate-500">{fc.driving_factors.join(' • ')}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-400">+{fc.projected_7d} (7d)</div>
                  <div className="text-[10px] text-slate-400">Current: {fc.current_value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================
          SECTION 3: AUTONOMOUS AGENT DISPATCHER
         ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Specialized Autonomous Agents
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatch dedicated cognitive agents coordinated by the AI Core for deep planning, technical research, and data maintenance.
            </p>
          </div>
        </div>

        {/* Agent Cards Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="font-bold text-xs text-white">{agent.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">{agent.role}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agent Execution Box */}
        {selectedAgent && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Dispatch Directive to {selectedAgent.name}:</span>
              <span className="text-[10px] text-slate-500 font-mono">Capabilities: {selectedAgent.capabilities.join(', ')}</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={agentInstruction}
                onChange={(e) => setAgentInstruction(e.target.value)}
                placeholder={`e.g., Decompose milestones for ${twin.goals[0]?.title || 'System architecture'}...`}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={handleExecuteAgent}
                disabled={agentExecuting || !agentInstruction.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {agentExecuting ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                <span>Execute</span>
              </button>
            </div>

            {agentOutput && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed animate-fadeIn">
                <div className="font-bold text-cyan-300 mb-1">Agent Result</div>
                <div className="whitespace-pre-wrap">{agentOutput}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 4: DIGITAL STATE SUMMARY CARDS
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
              Self-report your current cognitive capacity. Your Digital Twin updates its latent representation accordingly.
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

function intToPercent(val: number): string {
  return `${Math.round(val * 100)}%`;
}
