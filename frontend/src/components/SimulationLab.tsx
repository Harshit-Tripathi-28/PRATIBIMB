import React, { useState } from 'react';
import { 
  Sliders, Play, Sparkles, TrendingUp, AlertTriangle, 
  CheckCircle, ArrowRight, ShieldCheck, Flame, GitBranch, Cpu
} from 'lucide-react';
import type { DigitalTwin, ScenarioOutcome, SimulationScenarioRequest } from '../types';
import { api } from '../services/api';

interface SimulationLabProps {
  twin: DigitalTwin;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ twin, onNavigateTab }) => {
  const [scenarioTitle, setScenarioTitle] = useState<string>('Deep Focus on AI Systems Architecture');
  const [focusDomain, setFocusDomain] = useState<string>('Distributed Machine Learning & Deep Learning');
  const [allocatedHours, setAllocatedHours] = useState<number>(14);
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [adjustment, setAdjustment] = useState<string>('De-prioritize low-leverage administrative tasks by 30%');
  
  const [simulating, setSimulating] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<ScenarioOutcome | null>(null);

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const req: SimulationScenarioRequest = {
        scenario_title: scenarioTitle,
        focus_domain: focusDomain,
        allocated_hours_per_week: allocatedHours,
        duration_weeks: durationWeeks,
        competing_priorities_adjustment: adjustment,
        target_goal_id: twin.goals.length > 0 ? twin.goals[0].id : undefined
      };
      const result = await api.simulateScenario(req);
      setOutcome(result);
    } catch (e) {
      console.error('Simulation execution failed', e);
    } finally {
      setSimulating(false);
    }
  };

  // Run initial simulation on mount if outcome is null
  React.useEffect(() => {
    if (!outcome) {
      handleRunSimulation();
    }
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-20 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#22d3ee] flex items-center justify-center text-slate-950 shadow-lg shadow-violet-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Future State Lab 2.0</h1>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                STATE LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate downstream cognitive trajectories, milestone velocities, and tradeoff distributions across your world model.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#140f2d]/80 px-4 py-2.5 rounded-2xl border border-white/10">
          <Cpu className="w-4 h-4 text-[#22d3ee]" />
          <span>Representation: <strong className="text-white">64D Spectral</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Scenario Controls (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#c33cff]" />
              Scenario Parameters
            </h2>
            <span className="text-[10px] font-mono text-violet-400">STATE LAB</span>
          </div>

          {/* Scenario Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Scenario Name</label>
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#c33cff]"
              placeholder="e.g., 3-Month Sprint on Deep Learning Architecture"
            />
          </div>

          {/* Focus Domain */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Focus Domain / Competency Target</label>
            <input
              type="text"
              value={focusDomain}
              onChange={(e) => setFocusDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#c33cff]"
              placeholder="e.g., System Architecture, Spectral Embeddings, Distributed AI"
            />
          </div>

          {/* Allocated Hours Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Allocated Time / Week</span>
              <span className="font-mono text-[#22d3ee] font-bold">{allocatedHours} hrs / week</span>
            </div>
            <input
              type="range"
              min="4"
              max="35"
              step="1"
              value={allocatedHours}
              onChange={(e) => setAllocatedHours(Number(e.target.value))}
              className="w-full accent-[#22d3ee] bg-slate-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4h (Light)</span>
              <span>15h (Moderate)</span>
              <span>35h (Extreme Sprint)</span>
            </div>
          </div>

          {/* Duration Weeks Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Duration Period</span>
              <span className="font-mono text-violet-300 font-bold">{durationWeeks} weeks</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full accent-[#c33cff] bg-slate-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2w (Sprint)</span>
              <span>8w (Quarter)</span>
              <span>24w (Semester)</span>
            </div>
          </div>

          {/* Mitigation / Tradeoff strategy */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-medium text-slate-300">Tradeoff Adjustment</label>
            <input
              type="text"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#c33cff]"
              placeholder="e.g., Reduce context switching, deload weekends"
            />
          </div>

          {/* Run Button */}
          <div className="pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Computing Neural Trajectory...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Run Future Simulation</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right: Projected Outcome & Probabilistic Insights (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {outcome ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
              
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">SIMULATION OUTCOME</div>
                  <h3 className="text-base font-bold text-white mt-0.5">{outcome.scenario_title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold">
                  Trajectory Projected
                </span>
              </div>

              {/* 3 Core Metric Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Milestone Velocity Delta */}
                <div className="p-4 rounded-2xl bg-[#140f2d]/80 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Goal Advancement</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    +{outcome.estimated_goal_progress_delta}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">Estimated progress delta</div>
                </div>

                {/* Momentum Score */}
                <div className="p-4 rounded-2xl bg-[#140f2d]/80 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Momentum Score</span>
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {outcome.momentum_score}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">Trajectory strength</div>
                </div>

                {/* Burnout Risk Gauge */}
                <div className="p-4 rounded-2xl bg-[#140f2d]/80 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Burnout Risk</span>
                  </div>
                  <div className="text-2xl font-black text-rose-300 font-mono">
                    {Math.round(outcome.burnout_risk_score * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">{outcome.cognitive_load_projection} load</div>
                </div>

              </div>

              {/* AI Synthesis Statement */}
              <div className="p-4 rounded-2xl bg-[#140f2d]/90 border border-violet-500/20 text-xs text-slate-200 leading-relaxed font-sans">
                <div className="font-bold text-violet-300 mb-1 flex items-center gap-1.5 font-mono text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#c33cff]" />
                  <span>Cognitive Synthesis</span>
                </div>
                {outcome.ai_synthesis}
              </div>

              {/* Catalysts & Tradeoffs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                
                {/* Positive Catalysts */}
                <div className="space-y-2 p-4 rounded-2xl bg-[#140f2d]/60 border border-white/5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Positive Catalysts</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {outcome.positive_catalysts.map((cat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Projected Tradeoffs */}
                <div className="space-y-2 p-4 rounded-2xl bg-[#140f2d]/60 border border-white/5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tradeoffs & Guardrails</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {outcome.projected_tradeoffs.map((tro, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{tro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Plan Commitment Action */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('intelligence', `Decompose this simulated scenario into an actionable weekly sprint plan: "${outcome.scenario_title}"`)}
                  className="w-full py-3 rounded-2xl bg-[#140f2d] hover:bg-[#1a133d] border border-white/10 hover:border-violet-500/40 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Decompose into Tasks with AI Core</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#22d3ee]" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#0c0a1a]/40 border border-white/5 text-center text-slate-500 text-xs">
              Configure parameters on the left and execute the simulation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
