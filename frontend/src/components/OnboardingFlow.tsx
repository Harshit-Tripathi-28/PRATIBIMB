import React, { useState } from 'react';
import { 
  Brain, ArrowRight, ArrowLeft, CheckCircle2, 
  Sparkles, Target, Flame, Zap, Plus, X 
} from 'lucide-react';
import type { OnboardingData, AvatarConfig, DigitalTwin } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface OnboardingFlowProps {
  initialName: string;
  onCompleted: (twin: DigitalTwin) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialName, onCompleted }) => {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Identity Form
  const [name, setName] = useState(initialName || '');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['Python', 'Architecture', 'AI']);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(['Cognitive Systems', 'Productivity']);

  // Goals Form
  const [goal1Title, setGoal1Title] = useState('');
  const [goal1Category, setGoal1Category] = useState('Engineering');
  const [goal1Priority, setGoal1Priority] = useState('high');
  const [goal1Deadline, setGoal1Deadline] = useState('End of Quarter');

  // Work & Energy
  const [preferredWorkStyle, setPreferredWorkStyle] = useState('Deep Morning Sprints (3-4 hour focus blocks)');
  const [energyLevel, setEnergyLevel] = useState(80);

  // Habits
  const [habit1Title, setHabit1Title] = useState('');
  const [habit1Category, setHabit1Category] = useState('Deep Work');

  // Avatar Configuration
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    gender_expression: 'neutral',
    skin_tone: '#E0B394',
    hair_style: 'short_clean',
    hair_color: '#2C221E',
    outfit_style: 'tech_minimal',
    outfit_color: '#0F172A',
    glasses: 'none',
    mood: 'focused',
    aura_color: 'cyan',
  });

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      setSubmitting(true);
      setCalibrating(true);

      // Calibration visual sequence
      for (let i = 1; i <= 100; i += 20) {
        setCalibrationProgress(i);
        await new Promise((r) => setTimeout(r, 200));
      }

      const initialGoals = goal1Title.trim() ? [
        {
          title: goal1Title.trim(),
          category: goal1Category,
          priority: goal1Priority,
          deadline: goal1Deadline,
        }
      ] : [];

      const initialHabits = habit1Title.trim() ? [
        {
          title: habit1Title.trim(),
          category: habit1Category,
          frequency: 'Daily',
          target_days: 7,
        }
      ] : [];

      const payload: OnboardingData = {
        name: name.trim() || initialName || 'Explorer',
        title: title.trim() || 'Knowledge Explorer',
        bio: bio.trim(),
        skills,
        interests,
        preferred_work_style: preferredWorkStyle,
        energy_level: energyLevel,
        initial_goals: initialGoals,
        initial_habits: initialHabits,
        avatar_config: avatarConfig,
      };

      const updatedTwin = await api.submitOnboarding(payload);
      setCalibrationProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      onCompleted(updatedTwin);
    } catch (e) {
      console.error('Onboarding failed', e);
      setCalibrating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6 animate-fadeIn">
        {/* Step Indicator */}
        {!calibrating && (
          <div className="flex items-center justify-between px-2 mb-2 text-xs font-mono text-slate-400">
            <span>Step {step} of 5</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-cyan-400' : s < step ? 'w-4 bg-cyan-600/60' : 'w-4 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {calibrating ? (
            /* Calibration Screen */
            <div className="text-center py-10 space-y-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-2xl shadow-cyan-500/20">
                <Brain className="w-12 h-12 animate-pulse text-cyan-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Calibrating Your Digital Twin
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Constructing cognitive memory graphs, baseline behavioral models, and avatar identity.
                </p>
              </div>

              {/* Checklist */}
              <div className="max-w-xs mx-auto space-y-3 text-left font-mono text-xs text-slate-300 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Identity Matrix</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Strategic Goals</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Work & Focus Preferences</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Second Brain Memory</span>
                  <span>Clean Slate</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Behavioral Engine</span>
                  <span className="animate-pulse">Calibrating</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm mx-auto bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-all duration-300 rounded-full"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Identity */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Phase 1: Human Identity</span>
                <h2 className="text-2xl font-black text-white">Who are you?</h2>
                <p className="text-xs text-slate-400">Your Digital Twin needs a foundation to understand your cognitive domain.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Primary Role / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI Systems Architect, Biophysics Researcher, Product Designer"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Bio / Focus Statement (Optional)</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe what you are building or studying..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Core Competencies & Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                      placeholder="Add skill (e.g. React, PyTorch, Writing) and press Enter"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5">
                        {s}
                        <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSkills(skills.filter((_: string, idx: number) => idx !== i))} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Areas of Interest & Research</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); }}}
                      placeholder="Add interest (e.g. Cognitive AI, Neuroscience) and press Enter"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {interests.map((it: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-mono flex items-center gap-1.5">
                        {it}
                        <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setInterests(interests.filter((_: string, idx: number) => idx !== i))} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Goals */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Phase 2: Strategic Goals</span>
                <h2 className="text-2xl font-black text-white">What are you working toward?</h2>
                <p className="text-xs text-slate-400">PRATIBIMB aligns your daily tasks and focus sessions with your core aspirations.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Primary Strategic Goal
                    </label>
                    <input
                      type="text"
                      value={goal1Title}
                      onChange={(e) => setGoal1Title(e.target.value)}
                      placeholder="e.g. Launch AI Operating System Beta"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px]">Category</label>
                      <select
                        value={goal1Category}
                        onChange={(e) => setGoal1Category(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Research">Research</option>
                        <option value="Career">Career</option>
                        <option value="Learning">Learning</option>
                        <option value="Health">Health</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px]">Priority</label>
                      <select
                        value={goal1Priority}
                        onChange={(e) => setGoal1Priority(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">Target Timeline / Deadline</label>
                    <input
                      type="text"
                      value={goal1Deadline}
                      onChange={(e) => setGoal1Deadline(e.target.value)}
                      placeholder="e.g. End of Quarter, Nov 30, 2026"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Work Style & Focus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            /* Step 3: Work Style & Energy */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Phase 3: Cognitive Flow</span>
                <h2 className="text-2xl font-black text-white">How do you work best?</h2>
                <p className="text-xs text-slate-400">Configure your optimal focus cadence and current baseline energy.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300">Preferred Focus Pattern</label>
                  <div className="space-y-2">
                    {[
                      'Deep Morning Sprints (3-4 hour focus blocks)',
                      'Ultradian Cycles (90 min focus + 20 min reset)',
                      'Pomodoro Cadence (25 min focus sprints)',
                      'Flexible Flow (Adaptive session lengths)'
                    ].map((pattern) => (
                      <div
                        key={pattern}
                        onClick={() => setPreferredWorkStyle(pattern)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          preferredWorkStyle === pattern
                            ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{pattern}</span>
                        {preferredWorkStyle === pattern && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Self-Reported Initial Energy Level
                    </label>
                    <span className="font-mono text-amber-300 font-bold">{energyLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Used to recommend tasks matched to your cognitive capacity.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Daily Rituals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : step === 4 ? (
            /* Step 4: Habits */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Phase 4: Daily Habits</span>
                <h2 className="text-2xl font-black text-white">Any daily rituals?</h2>
                <p className="text-xs text-slate-400">Optional: Track recurring rituals to build streak momentum.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Daily Habit (Optional)
                    </label>
                    <input
                      type="text"
                      value={habit1Title}
                      onChange={(e) => setHabit1Title(e.target.value)}
                      placeholder="e.g. Morning Technical Review & Architecture"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">Category</label>
                    <select
                      value={habit1Category}
                      onChange={(e) => setHabit1Category(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="Deep Work">Deep Work</option>
                      <option value="Learning">Learning</option>
                      <option value="Health">Health</option>
                      <option value="Reflection">Reflection</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Customize Avatar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Step 5: Avatar Customization */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Phase 5: Visual Representation</span>
                <h2 className="text-2xl font-black text-white">Your Digital Avatar</h2>
                <p className="text-xs text-slate-400">Customize the visual reflection of your Digital Twin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Avatar Preview using CanonicalAvatar */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="w-36 h-36 flex items-center justify-center">
                    <CanonicalAvatar
                      config={avatarConfig}
                      size="md"
                      mode="3d"
                      showAura={true}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">{name || 'Your Twin'}’s Avatar</span>
                </div>

                {/* Quick Selectors */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 text-[11px]">Skin Tone</label>
                    <div className="flex gap-2 mt-1">
                      {['#E0B394', '#F5D0C5', '#A57255', '#6A412A', '#FBE5D6'].map((c) => (
                        <div
                          key={c}
                          onClick={() => setAvatarConfig({ ...avatarConfig, skin_tone: c })}
                          className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform ${
                            avatarConfig.skin_tone === c ? 'scale-110 border-white shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Hair Style</label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {['short_clean', 'curly_fade', 'long_wavy'].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setAvatarConfig({ ...avatarConfig, hair_style: h })}
                          className={`px-2 py-1.5 rounded-lg text-[11px] border capitalize cursor-pointer ${
                            avatarConfig.hair_style === h
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {h.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Eyewear</label>
                    <div className="flex gap-1.5 mt-1">
                      {['none', 'classic', 'cyber'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setAvatarConfig({ ...avatarConfig, glasses: g })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border capitalize cursor-pointer ${
                            avatarConfig.glasses === g
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinishOnboarding}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Initialize Digital Twin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
