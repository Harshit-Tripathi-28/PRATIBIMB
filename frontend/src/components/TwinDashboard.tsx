import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Flame, Sparkles, ArrowRight, 
  RefreshCw, CheckCircle2, User, Sliders, Database,
  Zap, ChevronRight
} from 'lucide-react';
import type { DigitalTwin, RecommendationItem } from '../types';
import { api } from '../services/api';

interface TwinDashboardProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onOpenCalibration: () => void;
}

export const TwinDashboard: React.FC<TwinDashboardProps> = ({
  twin,
  onRefresh,
  onNavigateTab,
  onOpenCalibration,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(twin.state.energy_level);
  const [updatingEnergy, setUpdatingEnergy] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    setSelectedEnergy(twin.state.energy_level);
  }, [twin.state.energy_level]);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (e) {
      console.error('Failed to load recommendations', e);
    } finally {
      setLoadingRecs(false);
    }
  };

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

  const { profile, behavior, state, goals, tasks, insights, habits, memories } = twin;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const avatar = profile.avatar_config || {
    skin_tone: '#E0B394',
    hair_style: 'short_clean',
    hair_color: '#2C221E',
    outfit_style: 'tech_minimal',
    outfit_color: '#0F172A',
    glasses: 'none',
    mood: 'focused',
    aura_color: 'cyan',
  };

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-12">
      {/* ========================================================
          1. HERO SECTION: Digital Twin & Live Avatar Centerpiece
         ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/50 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Hero Text */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {state.context_mode || 'Cognitive Active'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Cognitive State: <strong className="text-cyan-300">{behavior.cognitive_load}</strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              {getGreeting()}, <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent">{profile.name}</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your Personal AI Digital Twin is actively learning from your goals, memories, habits, and focus activity. Currently centered on <span className="text-cyan-300 font-semibold">{state.current_focus}</span>.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('chat')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Dialogue with AI Core</span>
              </button>
              <button
                onClick={() => onNavigateTab('avatar')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Customize Avatar</span>
              </button>
              <button
                onClick={onOpenCalibration}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Brain className="w-4 h-4 text-violet-400" />
                <span>Calibrate Identity</span>
              </button>
              <button
                onClick={() => setShowEnergyModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Energy: {state.energy_level}%</span>
              </button>
            </div>
          </div>

          {/* Right Hero Avatar Showcase */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl relative group shrink-0">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-900">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill={avatar.aura_color === 'cyan' ? '#06b6d4' : avatar.aura_color === 'violet' ? '#8b5cf6' : avatar.aura_color === 'amber' ? '#f59e0b' : '#10b981'} opacity="0.18" />
                <path d="M 20 100 Q 50 70 80 100 Z" fill={avatar.outfit_color || '#0F172A'} />
                <circle cx="50" cy="45" r="22" fill={avatar.skin_tone || '#E0B394'} />
                <path
                  d={
                    avatar.hair_style === 'short_clean' ? "M 28 42 Q 50 20 72 42 Q 50 28 28 42 Z" :
                    avatar.hair_style === 'curly_fade' ? "M 26 40 Q 50 16 74 40 Q 70 25 26 40 Z" :
                    "M 26 42 Q 50 18 74 42 Q 80 75 74 65 Q 50 25 26 42 Z"
                  }
                  fill={avatar.hair_color || '#2C221E'}
                />
                <circle cx="42" cy="44" r="2.5" fill="#1e293b" />
                <circle cx="58" cy="44" r="2.5" fill="#1e293b" />
                {avatar.glasses === 'classic' && (
                  <g stroke="#0f172a" strokeWidth="1.5" fill="none">
                    <rect x="36" y="40" width="12" height="8" rx="2" />
                    <rect x="52" y="40" width="12" height="8" rx="2" />
                    <line x1="48" y1="44" x2="52" y2="44" />
                  </g>
                )}
                {avatar.glasses === 'cyber' && (
                  <path d="M 34 41 L 66 41 L 62 47 L 38 47 Z" fill="#06b6d4" opacity="0.85" />
                )}
                <path d="M 44 54 Q 50 58 56 54" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center mt-3 space-y-0.5">
              <span className="text-xs font-bold text-white tracking-wide">{profile.name}</span>
              <p className="text-[11px] font-mono text-cyan-300">{profile.title || 'Digital Twin Core'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. DIGITAL TWIN LIVING ARCHITECTURE OVERVIEW
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Goals Node */}
        <div 
          onClick={() => onNavigateTab('goals')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" /> Strategic Goals
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="text-2xl font-black text-white">{goals.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {goals.length === 0 ? 'No active goals' : `${goals.filter(g => g.progress === 100).length} completed`}
          </div>
        </div>

        {/* Tasks Node */}
        <div 
          onClick={() => onNavigateTab('goals')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" /> Pending Tasks
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
          </div>
          <div className="text-2xl font-black text-white">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingTasks.length === 0 ? 'Queue clear' : `${tasks.filter(t => t.status === 'completed').length} completed`}
          </div>
        </div>

        {/* Second Brain Memories */}
        <div 
          onClick={() => onNavigateTab('memory')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" /> Second Brain
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="text-2xl font-black text-white">{memories.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {memories.length === 0 ? 'No memories stored' : 'Indexed in vector vault'}
          </div>
        </div>

        {/* Daily Habits */}
        <div 
          onClick={() => onNavigateTab('habits')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" /> Daily Habits
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
          </div>
          <div className="text-2xl font-black text-white">{habits.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {habits.length === 0 ? 'No habits set' : `${habits.filter(h => h.completed_today).length}/${habits.length} done today`}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN CONTENT: Priorities, Recommendations & Insights
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Action Directives & Goals */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Recommended Next Action */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Recommended Focus Directive</h2>
              </div>
              <button 
                onClick={fetchRecommendations}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Refresh recommendations"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRecs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <p className="text-xs text-slate-400">Your task space is currently clear or no pending tasks match your active focus.</p>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
                >
                  Create a New Task →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-4.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          rec.task?.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          rec.task?.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {rec.task?.priority}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Rank: {rec.score}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {rec.task?.title}
                      </h4>
                      <p className="text-xs text-slate-400">{rec.recommendation_reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('chat', `I'd like to work on: "${rec.task?.title}". How should we approach this?`)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Act with Twin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Goals Showcase */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Strategic Goals</h2>
              </div>
              <button 
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                View all ({goals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <p className="text-xs text-slate-400">You have no strategic goals defined yet.</p>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
                >
                  Define Your First Goal →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.slice(0, 4).map((goal) => {
                  const doneM = goal.milestones.filter(m => m.completed).length;
                  const totalM = goal.milestones.length;
                  return (
                    <div key={goal.id} className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase">
                            {goal.category}
                          </span>
                          <span className="text-cyan-400 font-mono font-bold">{goal.progress}%</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-1">{goal.title}</h4>
                        <p className="text-[11px] text-slate-400">{doneM}/{totalM} milestones completed</p>
                      </div>

                      <div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Deadline: {goal.deadline}</span>
                          <span className="capitalize text-cyan-300 font-mono">{goal.priority}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Dynamic Insights & Human Identity */}
        <div className="space-y-8">
          {/* Dynamic Insights Stream */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <Brain className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Twin Insights</h2>
            </div>

            <div className="space-y-3.5">
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    insight.impact === 'high' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                    insight.impact === 'info' ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' :
                    'bg-slate-950/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      {insight.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {insight.created_at}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{insight.description}</p>
                  {insight.action_prompt && (
                    <button
                      onClick={() => onNavigateTab('chat', insight.action_prompt)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{insight.action_prompt}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What Your Twin Knows Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Human Identity Model
              </h3>
              <button
                onClick={() => onNavigateTab('avatar')}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Edit Avatar →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Role / Title</span>
                <span className="font-mono text-cyan-300 font-medium">{profile.title || 'Explorer'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Work Style</span>
                <span className="font-mono text-slate-200 text-right max-w-[170px] truncate">{profile.preferred_work_style}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Energy Level</span>
                <span className="font-mono text-amber-300">{state.energy_level}% (Check-in)</span>
              </div>
              <div className="pt-2">
                <div className="text-slate-400 mb-1.5">Competencies</div>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No skills listed yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. ENERGY CHECK-IN MODAL
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
              Self-report your current cognitive capacity. Your Digital Twin uses this to adjust task recommendations.
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
                <span>10% (Exhausted)</span>
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
