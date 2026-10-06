import React, { useState } from 'react';
import { Brain, X } from 'lucide-react';
import type { UserProfile } from '../types';
import { api } from '../services/api';

interface OnboardingModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [title, setTitle] = useState(profile.title || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [skills, setSkills] = useState(profile.skills?.join(', ') || '');
  const [interests, setInterests] = useState(profile.interests?.join(', ') || '');
  const [preferredWorkStyle, setPreferredWorkStyle] = useState(profile.preferred_work_style || 'Deep Focus Blocks');
  const [timezone, setTimezone] = useState(profile.timezone || 'IST (UTC+5:30)');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateProfile({
        name,
        title,
        bio,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_work_style: preferredWorkStyle,
        workload_capacity: profile.workload_capacity || 'Optimal',
        timezone,
      });
      onProfileUpdated();
      onClose();
    } catch (e) {
      console.error('Failed to update twin profile', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto selection:bg-[#8B5CFF] selection:text-white">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0c0a1a]/95 border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Twin Genesis Calibration</h2>
              <p className="text-xs text-slate-400">
                Configure your cognitive profile so Pratibimb accurately models your identity.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Human Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Role / Craft</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Bio / Identity Summary</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Preferred Work Style</label>
              <input
                type="text"
                value={preferredWorkStyle}
                onChange={(e) => setPreferredWorkStyle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">
              Core Skills & Stacks (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">
              Interests & Domains (comma separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#05050A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#8B5CFF] focus:ring-1 focus:ring-[#8B5CFF]/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-violet-500/20 cursor-pointer transition-all"
            >
              {saving ? 'Calibrating Twin...' : 'Save & Calibrate Twin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
