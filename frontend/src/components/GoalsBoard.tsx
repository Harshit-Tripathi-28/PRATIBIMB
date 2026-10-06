import React, { useState } from 'react';
import { 
  Target, CheckCircle2, Circle, Clock, Plus, 
  Trash2, Cpu
} from 'lucide-react';
import type { Goal, Task, DigitalTwin } from '../types';
import { api } from '../services/api';

interface GoalsBoardProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
}

export const GoalsBoard: React.FC<GoalsBoardProps> = ({ twin, onRefreshTwin }) => {
  const [goals, setGoals] = useState<Goal[]>(twin.goals || []);
  const [tasks, setTasks] = useState<Task[]>(twin.tasks || []);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New Goal State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('Engineering');
  const [goalDeadline, setGoalDeadline] = useState('2026-12-31');
  const [goalPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  // New Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory] = useState('Core Architecture');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskEstMins, setTaskEstMins] = useState(45);

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setGoals(twin.goals || []);
    setTasks(twin.tasks || []);
  }, [twin.goals, twin.tasks]);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleTask(taskId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to toggle task', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    try {
      setLoading(true);
      await api.createGoal({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        category: goalCategory,
        deadline: goalDeadline,
        priority: goalPriority,
      });
      setShowNewGoalModal(false);
      setGoalTitle('');
      setGoalDescription('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to create goal', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      setLoading(true);
      await api.createTask({
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        estimated_minutes: taskEstMins,
      });
      setShowNewTaskModal(false);
      setTaskTitle('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to create task', e);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'in_progress');

  return (
    <div className="space-y-6 animate-fadeIn text-[#F4F7FF] max-w-7xl mx-auto pb-20 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070A12]/90 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Strategic Trajectory System</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-mono text-[10px] font-bold">
                TRAJECTORY ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Long-term strategic horizons, milestone progressions, and execution velocity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#04060C] hover:bg-[#0c0a1a] border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#48D7FF]" />
            <span>New Action</span>
          </button>
          
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Strategic Horizon</span>
          </button>
        </div>
      </div>

      {/* Strategic Horizons Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#FF365C]" />
            ACTIVE STRATEGIC HORIZONS ({goals.length})
          </span>
          <span className="text-[10px] text-slate-500">VELOCITY TRACKING ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-5 rounded-3xl bg-[#070A12]/90 border border-white/10 hover:border-[#E51D48]/30 transition-all space-y-4 backdrop-blur-2xl group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-bold uppercase">
                  {goal.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{goal.deadline || 'Ongoing'}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#FF365C] transition-colors">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{goal.description}</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2 border-t border-white/5 font-mono text-[11px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Horizon Progress</span>
                  <span className="text-[#48D7FF] font-bold">{goal.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#04060C] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Kanban */}
      <div className="space-y-3 pt-4">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 block">
          EXECUTION DISPATCH ({tasks.length} ACTIONS)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1: Pending */}
          <div className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-xs">
              <span className="text-slate-400">Pending</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{pendingTasks.length}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className="p-3.5 rounded-2xl bg-[#04060C] border border-white/5 hover:border-white/20 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-white font-medium group-hover:text-[#48D7FF] transition-colors">{t.title}</span>
                    <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{t.estimated_minutes || 30}m</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="p-4 rounded-3xl bg-[#070A12]/80 border border-[#E51D48]/30 space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-xs">
              <span className="text-[#FF365C] font-bold">In Focus</span>
              <span className="px-2 py-0.5 rounded bg-[#E51D48]/15 text-[#FF365C] font-bold">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className="p-3.5 rounded-2xl bg-[#0c0a1a] border border-[#E51D48]/40 transition-all cursor-pointer space-y-2 group shadow-md shadow-red-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-white font-bold">{t.title}</span>
                    <Clock className="w-4 h-4 text-[#FF365C] shrink-0 mt-0.5 animate-spin" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-[#48D7FF] font-bold">{t.category}</span>
                    <span>{t.estimated_minutes || 45}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-xs">
              <span className="text-emerald-400">Completed</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{completedTasks.length}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className="p-3.5 rounded-2xl bg-[#04060C]/60 border border-white/5 opacity-70 hover:opacity-100 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-400 line-through">{t.title}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4 animate-fadeIn font-sans">
          <div className="w-full max-w-lg rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF365C]" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">New Strategic Horizon</h3>
              </div>
              <button onClick={() => setShowNewGoalModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Horizon Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Launch AI Distributed Inference Engine"
                  className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Description</label>
                <textarea
                  rows={2}
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Scope, target outcome, and core milestones..."
                  className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research</option>
                    <option value="Career">Career</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Deadline</label>
                  <input
                    type="text"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    placeholder="e.g. 2026-12-31"
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white font-bold font-mono shadow-md shadow-red-950/40 cursor-pointer"
                >
                  {loading ? 'Aligning...' : 'Establish Horizon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4 animate-fadeIn font-sans">
          <div className="w-full max-w-md rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#48D7FF]" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">New Action Dispatch</h3>
              </div>
              <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Action Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement GNN tensor extraction pipeline"
                  className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    value={taskEstMins}
                    onChange={(e) => setTaskEstMins(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white font-bold font-mono shadow-md shadow-red-950/40 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Dispatch Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
