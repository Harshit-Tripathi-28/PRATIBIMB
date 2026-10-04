import React, { useState } from 'react';
import { 
  Zap, Brain, Target, Activity, Flame, 
  Sparkles, ArrowRight, RefreshCw, ShieldCheck, CheckCircle2, User, Sliders
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

  React.useEffect(() => {
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

  const { profile, behavior, state, goals, tasks, insights, habits } = twin;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Dynamic cognitive load bar calculation
  const cognitiveLoadPercent = 
    behavior.cognitive_load === 'Heavy' ? 95 :
    behavior.cognitive_load === 'Elevated' ? 70 :
    behavior.cognitive_load === 'Balanced' ? 45 : 20;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Top Banner: Digital Twin State Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Mode: {state.context_mode}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Cognitive State: <strong className="text-cyan-300">{behavior.cognitive_load}</strong>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              {profile.name}’s Digital Twin
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your Digital Twin models your cognitive state, active goals, memories, and behavioral patterns. Currently focused on <span className="text-cyan-300 font-medium">{state.current_focus}</span>. Peak focus bracket: <span className="text-amber-300 font-mono">{behavior.peak_focus_time}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('avatar')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Digital Avatar</span>
            </button>
            <button
              onClick={onOpenCalibration}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-violet-400" />
              <span>Calibrate Identity</span>
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>AI Core Dialogue</span>
            </button>
          </div>
        </div>

        {/* Cognitive & Energy Gauges (Honest Calculated Metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
          {/* Energy Check-in */}
          <div 
            onClick={() => setShowEnergyModal(true)}
            className="bg-slate-950/60 hover:bg-slate-950/80 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
            title="Click to check in your energy level"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy Check-in
              </span>
              <span className="font-mono text-amber-300 font-bold flex items-center gap-1">
                {state.energy_level}%
                <Sliders className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500" 
                style={{ width: `${state.energy_level}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-mono">Click to update check-in</div>
          </div>

          {/* Productivity Score */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Productivity Index
              </span>
              <span className="font-mono text-cyan-300 font-bold">{behavior.productivity_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500" 
                style={{ width: `${behavior.productivity_score}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
              Tasks: {Math.round(behavior.task_completion_rate * 100)}% • Habits: {Math.round(behavior.habit_consistency_index * 100)}%
            </div>
          </div>

          {/* Cognitive Load (Dynamic Bar) */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Brain className="w-3.5 h-3.5 text-violet-400" /> Cognitive Load
              </span>
              <span className="font-mono text-violet-300 font-bold">{behavior.cognitive_load}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all duration-500" 
                style={{ width: `${cognitiveLoadPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
              {pendingTasks.length} pending task{pendingTasks.length !== 1 ? 's' : ''} in queue
            </div>
          </div>

          {/* Active Habit Streak */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Active Streak
              </span>
              <span className="font-mono text-rose-300 font-bold">{behavior.active_streak_days}d</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, behavior.active_streak_days * 15))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
              {habits.filter(h => h.completed_today).length}/{habits.length} habits done today
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Priorities, AI Recommendations & ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Actions & Goals */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Recommended Next Actions */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Dynamic Task Alignment</h2>
              </div>
              <button 
                onClick={fetchRecommendations}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Refresh Recommendations"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRecs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No pending tasks found. All active tasks completed or queue is empty.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          rec.task?.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          rec.task?.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {rec.task?.priority}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Rank Score: {rec.score}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {rec.task?.title}
                      </h4>
                      <p className="text-xs text-slate-400">{rec.recommendation_reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('chat', `I'd like to work on: "${rec.task?.title}". How should we tackle this?`)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Act with Twin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals & Milestone Progress */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Active Strategic Goals</h2>
              </div>
              <button 
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                View all ({goals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.slice(0, 4).map((goal) => {
                const doneM = goal.milestones.filter(m => m.completed).length;
                const totalM = goal.milestones.length;
                return (
                  <div key={goal.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase">
                          {goal.category}
                        </span>
                        <span className="text-cyan-400 font-mono font-bold">{goal.progress}%</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-2">{goal.title}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{doneM}/{totalM} milestones completed</p>
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
                        <span className="capitalize text-cyan-300 font-mono">{goal.priority} priority</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Tasks & Habit Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgent Tasks */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Prioritized Tasks ({pendingTasks.length})
                </h3>
                <button onClick={() => onNavigateTab('goals')} className="text-xs text-slate-400 hover:text-white cursor-pointer">Manage</button>
              </div>
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-slate-200 font-medium">{task.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">Est. {task.estimated_minutes} min • {task.category}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                      task.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Streaks */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Daily Habits ({habits.length})
                </h3>
                <button onClick={() => onNavigateTab('habits')} className="text-xs text-slate-400 hover:text-white cursor-pointer">Track</button>
              </div>
              <div className="space-y-2.5">
                {habits.slice(0, 3).map(habit => (
                  <div key={habit.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-slate-200 font-medium">{habit.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{habit.frequency} • {habit.category}</div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 font-mono font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{habit.streak_count}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Dynamic Insights & Twin Profile */}
        <div className="space-y-8">
          {/* Dynamic Insights Stream */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-5">
              <Brain className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Dynamic Twin Insights</h2>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-xl border transition-all ${
                    insight.impact === 'high' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                    insight.impact === 'info' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' :
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
                  <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight.description}</p>
                  {insight.action_prompt && (
                    <button
                      onClick={() => onNavigateTab('chat', insight.action_prompt)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {insight.action_prompt}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Twin Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
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
                <span className="text-slate-400">Title</span>
                <span className="font-mono text-cyan-300 font-medium">{profile.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Work Style</span>
                <span className="font-mono text-slate-200">{profile.preferred_work_style}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Timezone</span>
                <span className="text-slate-300">{profile.timezone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Avatar Mood</span>
                <span className="font-mono text-amber-300 capitalize">{profile.avatar_config?.mood || 'focused'}</span>
              </div>
              <div className="pt-2">
                <div className="text-slate-400 mb-1.5">Core Competencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills?.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Check-in Modal */}
      {showEnergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Daily Energy Check-in</span>
              </h3>
              <button onClick={() => setShowEnergyModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Calibrate your current cognitive and physical energy level. This informs task prioritization and focus block sizing.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Selected Level:</span>
                <span className="text-amber-300 font-bold text-base">{selectedEnergy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Depleted (20%)</span>
                <span>Balanced (60%)</span>
                <span>Peak Flow (95%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {[40, 60, 80, 95].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedEnergy(lvl)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-mono cursor-pointer ${
                    selectedEnergy === lvl ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEnergyModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateEnergy(selectedEnergy)}
                disabled={updatingEnergy}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                {updatingEnergy ? 'Saving...' : 'Record Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
