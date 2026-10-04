import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, RotateCcw, 
  Smile, Glasses, Palette, User, Check, Eye
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
  { 
    id: 'short_clean', 
    label: 'Short Clean', 
    desc: 'Structured side-part, visible forehead',
    svgPath: 'M 10 24 C 10 12 18 8 26 8 C 34 8 42 12 42 24 C 40 18 34 16 26 16 C 18 16 12 18 10 24 Z'
  },
  { 
    id: 'textured', 
    label: 'Textured Quiff', 
    desc: 'Layered crown locks with cropped sides',
    svgPath: 'M 12 24 C 12 10 16 6 26 6 C 36 6 40 10 40 24 C 36 14 32 12 26 14 C 20 12 16 14 12 24 Z'
  },
  { 
    id: 'long_wavy', 
    label: 'Flowing Waves', 
    desc: 'Flows gracefully behind the shoulders',
    svgPath: 'M 10 22 C 10 10 18 8 26 8 C 34 8 42 10 42 22 C 44 32 44 42 38 42 C 36 34 34 26 32 22 C 28 20 24 20 20 22 C 18 26 16 34 14 42 C 8 42 8 32 10 22 Z'
  },
  { 
    id: 'curly', 
    label: 'Textured Curls', 
    desc: 'Volumetric clustered curl geometry',
    svgPath: 'M 12 24 C 10 16 14 10 20 10 C 22 6 30 6 32 10 C 38 10 42 16 40 24 C 36 18 32 16 26 16 C 20 16 16 18 12 24 Z'
  },
  { 
    id: 'buzz', 
    label: 'Minimal Buzz', 
    desc: 'Clean close scalp-following cut',
    svgPath: 'M 12 22 C 12 12 18 9 26 9 C 34 9 40 12 40 22 C 38 17 32 15 26 15 C 20 15 14 17 12 22 Z'
  },
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
  { id: 'none', label: 'None', desc: 'Natural unfiltered appearance' },
  { id: 'classic', label: 'Classic Frames', desc: 'Balanced rectangular modern glasses' },
  { id: 'round_wire', label: 'Round Wire', desc: 'Refined circular frame aesthetics' },
  { id: 'cyber', label: 'Cyber Visor', desc: 'Minimalist illuminated data interface' },
];

const MOODS = [
  { id: 'focused', label: 'Deep Focus', desc: 'Attentive, sharp, and execution-oriented' },
  { id: 'calm', label: 'Zen Calm', desc: 'Tranquil, balanced, and composed' },
  { id: 'analytical', label: 'Analytical', desc: 'Systematic, questioning, and introspective' },
  { id: 'optimistic', label: 'Optimistic', desc: 'Constructive, forward-looking, and energetic' },
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
  const initialConfig: AvatarConfig = {
    skin_tone: '#E0B394',
    hair_style: 'short_clean',
    hair_color: '#2C221E',
    outfit_style: 'tech_minimal',
    outfit_color: '#0F172A',
    glasses: 'classic',
    mood: 'focused',
    aura_color: 'cyan',
    ...(twin.profile.avatar_config || {}),
  };

  const [avatar, setAvatar] = useState<AvatarConfig>(initialConfig);
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'hair' | 'style' | 'accessories' | 'mood'>('appearance');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (twin.profile.avatar_config) {
      setAvatar((prev) => ({
        ...prev,
        ...twin.profile.avatar_config,
      }));
    }
  }, [twin.profile.avatar_config]);

  // Robust property updater that never resets unaffected properties and auto-persists immediately
  const updateProperty = (key: keyof AvatarConfig, value: string) => {
    setAvatar((prev) => {
      const next = { ...prev, [key]: value };
      api.updateAvatarConfig(next).then(() => {
        onRefreshTwin();
      }).catch((err) => console.warn('Failed to auto-sync avatar config', err));
      return next;
    });
  };

  const handleManualSave = async () => {
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
    setAvatar(initialConfig);
    api.updateAvatarConfig(initialConfig).then(() => onRefreshTwin());
  };

  const handleRandomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomized: AvatarConfig = {
      gender_expression: 'neutral',
      skin_tone: randomItem(SKIN_TONES).value,
      hair_style: randomItem(HAIR_STYLES).id,
      hair_color: randomItem(HAIR_COLORS).value,
      outfit_style: randomItem(OUTFIT_STYLES).id,
      outfit_color: randomItem(OUTFIT_COLORS).value,
      glasses: randomItem(ACCESSORIES).id,
      mood: randomItem(MOODS).id,
      aura_color: randomItem(AURA_COLORS).id,
    };
    setAvatar(randomized);
    api.updateAvatarConfig(randomized).then(() => onRefreshTwin());
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
            <h1 className="text-2xl font-black text-white tracking-tight">Avatar Identity</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Customize the visual reflection of your Digital Twin across PRATIBIMB.
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
            onClick={handleManualSave}
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
        {/* Left (5 Cols): Live 3D Canonical Avatar Canvas */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
          {/* Avatar Canvas */}
          <div className="w-full h-84 sm:h-[450px] flex items-center justify-center">
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

        {/* Right (7 Cols): Customizer Palette & Visual Preview Controls */}
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
              <User className="w-3.5 h-3.5" />
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
              onClick={() => setActiveCategory('mood')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'mood' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
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
                      onClick={() => updateProperty('skin_tone', tone.value)}
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
                  <h3 className="text-sm font-bold text-white mb-3">Hairstyle Silhouette</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateProperty('hair_style', style.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          avatar.hair_style === style.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {/* Hairstyle Silhouette Icon Preview */}
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 52 52" className="w-7 h-7">
                            <ellipse cx="26" cy="28" rx="13" ry="15" fill={avatar.skin_tone || '#E0B394'} />
                            <path d={style.svgPath} fill={avatar.hair_color || '#2C221E'} />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{style.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                        </div>
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
                        onClick={() => updateProperty('hair_color', c.value)}
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
                        onClick={() => updateProperty('outfit_style', outfit.id)}
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
                        onClick={() => updateProperty('outfit_color', oc.value)}
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
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-cyan-400" />
                  <span>Eyewear & Accessories</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateProperty('glasses', item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        avatar.glasses === item.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 5: Mood & Aura */}
            {activeCategory === 'mood' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>Cognitive Mood</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => updateProperty('mood', m.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          avatar.mood === m.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white">{m.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Resonant Aura</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {AURA_COLORS.map((aura) => (
                      <button
                        key={aura.id}
                        onClick={() => updateProperty('aura_color', aura.id)}
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
