import React, { useState } from 'react';
import { 
  Sparkles, Save, RotateCcw, ShieldCheck, 
  Smile, Glasses, Palette, Shirt, Check
} from 'lucide-react';
import type { DigitalTwin, AvatarConfig } from '../types';
import { api } from '../services/api';

interface AvatarStudioProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
}

const SKIN_TONES = [
  { label: 'Porcelain', value: '#FAD9C0' },
  { label: 'Sand Warm', value: '#E0B394' },
  { label: 'Golden Honey', value: '#C68642' },
  { label: 'Rich Chestnut', value: '#8D5524' },
  { label: 'Deep Espresso', value: '#3D2314' },
  { label: 'Warm Bronze', value: '#A56542' },
];

const HAIR_STYLES = [
  { id: 'short_clean', label: 'Taper Fade' },
  { id: 'curly_fade', label: 'Textured Curls' },
  { id: 'sleek_part', label: 'Executive Part' },
  { id: 'long_wavy', label: 'Flowing Waves' },
  { id: 'buzz_cut', label: 'Minimal Buzz' },
  { id: 'bald', label: 'Clean Shaved' },
];

const HAIR_COLORS = [
  { label: 'Obsidian Black', value: '#18181B' },
  { label: 'Espresso Brown', value: '#3F2E23' },
  { label: 'Golden Honey', value: '#D4A373' },
  { label: 'Silver Platinum', value: '#94A3B8' },
  { label: 'Cyber Cyan', value: '#06B6D4' },
  { label: 'Neural Violet', value: '#A855F7' },
];

const OUTFIT_STYLES = [
  { id: 'tech_minimal', label: 'Tech Minimal Hoodie', desc: 'Sleek structured hoodie with subtle illuminated seam' },
  { id: 'architect_blazer', label: 'Architect Blazer', desc: 'Unstructured dark blazer with crewneck base' },
  { id: 'cyber_tactical', label: 'Cyber Modular Jacket', desc: 'High collar technical jacket with magnetic closure' },
  { id: 'clean_crewneck', label: 'Studio Crewneck', desc: 'Relaxed premium cotton crewneck' },
  { id: 'zen_robe', label: 'Zen Studio Kimono', desc: 'Flow-state meditation garment' },
];

const OUTFIT_COLORS = [
  { label: 'Midnight Black', value: '#090D16' },
  { label: 'Slate Navy', value: '#1E293B' },
  { label: 'Deep Charcoal', value: '#334155' },
  { label: 'Emerald Pine', value: '#064E3B' },
  { label: 'Imperial Violet', value: '#4C1D95' },
  { label: 'Burgundy Crimson', value: '#831843' },
];

