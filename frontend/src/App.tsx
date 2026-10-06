import { useState, useEffect } from 'react';
import { NavigationRail, type OSViewTab } from './components/NavigationRail';
import { PortalHome } from './components/PortalHome';
import { SpatialCommandCenter } from './components/SpatialCommandCenter';
import { BottomTelemetryBar } from './components/BottomTelemetryBar';
import { CommandPalette } from './components/CommandPalette';
import { TwinChat } from './components/TwinChat';
import { LifeGraphView } from './components/LifeGraphView';
import { SimulationLab } from './components/SimulationLab';
import { StateTimelineView } from './components/StateTimelineView';
import { InsightExplorer } from './components/InsightExplorer';
import { TwinGraph } from './components/TwinGraph';
import { MemoryVault } from './components/MemoryVault';
import { GoalsBoard } from './components/GoalsBoard';
import { HabitsFocus } from './components/HabitsFocus';
import { AvatarStudio } from './components/AvatarStudio';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';

import type { DigitalTwin, AuthResponse, LatentStateVector } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<OSViewTab>('portal');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Authentication & Onboarding state
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; has_onboarded: boolean } | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);

  // Digital Twin state
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [latentState, setLatentState] = useState<LatentStateVector | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Global Keyboard Shortcut Listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkSession = async () => {
    const token = api.getToken();
    if (!token) {
      setAuthChecked(true);
      setIsLoadingInitial(false);
      return;
    }

    try {
      const me = await api.getMe();
      setCurrentUser({
        id: me.user_id,
        email: me.email,
        name: me.name,
        has_onboarded: me.has_onboarded,
      });

      if (!me.has_onboarded) {
        setIsOnboarding(true);
      } else {
        setTwin(me.twin);
        api.getLatentStateVector().then(setLatentState).catch(() => null);
      }
    } catch (e) {
      console.warn('Session check failed, clearing token:', e);
      api.setToken(null);
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingInitial(false);
    }
  };

  const handleAuthenticated = async (auth: AuthResponse) => {
    setCurrentUser({
      id: auth.user_id,
      email: auth.email,
      name: auth.name,
      has_onboarded: auth.has_onboarded,
    });

    if (!auth.has_onboarded) {
      setIsOnboarding(true);
    } else {
      setIsLoadingInitial(true);
      try {
        const twinData = await api.getTwin();
        setTwin(twinData);
        api.getLatentStateVector().then(setLatentState).catch(() => null);
      } catch (e) {
        console.error('Failed to load twin after login', e);
      } finally {
        setIsLoadingInitial(false);
      }
    }
  };

  const handleOnboardingComplete = async (calibratedTwin: DigitalTwin) => {
    setTwin(calibratedTwin);
    setIsOnboarding(false);
    if (currentUser) {
      setCurrentUser({ ...currentUser, has_onboarded: true, name: calibratedTwin.profile.name });
    }
    api.getLatentStateVector().then(setLatentState).catch(() => null);
  };

  const handleSignOut = async () => {
    await api.logout();
    setCurrentUser(null);
    setTwin(null);
    setIsOnboarding(false);
    setActiveTab('core');
  };

  const handleRefreshTwin = async () => {
    try {
      const updated = await api.getTwin();
      setTwin(updated);
      api.getLatentStateVector().then(setLatentState).catch(() => null);
    } catch (e) {
      console.error('Failed to refresh twin', e);
    }
  };

  const handleNavigateTab = (tab: string, initialPrompt?: string) => {
    const tabMap: Record<string, OSViewTab> = {
      portal: 'portal',
      home: 'portal',
      dashboard: 'core',
      core: 'core',
      chat: 'intelligence',
      intelligence: 'intelligence',
      insights: 'insights',
      lifegraph: 'lifegraph',
      simulation: 'simulation',
      timeline: 'timeline',
      memory: 'memory',
      goals: 'goals',
      tasks: 'goals',
      habits: 'focus',
      focus: 'focus',
      avatar: 'twin',
      twin: 'twin',
    };
    const targetTab = tabMap[tab] || 'portal';
    setActiveTab(targetTab);
    if (initialPrompt) {
      setChatInitialPrompt(initialPrompt);
    }
  };

  if (!authChecked || isLoadingInitial) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
            INITIALIZING PRATIBIMB OS...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (isOnboarding || !currentUser.has_onboarded) {
    return (
      <OnboardingFlow
        initialName={currentUser.name}
        onCompleted={handleOnboardingComplete}
      />
    );
  }

  if (!twin) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm font-mono">Digital Twin state not initialized.</p>
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const tabMeta: Record<string, { label: string; sub: string; icon: string }> = {
    intelligence: { label: 'AI Cognition Core', sub: 'Multi-turn neural reasoning & memory synthesis', icon: '🧠' },
    insights: { label: 'Cognitive Insights', sub: 'Epistemic diagnostics & behavioral pattern detection', icon: '✨' },
    lifegraph: { label: 'Personal World Model', sub: 'Graph Neural Network semantic knowledge graph', icon: '🌐' },
    simulation: { label: 'Future State Lab', sub: 'Multiverse trajectory & counterfactual engine', icon: '⚡' },
    timeline: { label: 'Temporal Sequence', sub: 'Latent state evolution across T-1, T0, T+1', icon: '⏳' },
    memory: { label: 'Neural Memory Vault', sub: 'Vector embeddings & associative recall hierarchy', icon: '💾' },
    goals: { label: 'Trajectory & Goals', sub: 'Strategic horizons, milestones, and task velocity', icon: '🎯' },
    focus: { label: 'Focus & Daily Rituals', sub: 'Attention rhythm, consistency, and cognitive telemetry', icon: '🔥' },
    twin: { label: 'Digital Twin Calibration', sub: 'Identity graph, avatar representation, and neural weights', icon: '👤' },
  };

  return (
    <div className="min-h-screen bg-[#05050A] flex text-slate-100 font-sans selection:bg-[#8B5CFF] selection:text-white overflow-x-hidden">
      
      {/* 1. Left Persistent Minimal Navigation Rail */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        userName={currentUser.name}
        avatarConfig={twin.profile.avatar_config}
        operationalState={twin.state.operational_state}
        onSignOut={handleSignOut}
      />

      {/* 2. Global Spatial Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={handleNavigateTab}
        onRefreshTwin={handleRefreshTwin}
      />

      {/* 3. Main Operating Viewport */}
      <main className={`flex-1 md:pl-16 flex flex-col min-h-screen ${(activeTab === 'core' || activeTab === 'portal') ? 'pb-0' : 'pb-14 md:pb-12'}`}>
        
        {/* Top Operational Context Bar (Displayed on internal views) */}
        {activeTab !== 'portal' && activeTab !== 'core' && (
          <header className="sticky top-0 z-30 bg-[#05050A]/85 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#8B5CFF] uppercase bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md font-semibold">
                  PRATIBIMB OS
                </span>
                <span className="text-slate-600 text-xs">/</span>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span className="text-base">{tabMeta[activeTab]?.icon || '✨'}</span>
                  <span>{tabMeta[activeTab]?.label || activeTab}</span>
                </h1>
              </div>
              <span className="hidden md:inline text-xs text-slate-400 border-l border-white/10 pl-3">
                {tabMeta[activeTab]?.sub}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Operational State Badge */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{twin.state.operational_state || 'COHERENT'}</span>
              </div>

              {/* Latent Vector Pill */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-[11px] font-mono text-violet-300">
                <span>64D LATENT</span>
                <span className="text-white/30">•</span>
                <span>{Math.round((latentState?.entropy || 0.28) * 100)}% ENTROPY</span>
              </div>

              {/* Command Palette Trigger */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                <span className="font-mono text-[10px] text-slate-400 bg-black/40 px-1 rounded">⌘K</span>
              </button>

              {/* Calibration Trigger */}
              <button
                onClick={() => setIsCalibrating(true)}
                className="px-2.5 py-1 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-xs text-violet-200 font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Calibrate</span>
              </button>
            </div>
          </header>
        )}
        
        {/* VIEW 0: PRATIBIMB PORTAL 1.0 (Entry / Discovery / Action Gateway) */}
        {activeTab === 'portal' && (
          <PortalHome
            twin={twin}
            onNavigateTab={handleNavigateTab}
            onRefreshTwin={handleRefreshTwin}
            onOpenCalibration={() => setIsCalibrating(true)}
          />
        )}

        {/* VIEW 1: SPATIAL NEURAL COMMAND CENTER */}
        {activeTab === 'core' && (
          <SpatialCommandCenter
            twin={twin}
            onRefresh={handleRefreshTwin}
            onNavigateTab={handleNavigateTab}
            onOpenCalibration={() => setIsCalibrating(true)}
          />
        )}

        {/* VIEW 2: AI CORE COGNITION */}
        {activeTab === 'intelligence' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <TwinChat
              twin={twin}
              onRefreshTwin={handleRefreshTwin}
              onNavigateTab={handleNavigateTab}
              initialPrompt={chatInitialPrompt}
            />
          </div>
        )}

        {/* VIEW 3: COGNITIVE INSIGHTS & CAUSAL CONTEXT */}
        {activeTab === 'insights' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <InsightExplorer
              twin={twin}
              onRefresh={handleRefreshTwin}
              onNavigateTab={handleNavigateTab}
            />
          </div>
        )}

        {/* VIEW 4: LIFE GRAPH NETWORK */}
        {activeTab === 'lifegraph' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <LifeGraphView
              onNavigateTab={handleNavigateTab}
            />
          </div>
        )}

        {/* VIEW 5: WHAT-IF SIMULATION LAB */}
        {activeTab === 'simulation' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SimulationLab
              twin={twin}
              onNavigateTab={handleNavigateTab}
            />
          </div>
        )}

        {/* VIEW 6: STATE TIMELINE & EVOLUTION */}
        {activeTab === 'timeline' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <StateTimelineView
              onNavigateTab={handleNavigateTab}
            />
          </div>
        )}

        {/* VIEW 7: NEURAL MEMORY VAULT */}
        {activeTab === 'memory' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <MemoryVault twin={twin} onRefreshTwin={handleRefreshTwin} />
          </div>
        )}

        {/* VIEW 8: GOALS & TASKS VELOCITY */}
        {activeTab === 'goals' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <GoalsBoard twin={twin} onRefreshTwin={handleRefreshTwin} />
          </div>
        )}

        {/* VIEW 9: FOCUS & HABITS RITUAL ENGINE */}
        {activeTab === 'focus' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <HabitsFocus twin={twin} onRefreshTwin={handleRefreshTwin} />
          </div>
        )}

        {/* VIEW 10: DIGITAL TWIN IDENTITY & CUSTOMIZATION */}
        {activeTab === 'twin' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            <TwinGraph
              twin={twin}
              onRefreshTwin={handleRefreshTwin}
              onNavigateTab={handleNavigateTab}
            />
            <AvatarStudio twin={twin} onRefreshTwin={handleRefreshTwin} />
          </div>
        )}

      </main>

      {/* 4. Bottom Live Intelligence & Telemetry Bar (Shown on non-core/non-portal tabs) */}
      {activeTab !== 'core' && activeTab !== 'portal' && (
        <BottomTelemetryBar
          twin={twin}
          latentState={latentState}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigateTab={handleNavigateTab}
          onOpenEnergyCheckin={() => setIsCalibrating(true)}
        />
      )}

      {/* Genesis Calibration Modal */}
      <OnboardingModal
        profile={twin.profile}
        isOpen={isCalibrating}
        onClose={() => setIsCalibrating(false)}
        onProfileUpdated={handleRefreshTwin}
      />

    </div>
  );
}

export default App;
