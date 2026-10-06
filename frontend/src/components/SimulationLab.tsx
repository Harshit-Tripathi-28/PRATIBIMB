import React, { useState } from 'react';
import { 
  Sliders, Play, AlertTriangle, 
  CheckCircle, ArrowRight, GitBranch, Cpu
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
    <div className="space-y-6 animate-fadeIn text-[#F4F7FF] max-w-7xl mx-auto pb-20 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070A12]/90 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Future Trajectory Lab</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#1E7BFF]/15 border border-[#1E7BFF]/30 text-[#48D7FF] font-mono text-[10px] font-bold">
                MULTIVERSE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate counterfactual behavioral adjustments, skill acquisition velocity, and burnout risks.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 fill-white ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? 'Synthesizing Multiverse...' : 'Simulate Trajectory'}</span>
        </button>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameter Formulation Matrix (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF365C]" />
              <h2 className="text-sm font-bold text-white font-mono uppercase">Scenario Hypothesis</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">PARAMETRIC INPUT</span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Scenario Title</label>
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Target Focus Domain</label>
              <input
                type="text"
                value={focusDomain}
                onChange={(e) => setFocusDomain(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center font-mono">
                <label className="text-slate-300 text-[11px]">Allocated Deep Work Hours / Week</label>
                <span className="text-[#FF365C] font-bold">{allocatedHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="2"
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(Number(e.target.value))}
                className="w-full accent-[#E51D48] bg-[#04060C] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center font-mono">
                <label className="text-slate-300 text-[11px]">Duration Horizon</label>
                <span className="text-[#48D7FF] font-bold">{durationWeeks} weeks</span>
              </div>
              <input
                type="range"
                min="2"
                max="24"
                step="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full accent-[#1E7BFF] bg-[#04060C] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Competing Priority Tradeoff</label>
              <textarea
                rows={2}
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Counterfactual Outcome (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {outcome ? (
            <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-bold">
                      PROJECTED MULTIVERSE STATE
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ID: {outcome.scenario_id.substring(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{outcome.scenario_title}</h2>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">MOMENTUM</span>
                  <span className="text-lg font-black text-[#48D7FF]">{Math.round(outcome.momentum_score)}/100</span>
                </div>
              </div>

              {/* Trajectory Delta Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">GOAL PROGRESS</div>
                  <div className="text-emerald-400 font-bold text-lg mt-0.5">
                    +{outcome.estimated_goal_progress_delta}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">SKILL ACQUISITION</div>
                  <div className="text-[#48D7FF] font-bold text-lg mt-0.5">
                    +{outcome.estimated_skill_acquisition_score}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">BURNOUT RISK</div>
                  <div className={`font-bold text-lg mt-0.5 ${
                    outcome.burnout_risk_score > 60 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {outcome.burnout_risk_score}%
                  </div>
                </div>
              </div>

              {/* AI Strategic Synthesis */}
              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF365C] uppercase tracking-wider font-bold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Causal Trajectory Synthesis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {outcome.ai_synthesis}
                </p>
              </div>

              {/* Projected Tradeoffs & Catalysts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Projected Tradeoffs</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {outcome.projected_tradeoffs.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Positive Catalysts</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {outcome.positive_catalysts.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigateTab('intelligence', `Adopt scenario "${outcome.scenario_title}" with ${allocatedHours} weekly hours and update my priorities.`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs font-mono shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Adopt Trajectory Protocol in AI Core</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#070A12]/50 border border-white/5 text-center text-slate-500 text-xs font-mono">
              Adjust parameters on the left and run simulation to compute counterfactual multiverse outcomes.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
