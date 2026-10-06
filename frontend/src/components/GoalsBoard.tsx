import React, { useState } from 'react';
import { 
  Target, CheckCircle2, Circle, Clock, Plus, 
  Zap, Trash2, Layers
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
  const [goalPriority, setGoalPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  // New Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Core Architecture');
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

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      await api.toggleGoalMilestone(goalId, milestoneId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to toggle milestone', e);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      setLoading(true);
      await api.createGoal({
        title: goalTitle,
        description: goalDescription || goalTitle,
        category: goalCategory,
        deadline: goalDeadline,
        priority: goalPriority,
        progress: 0,
        milestones: [
          { id: `ms-${Date.now()}-1`, title: 'Core architecture initialization', completed: true },
          { id: `ms-${Date.now()}-2`, title: 'Production benchmark evaluation', completed: false }
        ],
        linked_task_ids: [],
      });
      setShowNewGoalModal(false);
      setGoalTitle('');
      setGoalDescription('');
      onRefreshTwin();
    } catch (e) {
      console.error('Goal creation failed', e);
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
        title: taskTitle,
        category: taskCategory,
        priority: taskPriority,
        estimated_minutes: taskEstMins,
        status: 'todo',
      });
      setShowNewTaskModal(false);
      setTaskTitle('');
      onRefreshTwin();
    } catch (e) {
      console.error('Task creation failed', e);
    } finally {
      setLoading(false);
    }
  };

  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#6c4dff] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Goal Trajectory & Velocity</h1>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                {totalProgress}% ALIGNED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Align daily cognitive focus and task execution with multi-horizon personal aspirations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#140f2d]/80 hover:bg-[#1a133d] border border-white/10 hover:border-violet-500/30 text-slate-200 hover:text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#22d3ee]" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-violet-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Cards Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c33cff]" />
            Active Life Horizons ({goals.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-5 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 hover:border-violet-500/40 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#140f2d] border border-white/10 text-violet-300 font-mono text-[10px] uppercase">
                    {g.category}
                  </span>
                  <span className="text-[#22d3ee] font-mono font-bold text-xs">{g.progress}%</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-violet-200 transition-colors">
                  {g.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3 font-sans leading-relaxed line-clamp-2">
                  {g.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-3.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#c33cff] to-[#22d3ee] rounded-full transition-all duration-500"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>

                {/* Milestones list */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Milestones (click to toggle):
                  </div>
                  {g.milestones?.map((m) => (
                    <div 
                      key={m.id} 
                      onClick={() => handleToggleMilestone(g.id, m.id)}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 group/m"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 group-hover/m:text-[#c33cff] shrink-0" />
                      )}
                      <span className={m.completed ? 'line-through text-slate-500 text-[11px]' : 'text-[11px]'}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3 border-t border-white/5">
                <span>Target: {g.deadline}</span>
                <span className="capitalize text-[#22d3ee] font-semibold">{g.priority} priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Kanban Columns */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Execution Kanban & Action Streams
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column: To Do */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/70 border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Circle className="w-3 h-3 text-slate-400" /> To Do (
                {tasks.filter((t) => t.status === 'todo').length})
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.status === 'todo')
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3.5 rounded-2xl bg-[#140f2d]/80 border border-white/5 hover:border-violet-500/40 cursor-pointer transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-violet-200 transition-colors">
                        {task.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {task.estimated_minutes}m
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[9px] ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-slate-300 border border-white/5'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/70 border border-violet-500/20 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#c33cff] pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#c33cff]" /> In Progress (
                {tasks.filter((t) => t.status === 'in_progress').length})
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3.5 rounded-2xl bg-[#140f2d]/90 border border-violet-500/30 hover:border-[#c33cff] cursor-pointer transition-all space-y-2 group shadow-md shadow-violet-500/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {task.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Zap className="w-3 h-3" /> {task.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        Advance →
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/70 border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed (
                {tasks.filter((t) => t.status === 'completed').length})
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.status === 'completed')
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3.5 rounded-2xl bg-[#140f2d]/50 border border-emerald-900/30 cursor-pointer transition-all space-y-1 opacity-75 hover:opacity-100 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-300 line-through">
                        {task.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Completed ✓
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a]/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-[#0c0a1a] border border-violet-500/30 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#c33cff]" />
                Define New Horizon Goal
              </h3>
              <span className="text-[10px] font-mono text-violet-300">HORIZON DEFINITION</span>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master Deep Representation Learning"
                  className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c33cff]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Description</label>
                <input
                  type="text"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Key milestones and outcome vision"
                  className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c33cff]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c33cff]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Career">Career</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c33cff]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c33cff]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-95 text-white font-bold text-xs cursor-pointer shadow-lg shadow-violet-500/20"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a]/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-[#0c0a1a] border border-cyan-500/30 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22d3ee]" />
                Add Execution Task
              </h3>
              <span className="text-[10px] font-mono text-cyan-300">TASK CREATION</span>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Conduct benchmark evaluation"
                  className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Minutes</label>
                  <input
                    type="number"
                    value={taskEstMins}
                    onChange={(e) => setTaskEstMins(parseInt(e.target.value))}
                    className="w-full p-2 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#6c4dff] text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
