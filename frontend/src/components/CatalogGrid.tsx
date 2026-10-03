import React, { useState } from 'react';
import { Sparkles, Upload, Plus, Eye, Layers } from 'lucide-react';
import type { CatalogItem, LayerType } from '../types';
import { api } from '../services/api';

interface CatalogGridProps {
  catalogItems: CatalogItem[];
  onSelectTryOn: (item: CatalogItem) => void;
  onItemUploaded: (item: CatalogItem) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ catalogItems, onSelectTryOn, onItemUploaded }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload Form State
  const [uploadName, setUploadName] = useState<string>('');
  const [uploadLayerType, setUploadLayerType] = useState<LayerType>('base_top');
  const [uploadSubCategory, setUploadSubCategory] = useState<string>('T-Shirts');
  const [uploadPrice, setUploadPrice] = useState<number>(89.0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const filteredItems = catalogItems.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.layer_type === filterCategory || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.style_tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', uploadName);
      formData.append('category', uploadLayerType === 'eyewear' ? 'glasses' : 'tops');
      formData.append('sub_category', uploadSubCategory);
      formData.append('price', uploadPrice.toString());
      formData.append('file', uploadFile);

      const newItem = await api.uploadCustomItem(formData);
      onItemUploaded(newItem);
      setShowUploadModal(false);
      setUploadName('');
      setUploadFile(null);
    } catch (err) {
      console.error('Failed to upload custom item:', err);
      alert('Upload failed. Please ensure the image is a valid PNG or JPG.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Layered Wardrobe & Apparel Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse compatible base tops, open outerwear, silk ties, designer eyewear, and headwear.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Garment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'base_top', label: 'Base Tops' },
            { id: 'outerwear', label: 'Outerwear' },
            { id: 'accessory', label: 'Accessories & Ties' },
            { id: 'eyewear', label: 'Eyewear' },
            { id: 'headwear', label: 'Headwear' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search wardrobe, style, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl glass-panel border border-white/5 hover:border-cyan-500/30 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-cyan-500/10"
          >
            {/* Image Preview Container */}
            <div className="h-52 bg-slate-950/60 p-4 flex items-center justify-center relative overflow-hidden">
              <img
                src={`http://localhost:8000${item.image_url}`}
                alt={item.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-cyan-400 border border-white/5 flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" />
                {item.layer_type.replace('_', ' ')}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">{item.brand}</span>
                <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {item.style_tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Price and CTA */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">${item.price}</span>
                <button
                  onClick={() => onSelectTryOn(item)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500 hover:text-slate-950 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Stack in Studio
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Custom Garment Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                Upload Custom Layer Garment
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Leather Jacket"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Layer Category</label>
                  <select
                    value={uploadLayerType}
                    onChange={(e) => setUploadLayerType(e.target.value as LayerType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="base_top">Base Top (Shirt / Tee)</option>
                    <option value="outerwear">Outerwear (Blazer / Jacket)</option>
                    <option value="accessory">Accessory (Tie / Scarf)</option>
                    <option value="eyewear">Eyewear (Glasses)</option>
                    <option value="headwear">Headwear (Hat / Cap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Outerwear"
                    value={uploadSubCategory}
                    onChange={(e) => setUploadSubCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Price ($)</label>
                <input
                  type="number"
                  value={uploadPrice}
                  onChange={(e) => setUploadPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transparent PNG Image</label>
                <input
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save & Add to Wardrobe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
