import React, { useState } from 'react';
import { Bookmark, Download, Trash2, Eye } from 'lucide-react';
import type { SavedLook } from '../types';

interface LookbookGalleryProps {
  savedLooks: SavedLook[];
  onDeleteLook: (lookId: string) => void;
}

export const LookbookGallery: React.FC<LookbookGalleryProps> = ({ savedLooks, onDeleteLook }) => {
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);

  if (savedLooks.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel space-y-4">
        <Bookmark className="w-12 h-12 text-cyan-400 mx-auto opacity-60" />
        <h3 className="text-lg font-bold text-white">Your Lookbook is Empty</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Capture looks from the Live AI Mirror or click "Save Look" in the Studio Dressing Room to collect and compare your virtual try-on creations.
        </p>
      </div>
    );
  }

  const handleDownload = (look: SavedLook) => {
    const link = document.createElement('a');
    link.href = look.result_image_base64;
    link.download = `lookbook-${look.id}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            Virtual Lookbook Gallery
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review, compare, and export your high-resolution virtual try-on creations.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-slate-900 px-4 py-2 rounded-xl border border-white/10">
          Total Looks Saved: <strong className="text-cyan-400">{savedLooks.length}</strong>
        </div>
      </div>

      {/* Looks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {savedLooks.map((look) => (
          <div
            key={look.id}
            className="group rounded-2xl glass-panel border border-white/5 hover:border-cyan-500/30 overflow-hidden flex flex-col transition-all"
          >
            {/* Image Preview Container */}
            <div
              onClick={() => setSelectedLook(look)}
              className="relative aspect-[4/3] bg-slate-950 cursor-pointer overflow-hidden flex items-center justify-center"
            >
              <img
                src={look.result_image_base64}
                alt={look.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 shadow-lg">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> View HD
                </span>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-white">{look.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{look.created_at}</p>
              </div>

              {look.items_applied && look.items_applied.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {look.items_applied.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/20"
                    >
                      {item.replace(/^(glasses-|shirt-|tshirt-|jacket-|bg-)/, '')}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleDownload(look)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => onDeleteLook(look.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete Look"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full HD view */}
      {selectedLook && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedLook.title}</h3>
                <p className="text-xs text-slate-400">{selectedLook.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedLook(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
              <img
                src={selectedLook.result_image_base64}
                alt={selectedLook.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {selectedLook.items_applied?.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(selectedLook)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25"
                >
                  <Download className="w-4 h-4" /> Download Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
