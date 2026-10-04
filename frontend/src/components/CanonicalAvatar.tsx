import React from 'react';
import type { AvatarConfig } from '../types';
import { ThreeAvatarCanvas, type ConstellationNodeData } from './ThreeAvatarCanvas';

interface CanonicalAvatarProps {
  config?: AvatarConfig;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  mode?: '3d' | '2d' | 'auto';
  className?: string;
  showAura?: boolean;
  showNodes?: boolean;
  nodeData?: ConstellationNodeData;
  onNodeClick?: (nodeType: 'goals' | 'tasks' | 'memory' | 'habits' | 'avatar' | 'chat') => void;
}

export const CanonicalAvatar: React.FC<CanonicalAvatarProps> = ({
  config = {},
  size = 'md',
  mode = 'auto',
  className = '',
  showAura = true,
  showNodes = false,
  nodeData = { goalsCount: 0, memoriesCount: 0, habitsCount: 0, tasksCount: 0 },
  onNodeClick,
}) => {
  // Canonical Fallbacks
  const skin = config.skin_tone || '#E0B394';
  const hairColor = config.hair_color || '#2C221E';
  const hairStyle = config.hair_style || 'short_clean';
  const outfitColor = config.outfit_color || '#0F172A';
  const glasses = config.glasses || 'classic';
  const aura = config.aura_color || 'cyan';

  const auraGlowMap: Record<string, string> = {
    cyan: 'from-cyan-500/15 via-blue-500/5 to-transparent shadow-[0_0_35px_rgba(6,182,212,0.2)]',
    violet: 'from-purple-500/15 via-indigo-500/5 to-transparent shadow-[0_0_35px_rgba(139,92,246,0.2)]',
    amber: 'from-amber-500/15 via-orange-500/5 to-transparent shadow-[0_0_35px_rgba(245,158,11,0.2)]',
    emerald: 'from-emerald-500/15 via-teal-500/5 to-transparent shadow-[0_0_35px_rgba(16,185,129,0.2)]',
    rose: 'from-rose-500/15 via-pink-500/5 to-transparent shadow-[0_0_35px_rgba(244,63,94,0.2)]',
    obsidian: 'from-slate-500/15 via-zinc-500/5 to-transparent shadow-[0_0_35px_rgba(100,116,139,0.2)]',
  };

  const auraBorderMap: Record<string, string> = {
    cyan: 'border-cyan-500/30',
    violet: 'border-violet-500/30',
    amber: 'border-amber-500/30',
    emerald: 'border-emerald-500/30',
    rose: 'border-rose-500/30',
    obsidian: 'border-slate-500/30',
  };

  // Size Dimensions
  const sizeClasses = {
    xs: 'w-7 h-7 min-h-[28px]',
    sm: 'w-10 h-10 min-h-[40px]',
    md: 'w-24 h-24 min-h-[96px]',
    lg: 'w-44 h-44 min-h-[176px]',
    xl: 'w-64 h-64 min-h-[256px]',
    hero: 'w-full h-80 sm:h-[400px] lg:h-[450px] min-h-[340px]',
  };

  // If size is xs or sm, or mode explicitly '2d', render the crisp 2D vector badge
  if (size === 'xs' || size === 'sm' || mode === '2d') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border ${
          auraBorderMap[aura] || 'border-cyan-500/30'
        } ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: outfitColor }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Subtle Ambient Gradient */}
          <circle cx="50" cy="50" r="48" fill="url(#auraGrad2D)" opacity="0.4" />
          <defs>
            <radialGradient id="auraGrad2D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={skin} stopOpacity="0.8" />
              <stop offset="100%" stopColor={outfitColor} stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Shoulders / Torso */}
          <path d="M 18 95 C 22 72 40 68 50 68 C 60 68 78 72 82 95 Z" fill={outfitColor} />

          {/* Neck */}
          <rect x="44" y="52" width="12" height="18" fill={skin} rx="4" />

          {/* Head */}
          <ellipse cx="50" cy="42" rx="21" ry="25" fill={skin} />

          {/* Hair Styles */}
          {hairStyle === 'long_wavy' && (
            <path
              d="M 28 35 C 26 20 40 14 50 14 C 60 14 74 20 72 35 C 75 52 75 75 66 75 C 64 60 62 48 60 42 C 54 40 46 40 40 42 C 38 48 36 60 34 75 C 25 75 25 52 28 35 Z"
              fill={hairColor}
            />
          )}
          {hairStyle === 'curly' || hairStyle === 'curly_fade' ? (
            <g fill={hairColor}>
              <circle cx="35" cy="24" r="9" />
              <circle cx="50" cy="18" r="10" />
              <circle cx="65" cy="24" r="9" />
              <circle cx="28" cy="34" r="8" />
              <circle cx="72" cy="34" r="8" />
            </g>
          ) : hairStyle !== 'long_wavy' ? (
            <path d="M 28 36 C 28 20 40 16 50 16 C 60 16 72 20 72 36 C 70 28 62 24 50 24 C 38 24 30 28 28 36 Z" fill={hairColor} />
          ) : null}

          {/* Eyebrows */}
          <rect x="38" y="36" width="9" height="2" rx="1" fill={hairColor} />
          <rect x="53" y="36" width="9" height="2" rx="1" fill={hairColor} />

          {/* Eyes */}
          <ellipse cx="42" cy="43" rx="2.5" ry="3" fill="#0f172a" />
          <ellipse cx="58" cy="43" rx="2.5" ry="3" fill="#0f172a" />

          {/* Glasses */}
          {glasses && glasses !== 'none' && (
            <g stroke="#0f172a" strokeWidth="2" fill="none">
              <rect x="35" y="37" width="13" height="11" rx="3" fill="rgba(56,189,248,0.2)" />
              <rect x="52" y="37" width="13" height="11" rx="3" fill="rgba(56,189,248,0.2)" />
              <line x1="48" y1="42" x2="52" y2="42" />
            </g>
          )}

          {/* Smile */}
          <path d="M 45 54 Q 50 58 55 54" stroke="#881337" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 3D Canvas Rendering for Large / Hero displays
  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {showAura && (
        <div
          className={`absolute inset-4 rounded-full bg-gradient-to-tr ${
            auraGlowMap[aura] || auraGlowMap.cyan
          } blur-2xl pointer-events-none opacity-60`}
        />
      )}
      <ThreeAvatarCanvas
        config={config}
        showNodes={showNodes}
        nodeData={nodeData}
        onNodeClick={onNodeClick}
        className="w-full h-full relative z-10"
      />
    </div>
  );
};
