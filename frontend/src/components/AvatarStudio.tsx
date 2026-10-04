import React, { useState } from 'react';
import { 
  Sparkles, Save, RotateCcw, 
  Smile, Glasses, Palette, Shirt, Check
} from 'lucide-react';
import type { DigitalTwin, AvatarConfig } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface AvatarStudioProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
}

const SKIN_TONES = [
  { label: 'Porcelain', value: '#FAD9C0' },
  { label: 'Warm Sand', value: '#E0B394' },
  { label: 'Golden Honey', value: '#C68642' },
  { label: 'Rich Chestnut', value: '#8D5524' },
  { label: 'Deep Espresso', value: '#3D2314' },
  { label: 'Warm Bronze', value: '#A56542' },
];

const HAIR_STYLES = [
  { id: 'short_clean', label: 'Short Clean' },
  { id: 'curly', label: 'Textured Curls' },
  { id: 'long_wavy', label: 'Flowing Waves' },
  { id: 'buzz', label: 'Minimal Buzz' },
];

const HAIR_COLORS = [
  { label: 'Obsidian Black', value: '#18181B' },
  { label: 'Espresso Brown', value: '#3F2E23' },
  { label: 'Golden Amber', value: '#D4A373' },
  { label: 'Platinum Silver', value: '#94A3B8' },
  { label: 'Electric Cyan', value: '#06B6D4' },
  { label: 'Neural Violet', value: '#A855F7' },
];

const OUTFIT_STYLES = [
  { id: 'tech_minimal', label: 'Tech Minimalist', desc: 'Clean streamlined crewneck with illuminated accents' },
  { id: 'architect_blazer', label: 'Architect Blazer', desc: 'Tailored unstructured modern silhouette' },
  { id: 'cyber_tactical', label: 'Cyber Modular', desc: 'Tactical high collar with subtle paneling' },
  { id: 'zen_flow', label: 'Zen Flow Kimono', desc: 'Relaxed flow-state natural drape' },
];

const OUTFIT_COLORS = [
  { label: 'Midnight Obsidian', value: '#0F172A' },
  { label: 'Deep Slate', value: '#1E293B' },
  { label: 'Indigo Core', value: '#312E81' },
  { label: 'Emerald Pine', value: '#064E3B' },
  { label: 'Imperial Violet', value: '#4C1D95' },
  { label: 'Burgundy Crimson', value: '#831843' },
];

const ACCESSORIES = [
  { id: 'none', label: 'None' },
  { id: 'classic', label: 'Classic Frames' },
  { id: 'round_wire', label: 'Round Wire' },
  { id: 'cyber', label: 'Cyber Visor' },
];

const MOODS = [
  { id: 'focused', label: 'Deep Focus' },
  { id: 'optimistic', label: 'Optimistic' },
  { id: 'analytical', label: 'Analytical' },
  { id: 'calm', label: 'Zen Calm' },
];

