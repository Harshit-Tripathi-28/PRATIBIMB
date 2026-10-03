import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Sparkles, Sliders, RefreshCw, Layers, X } from 'lucide-react';
import type { CatalogItem, BackgroundPreset, SelectedLayerItem, LayerType } from '../types';
import confetti from 'canvas-confetti';

interface LiveMirrorProps {
  catalogItems: CatalogItem[];
  backgrounds: BackgroundPreset[];
  onSaveLook: (lookImage: string, appliedItems: string[]) => void;
}

export const LiveMirror: React.FC<LiveMirrorProps> = ({ catalogItems, backgrounds, onSaveLook }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Multi-layer state in Live Mirror
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, string | null>>({
    base_top: 'shirt-navy-formal',
    outerwear: 'blazer-charcoal-open',
    accessory: 'tie-crimson-silk',
    eyewear: 'glasses-classic-black',
    headwear: null,
    background: 'none',
  });

  const [scale, setScale] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [fps, setFps] = useState<number>(30);
  const [latency, setLatency] = useState<number>(18);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<LayerType>('base_top');

  // Start Webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied or unavailable. You can use Studio Try-On mode with portrait photos!');
    }
  };

  // Stop Webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Capture frame from webcam and send to API
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.7);

    // Build items list
    const itemsList: SelectedLayerItem[] = [];
    (Object.keys(activeLayers) as LayerType[]).forEach((lType) => {
      if (lType !== 'background') {
        const itemId = activeLayers[lType];
        if (itemId && itemId !== 'none') {
          itemsList.push({ id: itemId, layer_type: lType });
        }
      }
    });

    setIsProcessing(true);
    const startT = performance.now();

    try {
      const res = await fetch('http://localhost:8000/api/stream/frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame_base64: frameBase64,
          items: itemsList,
          background_id: activeLayers.background !== 'none' ? activeLayers.background || undefined : undefined,
          adjust_scale: scale,
          adjust_offset_x: offsetX,
          adjust_offset_y: offsetY,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.frame_base64) {
          setProcessedFrame(data.frame_base64);
          const endT = performance.now();
          const dt = Math.round(endT - startT);
          setLatency(dt);
          setFps(Math.round(1000 / Math.max(dt, 33)));
        }
      }
    } catch (e) {
      // Ignore transient network errors
    } finally {
      setIsProcessing(false);
    }
  }, [isStreaming, isProcessing, activeLayers, scale, offsetX, offsetY]);

  useEffect(() => {
    let interval: any;
    if (isStreaming) {
      interval = setInterval(() => {
        processFrame();
      }, 65);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, processFrame]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Snapshot capture
  const handleSnapshot = () => {
    if (!processedFrame && !videoRef.current) return;
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#8b5cf6', '#ec4899'],
    });

    const snapshotImg = processedFrame || '';
    if (snapshotImg) {
      const appliedList: string[] = [];
      (Object.keys(activeLayers) as LayerType[]).forEach((lt) => {
        const val = activeLayers[lt];
        if (val && val !== 'none') appliedList.push(val);
      });
      onSaveLook(snapshotImg, appliedList);
    }
  };

  const handleToggleItem = (item: CatalogItem) => {
    setActiveLayers((prev) => {
      const cur = prev[item.layer_type];
      return { ...prev, [item.layer_type]: cur === item.id ? null : item.id };
    });
  };

  const handleRemoveLayer = (layerType: LayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layerType]: null }));
  };

  const activeLayersCount = (Object.keys(activeLayers) as LayerType[]).filter(
    (k) => k !== 'background' && activeLayers[k] !== null
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Live AI Smart Mirror
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-layer pose & face tracking with depth compositing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isStreaming ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{fps} FPS</span>
                <span className="text-slate-600">|</span>
                <span>{latency} ms</span>
              </div>
              <button
                onClick={stopWebcam}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/20 transition-all"
              >
                <CameraOff className="w-3.5 h-3.5" />
                Stop Mirror
              </button>
            </>
          ) : (
            <button
              onClick={startWebcam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              Start Live Camera Mirror
            </button>
          )}
        </div>
      </div>

      {/* Layer Stack Badges */}
      <div className="p-3.5 rounded-2xl glass-panel border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Active Layers ({activeLayersCount}):
          </span>

          {[
            { key: 'base_top', label: 'Base' },
            { key: 'outerwear', label: 'Outer' },
            { key: 'accessory', label: 'Tie' },
            { key: 'eyewear', label: 'Glasses' },
            { key: 'headwear', label: 'Hat' },
          ].map(({ key, label }) => {
            const itemId = activeLayers[key as LayerType];
            const item = catalogItems.find((i) => i.id === itemId);
            if (!item) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[11px] font-medium"
              >
                <span className="font-semibold text-white">{label}:</span>
                <span className="max-w-[100px] truncate">{item.name}</span>
                <button onClick={() => handleRemoveLayer(key as LayerType)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Mirror Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mirror Screen */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex items-center justify-center">
            {flashEffect && <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />}
            <canvas ref={canvasRef} className="hidden" />

            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                processedFrame ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {processedFrame && isStreaming && (
              <img
                src={processedFrame}
                alt="Live AI Mirror Try-On"
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {!isStreaming && (
              <div className="text-center p-8 space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center mx-auto text-cyan-400">
                  <Camera className="w-8 h-8 opacity-70" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Camera Offline</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Start Live Camera Mirror" to activate the multi-layer real-time fitting room.
                  </p>
                </div>
                <button
                  onClick={startWebcam}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all"
                >
                  Activate Webcam Mirror
                </button>
              </div>
            )}

            {isStreaming && (
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-30">
                <button
                  onClick={handleSnapshot}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 text-cyan-600" />
                  Capture & Save Look
                </button>
              </div>
            )}
          </div>

          {/* Sliders */}
          <div className="p-4 rounded-xl glass-panel space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Fine-Tune Garment Fit & Placement
              </span>
              <button
                onClick={() => {
                  setScale(1.0);
                  setOffsetY(0);
                  setOffsetX(0);
                }}
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Scale / Size</span>
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
                  <span>Vertical Offset</span>
                  <span className="text-cyan-400">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="2"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal Offset</span>
                  <span className="text-cyan-400">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="2"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Drawer: Category Items */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-white/5 text-[11px]">
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
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Select {activeCategoryTab.replace('_', ' ')}:
              </span>
              <button
                onClick={() => handleRemoveLayer(activeCategoryTab)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900"
              >
                None
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {activeCategoryTab !== 'background'
                ? catalogItems
                    .filter((item) => item.layer_type === activeCategoryTab)
                    .map((item) => {
                      const isSelected = activeLayers[activeCategoryTab] === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleToggleItem(item)}
                          className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img
                            src={`http://localhost:8000${item.image_url}`}
                            alt={item.name}
                            className="h-14 w-auto object-contain py-1"
                          />
                          <span className="text-[11px] font-medium text-slate-200 truncate w-full text-center mt-1">
                            {item.name}
                          </span>
                        </button>
                      );
                    })
                : backgrounds.map((bg) => {
                    const isSelected = activeLayers.background === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => setActiveLayers((p) => ({ ...p, background: bg.id }))}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-400'
                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img
                          src={`http://localhost:8000${bg.image_url}`}
                          alt={bg.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-medium text-slate-200 truncate">{bg.name}</span>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
