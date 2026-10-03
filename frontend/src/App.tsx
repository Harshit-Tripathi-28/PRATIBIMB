import { useState, useEffect } from 'react';
import { Navbar, type MainTabType } from './components/Navbar';
import { TwinDashboard } from './components/TwinDashboard';
import { TwinChat } from './components/TwinChat';
import { TwinGraph } from './components/TwinGraph';
import { MemoryVault } from './components/MemoryVault';
import { GoalsBoard } from './components/GoalsBoard';
import { HabitsFocus } from './components/HabitsFocus';
import { OnboardingModal } from './components/OnboardingModal';

// Vision Studio (Visual AI) Components
import { StudioTryOn } from './components/StudioTryOn';
import { LiveMirror } from './components/LiveMirror';
import { CatalogGrid } from './components/CatalogGrid';
import { BiometricDashboard } from './components/BiometricDashboard';
import { LookbookGallery } from './components/LookbookGallery';

import type { 
  DigitalTwin, CatalogItem, BackgroundPreset, 
  SampleImage, BiometricAnalysis, SavedLook 
} from './types';
import { api } from './services/api';
import { Camera, Eye, Layers, Activity, Bookmark, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [visionSubTab, setVisionSubTab] = useState<'studio' | 'live' | 'wardrobe' | 'biometrics' | 'lookbook'>('studio');

  // Digital Twin state
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  // Vision Studio states
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundPreset[]>([]);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricAnalysis | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Fetch initial data
  const fetchAllData = async () => {
    try {
      const [twinData, items, bgs, smps, looks] = await Promise.all([
        api.getTwin().catch((e) => {
          console.error('Twin fetch error', e);
          return null;
        }),
        api.getCatalogItems().catch(() => []),
        api.getBackgrounds().catch(() => []),
        api.getSamples().catch(() => []),
        api.getSavedLooks().catch(() => []),
      ]);

      if (twinData) setTwin(twinData);
      setCatalogItems(items);
      setBackgrounds(bgs);
      setSamples(smps);
      setSavedLooks(looks);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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

  // Save look in Vision Studio
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

  if (isLoadingInitial || !twin) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-sans tracking-wider text-white">PRATIBIMB</h2>
          <p className="text-xs text-cyan-400 font-mono">Initializing Human Digital Twin & Cognitive Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        twinEvolutionLevel={3}
        onResetDemo={handleResetDemo}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: COMMAND CENTER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <TwinDashboard
            twin={twin}
            onRefresh={handleRefreshTwin}
            onNavigateTab={(tab) => setActiveTab(tab as MainTabType)}
            onOpenCalibration={() => setIsCalibrating(true)}
          />
        )}

        {/* TAB 2: AI CORE CHAT */}
        {activeTab === 'chat' && (
          <TwinChat
            twin={twin}
            onRefreshTwin={handleRefreshTwin}
            onNavigateTab={(tab) => setActiveTab(tab as MainTabType)}
          />
        )}

        {/* TAB 3: DIGITAL TWIN NEURAL CONSTELLATION GRAPH */}
        {activeTab === 'twin' && (
          <TwinGraph onRefreshTwin={handleRefreshTwin} />
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

        {/* TAB 7: VISION STUDIO (VISUAL AI & APPEARANCE SUITE) */}
        {activeTab === 'vision' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Vision Studio Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border border-pink-500/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 text-xs font-semibold border border-pink-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Visual AI & Appearance Environment
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Vision Studio
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Explore how you look — AI-powered visual fitting and multi-layer garment simulation.
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
            <span>Isolation Forest ML</span>
            <span>•</span>
            <span>Semantic Vector Store</span>
            <span>•</span>
            <span>Vision Studio MediaPipe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
