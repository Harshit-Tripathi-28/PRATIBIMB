import React, { useState } from 'react';
import { 
  Target, CheckCircle2, Circle, Clock, Plus, 
  Zap, Trash2 
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Goals & Execution Board</h1>
            <p className="text-xs text-slate-400">
              Align daily cognitive focus with high-level personal aspirations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Cards Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Active Life Goals ({goals.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase">
                    {g.category}
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">{g.progress}%</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{g.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{g.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>

                {/* Milestones list */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <div className="text-[11px] font-mono text-slate-400">Milestones (click to toggle):</div>
                  {g.milestones?.map((m) => (
                    <div 
                      key={m.id} 
                      onClick={() => handleToggleMilestone(g.id, m.id)}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5 group"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                      )}
                      <span className={m.completed ? 'line-through text-slate-500' : ''}>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Deadline: {g.deadline}</span>
                <span className="capitalize text-cyan-300">{g.priority} priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Kanban Columns */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Execution Kanban & Action Streams
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column: To Do */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 pb-2 border-b border-slate-800">
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
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200">
                        {task.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimated_minutes}m
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
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
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" /> In Progress (
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
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all space-y-2 group shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-200">
                        {task.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Zap className="w-3 h-3" /> {task.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">Click to toggle →</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 pb-2 border-b border-slate-800">
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
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-emerald-900/30 cursor-pointer transition-all space-y-1 opacity-70 hover:opacity-100 group"
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
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-emerald-500 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Define New Life Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master Deep Reinforcement Learning"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Description</label>
                <input
                  type="text"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Key milestones and outcome vision"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Add Execution Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Conduct benchmark evaluation"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
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
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
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
