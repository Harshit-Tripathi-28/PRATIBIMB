import React, { useState } from 'react';
import { 
  Zap, Brain, Target, Activity, Flame, 
  Sparkles, ArrowRight, RefreshCw, ShieldCheck, CheckCircle2
} from 'lucide-react';
import type { DigitalTwin, RecommendationItem } from '../types';
import { api } from '../services/api';

interface TwinDashboardProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCalibration: () => void;
}

export const TwinDashboard: React.FC<TwinDashboardProps> = ({
  twin,
  onRefresh: _onRefresh,
  onNavigateTab,
  onOpenCalibration,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  React.useEffect(() => {
    fetchRecommendations();
  }, []);

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

  const { profile, behavior, state, goals, tasks, insights, habits } = twin;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Top Banner: Digital Twin State Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Mode: {state.context_mode}
              </div>
              <span className="text-xs text-slate-400 font-mono">Cognitive State: {state.workload_status}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              {profile.name}’s Digital Twin
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your Digital Twin models your cognitive state, active goals, memories, and behavioral patterns in real-time. Focusing on <span className="text-cyan-300 font-medium">{state.current_focus}</span> with peak window <span className="text-amber-300 font-mono">{behavior.peak_focus_time}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCalibration}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              Recalibrate Twin
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Converse with Core
            </button>
          </div>
        </div>

        {/* Cognitive & Energy Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Energy Level</span>
              <span className="font-mono text-amber-300 font-bold">{state.energy_level}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-700" 
                style={{ width: `${state.energy_level}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-cyan-400" /> Productivity Score</span>
              <span className="font-mono text-cyan-300 font-bold">{behavior.productivity_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-700" 
                style={{ width: `${behavior.productivity_score}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-violet-400" /> Cognitive Load</span>
              <span className="font-mono text-violet-300 font-bold">{behavior.cognitive_load}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all duration-700" 
                style={{ width: `75%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400" /> Active Streak</span>
              <span className="font-mono text-rose-300 font-bold">{behavior.active_streak_days} Days</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, behavior.active_streak_days * 7)}%` }}
              />
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
                <h2 className="text-lg font-bold text-white tracking-wide">Pratibimb Recommended Next Actions</h2>
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
              <div className="text-center py-8 text-slate-400 text-sm">
                No immediate interventions needed. You are operating in flow state.
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
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono uppercase">
                          {rec.task?.priority || 'Priority'}
                        </span>
                        <span className="text-xs text-slate-400">Score: {rec.score}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {rec.task?.title}
                      </h4>
                      <p className="text-xs text-slate-400">{rec.recommendation_reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('chat')}
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
                <h2 className="text-lg font-bold text-white tracking-wide">Active Life Goals</h2>
              </div>
              <button 
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                View all ({goals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase">
                        {goal.category}
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">{goal.progress}%</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-3">{goal.title}</h4>
                  </div>

                  <div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
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
              ))}
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
                  Active Habits
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

        {/* Right Column (1 Col): ML Behavioral Insights & Twin State Details */}
        <div className="space-y-8">
          {/* ML Insights Stream */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-5">
              <Brain className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">ML Pattern Diagnostics</h2>
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
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      {insight.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {(insight.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight.description}</p>
                  {insight.action_prompt && (
                    <button
                      onClick={() => onNavigateTab('chat')}
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
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Cognitive Profile Identity
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Role & Title</span>
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
              <div className="pt-2">
                <div className="text-slate-400 mb-1.5">Core Skills & Stacks</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills?.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
