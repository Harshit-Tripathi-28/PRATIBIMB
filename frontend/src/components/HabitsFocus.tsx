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
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] flex items-center justify-center text-slate-950 shadow-lg shadow-violet-500/20">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Focus Rhythm & Habit Consistency</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                RHYTHM ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Build high-velocity cognitive habits and enter sustained deep focus states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#140f2d]/80 px-4 py-2.5 rounded-2xl border border-white/10">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Active Streak: <strong className="text-[#22d3ee] font-bold">{twin.behavior.active_streak_days} days</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Deep Focus Timer */}
        <div className="p-8 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl flex flex-col items-center justify-between text-center space-y-6 backdrop-blur-2xl">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c33cff]">
              <Clock className="w-4 h-4" />
              <span>COGNITIVE FLOW ENGINE</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectDuration(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    timerDurationMins === m
                      ? 'bg-gradient-to-r from-[#c33cff] to-[#6c4dff] text-white font-bold shadow-md shadow-violet-500/20'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Big Clock Display with Glowing Violet/Cyan Rim */}
          <div className="relative my-4 flex items-center justify-center">
            <div className={`w-64 h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
              timerRunning
                ? 'border-[#c33cff] shadow-[0_0_50px_rgba(195,60,255,0.25)] bg-[#140f2d]/60'
                : 'border-white/10 bg-[#140f2d]/30 shadow-inner'
            }`}>
              <span className="text-6xl font-mono font-extrabold text-white tracking-wider">
                {formatTime(timeLeftSeconds)}
              </span>
              <span className="text-[10px] font-mono text-violet-300 mt-2 uppercase tracking-widest">
                {timerRunning ? 'Deep Focus Session Active' : 'Session Standby'}
              </span>
            </div>
          </div>

          {/* Session Complete Feedback Form */}
          {sessionCompleted ? (
            <div className="w-full p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-fadeIn">
              <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                FOCUS SESSION COMPLETED
              </div>
              <input
                type="text"
                placeholder="Add session reflection or key output notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0c0a1a] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={handleLogCompletedSession}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Log to Digital Twin Memory
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetTimer}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleTimer}
                className={`px-8 py-3.5 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                  timerRunning
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] text-slate-950 hover:opacity-95 shadow-violet-500/25'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? 'Pause Session' : 'Begin Focus Sprint'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Habit Tracker Grid */}
        <div className="p-6 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl space-y-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Daily Habit Protocol ({habits.length})
            </h2>
            <button
              onClick={() => setShowNewHabitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#140f2d] hover:bg-[#1a133d] text-xs font-semibold text-violet-300 hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span>Add Habit</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No habits defined yet. Click "Add Habit" to establish your daily protocols.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 rounded-2xl bg-[#140f2d]/70 border border-white/5 hover:border-violet-500/30 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-violet-200 transition-colors">
                        {habit.title}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-violet-300">
                        {habit.frequency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Category: {habit.category} • Target: {habit.target_days} days/week
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
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
                          : 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a]/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-[#0c0a1a] border border-violet-500/30 p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Define Daily Habit Protocol</span>
              </h3>
              <button onClick={() => setShowNewHabitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 15-Minute Morning Synthesis Ritual"
                  className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c33cff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c33cff]"
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
                    className="w-full p-2.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c33cff]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHabit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
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
