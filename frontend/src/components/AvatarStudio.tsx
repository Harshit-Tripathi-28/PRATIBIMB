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
  { label: 'Electric Cyan', value: '#22D3EE' },
  { label: 'Neural Violet', value: '#8B5CFF' },
];

const OUTFIT_STYLES = [
  { id: 'tech_minimal', label: 'Tech Minimalist', desc: 'Clean streamlined crewneck with illuminated accents' },
  { id: 'architect_blazer', label: 'Architect Blazer', desc: 'Tailored unstructured modern silhouette' },
  { id: 'cyber_tactical', label: 'Cyber Modular', desc: 'Tactical high collar with subtle paneling' },
  { id: 'zen_flow', label: 'Zen Flow Kimono', desc: 'Relaxed flow-state natural drape' },
];

const OUTFIT_COLORS = [
  { label: 'Midnight Obsidian', value: '#05050A' },
  { label: 'Deep Slate', value: '#0C0A1A' },
  { label: 'Indigo Core', value: '#312E81' },
  { label: 'Emerald Pine', value: '#064E3B' },
  { label: 'Imperial Violet', value: '#4C1D95' },
  { label: 'Electric Magenta', value: '#C33CFF' },
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
  { id: 'cyan', label: 'Cyan Aura', hex: '#22D3EE' },
  { id: 'violet', label: 'Violet Aura', hex: '#8B5CFF' },
  { id: 'emerald', label: 'Emerald Aura', hex: '#00E5A8' },
  { id: 'amber', label: 'Amber Aura', hex: '#F5B942' },
];

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ twin, onRefreshTwin }) => {
  const [avatar, setAvatar] = useState<AvatarConfig>(twin.profile.avatar_config || {});
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'hair' | 'style' | 'accessories' | 'mood'>('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setAvatar(twin.profile.avatar_config || {});
  }, [twin.profile.avatar_config]);

  const updateProperty = (key: keyof AvatarConfig, value: any) => {
    setAvatar((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.updateAvatarConfig(avatar);
      setSaveSuccess(true);
      onRefreshTwin();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save avatar', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setAvatar(twin.profile.avatar_config || {});
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#6c4dff] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Identity Calibration Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                CALIBRATION ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrate visual, stylistic, and resonant presentation parameters for your Digital Twin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-2xl bg-[#140f2d] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-violet-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Calibrated ✓</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Calibration'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Avatar Viewport (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c0a1a]/80 border border-white/10 shadow-2xl flex flex-col items-center justify-between min-h-[460px] text-center backdrop-blur-2xl">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
              <span>LIVE HOLOGRAM</span>
            </span>
            <span className="text-violet-300">MOOD: {avatar.mood?.toUpperCase() || 'FOCUSED'}</span>
          </div>

          <div className="py-6 flex items-center justify-center">
            <CanonicalAvatar config={avatar} size="xl" mode="2d" showAura={true} />
          </div>

          <div className="w-full p-3.5 rounded-2xl bg-[#140f2d]/80 border border-white/5 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-white">{twin.profile.name} • Representation</div>
            <div className="text-slate-400 font-mono">
              Hairstyle: {avatar.hair_style || 'Default'} • Aura: {avatar.aura_color || 'Violet'}
            </div>
          </div>
        </div>

        {/* Right: Customizer Palette (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0a1a]/90 border border-white/10 overflow-x-auto scrollbar-none">
            {[
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'hair', label: 'Hair', icon: Sparkles },
              { id: 'style', label: 'Style', icon: User },
              { id: 'accessories', label: 'Accessories', icon: Glasses },
              { id: 'mood', label: 'Mood & Aura', icon: Smile },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#c33cff] to-[#6c4dff] text-white shadow-md shadow-violet-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Option Panels */}
          <div className="p-6 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl space-y-6 backdrop-blur-2xl">
            
            {/* Panel 1: Appearance */}
            {activeCategory === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#c33cff]" />
                  <span>Skin Tone Complexion</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => updateProperty('skin_tone', tone.value)}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                        avatar.skin_tone === tone.value
                          ? 'border-[#c33cff] bg-violet-500/15 shadow-md shadow-violet-500/20'
                          : 'border-white/5 bg-[#140f2d]/60 hover:border-violet-500/30'
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
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3">Hairstyle Silhouette</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateProperty('hair_style', style.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          avatar.hair_style === style.id
                            ? 'border-[#c33cff] bg-violet-500/15 text-white shadow-md shadow-violet-500/15'
                            : 'border-white/5 bg-[#140f2d]/60 text-slate-400 hover:text-white hover:border-violet-500/30'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#0c0a1a] border border-white/10 flex items-center justify-center shrink-0">
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
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3">Hair Pigment</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateProperty('hair_color', c.value)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          avatar.hair_color === c.value
                            ? 'border-[#22d3ee] bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                            : 'border-white/5 bg-[#140f2d]/60 hover:border-violet-500/30'
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
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3">Signature Silhouette</h3>
                  <div className="space-y-2.5">
                    {OUTFIT_STYLES.map((outfit) => (
                      <button
                        key={outfit.id}
                        onClick={() => updateProperty('outfit_style', outfit.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          avatar.outfit_style === outfit.id
                            ? 'border-[#c33cff] bg-violet-500/15 text-white shadow-md'
                            : 'border-white/5 bg-[#140f2d]/60 text-slate-300 hover:border-violet-500/30'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{outfit.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{outfit.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3">Color Accent</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OUTFIT_COLORS.map((oc) => (
                      <button
                        key={oc.value}
                        onClick={() => updateProperty('outfit_color', oc.value)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          avatar.outfit_color === oc.value
                            ? 'border-[#c33cff] bg-violet-500/10 shadow-md'
                            : 'border-white/5 bg-[#140f2d]/60 hover:border-violet-500/30'
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

            {/* Panel 4: Accessories */}
            {activeCategory === 'accessories' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3 flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-[#22d3ee]" />
                  <span>Eyewear & Accessories</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateProperty('glasses', item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        avatar.glasses === item.id
                          ? 'border-[#22d3ee] bg-cyan-500/15 text-white shadow-md'
                          : 'border-white/5 bg-[#140f2d]/60 text-slate-400 hover:text-white hover:border-violet-500/30'
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
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>Cognitive Mood</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => updateProperty('mood', m.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          avatar.mood === m.id
                            ? 'border-[#c33cff] bg-violet-500/15 text-white shadow-md'
                            : 'border-white/5 bg-[#140f2d]/60 text-slate-400 hover:text-white hover:border-violet-500/30'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white">{m.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#22d3ee]" />
                    <span>Resonant Aura</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {AURA_COLORS.map((aura) => (
                      <button
                        key={aura.id}
                        onClick={() => updateProperty('aura_color', aura.id)}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                          avatar.aura_color === aura.id
                            ? 'border-[#22d3ee] bg-cyan-500/15 shadow-md shadow-cyan-500/20'
                            : 'border-white/5 bg-[#140f2d]/60 hover:border-violet-500/30'
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
