import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Play, Pause, RotateCcw, Clock, CheckCircle2, 
  Award, Check, Plus, Trash2, X 
} from 'lucide-react';
import type { Habit, DigitalTwin } from '../types';
import { api } from '../services/api';

interface HabitsFocusProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
}

export const HabitsFocus: React.FC<HabitsFocusProps> = ({ twin, onRefreshTwin }) => {
  const [habits, setHabits] = useState<Habit[]>(twin.habits || []);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);

  // Focus Timer State
  const [timerDurationMins, setTimerDurationMins] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // New Habit Modal State
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Deep Work');
  const [newTargetDays, setNewTargetDays] = useState(7);
  const [savingHabit, setSavingHabit] = useState(false);

  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    setHabits(twin.habits || []);
  }, [twin.habits]);

  // Timer Tick
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            setSessionCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const handleSelectDuration = (mins: number) => {
    if (timerRunning) return;
    setTimerDurationMins(mins);
    setTimeLeftSeconds(mins * 60);
    setSessionCompleted(false);
  };

  const handleToggleTimer = () => {
    if (timeLeftSeconds === 0) {
      setTimeLeftSeconds(timerDurationMins * 60);
      setSessionCompleted(false);
    }
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeftSeconds(timerDurationMins * 60);
    setSessionCompleted(false);
  };

  const handleLogCompletedSession = async () => {
    try {
      await api.logFocusSession({
        duration_minutes: timerDurationMins,
        notes: sessionNotes || 'Standard Deep Work Session',
      });
      setSessionCompleted(false);
      setTimeLeftSeconds(timerDurationMins * 60);
      setSessionNotes('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to log focus session', e);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      setLoggingHabitId(habitId);
      await api.toggleHabit(habitId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to toggle habit', e);
    } finally {
      setLoggingHabitId(null);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.deleteHabit(habitId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to delete habit', e);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSavingHabit(true);
      await api.createHabit({
        title: newTitle.trim(),
        category: newCategory,
        target_days: newTargetDays,
        frequency: 'Daily',
      });
      setShowNewHabitModal(false);
      setNewTitle('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to create habit', e);
    } finally {
      setSavingHabit(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Habit Streaks & Focus Engine</h1>
            <p className="text-xs text-slate-400">
              Build automatic behavioral rituals and enter deep focus state with precision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Active Streak: <strong className="text-white">{twin.behavior.active_streak_days} days</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Deep Focus Timer */}
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center justify-between text-center space-y-6 backdrop-blur-md">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Clock className="w-4 h-4" />
              <span>COGNITIVE FLOW ENGINE</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectDuration(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    timerDurationMins === m
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Big Clock Display */}
          <div className="relative my-4 flex items-center justify-center">
            <div className={`w-64 h-64 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
              timerRunning
                ? 'border-cyan-400 shadow-2xl shadow-cyan-500/20'
                : 'border-slate-800 shadow-inner'
            }`}>
              <span className="text-6xl font-mono font-extrabold text-white tracking-wider">
                {formatTime(timeLeftSeconds)}
              </span>
              <span className="text-xs font-mono text-slate-400 mt-2 uppercase">
                {timerRunning ? 'Deep Focus Session Active' : 'Session Standby'}
              </span>
            </div>
          </div>

          {/* Session Complete Feedback Form */}
          {sessionCompleted ? (
            <div className="w-full p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-fadeIn">
              <div className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Focus Session Completed!
              </div>
              <input
                type="text"
                placeholder="Add session reflection or notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                onClick={handleLogCompletedSession}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Log to Digital Twin Memory
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleResetTimer}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleToggleTimer}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                  timerRunning
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white shadow-cyan-500/25'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? 'Pause Session' : 'Begin Focus Sprint'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Habit Tracker Grid */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Daily Habit Protocol ({habits.length})
            </h2>
            <button
              onClick={() => setShowNewHabitModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Habit</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No habits defined yet. Click "Add Habit" to establish your daily protocols.
            </div>
          ) : (
            <div className="space-y-3.5">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-orange-500/30 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{habit.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {habit.frequency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Category: {habit.category} • Target: {habit.target_days} days/week
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-orange-400 font-mono flex items-center gap-1 justify-end">
                        <Flame className="w-3.5 h-3.5" />
                        {habit.streak_count}d
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={loggingHabitId === habit.id}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                        habit.completed_today
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{habit.completed_today ? 'Completed' : 'Log Daily'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Define Daily Habit Protocol</span>
              </h3>
              <button onClick={() => setShowNewHabitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 15-Minute Morning Planning Ritual"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Reflection">Reflection</option>
                    <option value="Mindset">Mindset</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Target Days/Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={newTargetDays}
                    onChange={(e) => setNewTargetDays(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHabit}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  {savingHabit ? 'Adding...' : 'Establish Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
