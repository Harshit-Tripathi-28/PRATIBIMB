import React, { useState } from 'react';
import { Sparkles, Brain, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-violet-600/10 to-indigo-800/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-violet-600/20 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 mb-2">
            <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
            PRATIBIMB
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your personal AI Digital Twin and Cognitive Operating Layer.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
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
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Build My Digital Twin' : 'Enter PRATIBIMB'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted local session • Zero tracking</span>
          </div>
        </div>

        {/* Demo Fast Access Pill */}
        <div className="text-center">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                // Attempt login with demo account or create demo user
                try {
                  const res = await api.login({ email: 'harshit@pratibimb.ai', password: 'password123' });
                  onAuthenticated(res);
                } catch {
                  const res = await api.signup({ name: 'Harshit Tripathi', email: 'harshit@pratibimb.ai', password: 'password123' });
                  onAuthenticated(res);
                }
              } catch (e: any) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Quick Demo Explorer Sign-In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
