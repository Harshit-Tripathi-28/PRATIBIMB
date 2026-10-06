import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Play, Pause, RotateCcw, CheckCircle2, 
  Check, Plus, Trash2
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

  const handleStartTimer = () => setTimerRunning(true);
  const handlePauseTimer = () => setTimerRunning(false);
  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeftSeconds(timerDurationMins * 60);
    setSessionCompleted(false);
  };

  const handleSelectPreset = (mins: number) => {
    setTimerDurationMins(mins);
    setTimeLeftSeconds(mins * 60);
    setTimerRunning(false);
    setSessionCompleted(false);
  };

  const handleLogFocusSession = async () => {
    try {
      await api.logFocusSession({
        duration_minutes: timerDurationMins,
        notes: sessionNotes.trim() ? `[${twin.state.current_focus || 'Deep Work'}] ${sessionNotes.trim()}` : `Domain: ${twin.state.current_focus || 'Deep Work'}`,
        energy_after: twin.state.energy_level,
      });
      setSessionNotes('');
      setSessionCompleted(false);
      handleResetTimer();
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to log focus session', e);
    }
  };

  const handleLogHabit = async (habitId: string) => {
    try {
      setLoggingHabitId(habitId);
      await api.toggleHabit(habitId);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to log habit completion', e);
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
        frequency: 'Daily',
        target_days: newTargetDays,
      });
      setShowNewHabitModal(false);
      setNewTitle('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to create habit protocol', e);
    } finally {
      setSavingHabit(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = ((timerDurationMins * 60 - timeLeftSeconds) / (timerDurationMins * 60)) * 100;

  return (
    <div className="space-y-6 animate-fadeIn text-[#F4F7FF] max-w-7xl mx-auto pb-20 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070A12]/90 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Focus & Rhythm Protocols</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-mono text-[10px] font-bold">
                ATTENTION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Circadian focus blocks, ultradian cycles, and recursive habit consistency tracking.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewHabitModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Protocol</span>
        </button>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Radial Glowing Focus Timer (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
            <span className="text-slate-400">FOCUS TIMER</span>
            <span className="text-[#FF365C] font-bold">{twin.state.current_focus}</span>
          </div>

          {/* Radial Circular Progress Display */}
          <div className="relative w-56 h-56 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                fill="none"
                stroke="#04060C"
                strokeWidth="12"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                fill="none"
                stroke="url(#crimsonBlueGrad)"
                strokeWidth="12"
                strokeDasharray="603"
                strokeDashoffset={603 - (603 * progressPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="crimsonBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B0F24" />
                  <stop offset="50%" stopColor="#E51D48" />
                  <stop offset="100%" stopColor="#1E7BFF" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {formatTime(timeLeftSeconds)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">
                {timerRunning ? 'FOCUS BLOCK ACTIVE' : 'INTERVAL READY'}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2 font-mono text-xs">
            {[
              { label: '25m Sprint', mins: 25 },
              { label: '50m Deep', mins: 50 },
              { label: '90m Ultradian', mins: 90 },
            ].map((p) => (
              <button
                key={p.mins}
                onClick={() => handleSelectPreset(p.mins)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  timerDurationMins === p.mins
                    ? 'bg-[#E51D48]/20 border-[#E51D48]/50 text-white font-bold'
                    : 'bg-[#04060C] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full">
            {!timerRunning ? (
              <button
                onClick={handleStartTimer}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Initiate Focus Block</span>
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="flex-1 py-3 rounded-2xl bg-[#04060C] border border-[#E51D48]/50 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Interval</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl bg-[#04060C] hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Complete Reflection Form */}
          {sessionCompleted && (
            <div className="w-full p-4 rounded-2xl bg-[#0c0a1a] border border-[#E51D48]/40 space-y-3 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Focus Session Complete (+{timerDurationMins}m)</span>
              </div>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Session reflection note (optional)..."
                className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white focus:outline-none"
              />
              <button
                onClick={handleLogFocusSession}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] to-[#E51D48] text-white font-bold font-mono cursor-pointer"
              >
                Log Session to Memory
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Daily Habit Protocols (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-mono uppercase">Daily Habit Protocols ({habits.length})</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">STREAK LOG ACTIVE</span>
            </div>

            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 rounded-2xl bg-[#04060C] border border-white/5 hover:border-[#E51D48]/30 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{habit.title}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-slate-400">
                        {habit.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Flame className="w-3 h-3" />
                        {habit.streak_count || 0} Day Streak
                      </span>
                      <span>Target: {habit.target_days}d/wk</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLogHabit(habit.id)}
                      disabled={loggingHabitId === habit.id}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{loggingHabitId === habit.id ? 'Logging...' : 'Check In'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4 animate-fadeIn font-sans">
          <div className="w-full max-w-md rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF365C]" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">New Habit Protocol</h3>
              </div>
              <button onClick={() => setShowNewHabitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Protocol Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily Architectural Review & State Calibration"
                  className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Reflection">Reflection</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Weekly Target (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={newTargetDays}
                    onChange={(e) => setNewTargetDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHabit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white font-bold font-mono shadow-md shadow-red-950/40 cursor-pointer"
                >
                  {savingHabit ? 'Configuring...' : 'Establish Protocol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