const AURA_COLORS = [
  { id: 'cyan', label: 'Cyan Aura', hex: '#06B6D4' },
  { id: 'violet', label: 'Violet Aura', hex: '#8B5CF6' },
  { id: 'emerald', label: 'Emerald Aura', hex: '#10B981' },
  { id: 'amber', label: 'Amber Aura', hex: '#F59E0B' },
  { id: 'rose', label: 'Rose Aura', hex: '#F43F5E' },
  { id: 'obsidian', label: 'Obsidian Aura', hex: '#64748B' },
];

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ twin, onRefreshTwin }) => {
  const currentConfig: AvatarConfig = twin.profile.avatar_config || {
    skin_tone: '#E0B394',
    hair_style: 'short_clean',
    hair_color: '#2C221E',
    outfit_style: 'tech_minimal',
    outfit_color: '#0F172A',
    glasses: 'classic',
    mood: 'focused',
    aura_color: 'cyan',
  };

  const [avatar, setAvatar] = useState<AvatarConfig>(currentConfig);
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'hair' | 'style' | 'accessories' | 'aura'>('appearance');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateAvatarConfig(avatar);
      onRefreshTwin();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save avatar', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatar(currentConfig);
  };

  const handleRandomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setAvatar({
      gender_expression: 'neutral',
      skin_tone: randomItem(SKIN_TONES).value,
      hair_style: randomItem(HAIR_STYLES).id,
      hair_color: randomItem(HAIR_COLORS).value,
      outfit_style: randomItem(OUTFIT_STYLES).id,
      outfit_color: randomItem(OUTFIT_COLORS).value,
      glasses: randomItem(ACCESSORIES).id,
      mood: randomItem(MOODS).id,
      aura_color: randomItem(AURA_COLORS).id,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Your Avatar</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Customize the visual identity of your Digital Twin across PRATIBIMB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleRandomize}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Identity Saved' : saving ? 'Saving...' : 'Save Avatar'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Live Preview & Customization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (5 Cols): Live 3D/2D Canonical Avatar Canvas */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
          {/* Avatar Canvas */}
          <div className="w-full h-80 sm:h-96 flex items-center justify-center">
            <CanonicalAvatar
              config={avatar}
              size="hero"
              mode="3d"
              showAura={true}
              showNodes={false}
            />
          </div>

          {/* Identity Tag */}
          <div className="mt-4 text-center space-y-1 z-10">
            <h3 className="text-base font-bold text-white tracking-wide">{twin.profile.name}</h3>
            <p className="text-xs text-cyan-300">{twin.profile.title || 'Digital Twin Core'}</p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                Mood: <strong className="text-cyan-300 capitalize">{avatar.mood}</strong>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                Style: <strong className="text-cyan-300 capitalize">{avatar.outfit_style?.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right (7 Cols): Customizer Palette & Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('appearance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'appearance' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>
            <button
              onClick={() => setActiveCategory('hair')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'hair' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hair</span>
            </button>
            <button
              onClick={() => setActiveCategory('style')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'style' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Style</span>
            </button>
            <button
              onClick={() => setActiveCategory('accessories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'accessories' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>Accessories</span>
            </button>
            <button
              onClick={() => setActiveCategory('aura')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'aura' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Mood & Aura</span>
            </button>
          </div>

          {/* Option Panels */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-xl space-y-6 backdrop-blur-md">
            {/* Panel 1: Appearance (Skin Tone) */}
            {activeCategory === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Skin Tone Complexion</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setAvatar({ ...avatar, skin_tone: tone.value })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        avatar.skin_tone === tone.value
                          ? 'border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/20'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: tone.value }}
                      />
                      <span className="text-xs font-medium text-slate-200">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 2: Hair Style & Color */}
            {activeCategory === 'hair' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Hairstyle Geometry</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setAvatar({ ...avatar, hair_style: style.id })}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                          avatar.hair_style === style.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Hair Pigment</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setAvatar({ ...avatar, hair_color: c.value })}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          avatar.hair_color === c.value
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-md'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.value }} />
                        <span className="text-xs text-slate-300">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: Style (Outfit) */}
            {activeCategory === 'style' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Signature Silhouette</h3>
                  <div className="space-y-2.5">
                    {OUTFIT_STYLES.map((outfit) => (
                      <button
                        key={outfit.id}
                        onClick={() => setAvatar({ ...avatar, outfit_style: outfit.id })}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          avatar.outfit_style === outfit.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{outfit.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{outfit.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Color Accent</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OUTFIT_COLORS.map((oc) => (
                      <button
                        key={oc.value}
                        onClick={() => setAvatar({ ...avatar, outfit_color: oc.value })}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          avatar.outfit_color === oc.value
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-md'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: oc.value }} />
                        <span className="text-xs text-slate-300">{oc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: Accessories (Glasses) */}
            {activeCategory === 'accessories' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-cyan-400" />
                  <span>Eyewear</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {ACCESSORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAvatar({ ...avatar, glasses: item.id })}
                      className={`p-3.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                        avatar.glasses === item.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 5: Mood & Aura */}
            {activeCategory === 'aura' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>Cognitive Mood</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setAvatar({ ...avatar, mood: m.id })}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                          avatar.mood === m.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Resonant Aura</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {AURA_COLORS.map((aura) => (
                      <button
                        key={aura.id}
                        onClick={() => setAvatar({ ...avatar, aura_color: aura.id })}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          avatar.aura_color === aura.id
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/20'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full shadow-lg shrink-0" style={{ backgroundColor: aura.hex }} />
                      <span className="text-xs text-slate-200">{aura.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
