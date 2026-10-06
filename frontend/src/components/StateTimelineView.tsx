import React, { useState, useEffect } from 'react';
import { 
  History, Sparkles, RefreshCw, GitCommit, Bot
} from 'lucide-react';
import type { 
  StateSnapshot, TemporalTriadState 
} from '../types';
import { api } from '../services/api';

interface StateTimelineViewProps {
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
}

export const StateTimelineView: React.FC<StateTimelineViewProps> = ({ onNavigateTab }) => {
  const [triadState, setTriadState] = useState<TemporalTriadState | null>(null);
  const [history, setHistory] = useState<StateSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<StateSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [capturingSnapshot, setCapturingSnapshot] = useState<boolean>(false);

  const fetchStateData = async () => {
    try {
      setLoading(true);
      const [triad, histData] = await Promise.all([
        api.getTemporalTriadState().catch(() => null),
        api.getStateHistory().catch(() => ({ history: [], comparison: null as any })),
      ]);

      if (triad) setTriadState(triad);
      if (histData) {
        setHistory(histData.history || []);
        if (histData.history?.length > 0 && !selectedSnapshot) {
          setSelectedSnapshot(histData.history[histData.history.length - 1]);
        }
      }
    } catch (e) {
      console.error('Failed to load state timeline data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStateData();
  }, []);

  const handleCaptureSnapshot = async () => {
    try {
      setCapturingSnapshot(true);
      await api.triggerStateSnapshot("Manual Temporal Anchor");
      await fetchStateData();
    } catch (e) {
      console.error('Failed to capture snapshot', e);
    } finally {
      setCapturingSnapshot(false);
    }
  };

  const getOperationalBadge = (state: string) => {
    switch (state) {
      case 'DEEP_FOCUS': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'PROJECT_ACCELERATING': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'HABIT_STABILIZING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'GOAL_AT_RISK': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'RECOVERY': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default: return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c0a1a]/80 border border-white/10 shadow-2xl backdrop-blur-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#c33cff]/15 border border-[#c33cff]/30 text-[#c33cff]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Temporal State Evolution</h1>
              <p className="text-xs text-slate-400">
                Discrete state tensor progression and Markovian trajectory across time horizons.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStateData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh State Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleCaptureSnapshot}
            disabled={capturingSnapshot}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{capturingSnapshot ? 'Capturing...' : 'Capture State Anchor'}</span>
          </button>
        </div>
      </div>

      {/* Temporal Triad: Past (History) -> Current -> Predicted */}
      {triadState && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Past Baseline */}
          <div className="p-5 rounded-3xl bg-[#0c0a1a]/70 border border-white/5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                PAST BASELINE (T-1)
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <div className="text-sm font-bold text-slate-200">
              {triadState.history?.dominant_cluster || 'Baseline Sequence'}
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Focus Depth:</span>
                <span className="text-slate-300">{Math.round((triadState.history?.focus_depth || 0.72) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Energy Bandwidth:</span>
                <span className="text-slate-300">{Math.round((triadState.history?.energy_bandwidth || 0.8) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#140f2d] to-[#0c0a1a] border border-violet-500/30 backdrop-blur-2xl space-y-3 shadow-lg shadow-violet-500/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-violet-300 uppercase tracking-widest font-bold">
                CURRENT STATE (T0)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#c33cff] animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white">
              {triadState.current?.dominant_cluster || 'Active Synthesis'}
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-300">Focus Depth:</span>
                <span className="text-[#22d3ee] font-bold">{Math.round((triadState.current?.focus_depth || 0.85) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Energy Bandwidth:</span>
                <span className="text-[#c33cff] font-bold">{Math.round((triadState.current?.energy_bandwidth || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Projected Future */}
          <div className="p-5 rounded-3xl bg-[#0c0a1a]/70 border border-white/5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#22d3ee] uppercase tracking-widest font-semibold">
                PROJECTED FUTURE (T+1)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
            </div>
            <div className="text-sm font-bold text-slate-200">
              {triadState.predicted?.dominant_cluster || 'Target Trajectory'}
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Projected Focus:</span>
                <span className="text-[#22d3ee] font-bold">{Math.round((triadState.predicted?.focus_depth || 0.88) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Projected Energy:</span>
                <span className="text-violet-300 font-bold">{Math.round((triadState.predicted?.energy_bandwidth || 0.85) * 100)}%</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Main Timeline Stream */}
      <div className="p-6 rounded-3xl bg-[#0c0a1a]/80 border border-white/10 backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#c33cff]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              STATE ANCHOR TIMELINE ({history.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('intelligence', 'Analyze my temporal state evolution and predict upcoming cognitive bottlenecks.')}
            className="text-[11px] font-mono text-violet-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult AI Core</span>
          </button>
        </div>

        <div className="space-y-3">
          {history.map((snap, idx) => (
            <div
              key={snap.snapshot_id || idx}
              onClick={() => setSelectedSnapshot(snap)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                selectedSnapshot?.snapshot_id === snap.snapshot_id
                  ? 'bg-[#140f2d] border-violet-500/60 shadow-lg shadow-violet-500/10'
                  : 'bg-[#140f2d]/40 border-white/5 hover:bg-[#140f2d]/70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{snap.active_focus || 'Temporal Anchor'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${getOperationalBadge(snap.operational_state)}`}>
                    {snap.operational_state}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {snap.timestamp} • Coherence: {Math.round((snap.semantic_coherence || 0.8) * 100)}%
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Energy: <strong className="text-[#22d3ee]">{snap.energy_level}%</strong></span>
                <span className="text-slate-400">Goals: <strong className="text-violet-300">{snap.active_goals_count}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
