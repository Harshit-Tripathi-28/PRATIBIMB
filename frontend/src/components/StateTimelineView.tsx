import React, { useState, useEffect } from 'react';
import { 
  History, RefreshCw, GitCommit, Bot, Zap
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
      case 'DEEP_FOCUS': return 'bg-[#1E7BFF]/20 text-[#48D7FF] border-[#1E7BFF]/40';
      case 'PROJECT_ACCELERATING': return 'bg-[#E51D48]/20 text-[#FF365C] border-[#E51D48]/40';
      case 'HABIT_STABILIZING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'GOAL_AT_RISK': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'RECOVERY': return 'bg-[#123B73]/30 text-slate-300 border-[#123B73]/50';
      default: return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans text-[#F4F7FF] selection:bg-[#E51D48] selection:text-white max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8B0F24]/20 border border-[#E51D48]/30 text-[#FF365C]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Temporal Continuum</h1>
              <p className="text-xs text-slate-400">
                State tensor evolution and Markovian trajectory across T-1, T0, and T+1 horizons.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <button
            onClick={fetchStateData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#04060C] hover:bg-[#0c0a1a] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh State Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF365C]' : ''}`} />
          </button>
          
          <button
            onClick={handleCaptureSnapshot}
            disabled={capturingSnapshot}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{capturingSnapshot ? 'Capturing...' : 'Capture State Anchor'}</span>
          </button>
        </div>
      </div>

      {/* Temporal Triad: Past (Dim Blue) -> Current (Crimson Core) -> Future (Electric Blue) */}
      {triadState && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Past Baseline (Dim Space Blue) */}
          <div className="p-5 rounded-3xl bg-[#07152B]/60 border border-[#123B73]/40 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                PAST BASELINE (T-1)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#123B73]" />
            </div>
            <div className="text-sm font-bold text-slate-300">
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

          {/* Current State (Deep Crimson Core) */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0c0a1a] to-[#070A12] border border-[#E51D48]/40 backdrop-blur-2xl space-y-3 shadow-xl shadow-red-950/30">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-[#FF365C] uppercase tracking-widest font-bold">
                CURRENT CORE (T0)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF365C] animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white">
              {triadState.current?.dominant_cluster || 'Active Synthesis'}
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-300">Focus Depth:</span>
                <span className="text-[#48D7FF] font-bold">{Math.round((triadState.current?.focus_depth || 0.85) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Energy Bandwidth:</span>
                <span className="text-[#FF365C] font-bold">{Math.round((triadState.current?.energy_bandwidth || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Projected Future (Electric Blue Trajectory) */}
          <div className="p-5 rounded-3xl bg-[#070A12]/80 border border-[#1E7BFF]/30 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-[#48D7FF] uppercase tracking-widest font-semibold">
                PREDICTED TRAJECTORY (T+1)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#48D7FF] animate-pulse" />
            </div>
            <div className="text-sm font-bold text-slate-200">
              {triadState.predicted?.dominant_cluster || 'Target Horizon'}
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Projected Focus:</span>
                <span className="text-[#48D7FF] font-bold">{Math.round((triadState.predicted?.focus_depth || 0.88) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Projected Energy:</span>
                <span className="text-[#1E7BFF] font-bold">{Math.round((triadState.predicted?.energy_bandwidth || 0.85) * 100)}%</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Main Timeline Stream */}
      <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#FF365C]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              STATE CONTINUUM LOG ({history.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('intelligence', 'Analyze my temporal state continuum and predict potential cognitive bottlenecks.')}
            className="text-[11px] font-mono text-[#1E7BFF] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult AI Core</span>
          </button>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/5 bg-[#04060C]/40 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-[#E51D48]/10 text-[#FF365C] border border-[#E51D48]/20">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Building Your Temporal Continuum</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your Digital Twin captures state snapshots as you log focus sessions, complete milestones, and interact with the AI core. Click <strong className="text-white">Capture State Anchor</strong> above to record your baseline right now.
                </p>
              </div>
            </div>
          ) : (
            history.map((snap, idx) => (
              <div
                key={snap.snapshot_id || idx}
                onClick={() => setSelectedSnapshot(snap)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedSnapshot?.snapshot_id === snap.snapshot_id
                    ? 'bg-[#0c0a1a] border-[#E51D48]/60 shadow-lg shadow-red-950/30'
                    : 'bg-[#04060C]/60 border-white/5 hover:bg-[#04060C]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{snap.active_focus || 'Temporal State Anchor'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${getOperationalBadge(snap.operational_state)}`}>
                      {snap.operational_state}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {snap.timestamp} • Coherence: {Math.round((snap.semantic_coherence || 0.88) * 100)}%
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">Energy: <strong className="text-[#FF365C]">{snap.energy_level}%</strong></span>
                  <span className="text-slate-400">Goals: <strong className="text-[#48D7FF]">{snap.active_goals_count}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
