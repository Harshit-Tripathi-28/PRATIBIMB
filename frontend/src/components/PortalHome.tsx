import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Send,
  Maximize2,
  Brain,
  Sparkles,
} from 'lucide-react';
import type { 
  DigitalTwin, 
  LatentStateVector, 
} from '../types';
import { api } from '../services/api';
import { ChakraCore3D } from './ChakraCore3D';
import { NeuralCoreInspector } from './NeuralCoreInspector';

interface PortalHomeProps {
  twin: DigitalTwin;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onRefreshTwin: () => void;
  onOpenCalibration?: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  twin,
  onNavigateTab,
  onRefreshTwin: _onRefreshTwin,
  onOpenCalibration: _onOpenCalibration,
}) => {
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [isConversing, setIsConversing] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    api.getLatentStateVector().then(setLatentState).catch(() => null);
  }, [twin]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const prompt = quickInput.trim();
    setQuickInput('');
    setIsConversing(true);

    setTimeout(() => {
      onNavigateTab('intelligence', prompt);
    }, 400);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const operationalState = twin.state.operational_state || 'ACTIVE';
  const coherencePct = Math.round((latentState?.semantic_coherence ?? 0.92) * 100);
  const entropyVal = (latentState?.entropy ?? 0.22).toFixed(2);
  const activeGoalsCount = twin.goals?.filter((g) => g.progress < 100).length || 3;
  const pendingTasksCount = twin.tasks?.filter((t) => t.status !== 'completed').length || 6;

  return (
    <div className="relative min-h-screen bg-[#020307] text-[#F4F7FF] font-sans selection:bg-[#E51D48] selection:text-white overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. FIXED 3D DIGITAL TWIN + FULL-VIEWPORT CHAKRA & NEURAL ATMOSPHERE */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden w-full h-full">
        {/* Deep, Soft Ambient Cosmic Lighting (Centered with Chakra & Twin Core) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, rgba(94, 11, 25, 0.12) 0%, rgba(10, 28, 61, 0.07) 45%, rgba(2, 3, 7, 0) 80%),
              radial-gradient(circle at 50% 48%, rgba(148, 113, 36, 0.04) 0%, rgba(2, 3, 7, 0) 65%)
            `,
          }}
        />

        {/* Full-Viewport 3D Canvas */}
        <div className="w-full h-full pointer-events-auto">
          <ChakraCore3D
            operationalState={operationalState}
            latentState={latentState}
            className="w-full h-full"
            isFixedBackground={false}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOREGROUND CONTENT LAYER (Wide Usable Canvas, Clean Typography) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full pl-6 sm:pl-10 lg:pl-14 pr-6 sm:pr-10 lg:pr-14 max-w-[1600px] mx-auto">

        {/* SECTION 1: FULL-WIDTH STARTUP HERO */}
        <section id="hero" className="min-h-screen flex flex-col justify-between pt-16 pb-12">
          
          {/* Top Telemetry Status Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap w-full">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#070A12]/80 border border-white/10 text-[11px] font-mono backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FF365C] animate-pulse shadow-sm shadow-red-500" />
              <span className="text-white font-bold tracking-wide">PRATIBIMB OS</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#D4AF37] font-semibold">DIGITAL TWIN ONLINE</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-slate-400">
              <span className="px-3 py-1 rounded-xl bg-[#070A12]/80 border border-white/10">
                STATE: <span className="text-[#FF365C] font-bold">{operationalState}</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#070A12]/80 border border-white/10">
                COHERENCE: <span className="text-emerald-400 font-bold">{coherencePct}%</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#070A12]/80 border border-white/10">
                ENTROPY: <span className="text-[#48D7FF] font-bold">{entropyVal}</span>
              </span>
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="px-3 py-1 rounded-xl bg-[#0B132B]/90 hover:bg-[#121F45] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#D4AF37] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Maximize2 className="w-3 h-3" />
                <span>64D CORE</span>
              </button>
            </div>
          </div>

          {/* Main Hero Split Grid: Text on Left (45%), Digital Twin Stage on Right (55%) */}
          <div className="my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Confident Product Copy */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-6 max-w-xl">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
                  <span>PERSONAL AI OPERATING LAYER</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.02]">
                  PRATIBIMB
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#D4AF37]">
                  Your digital reflection, powered by deep learning.
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
                An AI operating layer that learns your context, models your evolving state, and helps you act with clarity across goals, memory, and execution.
              </p>

              {/* Primary Actions */}
              <div className="flex items-center gap-3.5 flex-wrap pt-2">
                <button
                  onClick={() => onNavigateTab('command')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-95 text-white font-bold text-sm font-mono shadow-2xl shadow-red-950/60 flex items-center gap-3 transition-all cursor-pointer group"
                >
                  <span>ENTER PRATIBIMB</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollToSection('intelligence')}
                  className="px-6 py-4 rounded-2xl bg-[#070A12]/90 hover:bg-[#0c0a1a] border border-white/10 hover:border-[#D4AF37]/40 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xl shadow-lg"
                >
                  <span>EXPLORE YOUR DIGITAL TWIN</span>
                </button>
              </div>

              {/* Quick Conversational Input Bar */}
              <form onSubmit={handleQuickSubmit} className="pt-2">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#070A12]/90 border border-white/10 focus-within:border-[#E51D48] shadow-2xl backdrop-blur-2xl transition-all">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Ask your digital twin or initiate your next action..."
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isConversing || !quickInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0F24] to-[#E51D48] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Act</span>
                  </button>
                </div>
              </form>

            </div>

            {/* Right Column: Kept cleanly open so the 3D Digital Twin Hero & Chakra Halo breathe without text collisions */}
            <div className="hidden lg:block lg:col-span-6 xl:col-span-7 min-h-[460px] pointer-events-none" />

          </div>

          {/* Bottom Metric Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-[#070A12]/80 border border-white/5 backdrop-blur-xl space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-bold uppercase">STRATEGIC HORIZONS</span>
              <span className="text-white font-bold text-sm">{activeGoalsCount} Active Goals</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#070A12]/80 border border-white/5 backdrop-blur-xl space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-bold uppercase">DISPATCH QUEUE</span>
              <span className="text-[#48D7FF] font-bold text-sm">{pendingTasksCount} Actions Queued</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#070A12]/80 border border-white/5 backdrop-blur-xl space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-bold uppercase">MEMORY VAULT</span>
              <span className="text-[#D4AF37] font-bold text-sm">{twin.memories?.length || 14} Associative Nodes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#070A12]/80 border border-white/5 backdrop-blur-xl space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-bold uppercase">COGNITIVE ENERGY</span>
              <span className="text-[#FF365C] font-bold text-sm">{twin.state.energy_level}/10 • {twin.state.workload_status}</span>
            </div>
          </div>

        </section>

        {/* SECTION 2: YOUR DIGITAL TWIN */}
        <section id="twin" className="min-h-screen py-28 flex flex-col justify-center max-w-6xl">
          <div className="space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#070A12]/90 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[11px] font-bold">
              <Brain className="w-3.5 h-3.5" />
              <span>THE DIGITAL REFLECTION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              YOUR DIGITAL TWIN
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              PRATIBIMB continuously models seven core dimensions of your evolving personal context into an active high-dimensional representation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Context', desc: 'Active environment, projects, circadian rhythms, and focus state tokens.', color: '#1E7BFF' },
              { title: 'Memory', desc: 'Associative memory graph consolidating episodic reflections and key knowledge.', color: '#D4AF37' },
              { title: 'Goals', desc: 'Hierarchical milestone trees with real-time velocity tracking and dependency weighting.', color: '#FF365C' },
              { title: 'Behavior', desc: 'Rhythm modeling across deep work intervals, focus transitions, and energy patterns.', color: '#FF6B35' },
              { title: 'State', desc: 'Real-time ground-truth tensor measuring cognitive load, semantic coherence, and focus.', color: '#48D7FF' },
              { title: 'Patterns & Trajectories', desc: '64D latent manifold projecting forward execution and burnout avoidance forecasts.', color: '#E51D48' },
            ].map((dim, i) => (
              <div
                key={dim.title}
                className="p-6 rounded-3xl bg-[#070A12]/85 border border-white/10 hover:border-white/20 backdrop-blur-2xl transition-all space-y-2.5 shadow-xl group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold" style={{ color: dim.color }}>
                    0{i + 1} //
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">{dim.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{dim.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: WHAT YOUR TWIN CAN DO */}
        <section id="capabilities" className="min-h-screen py-28 flex flex-col justify-center max-w-6xl">
          <div className="space-y-4 mb-14">
            <span className="text-xs font-mono font-bold tracking-widest text-[#1E7BFF] uppercase">
              Autonomous Capability
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              WHAT YOUR TWIN CAN DO
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              From continuous cognitive observation to counterfactual multiverse simulation and proactive task execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Understand',
                desc: 'Ingests tasks, notes, habits, and focus rhythms into an associative knowledge graph.',
                badge: 'GNN Graph',
                color: '#1E7BFF',
                tab: 'worldmodel',
              },
              {
                step: '02',
                title: 'Predict',
                desc: 'Calculates transition probabilities, completion dates, and cognitive fatigue curves.',
                badge: 'Markov Engine',
                color: '#FF6B35',
                tab: 'timeline',
              },
              {
                step: '03',
                title: 'Simulate',
                desc: 'Tests what-if strategic adjustments in work hours, focus allocation, and goal velocity.',
                badge: 'Multiverse Lab',
                color: '#48D7FF',
                tab: 'simulation',
              },
              {
                step: '04',
                title: 'Recommend',
                desc: 'Generates non-obvious cognitive insights, focus optimizations, and habit adaptations.',
                badge: 'Signal Engine',
                color: '#D4AF37',
                tab: 'insights',
              },
              {
                step: '05',
                title: 'Act',
                desc: 'Dispatches autonomous background agents to summarize, plan, and schedule next actions.',
                badge: 'Policy Dispatch',
                color: '#E51D48',
                tab: 'command',
              },
            ].map((cap) => (
              <div
                key={cap.title}
                onClick={() => onNavigateTab(cap.tab)}
                className="p-5 rounded-3xl bg-[#070A12]/85 border border-white/10 hover:border-white/25 backdrop-blur-2xl transition-all space-y-3 cursor-pointer group shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold" style={{ color: cap.color }}>{cap.step}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{cap.badge}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">{cap.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{cap.desc}</p>
                <div className="pt-2 flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                  <span>LAUNCH</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: LIVE INTELLIGENCE */}
        <section id="intelligence" className="min-h-screen py-28 flex flex-col justify-center max-w-6xl">
          <div className="space-y-4 mb-14">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
              Real-time Telemetry
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              LIVE INTELLIGENCE
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Direct mathematical state streaming from your active Digital Twin instance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-[#070A12]/90 border border-white/10 backdrop-blur-2xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">Strategic Vectors</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Active Goals</span>
                  <span className="text-white font-bold font-mono">{activeGoalsCount} Tracked</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Pending Tasks</span>
                  <span className="text-[#48D7FF] font-bold font-mono">{pendingTasksCount} Queued</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Memory Vault Nodes</span>
                  <span className="text-[#D4AF37] font-bold font-mono">{twin.memories?.length || 14} Associative</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>OPEN GOALS BOARD</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-7 rounded-3xl bg-[#070A12]/90 border border-white/10 backdrop-blur-2xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">Cognitive Coherence</span>
                <span className="w-2 h-2 rounded-full bg-[#1E7BFF]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Current Operational State</span>
                  <span className="text-[#FF365C] font-bold font-mono">{operationalState}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Semantic Coherence</span>
                  <span className="text-emerald-400 font-bold font-mono">{coherencePct}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Energy & Workload</span>
                  <span className="text-[#D4AF37] font-bold font-mono">{twin.state.energy_level}/10 • {twin.state.workload_status}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>VIEW STATE CONTINUUM</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-7 rounded-3xl bg-[#070A12]/90 border border-white/10 backdrop-blur-2xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">Simulation Horizon</span>
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Latent Entropy</span>
                  <span className="text-[#D4AF37] font-bold font-mono">{entropyVal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Burnout Hazard Index</span>
                  <span className="text-emerald-400 font-bold font-mono">Nominal (0.18)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Velocity Forecast</span>
                  <span className="text-[#48D7FF] font-bold font-mono">+24% Trajectory</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('simulation')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>LAUNCH SIMULATION LAB</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: ENTER THE SYSTEM */}
        <section id="gateway" className="min-h-[70vh] py-24 flex flex-col justify-center items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#070A12]/90 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRATIBIMB OPERATING LAYER</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            ENTER THE SYSTEM
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Step into your personal AI operating layer. Observe, simulate, and execute with perfect alignment.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center pt-2">
            <button
              onClick={() => onNavigateTab('command')}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-95 text-white font-bold text-sm font-mono shadow-2xl shadow-red-950/80 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <span>ENTER PRATIBIMB OPERATING SYSTEM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </div>

      {/* 64D Core Inspector Modal */}
      <NeuralCoreInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        latentState={latentState}
        twin={twin}
        onNavigateTab={onNavigateTab}
      />

    </div>
  );
};