const ACCESSORIES = [
  { id: 'none', label: 'None' },
  { id: 'classic_frames', label: 'Acetate Frames' },
  { id: 'wireframe_glasses', label: 'Titanium Wireframes' },
  { id: 'cyber_visor', label: 'Neural AR Visor' },
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
];

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ twin, onRefreshTwin }) => {
  const currentConfig: AvatarConfig = twin.profile.avatar_config || {
    gender_expression: 'neutral',
    skin_tone: '#E0B394',
    hair_style: 'short_clean',
    hair_color: '#2C221E',
    outfit_style: 'tech_minimal',
    outfit_color: '#0F172A',
    glasses: 'classic_frames',
    mood: 'focused',
    aura_color: 'cyan',
  };

  const [avatar, setAvatar] = useState<AvatarConfig>(currentConfig);
  const [activeCategory, setActiveCategory] = useState<'skin' | 'hair' | 'outfit' | 'gear' | 'aura'>('skin');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateAvatarConfig(avatar);
      onRefreshTwin();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save avatar', e);
    } finally {
      setSaving(false);
    }
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

  const currentAuraHex = AURA_COLORS.find((a) => a.id === avatar.aura_color)?.hex || '#06B6D4';

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Customizable Digital Avatar</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Visual Identity Layer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized Bitmoji-style avatar embodying your Digital Twin across Pratibimb.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomize}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Randomize Look</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Avatar Saved!' : saving ? 'Saving...' : 'Save Avatar Identity'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Avatar Preview & Customization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (5 Cols): Live Vector Avatar Canvas */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glowing Aura */}
          <div
            className="absolute w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentAuraHex }}
          />

          {/* Avatar SVG Vector Display */}
          <div className="relative z-10 w-72 h-88 flex items-center justify-center">
            <svg
              viewBox="0 0 300 380"
              className="w-full h-full drop-shadow-2xl transition-all duration-500"
            >
              <defs>
                <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentAuraHex} stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="0.8" />
                </linearGradient>
                <radialGradient id="skinGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor={avatar.skin_tone} stopOpacity="1" />
                </radialGradient>
              </defs>

              {/* Background Halo Ring */}
              <circle
                cx="150"
                cy="170"
                r="120"
                fill="none"
                stroke={currentAuraHex}
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="animate-spin-slow opacity-40"
              />

              {/* Shoulders / Torso Outfit */}
              <path
                d="M 60 380 C 60 270, 240 270, 240 380 Z"
                fill={avatar.outfit_color || '#090D16'}
                stroke="#1E293B"
                strokeWidth="2"
              />

              {/* Outfit Collar Seam Accent */}
              {avatar.outfit_style === 'tech_minimal' && (
                <>
                  <path d="M 120 280 L 150 320 L 180 280" fill="none" stroke={currentAuraHex} strokeWidth="2.5" />
                  <line x1="150" y1="320" x2="150" y2="380" stroke="#334155" strokeWidth="2" />
                </>
              )}
              {avatar.outfit_style === 'architect_blazer' && (
                <>
                  <polygon points="100,280 150,340 120,380 60,380" fill="#020617" opacity="0.4" />
                  <polygon points="200,280 150,340 180,380 240,380" fill="#020617" opacity="0.4" />
                  <line x1="150" y1="340" x2="150" y2="380" stroke="#64748B" strokeWidth="1.5" />
                </>
              )}
              {avatar.outfit_style === 'cyber_tactical' && (
                <>
                  <rect x="130" y="270" width="40" height="25" rx="4" fill="#0F172A" stroke={currentAuraHex} strokeWidth="1" />
                  <line x1="110" y1="310" x2="190" y2="310" stroke={currentAuraHex} strokeWidth="2" strokeDasharray="3 3" />
                </>
              )}

              {/* Neck */}
              <rect x="130" y="210" width="40" height="60" rx="8" fill={avatar.skin_tone} />

              {/* Head / Face Base */}
              <ellipse cx="150" cy="165" rx="55" ry="68" fill={avatar.skin_tone} />
              <ellipse cx="150" cy="165" rx="55" ry="68" fill="url(#skinGrad)" />

              {/* Ears */}
              <ellipse cx="94" cy="170" rx="7" ry="14" fill={avatar.skin_tone} />
              <ellipse cx="206" cy="170" rx="7" ry="14" fill={avatar.skin_tone} />

              {/* Eyes */}
              <ellipse cx="130" cy="160" rx="6" ry="4" fill="#0F172A" />
              <ellipse cx="170" cy="160" rx="6" ry="4" fill="#0F172A" />
              <circle cx="132" cy="159" r="1.5" fill="#FFFFFF" />
              <circle cx="172" cy="159" r="1.5" fill="#FFFFFF" />

              {/* Eyebrows based on mood */}
              {avatar.mood === 'analytical' ? (
                <>
                  <line x1="120" y1="148" x2="140" y2="151" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="160" y1="151" x2="180" y2="148" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : avatar.mood === 'optimistic' ? (
                <>
                  <path d="M 120 148 Q 130 143 140 148" fill="none" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 160 148 Q 170 143 180 148" fill="none" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="122" y1="149" x2="140" y2="149" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="160" y1="149" x2="178" y2="149" stroke={avatar.hair_color} strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* Nose */}
              <path d="M 150 162 L 147 178 L 153 178" fill="none" stroke="#A56542" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

              {/* Mouth */}
              {avatar.mood === 'optimistic' ? (
                <path d="M 138 194 Q 150 204 162 194" fill="none" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <line x1="140" y1="196" x2="160" y2="196" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
              )}

              {/* Glasses / Eyewear Layer */}
              {avatar.glasses === 'classic_frames' && (
                <>
                  <rect x="114" y="148" width="32" height="24" rx="4" fill="none" stroke="#0F172A" strokeWidth="3" />
                  <rect x="154" y="148" width="32" height="24" rx="4" fill="none" stroke="#0F172A" strokeWidth="3" />
                  <line x1="146" y1="158" x2="154" y2="158" stroke="#0F172A" strokeWidth="3" />
                </>
              )}
              {avatar.glasses === 'wireframe_glasses' && (
                <>
                  <circle cx="130" cy="160" r="14" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
                  <circle cx="170" cy="160" r="14" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="144" y1="160" x2="156" y2="160" stroke="#94A3B8" strokeWidth="1.5" />
                </>
              )}
              {avatar.glasses === 'cyber_visor' && (
                <path
                  d="M 112 152 C 140 148, 160 148, 188 152 L 184 168 C 160 164, 140 164, 116 168 Z"
                  fill={currentAuraHex}
                  fillOpacity="0.75"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}

              {/* Hair Style Layer */}
              {avatar.hair_style === 'short_clean' && (
                <path
                  d="M 96 150 C 96 90, 204 90, 204 150 C 204 130, 180 108, 150 108 C 120 108, 96 130, 96 150 Z"
                  fill={avatar.hair_color}
                />
              )}
              {avatar.hair_style === 'curly_fade' && (
                <g fill={avatar.hair_color}>
                  <ellipse cx="150" cy="115" rx="56" ry="32" />
                  <circle cx="118" cy="110" r="18" />
                  <circle cx="140" cy="100" r="20" />
                  <circle cx="165" cy="100" r="20" />
                  <circle cx="184" cy="112" r="18" />
                </g>
              )}
              {avatar.hair_style === 'sleek_part' && (
                <path
                  d="M 94 150 C 94 92, 190 85, 206 145 C 190 120, 160 106, 130 108 C 110 110, 98 126, 94 150 Z"
                  fill={avatar.hair_color}
                />
              )}
              {avatar.hair_style === 'long_wavy' && (
                <g fill={avatar.hair_color}>
                  <path d="M 92 155 C 92 88, 208 88, 208 155 C 215 220, 195 260, 185 270 C 190 230, 195 180, 190 150 C 175 110, 125 110, 110 150 C 105 180, 110 230, 115 270 C 105 260, 85 220, 92 155 Z" />
                </g>
              )}
              {avatar.hair_style === 'buzz_cut' && (
                <ellipse cx="150" cy="140" rx="55" ry="50" fill={avatar.hair_color} opacity="0.3" />
              )}
            </svg>
          </div>

          {/* Identity Tag Card */}
          <div className="mt-6 text-center space-y-1 z-10">
            <h3 className="text-lg font-bold text-white tracking-wide">{twin.profile.name}</h3>
            <p className="text-xs font-mono text-cyan-300">{twin.profile.title}</p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 font-mono">
                Mood: <strong className="text-slate-200 capitalize">{avatar.mood}</strong>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 font-mono">
                Outfit: <strong className="text-slate-200 capitalize">{avatar.outfit_style?.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right (7 Cols): Customizer Palette & Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('skin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'skin' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Skin & Tone</span>
            </button>
            <button
              onClick={() => setActiveCategory('hair')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'hair' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hair Style</span>
            </button>
            <button
              onClick={() => setActiveCategory('outfit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'outfit' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Wardrobe</span>
            </button>
            <button
              onClick={() => setActiveCategory('gear')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'gear' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>Eyewear & Mood</span>
            </button>
            <button
              onClick={() => setActiveCategory('aura')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'aura' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aura</span>
            </button>
          </div>

          {/* Option Panels */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 backdrop-blur-md">
            {/* Panel 1: Skin Tone */}
            {activeCategory === 'skin' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Select Avatar Complexion Tone</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setAvatar({ ...avatar, skin_tone: tone.value })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        avatar.skin_tone === tone.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/20'
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <h3 className="text-sm font-bold text-white mb-3">Hair Pigment & Tint</h3>
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

            {/* Panel 3: Wardrobe */}
            {activeCategory === 'outfit' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Signature Avatar Outfit</h3>
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
                  <h3 className="text-sm font-bold text-white mb-3">Garment Color Palette</h3>
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

            {/* Panel 4: Eyewear & Mood */}
            {activeCategory === 'gear' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Glasses className="w-4 h-4 text-cyan-400" />
                    <span>Eyewear & Accessories</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCESSORIES.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAvatar({ ...avatar, glasses: item.id })}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
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

                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>Cognitive Presence & Mood</span>
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
              </div>
            )}

            {/* Panel 5: Aura */}
            {activeCategory === 'aura' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Ambient Cognitive Aura</h3>
                <p className="text-xs text-slate-400">
                  Select the illumination halo that reflects your digital twin’s current mental resonance.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
