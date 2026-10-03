import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, Bookmark, Download, RotateCcw, Sliders, Layers, X } from 'lucide-react';
import type {
  CatalogItem,
  BackgroundPreset,
  SampleImage,
  TryOnResponse,
  BiometricAnalysis,
  SelectedLayerItem,
  LayerType,
} from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface StudioTryOnProps {
  catalogItems: CatalogItem[];
  backgrounds: BackgroundPreset[];
  samples: SampleImage[];
  onSaveLook: (lookImage: string, appliedItems: string[]) => void;
  onBiometricsUpdated: (biometrics: BiometricAnalysis) => void;
}

export const StudioTryOn: React.FC<StudioTryOnProps> = ({
  catalogItems,
  backgrounds,
  samples,
  onSaveLook,
  onBiometricsUpdated,
}) => {
  const [selectedSample, setSelectedSample] = useState<string>('sample-user-portrait');
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);

  // Multi-layer selections map: layer_type -> item_id
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, string | null>>({
    base_top: 'shirt-navy-formal',
    outerwear: 'blazer-charcoal-open',
    accessory: 'tie-crimson-silk',
    eyewear: 'glasses-classic-black',
    headwear: null,
    background: 'bg-studio-dark',
  });

  const [scale, setScale] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [drawLandmarks, setDrawLandmarks] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tryOnResult, setTryOnResult] = useState<TryOnResponse | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<LayerType>('base_top');

  // Toggle or replace an item in a specific layer slot
  const handleToggleItem = (item: CatalogItem) => {
    setActiveLayers((prev) => {
      const currentVal = prev[item.layer_type];
      return {
        ...prev,
        [item.layer_type]: currentVal === item.id ? null : item.id,
      };
    });
  };

  // Remove a single layer
  const handleRemoveLayer = (layerType: LayerType) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerType]: null,
    }));
  };

  // Clear all wearable layers
  const handleClearAllLayers = () => {
    setActiveLayers({
      base_top: null,
      outerwear: null,
      accessory: null,
      eyewear: null,
      headwear: null,
      background: 'none',
    });
  };

  // Trigger try-on processing
  const runTryOn = async () => {
    setIsLoading(true);
    try {
      // Build layer items array
      const itemsList: SelectedLayerItem[] = [];
      (Object.keys(activeLayers) as LayerType[]).forEach((lType) => {
        if (lType !== 'background') {
          const itemId = activeLayers[lType];
          if (itemId && itemId !== 'none') {
            itemsList.push({ id: itemId, layer_type: lType });
          }
        }
      });

      const response = await api.processTryOn({
        user_image_base64: userUploadedImage || undefined,
        sample_id: userUploadedImage ? undefined : selectedSample,
        items: itemsList,
        background_id: activeLayers.background !== 'none' ? activeLayers.background || undefined : undefined,
        adjust_scale: scale,
        adjust_offset_x: offsetX,
        adjust_offset_y: offsetY,
        draw_landmarks: drawLandmarks,
      });

      setTryOnResult(response);
      if (response.biometrics) {
        onBiometricsUpdated(response.biometrics);
      }
    } catch (err) {
      console.error('Try-on process error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run when layer stack or image changes
  useEffect(() => {
    runTryOn();
  }, [selectedSample, userUploadedImage, activeLayers, scale, offsetX, offsetY, drawLandmarks]);

  // Handle user photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserUploadedImage(reader.result as string);
      setSelectedSample('');
    };
    reader.readAsDataURL(file);
  };

  // Save to Lookbook
  const handleSave = () => {
    if (!tryOnResult?.result_image_base64) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    const appliedList: string[] = [];
    (Object.keys(activeLayers) as LayerType[]).forEach((lt) => {
      const val = activeLayers[lt];
      if (val && val !== 'none') appliedList.push(val);
    });
    onSaveLook(tryOnResult.result_image_base64, appliedList);
  };

  // Download high-res snapshot
  const handleDownload = () => {
    if (!tryOnResult?.result_image_base64) return;
    const link = document.createElement('a');
    link.href = tryOnResult.result_image_base64;
    link.download = `pratibimb-layered-tryon-${Date.now()}.jpg`;
    link.click();
  };

  const currentOriginalUrl = userUploadedImage
    ? userUploadedImage
    : samples.find((s) => s.id === selectedSample)?.url
    ? `http://localhost:8000${samples.find((s) => s.id === selectedSample)?.url}`
    : '';

  const activeLayersCount = (Object.keys(activeLayers) as LayerType[]).filter(
    (k) => k !== 'background' && activeLayers[k] !== null
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-2">
              <Layers className="w-3.5 h-3.5" />
              Multi-Layer Garment Stacking Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Studio Dressing Room
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Stack base shirts, open blazers, ties, eyewear, and hats simultaneously in Vision Studio with automatic depth ordering and alpha transparency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!tryOnResult?.success}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              <Bookmark className="w-4 h-4" />
              Save Look
            </button>
            <button
              onClick={handleDownload}
              disabled={!tryOnResult?.success}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs font-bold hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              <Download className="w-4 h-4" />
              Export HD
            </button>
          </div>
        </div>
      </div>

      {/* Layer Stack Floating Status Bar */}
      <div className="p-3.5 rounded-2xl glass-panel border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Active Layer Stack ({activeLayersCount}):
          </span>

          {/* Layer badges */}
          {[
            { key: 'base_top', label: 'Base Top', order: '1' },
            { key: 'outerwear', label: 'Outerwear', order: '2' },
            { key: 'accessory', label: 'Accessory', order: '3' },
            { key: 'eyewear', label: 'Eyewear', order: '4' },
            { key: 'headwear', label: 'Headwear', order: '5' },
          ].map(({ key, label, order }) => {
            const itemId = activeLayers[key as LayerType];
            const item = catalogItems.find((i) => i.id === itemId);
            if (!item) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-medium shadow-sm"
              >
                <span className="text-[10px] bg-cyan-500/30 text-white rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {order}
                </span>
                <span className="font-semibold text-white">{label}:</span>
                <span className="max-w-[120px] truncate">{item.name}</span>
                <button
                  onClick={() => handleRemoveLayer(key as LayerType)}
                  className="hover:text-red-400 ml-1 text-slate-400"
                  title={`Remove ${label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {activeLayersCount === 0 && (
            <span className="text-xs text-slate-500 italic">No garment layers selected. Choose items below.</span>
          )}
        </div>

        {activeLayersCount > 0 && (
          <button
            onClick={handleClearAllLayers}
            className="text-xs text-slate-400 hover:text-red-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-all"
          >
            Clear Stack
          </button>
        )}
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Viewport & Fitting Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visualizer Canvas */}
          <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex items-center justify-center group">
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <p className="text-xs font-medium text-cyan-300 tracking-wider uppercase font-mono">
                  Compositing Neural Layers...
                </p>
              </div>
            )}

            {/* Display Image */}
            {showOriginal ? (
              <img
                src={currentOriginalUrl}
                alt="Original Subject"
                className="w-full h-full object-contain"
              />
            ) : tryOnResult?.result_image_base64 ? (
              <img
                src={tryOnResult.result_image_base64}
                alt="AI Virtual Try-On Result"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 text-slate-500 text-xs">
                Select a portrait or upload an image to view try-on
              </div>
            )}

            {/* Top Bar Floating Controls */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs text-slate-200 font-medium hover:bg-slate-900 transition-all active:scale-95"
                >
                  Hold for Original
                </button>
                <button
                  onClick={() => setDrawLandmarks(!drawLandmarks)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    drawLandmarks
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Landmarks Skeleton
                </button>
              </div>

              {tryOnResult?.processing_time_ms && (
                <div className="px-2.5 py-1 rounded-md bg-slate-950/70 border border-white/10 text-[10px] font-mono text-cyan-400">
                  {tryOnResult.processing_time_ms}ms
                </div>
              )}
            </div>
          </div>

          {/* Model / Portrait Selector Bar */}
          <div className="p-4 rounded-xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Choose Model or Upload Your Photo</span>
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setUserUploadedImage(null);
                    setSelectedSample(sample.id);
                  }}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedSample === sample.id && !userUploadedImage
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={`http://localhost:8000${sample.url}`}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-medium text-slate-300 text-center py-0.5 truncate px-1">
                    {sample.name}
                  </span>
                </button>
              ))}

              {userUploadedImage && (
                <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-cyan-400 ring-2 ring-cyan-500/30 scale-105">
                  <img src={userUploadedImage} alt="User Upload" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-cyan-950/90 text-[9px] font-bold text-cyan-300 text-center py-0.5">
                    Your Photo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Precision Fitting Controls */}
          <div className="p-4 rounded-xl glass-panel space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Global Fitting & Alignment Controls
              </span>
              <button
                onClick={() => {
                  setScale(1.0);
                  setOffsetY(0);
                  setOffsetX(0);
                }}
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Stack Scaling</span>
                  <span className="text-cyan-400">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vertical Position</span>
                  <span className="text-cyan-400">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="2"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal Position</span>
                  <span className="text-cyan-400">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Multi-Category Layer Wardrobe (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl glass-panel space-y-4">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-xl bg-slate-900 border border-white/5 text-[11px]">
              {[
                { key: 'base_top', label: 'Tops' },
                { key: 'outerwear', label: 'Outer' },
                { key: 'accessory', label: 'Ties' },
                { key: 'eyewear', label: 'Glasses' },
                { key: 'headwear', label: 'Hats' },
                { key: 'background', label: 'Studio' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategoryTab(key as LayerType)}
                  className={`py-1.5 px-1 rounded-lg font-semibold transition-all text-center ${
                    activeCategoryTab === key
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                  {activeLayers[key as LayerType] && activeLayers[key as LayerType] !== 'none' && (
                    <span className="block w-1.5 h-1.5 rounded-full bg-cyan-400 mx-auto mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Render Items in Active Category */}
            {activeCategoryTab !== 'background' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Select {activeCategoryTab.replace('_', ' ')} layer:
                  </span>
                  <button
                    onClick={() => handleRemoveLayer(activeCategoryTab)}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      !activeLayers[activeCategoryTab]
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    No {activeCategoryTab.replace('_', ' ')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {catalogItems
                    .filter((item) => item.layer_type === activeCategoryTab)
                    .map((item) => {
                      const isSelected = activeLayers[activeCategoryTab] === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-500/40 shadow-lg'
                              : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="h-20 flex items-center justify-center p-1">
                            <img
                              src={`http://localhost:8000${item.image_url}`}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="mt-2">
                            <h4 className="text-xs font-bold text-slate-100 truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              <span className="text-slate-400 font-medium">${item.price}</span>
                              <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
                                {item.sub_category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              /* Backgrounds Staging */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Select studio backdrop:</span>
                  <button
                    onClick={() => setActiveLayers((p) => ({ ...p, background: 'none' }))}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      activeLayers.background === 'none'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Original Backdrop
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {backgrounds.map((bg) => {
                    const isSelected = activeLayers.background === bg.id;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => setActiveLayers((p) => ({ ...p, background: bg.id }))}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-400 ring-1 ring-purple-500/40'
                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img
                          src={`http://localhost:8000${bg.image_url}`}
                          alt={bg.name}
                          className="w-full h-16 rounded-lg object-cover"
                        />
                        <div className="mt-2">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{bg.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{bg.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Biometrics Snapshot Card */}
          {tryOnResult?.biometrics && (
            <div className="p-4 rounded-2xl glass-panel space-y-3 border-cyan-500/20">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Biometric Profile
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono">
                  {Math.round(tryOnResult.biometrics.size_confidence * 100)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Face Shape</span>
                  <p className="text-sm font-bold text-white mt-0.5">{tryOnResult.biometrics.face_shape}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Undertone</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: tryOnResult.biometrics.skin_tone_hex }}
                    />
                    <p className="text-sm font-bold text-white">{tryOnResult.biometrics.skin_undertone}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Fit Size</span>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{tryOnResult.biometrics.estimated_size}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
