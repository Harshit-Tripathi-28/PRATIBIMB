import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Share2,
  Compass,
  ArrowRight,
  Send,
  Activity,
  Zap,
  ChevronRight,
  TrendingUp,
  Brain,
  Sliders,
  Calendar,
  Layers,
  Cpu,
  Eye,
  Database,
  GitBranch,
} from 'lucide-react';
import type { DigitalTwin, LatentStateVector, CognitiveInsight, ChatMessage, BehavioralSequencePatternResponse } from '../types';
import { api } from '../services/api';
import { NeuralSpatialEnvironment } from './NeuralSpatialEnvironment';

interface PortalHomeProps {
  twin: DigitalTwin;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onRefreshTwin: () => void;
  onOpenCalibration: () => void;
}

/**
 * Full-width ambient background canvas with slow particle drift
 * in Electric Indigo (#6C4DFF), Magenta (#C33CFF), and Cyan (#22D3EE).
 */
const FullWidthAmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numParticles = Math.min(130, Math.floor((width * height) / 15000));
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.28 + 0.08,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.6
          ? '195, 60, 255' // Magenta
          : Math.random() > 0.3
          ? '108, 77, 255' // Indigo
          : '34, 211, 238', // Cyan
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.35;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.phase += p1.pulseSpeed;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        const distFromCenter = Math.hypot(p1.x - centerX, p1.y - centerY);
        const centerFactor = Math.max(0.4, 1 - distFromCenter / (width * 0.6));
        const alpha = p1.baseAlpha * (0.8 + 0.2 * Math.sin(p1.phase)) * centerFactor;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p1.color}, ${alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.07 * centerFactor;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(108, 77, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export const PortalHome: React.FC<PortalHomeProps> = ({
  twin,
  onNavigateTab,
  onOpenCalibration,
}) => {
  const [commandInput, setCommandInput] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [cognitiveInsights, setCognitiveInsights] = useState<CognitiveInsight[]>([]);
  const [behavioralPattern, setBehavioralPattern] = useState<BehavioralSequencePatternResponse | null>(null);
  const [worldEntityCount, setWorldEntityCount] = useState<number | null>(null);
  const [isTwinHoveredFromCTA, setIsTwinHoveredFromCTA] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Helper for proper pluralization
  const formatPlural = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  // Load real backend state on mount or twin update
  useEffect(() => {
    const loadPortalData = async () => {
      try {
        const [stateVec, insights, worldModel, seqPattern] = await Promise.all([
          api.getLatentStateVector().catch(() => null),
          api.getCognitiveInsights().catch(() => []),
          api.getWorldModel().catch(() => null),
          api.getBehavioralSequencePattern().catch(() => null),
        ]);
        if (stateVec) setLatentState(stateVec);
        if (insights && insights.length > 0) setCognitiveInsights(insights);
        if (worldModel) setWorldEntityCount(worldModel.entities.length);
        if (seqPattern) setBehavioralPattern(seqPattern);
        
        // Initial reflection message
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content:
              'Your digital reflection is active. Focus depth is synchronized with current architecture goals.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.error('Failed to load portal live data', e);
      }
    };
    loadPortalData();
  }, [twin.state.last_updated]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatLoading]);

  // Execute interactive prompt immediately via AI Core
  const handleExecutePrompt = async (promptText: string) => {
    if (isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await api.sendChatMessage(promptText);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I have recorded this context anchor. Let me synthesize our next steps in AI Core.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle direct conversational interaction in the left panel
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const promptToSend = chatInput.trim();
    setChatInput('');
    await handleExecutePrompt(promptToSend);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const prompt = commandInput.trim();
    setCommandInput('');
    onNavigateTab('intelligence', prompt);
  };

  const operationalState = twin.state.operational_state || 'ACTIVE';
  const dominantCluster = latentState?.dominant_cluster || 'Engineering Focus';
  const coherencePct = latentState ? Math.round(latentState.semantic_coherence * 100) : 72;
  
  // Robust Goal Alignment calculation from real backend goal progress
  const activeGoalsWithProgress = twin.goals.filter((g) => typeof g.progress === 'number');
  const goalAlignmentPct =
    activeGoalsWithProgress.length > 0
      ? Math.round(
          activeGoalsWithProgress.reduce((sum, g) => sum + g.progress, 0) / activeGoalsWithProgress.length
        )
      : null;

  const activeTasksCount = twin.tasks.filter((t) => t.status !== 'completed').length;
  const energyLevel = twin.state.energy_level || 90;

  const promptSuggestions = [
    {
      title: "What's changed in my world?",
      prompt: "What has changed across my world model, memories, and state trajectory recently?",
      icon: Share2,
    },
    {
      title: "Plan next focus session",
      prompt: "Plan my next high-leverage focus session and prioritize pending tasks.",
      icon: Calendar,
    },
    {
      title: "Explain my cognitive state",
      prompt: "Synthesize my current cognitive operating state and coherence signals.",
      icon: Brain,
    },
    {
      title: "Simulate downstream impact",
      prompt: "Simulate the downstream impact of accelerating my primary engineering goal.",
      icon: Sliders,
    },
  ];

  const quickActionPrompts = [
    { label: 'Ask', prompt: 'What is the current synthesis of my cognitive state?' },
    { label: 'Plan', prompt: 'Plan my next high-leverage focus session and tasks.' },
    { label: 'Research', prompt: 'Synthesize insights from my indexed knowledge and memory vault.' },
    { label: 'Remember', prompt: 'Extract key takeaways and memories from today.' },
    { label: 'Simulate', prompt: 'Simulate the downstream impact of accelerating my primary goal.' },
  ];

  // Meaningful Intelligence Statements
  const whatsHappeningItems =
    cognitiveInsights.length > 0
      ? cognitiveInsights.slice(0, 3).map((i) => ({
          title: i.title,
          desc: i.statement,
          tag: i.category,
        }))
      : [
          {
            title: 'Project Momentum Aligned',
            desc: 'Your focus depth is directly progressing active engineering architecture goals.',
            tag: 'FOCUS',
          },
          {
            title: 'Neural Memory Stream Synchronized',
            desc: 'Second brain memories and contextual entities are indexed and active.',
            tag: 'MEMORY',
          },
          {
            title: 'World Model Dependencies Stable',
            desc: 'No high-risk bottlenecks or blocking constraints identified in active trajectories.',
            tag: 'WORLD',
          },
        ];

  return (
    <div className="relative w-full min-h-screen bg-[#05050a] text-slate-100 font-sans selection:bg-[#c33cff] selection:text-white overflow-y-auto pb-24 space-y-8">
      
      {/* =========================================================================
          BACKGROUND ATMOSPHERE (Deep Obsidian + Electric Indigo & Magenta Bloom)
         ========================================================================= */}
      <FullWidthAmbientCanvas />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 50% 25%, rgba(195, 60, 255, 0.08) 0%, rgba(108, 77, 255, 0.05) 35%, rgba(5, 5, 10, 0) 80%),
            radial-gradient(circle at 15% 35%, rgba(108, 77, 255, 0.035) 0%, rgba(5, 5, 10, 0) 50%),
            radial-gradient(circle at 85% 35%, rgba(34, 211, 238, 0.03) 0%, rgba(5, 5, 10, 0) 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(3, 3, 6, 0.85) 100%)
          `,
        }}
      />

      {/* =========================================================================
          TOP MINIMAL FLOATING NAVIGATION
         ========================================================================= */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-8 pt-5">
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#0c0a1a]/70 border border-white/10 backdrop-blur-2xl shadow-2xl">
          
          {/* Brand Logo & Tag */}
          <div
            onClick={() => onNavigateTab('portal')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c33cff] to-[#6c4dff] p-0.5 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0c0a1a] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#c33cff]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
                <span>PRATIBIMB</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono border border-violet-500/20">
                  DIGITAL TWIN
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Your intelligent reflection
              </div>
            </div>
          </div>

          {/* Minimalist Tab Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-[#140f2d]/60 border border-white/5 p-1 rounded-xl backdrop-blur-md">
            {[
              { id: 'intelligence', label: 'AI' },
              { id: 'lifegraph', label: 'World' },
              { id: 'memory', label: 'Memory' },
              { id: 'twin', label: 'Twin' },
              { id: 'simulation', label: 'Simulation' },
              { id: 'core', label: 'Command' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigateTab(tab.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Status & User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140f2d]/80 border border-violet-500/20 text-xs font-mono text-violet-300">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
              <span>{coherencePct}% COHERENCE</span>
            </div>

            <div
              onClick={() => onNavigateTab('twin')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c33cff] to-[#22d3ee] flex items-center justify-center text-[11px] font-bold text-slate-950">
                {twin.profile.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                {twin.profile.name}
              </span>
            </div>
          </div>

        </div>
      </header>


      {/* =========================================================================
          HERO SPATIAL ENVIRONMENT (3-COLUMN DESKTOP PRODUCT STAGE)
          Hierarchy: Center Twin (50% / 6 Cols), Left AI (25% / 3 Cols), Right Profile (25% / 3 Cols)
          Vertical headroom: ample breathing space (~60px) below navigation bar.
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-3 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-center">
          
          {/* ---------------------------------------------------------------------
              LEFT PANEL: CONVERSATION WITH PRATIBIMB AI (3 Cols / 25%)
             --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col justify-between h-[510px] rounded-3xl bg-[#0a0815]/75 border border-white/5 hover:border-violet-500/20 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[#c33cff]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">
                    PRATIBIMB AI
                  </h2>
                  <p className="text-[9px] text-slate-400">
                    Your reflection
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">
                Connected
              </span>
            </div>

            {/* Conversation Feed / Interactive Intelligence Empty State */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-2.5 py-2.5 pr-1 text-xs scrollbar-thin scrollbar-thumb-slate-800"
            >
              {/* If single initial message, show helpful executable prompt cards */}
              {messages.length <= 1 && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-[#140f2d]/90 border border-white/10 text-slate-200 text-xs shadow-sm">
                    {messages[0]?.content || 'Your digital reflection is active and ready to reason.'}
                  </div>
                  
                  <div className="pt-0.5 space-y-1.5">
                    <div className="text-[9px] font-mono text-violet-400 uppercase tracking-wider px-1">
                      Suggested Inquiries
                    </div>
                    {promptSuggestions.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleExecutePrompt(item.prompt)}
                          disabled={isChatLoading}
                          className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-400/40 text-slate-300 hover:text-white transition-all text-[11px] flex items-center gap-2 cursor-pointer group"
                        >
                          <Icon className="w-3.5 h-3.5 text-violet-400 group-hover:text-cyan-300 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Multi-message Conversation */}
              {messages.length > 1 &&
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    } space-y-0.5`}
                  >
                    <div className="text-[9px] font-mono text-slate-500">
                      {m.role === 'user' ? 'You' : 'PRATIBIMB'}
                    </div>
                    <div
                      className={`max-w-[92%] p-2.5 rounded-2xl leading-relaxed text-[11px] ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#6c4dff] to-[#8b5cf6] text-white rounded-br-none shadow-md shadow-violet-500/10'
                          : 'bg-[#140f2d]/90 border border-white/10 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

              {isChatLoading && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#140f2d]/70 text-violet-300 text-xs w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse delay-200" />
                  <span className="text-[10px] font-mono ml-1">Reflecting...</span>
                </div>
              )}
            </div>

            {/* Context Aware Deep Learning Status Layer */}
            <div className="py-2 border-t border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-violet-300 uppercase tracking-wider">
                <span>CONTEXT SYNCHRONIZED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
                <span className="truncate">● Twin Latent State</span>
                <span className="truncate">● Memory Stream</span>
                <span className="truncate">● World Model GNN</span>
                <span className="truncate">● State Engine 2.0</span>
              </div>
            </div>

            {/* Conversation Input */}
            <form onSubmit={handleChatSubmit} className="pt-1">
              <div className="relative flex items-center rounded-2xl bg-[#140f2d]/90 border border-white/10 focus-within:border-violet-400 transition-all p-1 shadow-inner">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your reflection..."
                  className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none px-2.5 py-1 font-sans"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#c33cff] to-[#6c4dff] hover:opacity-90 disabled:opacity-20 flex items-center justify-center text-white cursor-pointer transition-all shrink-0 shadow-md shadow-violet-500/20"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* Action Hint */}
              <div className="flex items-center justify-between px-1 pt-1.5 text-[9px] text-slate-500">
                <span className="font-mono text-slate-500">REALTIME REASONING</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('intelligence')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <span>AI Core</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </form>

          </div>


          {/* ---------------------------------------------------------------------
              CENTER COLUMN: LUMINOUS DIGITAL TWIN HERO STAGE (6 Cols / 50%)
              Clear breathing space, zero overlap, sculpted facial planes
             --------------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-2">
            
            {/* Luminous 3D Holographic Twin Viewport Stage */}
            <div className="relative w-full h-[430px] sm:h-[460px] flex items-center justify-center">
              
              {/* Radial Backdrop Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#c33cff]/12 via-[#6c4dff]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <NeuralSpatialEnvironment
                twin={twin}
                latentState={latentState}
                onNavigateTab={onNavigateTab}
                onInspectTwin={() => onNavigateTab('twin')}
                className={`w-full h-full transition-all duration-500 ${
                  isTwinHoveredFromCTA ? 'scale-105 filter brightness-110' : ''
                }`}
              />

              {/* Floating Status Tag Indicator (Positioned safely below top boundary) */}
              <div className="absolute top-1 px-3.5 py-1 rounded-full bg-[#0c0a1a]/85 border border-violet-500/30 text-[10px] font-mono text-violet-300 backdrop-blur-xl shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                <span>DIGITAL TWIN // ONLINE</span>
              </div>

            </div>

            {/* Persona Identity Signature & Primary Actions */}
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                  {twin.profile.name}
                </h1>
                <div className="text-xs text-violet-400 font-mono mt-0.5 flex items-center justify-center gap-2">
                  <span>{operationalState}</span>
                  <span>•</span>
                  <span>{dominantCluster}</span>
                  <span>•</span>
                  <span className="text-[#22d3ee]">{coherencePct}% Coherence</span>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex items-center justify-center gap-2.5">
                <button
                  onClick={() => onNavigateTab('twin')}
                  onMouseEnter={() => setIsTwinHoveredFromCTA(true)}
                  onMouseLeave={() => setIsTwinHoveredFromCTA(false)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all cursor-pointer"
                >
                  <span>Open Digital Twin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenCalibration}
                  className="px-4 py-2.5 rounded-full bg-[#140f2d]/80 hover:bg-[#1a133d] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Calibrate
                </button>
              </div>
            </div>

          </div>


          {/* ---------------------------------------------------------------------
              RIGHT PANEL: COGNITIVE PROFILE INSTRUMENT PANEL (3 Cols / 25%)
             --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col justify-between h-[510px] rounded-3xl bg-[#0a0815]/75 border border-white/5 hover:border-cyan-500/20 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">
                    COGNITIVE PROFILE
                  </h2>
                  <p className="text-[9px] text-slate-400">
                    Operating signals
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[9px] font-mono">
                {operationalState}
              </span>
            </div>

            {/* Circular / Radial Progress & Key Metrics */}
            <div className="space-y-3 py-1">
              
              {/* Top Gauges: Coherence (Primary) + Goal Alignment */}
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Circular Coherence Indicator */}
                <div className="p-2.5 rounded-2xl bg-[#140f2d]/70 border border-white/5 flex flex-col items-center text-center space-y-1">
                  <div className="relative w-13 h-13 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#c33cff]"
                        strokeDasharray={`${coherencePct}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono text-white">
                      {coherencePct}%
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">
                    Coherence
                  </div>
                </div>

                {/* Circular Goal Alignment Indicator */}
                <div className="p-2.5 rounded-2xl bg-[#140f2d]/70 border border-white/5 flex flex-col items-center text-center space-y-1">
                  <div className="relative w-13 h-13 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#22d3ee]"
                        strokeDasharray={`${goalAlignmentPct !== null ? goalAlignmentPct : 0}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono text-white">
                      {goalAlignmentPct !== null ? `${goalAlignmentPct}%` : '--%'}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">
                    Goal Align
                  </div>
                </div>

              </div>

              {/* Operating Metrics Bars */}
              <div className="space-y-1.5">
                
                {/* Momentum & Focus */}
                <div className="p-2 rounded-xl bg-[#140f2d]/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <TrendingUp className="w-3.5 h-3.5 text-[#c33cff]" />
                    <span className="text-[11px]">Momentum</span>
                  </div>
                  <span className="font-mono text-[#22d3ee] font-semibold text-[11px]">+14% Velocity</span>
                </div>

                {/* Energy & Mental Bandwidth */}
                <div className="p-2 rounded-xl bg-[#140f2d]/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Bandwidth</span>
                    </div>
                    <span className="font-mono text-amber-400 font-semibold">{energyLevel}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#c33cff] rounded-full transition-all duration-500"
                      style={{ width: `${energyLevel}%` }}
                    />
                  </div>
                </div>

                {/* Memory Records & Goals Count with Clean Grammar */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => onNavigateTab('memory')}
                    className="p-2 rounded-xl bg-[#140f2d]/60 hover:bg-[#1a133d] border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="text-[9px] text-slate-500 font-mono">MEMORY</div>
                    <div className="font-semibold text-slate-200 text-[11px] mt-0.5">
                      {formatPlural(twin.memories.length, 'Record', 'Records')}
                    </div>
                  </div>

                  <div
                    onClick={() => onNavigateTab('goals')}
                    className="p-2 rounded-xl bg-[#140f2d]/60 hover:bg-[#1a133d] border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="text-[9px] text-slate-500 font-mono">GOALS & TASKS</div>
                    <div className="font-semibold text-slate-200 text-[11px] mt-0.5 truncate">
                      {formatPlural(twin.goals.length, 'Goal', 'Goals')} • {formatPlural(activeTasksCount, 'Task', 'Tasks')}
                    </div>
                  </div>
                </div>

              </div>

              {/* Real Cognitive Interpretation Line */}
              {cognitiveInsights.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-[#140f2d]/50 border border-white/5 space-y-1">
                  <div className="text-[9px] font-mono text-violet-300 uppercase tracking-wider">
                    CURRENT INTERPRETATION
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                    {cognitiveInsights[0].statement}
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Insight Footer */}
            <div
              onClick={() => onNavigateTab('insights')}
              className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              <span>Cognitive Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          PRIMARY FLOATING COMMAND CONSOLE ("ASK PRATIBIMB ANYTHING...")
         ========================================================================= */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 sm:px-8 pt-1">
        <div className="p-3.5 rounded-3xl bg-[#0c0a1a]/85 border border-white/10 hover:border-violet-500/40 backdrop-blur-2xl shadow-2xl transition-all space-y-2.5">
          
          <form
            onSubmit={handleCommandSubmit}
            className="relative flex items-center w-full h-12 rounded-2xl bg-[#140f2d]/90 border border-white/10 focus-within:border-[#c33cff] transition-all px-3.5 shadow-inner"
          >
            <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-[#c33cff]">
              <Sparkles className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ask PRATIBIMB anything about your world, goals, or cognitive state..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-3 font-sans"
            />

            <button
              type="submit"
              disabled={!commandInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-90 disabled:opacity-20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-violet-500/20"
            >
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Quick Action Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickActionPrompts.map((act, idx) => (
              <button
                key={idx}
                onClick={() => onNavigateTab('intelligence', act.prompt)}
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/40 backdrop-blur-md transition-all cursor-pointer"
              >
                {act.label}
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          "YOUR INTELLIGENCE" SPATIAL FLOW STRIP
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-2">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0a1a]/80 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c33cff] animate-pulse" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                YOUR INTELLIGENCE STREAM // CONVERGING ON TWIN
              </h2>
            </div>
            <span className="text-[10px] font-mono text-violet-400">
              64D SPECTRAL EMBEDDINGS ACTIVE
            </span>
          </div>

          {/* 6 Spatial Flow Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              {
                title: 'Memory Vault',
                val: formatPlural(twin.memories.length, 'Record', 'Records'),
                sub: 'Episodic Clusters',
                icon: Database,
                tab: 'memory',
                color: 'text-violet-400',
              },
              {
                title: 'Latent State',
                val: `${coherencePct}% Coherent`,
                sub: dominantCluster,
                icon: Cpu,
                tab: 'twin',
                color: 'text-[#c33cff]',
              },
              {
                title: 'Behavior Flow',
                val: `${energyLevel}% Focus`,
                sub: 'Dynamic Trajectory',
                icon: Activity,
                tab: 'habits',
                color: 'text-[#22d3ee]',
              },
              {
                title: 'Goal Matrix',
                val: formatPlural(twin.goals.length, 'Active Goal', 'Active Goals'),
                sub: `${goalAlignmentPct !== null ? goalAlignmentPct : 0}% Aligned`,
                icon: Layers,
                tab: 'goals',
                color: 'text-emerald-400',
              },
              {
                title: 'Prediction Engine',
                val: 'State Lab 2.0',
                sub: 'Scenario Simulation',
                icon: GitBranch,
                tab: 'simulation',
                color: 'text-pink-400',
              },
              {
                title: 'World Topology',
                val: worldEntityCount !== null ? `${worldEntityCount} Nodes` : 'Graph Network',
                sub: 'Semantic Causal Links',
                icon: Share2,
                tab: 'lifegraph',
                color: 'text-amber-400',
              },
            ].map((node, idx) => {
              const Icon = node.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigateTab(node.tab)}
                  className="p-3 rounded-2xl bg-[#140f2d]/70 hover:bg-[#1a133d] border border-white/5 hover:border-violet-500/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-3.5 h-3.5 ${node.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[9px] font-mono text-slate-500">0{idx + 1}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                    {node.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 font-semibold truncate">
                    {node.val}
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans truncate">
                    {node.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================================
          "HOW YOUR DIGITAL TWIN THINKS" (5 COGNITIVE STAGES)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#c33cff]" />
              HOW YOUR DIGITAL TWIN THINKS
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              End-to-end cognitive architecture powering continuous reasoning and self-evolution.
            </p>
          </div>
          <span className="text-xs font-mono text-[#22d3ee] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            5-STAGE COGNITION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            {
              stage: '01',
              name: 'Perceive',
              desc: 'Captures interaction events, task progress, and ambient focus signals in real-time.',
              tag: 'SENSORY INPUT',
              icon: Eye,
            },
            {
              stage: '02',
              name: 'Represent',
              desc: 'Encodes signals into 64D dense latent vectors via spectral embedding decomposition.',
              tag: 'SPECTRAL ENCODING',
              icon: Cpu,
            },
            {
              stage: '03',
              name: 'Remember',
              desc: 'Associates memories across episodic, project, and preference clusters using cosine space.',
              tag: 'ASSOCIATION GRAPH',
              icon: Database,
            },
            {
              stage: '04',
              name: 'Understand',
              desc: 'Synthesizes cognitive coherence, identifies blockers, and resolves goal alignments.',
              tag: 'COGNITIVE SYNTHESIS',
              icon: Brain,
            },
            {
              stage: '05',
              name: 'Predict',
              desc: 'Forecasts behavioral trajectories and simulates downstream causal impacts in the world model.',
              tag: 'CAUSAL SIMULATION',
              icon: GitBranch,
            },
          ].map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-gradient-to-b from-[#0c0a1a] to-[#140f2d]/80 border border-white/10 hover:border-[#c33cff]/40 backdrop-blur-2xl transition-all duration-300 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-violet-400">{st.stage}</span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    {st.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[8.5px] font-mono text-cyan-300 uppercase tracking-wider">
                    {st.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          BEHAVIORAL SEQUENCE INTELLIGENCE (PAST → CURRENT → PROJECTED)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22d3ee]" />
              BEHAVIORAL SEQUENCE SIGNAL
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Temporal sequence model tracking velocity deltas and future cognitive momentum.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('habits')}
            className="text-xs font-mono text-[#22d3ee] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Focus & Rhythm</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Past Baseline */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/75 border border-white/5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                PAST BASELINE (T-1)
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Focus Capacity</span>
                <span className="font-mono text-slate-300">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.past.focus_capacity * 100) : 74}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Task Velocity</span>
                <span className="font-mono text-slate-300">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.past.task_velocity * 100) : 68}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Habit Consistency</span>
                <span className="font-mono text-slate-300">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.past.habit_consistency * 100) : 72}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Signal */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-[#140f2d] to-[#0c0a1a] border border-violet-500/30 backdrop-blur-2xl space-y-3 shadow-lg shadow-violet-500/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-violet-300 uppercase tracking-wider font-bold">
                CURRENT OPERATING STATE (T0)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#c33cff] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Focus Capacity</span>
                <span className="font-mono text-white font-bold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.current.focus_capacity * 100) : 88}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Task Velocity</span>
                <span className="font-mono text-white font-bold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.current.task_velocity * 100) : 82}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Habit Consistency</span>
                <span className="font-mono text-white font-bold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.current.habit_consistency * 100) : 85}%
                </span>
              </div>
            </div>
          </div>

          {/* Projected Signal */}
          <div className="p-4 rounded-3xl bg-[#0c0a1a]/75 border border-white/5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#22d3ee] uppercase tracking-wider font-bold">
                PROJECTED TRAJECTORY (T+1)
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Projected Focus</span>
                <span className="font-mono text-[#22d3ee] font-semibold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.projected.focus_capacity * 100) : 94}%
                  <span className="text-[10px] text-emerald-400 ml-1">
                    (+{behavioralPattern ? Math.round(behavioralPattern.deltas.focus_delta * 100) : 6}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Projected Velocity</span>
                <span className="font-mono text-[#22d3ee] font-semibold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.projected.task_velocity * 100) : 89}%
                  <span className="text-[10px] text-emerald-400 ml-1">
                    (+{behavioralPattern ? Math.round(behavioralPattern.deltas.velocity_delta * 100) : 7}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Projected Consistency</span>
                <span className="font-mono text-[#22d3ee] font-semibold">
                  {behavioralPattern ? Math.round(behavioralPattern.signals.projected.habit_consistency * 100) : 91}%
                  <span className="text-[10px] text-emerald-400 ml-1">
                    (+{behavioralPattern ? Math.round(behavioralPattern.deltas.consistency_delta * 100) : 6}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          EXPLORE PRATIBIMB SPATIAL CAPABILITIES
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-4 pt-3">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              INTELLIGENCE WORKSPACES
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Dedicated spatial operating layers tailored to your cognitive twin.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('core')}
            className="text-xs text-[#22d3ee] hover:underline flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>Open Spatial OS</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 3 Featured Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. AI Core */}
          <div
            onClick={() => onNavigateTab('intelligence')}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#0c0a1a] to-[#140f2d] border border-white/10 hover:border-[#c33cff]/50 backdrop-blur-2xl shadow-xl hover:shadow-violet-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[#c33cff] group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#c33cff] transition-colors">
                AI Core Cognition
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Deep multi-hop reasoning, collaborative synthesis, and personal knowledge retrieval.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-mono text-[#c33cff] group-hover:translate-x-1 transition-transform">
              <span>Enter AI Core</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. World Model */}
          <div
            onClick={() => onNavigateTab('lifegraph')}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#0c0a1a] to-[#140f2d] border border-white/10 hover:border-[#6c4dff]/50 backdrop-blur-2xl shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[#6c4dff] group-hover:scale-110 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-mono">
                  {worldEntityCount !== null ? `${worldEntityCount} entities` : 'GNN Active'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#6c4dff] transition-colors">
                Personal World Model
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Topological graph of entities, upstream dependencies, and scenario propagation.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-mono text-[#6c4dff] group-hover:translate-x-1 transition-transform">
              <span>Explore World Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. Command Center */}
          <div
            onClick={() => onNavigateTab('core')}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#0c0a1a] to-[#140f2d] border border-white/10 hover:border-[#22d3ee]/50 backdrop-blur-2xl shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee] group-hover:scale-110 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">
                  {operationalState}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#22d3ee] transition-colors">
                Spatial Command Center
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Spatial neural environment with real-time state trajectories and State Engine 2.0.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-mono text-[#22d3ee] group-hover:translate-x-1 transition-transform">
              <span>Open Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </section>


      {/* =========================================================================
          "WHAT'S HAPPENING" LIVE INTELLIGENCE SIGNALS
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#22d3ee]" />
            WHAT'S HAPPENING
          </h2>
          <button
            onClick={() => onNavigateTab('insights')}
            className="text-xs font-mono text-[#22d3ee] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Intelligence Signals</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {whatsHappeningItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateTab('insights')}
              className="p-3.5 rounded-2xl bg-[#0c0a1a]/70 border border-white/10 hover:border-white/20 backdrop-blur-xl cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#140f2d] border border-white/10 text-violet-300">
                  {item.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
              </div>
              <div className="font-semibold text-xs text-slate-200 group-hover:text-white transition-colors">
                {item.title}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
