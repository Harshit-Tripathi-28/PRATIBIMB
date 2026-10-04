import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Flame, Sparkles, ArrowRight, 
  RefreshCw, CheckCircle2, User, Sliders, Database,
  Zap, MessageSquare, PlusCircle
} from 'lucide-react';
import type { DigitalTwin, RecommendationItem } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

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

  const { profile, state, goals, tasks, insights, habits, memories } = twin;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const activeGoals = goals.filter((g) => g.progress < 100);
  const avatarConfig = profile.avatar_config || {};

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-16">
      {/* ========================================================
          1. HERO SECTION: 3D Digital Avatar & Living Centerpiece
         ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/80 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Hero Narrative */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Digital Twin Reflecting Live</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {getGreeting()}, <span className="bg-gradient-to-r from-cyan-200 via-indigo-100 to-white bg-clip-text text-transparent">{profile.name}</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your Digital Twin is actively learning from your goals, memories, habits, and daily focus.
              {state.current_focus && (
                <> Currently centered on <strong className="text-cyan-300 font-semibold">{state.current_focus}</strong>.</>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <button
                onClick={() => onNavigateTab('chat', 'What should I focus on next?')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Ask AI Core</span>
              </button>

              <button
                onClick={() => onNavigateTab('avatar')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Customize Avatar</span>
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

          {/* Right Hero: 3D Digital Avatar Showcase */}
          <div className="w-full max-w-sm lg:max-w-md flex flex-col items-center justify-center">
            <div className="w-72 h-72 sm:w-80 sm:h-80 relative flex items-center justify-center">
              <CanonicalAvatar
                config={avatarConfig}
                size="hero"
                mode="3d"
                showAura={true}
                showNodes={true}
                nodeData={{
                  goalsCount: goals.length,
                  memoriesCount: memories.length,
                  habitsCount: habits.length,
                  tasksCount: tasks.length,
                }}
              />
            </div>
            <div className="text-center mt-1">
              <span className="text-xs font-bold text-slate-200 tracking-wide">{profile.name}</span>
              <p className="text-[11px] text-cyan-300">{profile.title || 'Personal Intelligence Core'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. YOUR DIGITAL STATE: Clean Honest Indicators
         ======================================================== */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 px-1">Your Digital State</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Goals State */}
          <div 
            onClick={() => onNavigateTab('goals')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" /> Goals
              </span>
              <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
            </div>
            <div className="text-2xl font-black text-white">{activeGoals.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {goals.length === 0 ? 'No goals defined yet' : `${activeGoals.length} active · ${goals.length - activeGoals.length} done`}
            </div>
          </div>

          {/* Tasks State */}
          <div 
            onClick={() => onNavigateTab('goals')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-violet-400" /> Tasks
              </span>
              <span className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors">→</span>
            </div>
            <div className="text-2xl font-black text-white">{pendingTasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {tasks.length === 0 ? 'Task space clear' : `${pendingTasks.length} pending`}
            </div>
          </div>

          {/* Memory State */}
          <div 
            onClick={() => onNavigateTab('memory')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-pink-400" /> Memory
              </span>
              <span className="text-xs text-slate-500 group-hover:text-pink-400 transition-colors">→</span>
            </div>
            <div className="text-2xl font-black text-white">{memories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {memories.length === 0 ? 'No memories stored' : 'Memories indexed'}
            </div>
          </div>

          {/* Habits State */}
          <div 
            onClick={() => onNavigateTab('habits')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Habits
              </span>
              <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors">→</span>
            </div>
            <div className="text-2xl font-black text-white">{habits.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {habits.length === 0 ? 'No habits tracked' : `${habits.filter(h => h.completed_today).length}/${habits.length} done today`}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN CONTENT: Priorities, Recommendations & What PRATIBIMB Knows
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Directives & Strategic Goals */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Recommended Next Action */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">AI Recommended Next Action</h3>
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
              <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 space-y-3">
                <p className="text-sm text-slate-300">Your task space is clear.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Define your goals or create a task so your Digital Twin can recommend personalized actions.
                </p>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create a Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          rec.task?.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          rec.task?.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {rec.task?.priority}
                        </span>
                        {rec.task?.estimated_minutes && (
                          <span className="text-xs text-slate-400 font-mono">~{rec.task.estimated_minutes} min</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {rec.task?.title}
                      </h4>
                      <p className="text-xs text-slate-400">{rec.recommendation_reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('chat', `I'd like to focus on: "${rec.task?.title}". Let's start.`)}
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
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Your Goals</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                View all ({goals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 space-y-3">
                <p className="text-sm text-slate-300">Define your first goal.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your Digital Twin aligns daily tasks, habit routines, and memory insights around your primary objectives.
                </p>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Define a Goal</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.slice(0, 4).map((goal) => {
                  const doneM = goal.milestones.filter(m => m.completed).length;
                  const totalM = goal.milestones.length;
                  return (
                    <div key={goal.id} className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase">
                            {goal.category}
                          </span>
                          <span className="text-cyan-400 font-mono font-bold">{goal.progress}%</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-1">{goal.title}</h4>
                        {totalM > 0 && (
                          <p className="text-[11px] text-slate-400">{doneM}/{totalM} milestones completed</p>
                        )}
                      </div>

                      <div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Deadline: {goal.deadline || 'Ongoing'}</span>
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

        {/* Right Column (1 Col): What PRATIBIMB Knows & Insights */}
        <div className="space-y-8">
          {/* What PRATIBIMB Understands Card */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                What PRATIBIMB Knows
              </h3>
              <button
                onClick={onOpenCalibration}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Update Profile →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="text-slate-400">Role / Identity</span>
                <span className="font-semibold text-cyan-300">{profile.title || 'Individual Explorer'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="text-slate-400">Work Rhythm</span>
                <span className="text-slate-200 text-right max-w-[170px] truncate">{profile.preferred_work_style || 'Flexible Sprint'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="text-slate-400">Self-Reported Energy</span>
                <span className="font-mono text-amber-300">{state.energy_level}%</span>
              </div>
              <div className="pt-2">
                <div className="text-slate-400 mb-1.5">Core Competencies</div>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No skills added yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Insights Stream */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Brain className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Twin Insights</h3>
            </div>

            {insights.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed py-3">
                Your Twin needs more activity to detect behavioral patterns. Complete a task or log a thought to begin.
              </p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      insight.impact === 'high' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                      insight.impact === 'info' ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' :
                      'bg-slate-950/50 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {insight.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {insight.created_at}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{insight.description}</p>
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
            )}
          </div>

          {/* Quick Action Navigation */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateTab('memory')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-pink-400 mb-1.5" />
                <div className="text-xs font-semibold text-white">Save Memory</div>
                <div className="text-[10px] text-slate-400">Log reflection</div>
              </button>

              <button
                onClick={() => onNavigateTab('habits')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400 mb-1.5" />
                <div className="text-xs font-semibold text-white">Focus Session</div>
                <div className="text-[10px] text-slate-400">Track ritual</div>
              </button>

              <button
                onClick={() => onNavigateTab('avatar')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-400 mb-1.5" />
                <div className="text-xs font-semibold text-white">Your Avatar</div>
                <div className="text-[10px] text-slate-400">Customize look</div>
              </button>

              <button
                onClick={() => onNavigateTab('chat')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400 mb-1.5" />
                <div className="text-xs font-semibold text-white">Talk to AI</div>
                <div className="text-[10px] text-slate-400">Reasoning core</div>
              </button>
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
