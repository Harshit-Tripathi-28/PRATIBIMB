import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { AuthResponse } from '../types';

interface AuthScreenProps {
  onAuthenticated: (auth: AuthResponse) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const res = await api.signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        onAuthenticated(res);
      } else {
        if (!email.trim()) throw new Error('Please enter your email.');
        if (!password) throw new Error('Please enter your password.');

        const res = await api.login({
          email: email.trim().toLowerCase(),
          password,
        });
        onAuthenticated(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#c33cff] selection:text-white">
      {/* Background ambient lighting */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 50% 25%, rgba(195, 60, 255, 0.08) 0%, rgba(108, 77, 255, 0.05) 35%, rgba(5, 5, 10, 0) 80%),
            radial-gradient(circle at 15% 35%, rgba(108, 77, 255, 0.035) 0%, rgba(5, 5, 10, 0) 50%),
            radial-gradient(circle at 85% 35%, rgba(34, 211, 238, 0.03) 0%, rgba(5, 5, 10, 0) 50%)
          `
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#c33cff] to-[#6c4dff] shadow-lg shadow-violet-500/20 mb-1">
            <div className="w-10 h-10 bg-[#0c0a1a] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#c33cff]" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
            PRATIBIMB
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your personal AI Digital Twin and Cognitive Operating Layer.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-[#0c0a1a]/85 border border-white/10 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#140f2d] rounded-2xl border border-white/5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-gradient-to-r from-[#c33cff] to-[#6c4dff] text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-gradient-to-r from-[#c33cff] to-[#6c4dff] text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#c33cff]" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#140f2d] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#c33cff] transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#c33cff]" />
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#140f2d] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#c33cff] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#22d3ee]" />
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#140f2d] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#22d3ee] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Initialize Digital Twin' : 'Access PRATIBIMB OS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span>Grounded representation • Multi-hop memory engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
