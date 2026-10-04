import { useState, useEffect } from 'react';
import { Navbar, type MainTabType } from './components/Navbar';
import { TwinDashboard } from './components/TwinDashboard';
import { TwinChat } from './components/TwinChat';
import { TwinGraph } from './components/TwinGraph';
import { MemoryVault } from './components/MemoryVault';
import { GoalsBoard } from './components/GoalsBoard';
import { HabitsFocus } from './components/HabitsFocus';
import { AvatarStudio } from './components/AvatarStudio';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';

// Vision Studio (Secondary / Compatible visual AI components)
import { StudioTryOn } from './components/StudioTryOn';
import { LiveMirror } from './components/LiveMirror';
import { CatalogGrid } from './components/CatalogGrid';
import { BiometricDashboard } from './components/BiometricDashboard';
import { LookbookGallery } from './components/LookbookGallery';

import type { 
  DigitalTwin, CatalogItem, BackgroundPreset, 
  SampleImage, BiometricAnalysis, SavedLook, AuthResponse 
} from './types';
import { api } from './services/api';
import { Camera, Eye, Layers, Activity, Bookmark, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [visionSubTab, setVisionSubTab] = useState<'studio' | 'live' | 'wardrobe' | 'biometrics' | 'lookbook'>('studio');

  // Authentication & Onboarding state
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; has_onboarded: boolean } | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);

  // Digital Twin state
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  // Vision Studio states (Compatibility)
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundPreset[]>([]);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricAnalysis | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
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
        await loadSecondaryAssets();
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

  const loadSecondaryAssets = async () => {
    try {
      const [items, bgs, smps, looks] = await Promise.all([
        api.getCatalogItems().catch(() => []),
        api.getBackgrounds().catch(() => []),
        api.getSamples().catch(() => []),
        api.getSavedLooks().catch(() => []),
      ]);
      setCatalogItems(items);
      setBackgrounds(bgs);
      setSamples(smps);
      setSavedLooks(looks);
    } catch (e) {
      console.warn('Error loading secondary assets', e);
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
        await loadSecondaryAssets();
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
    await loadSecondaryAssets();
  };

  const handleSignOut = async () => {
    await api.logout();
    setCurrentUser(null);
    setTwin(null);
    setIsOnboarding(false);
    setActiveTab('dashboard');
  };

  const handleRefreshTwin = async () => {
    try {
      const updated = await api.getTwin();
      setTwin(updated);
    } catch (e) {
      console.error('Failed to refresh twin', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const resetState = await api.resetDemo();
      setTwin(resetState);
    } catch (e) {
      console.error('Failed to reset demo state', e);
    }
  };

  const handleNavigateTab = (tab: string, initialPrompt?: string) => {
    setActiveTab(tab as MainTabType);
    if (initialPrompt) {
      setChatInitialPrompt(initialPrompt);
    }
  };

  // Vision Studio actions
  const handleSaveLook = async (resultImageBase64: string, appliedItems: string[]) => {
    const newLook: SavedLook = {
      id: `look-${Date.now()}`,
      title: `Outfit Styling #${savedLooks.length + 1}`,
      created_at: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      result_image_base64: resultImageBase64,
      items_applied: appliedItems,
    };

    setSavedLooks((prev) => [newLook, ...prev]);
    try {
      await api.saveLook(newLook);
    } catch (e) {
      console.warn('Failed to sync look with server:', e);
    }
  };

  const handleDeleteLook = async (lookId: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
    try {
      await api.deleteLook(lookId);
    } catch (e) {
      console.warn('Failed to delete look from server:', e);
    }
  };

  const handleItemUploaded = (newItem: CatalogItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  // 1. Loading State
  if (!authChecked || (currentUser && isLoadingInitial)) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-sans tracking-wider text-white">PRATIBIMB</h2>
          <p className="text-xs text-cyan-400 font-mono">Syncing Personal AI Digital Twin Core...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: Show Auth Screen
  if (!currentUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // 3. New User Onboarding State
  if (isOnboarding) {
    return (
      <OnboardingFlow
        initialName={currentUser.name}
        onCompleted={handleOnboardingComplete}
      />
    );
  }

  // 4. Authenticated & Onboarded Twin Dashboard Experience
  if (!twin) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Connecting to Digital Twin...</h2>
          <button
            onClick={handleRefreshTwin}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Dynamic twin evolution level based on real progress
  const completedTasksCount = twin.tasks.filter((t) => t.status === 'completed').length;
  const memoriesCount = twin.memories.length;
  const focusCount = twin.focus_sessions.length;
  const xp = (completedTasksCount * 20) + (memoriesCount * 15) + (focusCount * 25);
  const dynamicEvolutionLevel = Math.max(1, Math.min(5, Math.floor(xp / 40) + 1));

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        twinEvolutionLevel={dynamicEvolutionLevel}
        userName={currentUser.name}
        avatarConfig={twin.profile.avatar_config}
        onResetDemo={handleResetDemo}
        onSignOut={handleSignOut}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'dashboard' && (
          <TwinDashboard
            twin={twin}
            onRefresh={handleRefreshTwin}
            onNavigateTab={handleNavigateTab}
            onOpenCalibration={() => setIsCalibrating(true)}
          />
        )}

        {/* TAB 2: AI CORE */}
        {activeTab === 'chat' && (
          <TwinChat
            twin={twin}
            onRefreshTwin={handleRefreshTwin}
            onNavigateTab={handleNavigateTab}
            initialPrompt={chatInitialPrompt}
          />
        )}

        {/* TAB 3: DIGITAL TWIN IDENTITY */}
        {activeTab === 'twin' && (
          <TwinGraph
            twin={twin}
            onRefreshTwin={handleRefreshTwin}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {/* TAB 4: SECOND BRAIN / MEMORY VAULT */}
        {activeTab === 'memory' && (
          <MemoryVault twin={twin} onRefreshTwin={handleRefreshTwin} />
        )}

        {/* TAB 5: GOALS & TASKS */}
        {activeTab === 'goals' && (
          <GoalsBoard twin={twin} onRefreshTwin={handleRefreshTwin} />
        )}

        {/* TAB 6: HABITS & FOCUS ENGINE */}
        {activeTab === 'habits' && (
          <HabitsFocus twin={twin} onRefreshTwin={handleRefreshTwin} />
        )}

        {/* TAB 7: CUSTOMIZABLE DIGITAL AVATAR */}
        {activeTab === 'avatar' && (
          <AvatarStudio twin={twin} onRefreshTwin={handleRefreshTwin} />
        )}

        {/* TAB 8: VISION STUDIO (SECONDARY / COMPATIBLE TRY-ON SUITE) */}
        {activeTab === 'vision' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border border-pink-500/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 text-xs font-semibold border border-pink-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Visual AI Appearance Suite
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Vision Studio
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Experimental visual fitting and multi-layer garment simulation.
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-pink-500/20 text-xs font-mono text-pink-300">
                <span>MediaPipe Pose + Face Geometry</span>
              </div>
            </div>

            {/* Vision Studio Sub-Tabs */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setVisionSubTab('studio')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    visionSubTab === 'studio'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Studio Dressing Room
                </button>

                <button
                  onClick={() => setVisionSubTab('live')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    visionSubTab === 'live'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live Mirror
                </button>

                <button
                  onClick={() => setVisionSubTab('wardrobe')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    visionSubTab === 'wardrobe'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Garment Catalog
                </button>

                <button
                  onClick={() => setVisionSubTab('biometrics')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    visionSubTab === 'biometrics'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Biometric Styling
                </button>

                <button
                  onClick={() => setVisionSubTab('lookbook')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    visionSubTab === 'lookbook'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Lookbook ({savedLooks.length})
                </button>
              </div>

              <span className="hidden md:inline font-mono text-[11px] text-pink-400 font-medium px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                Multi-Layer Geometric Stacking
              </span>
            </div>

            {/* Sub-tab Views */}
            {visionSubTab === 'studio' && (
              <StudioTryOn
                catalogItems={catalogItems}
                backgrounds={backgrounds}
                samples={samples}
                onSaveLook={handleSaveLook}
                onBiometricsUpdated={setBiometrics}
              />
            )}

            {visionSubTab === 'live' && (
              <LiveMirror
                catalogItems={catalogItems}
                backgrounds={backgrounds}
                onSaveLook={handleSaveLook}
              />
            )}

            {visionSubTab === 'wardrobe' && (
              <CatalogGrid
                catalogItems={catalogItems}
                onSelectTryOn={() => setVisionSubTab('studio')}
                onItemUploaded={handleItemUploaded}
              />
            )}

            {visionSubTab === 'biometrics' && (
              <BiometricDashboard biometrics={biometrics} />
            )}

            {visionSubTab === 'lookbook' && (
              <LookbookGallery savedLooks={savedLooks} onDeleteLook={handleDeleteLook} />
            )}
          </div>
        )}
      </main>

      {/* Twin Genesis Calibration Modal */}
      <OnboardingModal
        profile={twin.profile}
        isOpen={isCalibrating}
        onClose={() => setIsCalibrating(false)}
        onProfileUpdated={handleRefreshTwin}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 PRATIBIMB — Personal AI Operating Layer & Digital Twin.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>FastAPI Core</span>
            <span>•</span>
            <span>Multi-User Isolated Store</span>
            <span>•</span>
            <span>LLM Provider Engine</span>
            <span>•</span>
            <span>Vector Memory Vault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
