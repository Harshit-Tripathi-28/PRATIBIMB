import React from 'react';
import { 
  Database, Target, CheckCircle2, Zap, 
  Search 
} from 'lucide-react';
import type { DigitalTwin, LatentStateVector } from '../types';

interface BottomTelemetryBarProps {
  twin: DigitalTwin;
  latentState?: LatentStateVector | null;
  onOpenCommandPalette: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onOpenEnergyCheckin: () => void;
}

export const BottomTelemetryBar: React.FC<BottomTelemetryBarProps> = ({
  twin,
  latentState,
  onOpenCommandPalette,
  onNavigateTab,
  onOpenEnergyCheckin,
}) => {
  const activeGoalsCount = twin.goals.filter((g) => g.progress < 100).length;
  const pendingTasksCount = twin.tasks.filter((t) => t.status !== 'completed').length;
  const memoriesCount = twin.memories.length;
  const coherencePct = latentState ? Math.round(latentState.semantic_coherence * 100) : 92;
  const operationalState = twin.state.operational_state || 'ACTIVE';

  return (
    <div className="hidden md:flex fixed bottom-0 left-16 right-0 h-11 bg-[#070A12]/90 backdrop-blur-2xl border-t border-white/10 z-30 px-6 items-center justify-between text-[11px] font-mono select-none font-sans">
      
      {/* Left: System & Operational State */}
      <div className="flex items-center gap-4 text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF365C] animate-pulse shadow-sm shadow-[#FF365C]/50" />
          <span className="font-bold text-slate-200">NEURAL CORE // ACTIVE</span>
        </div>

        <span className="text-slate-700">•</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">STATE:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#0B132B] border border-[#E51D48]/30 text-[#FF365C] font-semibold text-[10px]">
            {operationalState}
          </span>
        </div>

        <span className="text-slate-700">•</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">COHERENCE:</span>
          <span className="text-emerald-400 font-semibold">{coherencePct}%</span>
        </div>
      </div>

      {/* Center: Command Bar Quick Trigger */}
      <div 
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0B132B]/80 hover:bg-[#121F45] border border-white/10 hover:border-[#E51D48]/40 text-slate-400 hover:text-slate-200 cursor-pointer transition-all max-w-sm w-full mx-6 justify-between group"
      >
        <div className="flex items-center gap-2 text-xs font-sans text-slate-400 group-hover:text-slate-200">
          <Search className="w-3.5 h-3.5 text-[#FF365C]" />
          <span>Ask PRATIBIMB or trigger command...</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono text-slate-400 border border-white/10">
          ⌘K
        </kbd>
      </div>

      {/* Right: Live Telemetry Counters */}
      <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
        <div 
          onClick={() => onNavigateTab('memory')}
          className="flex items-center gap-1.5 hover:text-[#FF365C] cursor-pointer transition-colors"
          title="Memory Vault"
        >
          <Database className="w-3.5 h-3.5 text-[#E51D48]" />
          <span>MEM: {memoriesCount}</span>
        </div>

        <div 
          onClick={() => onNavigateTab('goals')}
          className="flex items-center gap-1.5 hover:text-[#1E7BFF] cursor-pointer transition-colors"
          title="Goals & Tasks"
        >
          <Target className="w-3.5 h-3.5 text-[#1E7BFF]" />
          <span>GOALS: {activeGoalsCount}</span>
        </div>

        <div 
          onClick={() => onNavigateTab('goals')}
          className="flex items-center gap-1.5 hover:text-[#FF365C] cursor-pointer transition-colors"
          title="Pending Tasks"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF365C]" />
          <span>TASKS: {pendingTasksCount}</span>
        </div>

        <div 
          onClick={onOpenEnergyCheckin}
          className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
          title="Energy Check-in"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 font-bold">{twin.state.energy_level}%</span>
        </div>
      </div>

    </div>
  );
};
