import React from 'react';
import { Activity, Sparkles, User, Palette, CheckCircle2, Ruler, ShieldCheck } from 'lucide-react';
import type { BiometricAnalysis } from '../types';

interface BiometricDashboardProps {
  biometrics: BiometricAnalysis | null;
  onSelectColorPalette?: (colorHex: string) => void;
}

export const BiometricDashboard: React.FC<BiometricDashboardProps> = ({ biometrics }) => {
  if (!biometrics) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel space-y-4">
        <Activity className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-white">Biometric Intelligence Standby</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start a Live Mirror session or perform a Studio Try-On to generate your full facial geometry, skin undertone, and body sizing report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Anthropometric AI Styling Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Biometric Intelligence & Sizing Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Computer vision facial contouring, undertone colorimetry, and upper torso anthropometrics.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Confidence Index: <strong className="text-cyan-400">{Math.round(biometrics.size_confidence * 100)}%</strong></span>
          </div>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Face Shape */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              Geometry
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Classified Face Shape</span>
            <h3 className="text-2xl font-bold font-display text-white mt-0.5">{biometrics.face_shape}</h3>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Recommended Eyewear Shapes:</span>
            <div className="flex flex-wrap gap-1.5">
              {biometrics.best_eyewear_shapes.map((shape, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-[11px] font-medium border border-cyan-500/20"
                >
                  {shape}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Skin Undertone & Color Palette */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-4 h-4 rounded-full border border-white/30"
                style={{ backgroundColor: biometrics.skin_tone_hex }}
              />
              <span className="text-[10px] font-mono text-slate-400">{biometrics.skin_tone_hex}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Skin Undertone</span>
            <h3 className="text-2xl font-bold font-display text-white mt-0.5">{biometrics.skin_undertone} Profile</h3>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Flattering Color Palette:</span>
            <div className="flex items-center gap-2">
              {biometrics.flattering_colors.map((color, idx) => (
                <div
                  key={idx}
                  className="group relative w-7 h-7 rounded-lg border border-white/20 shadow-md cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Size Recommendation */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Ruler className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Recommended Size
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Estimated Apparel Fit</span>
            <h3 className="text-3xl font-black font-display text-cyan-400 mt-0.5">{biometrics.estimated_size}</h3>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
            {biometrics.measurements_cm?.estimated_shoulder_cm && (
              <div className="flex justify-between text-slate-300">
                <span>Shoulder Span:</span>
                <strong className="text-white">{biometrics.measurements_cm.estimated_shoulder_cm} cm</strong>
              </div>
            )}
            {biometrics.measurements_cm?.estimated_chest_cm && (
              <div className="flex justify-between text-slate-300">
                <span>Chest Breadth:</span>
                <strong className="text-white">{biometrics.measurements_cm.estimated_chest_cm} cm</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Styling Recommendations Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Personalized AI Styling & Wardrobe Directives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {biometrics.style_recommendations.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Directive 0{idx + 1}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tip.replace(/\*\*/g, '')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
