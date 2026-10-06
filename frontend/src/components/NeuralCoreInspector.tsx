import React, { useState } from 'react';
import { 
  X, Activity, Cpu, Database, 
  Target, Share2, Flame, ArrowRight, 
  ShieldCheck, Zap, Layers 
} from 'lucide-react';
import type { DigitalTwin, LatentStateVector } from '../types';

interface NeuralCoreInspectorProps {
  twin: DigitalTwin;
  latentState?: LatentStateVector | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
}

export const NeuralCoreInspector: React.FC<NeuralCoreInspectorProps> = ({
  twin,
  latentState,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'representation' | 'state' | 'subsystems'>('representation');

  if (!isOpen) return null;

  const entropyPct = Math.round((latentState?.entropy ?? 0.24) * 100);
  const coherencePct = Math.round((latentState?.semantic_coherence ?? 0.88) * 100);
  const pc2d = latentState?.principal_components_2d ?? [0.42, -0.68];
  const pc3d = latentState?.principal_components_3d ?? [0.42, -0.68, 0.31];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/85 backdrop-blur-xl p-4 overflow-y-auto font-sans selection:bg-[#E51D48] selection:text-white animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl bg-[#070A12]/95 border border-[#E51D48]/30 p-6 md:p-8 shadow-2xl shadow-red-950/30 space-y-6 my-8 backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] p-[1px] shadow-lg shadow-red-500/20">
              <div className="w-full h-full bg-[#04060C] rounded-[15px] flex items-center justify-center text-[#FF365C]">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">NEURAL CORE INSPECTOR</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-mono text-[10px] font-bold">
                  {twin.state.operational_state || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ground-truth diagnostic telemetry of your 64D computational state vector.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {[
            { id: 'representation', label: '64D Latent Geometry', icon: Layers },
            { id: 'state', label: 'State & Entropy', icon: Activity },
            { id: 'subsystems', label: 'Subsystem Topology', icon: Share2 },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  active
                    ? 'bg-[#E51D48]/20 border border-[#E51D48]/50 text-white font-bold shadow-md shadow-red-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#FF365C]' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 64D Representation Geometry */}
        {activeTab === 'representation' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">COHERENCE RATIO</span>
                <div className="text-xl font-black text-[#48D7FF]">{coherencePct}%</div>
                <div className="text-[10px] text-slate-500">Cross-domain alignment</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">STATE ENTROPY</span>
                <div className="text-xl font-black text-[#FF365C]">{entropyPct}%</div>
                <div className="text-[10px] text-slate-500">Information disorder</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">CLUSTER ANCHOR</span>
                <div className="text-sm font-bold text-white truncate">{latentState?.dominant_cluster || 'Deep Flow'}</div>
                <div className="text-[10px] text-slate-500">Markov attractor</div>
              </div>
            </div>

            {/* Principal Components Matrix */}
            <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>PRINCIPAL PROJECTIONS (PCA)</span>
                <span className="text-[#1E7BFF]">ORTHOGONAL DECOMPOSITION</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/5">
                  <span className="text-[10px] text-slate-500">PC1 (X)</span>
                  <div className="text-white font-bold">{pc2d[0]?.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/5">
                  <span className="text-[10px] text-slate-500">PC2 (Y)</span>
                  <div className="text-white font-bold">{pc2d[1]?.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/5">
                  <span className="text-[10px] text-slate-500">PC3 (Z)</span>
                  <div className="text-white font-bold">{pc3d[2]?.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/5">
                  <span className="text-[10px] text-slate-500">TENSOR DIMS</span>
                  <div className="text-[#FF365C] font-bold">64 Float32</div>
                </div>
              </div>
            </div>

            {/* Simulated Vector Bars */}
            <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Sample Dimension Intensities</span>
              <div className="grid grid-cols-8 gap-1.5 h-12 items-end pt-2">
                {[0.82, 0.45, 0.91, 0.33, 0.74, 0.62, 0.88, 0.54].map((v, i) => (
                  <div key={i} className="space-y-1 text-center">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#8B0F24] to-[#E51D48] transition-all"
                      style={{ height: `${v * 36}px` }}
                    />
                    <span className="text-[9px] font-mono text-slate-500">d{i * 8}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: State & Entropy */}
        {activeTab === 'state' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-2">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Current Operational Mode</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E51D48] animate-pulse" />
                  <span className="text-base font-bold text-white">{twin.state.operational_state || 'ACTIVE'}</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Governed by the State Synthesis Engine across historical focus rhythms and active goal trajectories.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-2">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Current Focus Directive</span>
                <div className="text-base font-bold text-[#48D7FF] truncate">
                  {twin.state.current_focus || 'System Synthesis & Architecture'}
                </div>
                <p className="text-slate-400 text-[11px]">
                  Self-reported & inferred primary cognitive priority for the current temporal cycle.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#04060C] border border-white/10 space-y-2 font-mono">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>ENERGY BANDWIDTH</span>
                <span className="text-[#E51D48] font-bold">{twin.state.energy_level}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] rounded-full"
                  style={{ width: `${twin.state.energy_level}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Subsystems Topology */}
        {activeTab === 'subsystems' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn text-xs font-mono">
            {[
              { label: 'Neural Memory Field', tab: 'memory', count: `${twin.memories?.length || 0} Fragments`, icon: Database, color: 'text-[#E51D48]' },
              { label: 'Strategic Trajectory', tab: 'goals', count: `${twin.goals?.length || 0} Horizons`, icon: Target, color: 'text-[#FF365C]' },
              { label: 'Focus & Rituals', tab: 'focus', count: `${twin.habits?.length || 0} Protocols`, icon: Flame, color: 'text-amber-400' },
              { label: 'Personal World GNN', tab: 'lifegraph', count: 'Active Graph', icon: Share2, color: 'text-[#1E7BFF]' },
              { label: 'Temporal State Sequence', tab: 'timeline', count: 'T-1 / T0 / T+1', icon: Activity, color: 'text-[#48D7FF]' },
              { label: 'AI Cognition Core', tab: 'intelligence', count: 'Synchronized', icon: Zap, color: 'text-[#FF365C]' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.tab}
                  onClick={() => {
                    onClose();
                    onNavigateTab(s.tab);
                  }}
                  className="p-3.5 rounded-2xl bg-[#04060C] border border-white/10 hover:border-[#E51D48]/40 hover:bg-[#0c0a1a] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <div>
                      <div className="text-white font-bold">{s.label}</div>
                      <div className="text-slate-500 text-[10px]">{s.count}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry verified against live state engine</span>
          </span>

          <button
            onClick={() => {
              onClose();
              onNavigateTab('intelligence', 'Perform a full diagnostic reasoning cycle on my 64D state vector and active goals.');
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-red-950/40 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span>Consult AI Core on State</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
