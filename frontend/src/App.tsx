import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveMirror } from './components/LiveMirror';
import { StudioTryOn } from './components/StudioTryOn';
import { CatalogGrid } from './components/CatalogGrid';
import { BiometricDashboard } from './components/BiometricDashboard';
import { LookbookGallery } from './components/LookbookGallery';
import type { CatalogItem, BackgroundPreset, SampleImage, BiometricAnalysis, SavedLook } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'mirror' | 'studio' | 'wardrobe' | 'biometrics' | 'lookbook'>('studio');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundPreset[]>([]);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricAnalysis | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, bgs, smps, looks] = await Promise.all([
          api.getCatalogItems(),
          api.getBackgrounds(),
          api.getSamples(),
          api.getSavedLooks().catch(() => []),
        ]);
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

    fetchData();
  }, []);

  // Save new look
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

  // Delete look
  const handleDeleteLook = async (lookId: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
    try {
      await api.deleteLook(lookId);
    } catch (e) {
      console.warn('Failed to delete look from server:', e);
    }
  };

  // Item uploaded handler
  const handleItemUploaded = (newItem: CatalogItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  // Try On jump from Wardrobe
  const handleSelectTryOn = (_item: CatalogItem) => {
    setActiveTab('studio');
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[2px] animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold font-display text-white">PRATIBIMB AI</h2>
          <p className="text-xs text-cyan-400 font-mono">Initializing Neural Vision Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col text-slate-100">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} lookCount={savedLooks.length} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'mirror' && (
          <LiveMirror
            catalogItems={catalogItems}
            backgrounds={backgrounds}
            onSaveLook={handleSaveLook}
          />
        )}

        {activeTab === 'studio' && (
          <StudioTryOn
            catalogItems={catalogItems}
            backgrounds={backgrounds}
            samples={samples}
            onSaveLook={handleSaveLook}
            onBiometricsUpdated={setBiometrics}
          />
        )}

        {activeTab === 'wardrobe' && (
          <CatalogGrid
            catalogItems={catalogItems}
            onSelectTryOn={handleSelectTryOn}
            onItemUploaded={handleItemUploaded}
          />
        )}

        {activeTab === 'biometrics' && (
          <BiometricDashboard biometrics={biometrics} />
        )}

        {activeTab === 'lookbook' && (
          <LookbookGallery savedLooks={savedLooks} onDeleteLook={handleDeleteLook} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Pratibimb AI. Real-Time Virtual Mirror & Biometric Try-On Platform.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>OpenCV 4.13</span>
            <span>•</span>
            <span>FastAPI Core</span>
            <span>•</span>
            <span>MediaPipe Geometry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
