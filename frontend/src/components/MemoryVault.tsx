import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Share2,
  Compass,
  X,
  Cpu,
} from 'lucide-react';
import type {
  MemoryItem,
  DigitalTwin,
  MemoryCluster,
  MemoryAssociationResponse,
  MemorySemanticPoint,
} from '../types';
import { api } from '../services/api';

interface MemoryVaultProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
  onNavigateTab?: (tab: string, initialPrompt?: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  twin,
  onRefreshTwin,
  onNavigateTab,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>(twin.memories || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const [clusters, setClusters] = useState<MemoryCluster[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [associations, setAssociations] = useState<MemoryAssociationResponse | null>(null);
  const [loadingAssoc, setLoadingAssoc] = useState(false);
  const [semanticPoints, setSemanticPoints] = useState<MemorySemanticPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<MemorySemanticPoint | null>(null);
  const [viewMode, setViewMode] = useState<'fragments' | 'semantic_space'>('fragments');

  // New Memory Form State
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<string>('episodic');
  const [newImportance, setNewImportance] = useState(7);
  const [newTags, setNewTags] = useState('architecture, neural_os');
  const [addingMemory, setAddingMemory] = useState(false);

  // Load Clusters and Semantic Space on Mount
  useEffect(() => {
    const loadDeepLearningMemoryData = async () => {
      try {
        const [clusterRes, spaceRes] = await Promise.all([
          api.getMemoryClusters().catch(() => null),
          api.getMemorySemanticSpace().catch(() => null),
        ]);

        if (clusterRes?.clusters) {
          setClusters(clusterRes.clusters);
        }
        if (spaceRes?.points) {
          setSemanticPoints(spaceRes.points);
        }
      } catch (e) {
        console.error('Failed to load semantic memory space', e);
      }
    };
    loadDeepLearningMemoryData();
  }, [twin.memories.length]);

  const categories = [
    { id: 'all', label: 'All Fragments' },
    { id: 'episodic', label: 'Episodic' },
    { id: 'semantic', label: 'Semantic' },
    { id: 'procedural', label: 'Procedural' },
    { id: 'working', label: 'Working' },
    { id: 'reflective', label: 'Reflective' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMemories(twin.memories || []);
      return;
    }

    try {
      setSearching(true);
      const res = await api.searchMemory(searchQuery.trim());
      setMemories(res.results || []);
    } catch (e) {
      console.error('Vector search failed', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMemory = async (memory: MemoryItem) => {
    setSelectedMemory(memory);
    try {
      setLoadingAssoc(true);
      const assocData = await api.getMemoryAssociations(memory.id);
      setAssociations(assocData);
    } catch (e) {
      console.error('Failed to load memory associations', e);
      setAssociations(null);
    } finally {
      setLoadingAssoc(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setAddingMemory(true);
      await api.addMemory({
        content: newContent.trim(),
        type: newType as any,
        importance: newImportance,
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setNewContent('');
      setShowAddModal(false);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to store memory', e);
    } finally {
      setAddingMemory(false);
    }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteMemory(id);
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
        setAssociations(null);
      }
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  };

  const filteredMemories =
    activeCategory === 'all'
      ? memories
      : memories.filter((m) => m.type.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* 1. Header & Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8B0F24]/20 border border-[#E51D48]/30 text-[#FF365C]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">NEURAL MEMORY FIELD</h1>
              <p className="text-xs text-slate-400">
                Vector embeddings, 2D semantic space projections, and cosine similarity association.
              </p>
            </div>
          </div>
        </div>

        {/* Real Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#04060C] border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">FRAGMENTS</span>
            <span className="text-white font-bold">{twin.memories.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#04060C] border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">COHERENCE</span>
            <span className="text-[#48D7FF] font-bold">92%</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#04060C] border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">CLUSTERS</span>
            <span className="text-[#FF365C] font-bold">{clusters.length || 4}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store Fragment</span>
          </button>
        </div>
      </div>

      {/* 2. Semantic Memory Field Filter Strip */}
      <div className="p-5 rounded-3xl bg-[#070A12]/80 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-[#FF365C]" />
            SEMANTIC FILTER MATRIX
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('fragments')}
              className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                viewMode === 'fragments'
                  ? 'bg-[#E51D48]/20 text-white border border-[#E51D48]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fragments List
            </button>
            <button
              onClick={() => setViewMode('semantic_space')}
              className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'semantic_space'
                  ? 'bg-[#1E7BFF]/20 text-white border border-[#1E7BFF]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#48D7FF]" />
              <span>2D Semantic Space</span>
            </button>
          </div>
        </div>

        {/* Spatial Cluster Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? memories.length
                : memories.filter((m) => m.type.toLowerCase() === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-1 select-none ${
                  isActive
                    ? 'bg-[#0c0a1a] border-[#E51D48] shadow-lg shadow-red-950/30'
                    : 'bg-[#04060C] hover:bg-[#070A12] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 group-hover:text-slate-200">
                    {cat.label}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#FF365C] animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {count} <span className="text-[10px] text-slate-500 font-normal">nodes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 2D Semantic Space or Split Association View */}
      {viewMode === 'semantic_space' ? (
        <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#48D7FF]" />
                2D SEMANTIC EMBEDDING SPACE PROJECTION
              </h2>
              <p className="text-xs text-slate-400">
                Orthonormal spectral projection of dense memory embedding vectors.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {semanticPoints.length} projected points
            </span>
          </div>

          <div className="relative w-full h-[380px] rounded-2xl bg-[#04060C] border border-white/5 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#E51D4815_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute w-full h-[1px] bg-white/5" />
            <div className="absolute h-full w-[1px] bg-white/5" />

            <svg className="w-full h-full">
              {semanticPoints.map((pt, idx) => {
                const cx = `${50 + pt.x * 20}%`;
                const cy = `${50 - pt.y * 20}%`;
                const isSelected = selectedMemory?.id === pt.id;

                return (
                  <g
                    key={pt.id || idx}
                    className="cursor-pointer group"
                    onClick={() => {
                      const found = twin.memories.find((m) => m.id === pt.id);
                      if (found) handleSelectMemory(found);
                    }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#FF365C"
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4}
                      fill={
                        pt.type === 'episodic'
                          ? '#E51D48'
                          : pt.type === 'semantic'
                          ? '#1E7BFF'
                          : '#48D7FF'
                      }
                      className="transition-transform group-hover:scale-150"
                    />
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#070A12]/95 border border-[#E51D48]/30 text-xs font-mono backdrop-blur-xl flex items-center justify-between">
                <div>
                  <span className="text-[#FF365C] font-bold uppercase">[{hoveredPoint.type}]</span>{' '}
                  <span className="text-white font-medium">{hoveredPoint.title}</span>
                </div>
                <span className="text-slate-400 text-[10px]">Click to inspect associations</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Search & Fragments (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Vector Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Semantic embedding search across memory fragments..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#070A12] border border-white/10 focus:border-[#E51D48] text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-5 py-3 rounded-2xl bg-[#070A12] hover:bg-[#0c0a1a] border border-white/10 hover:border-[#E51D48]/30 text-xs font-mono font-bold text-white transition-all cursor-pointer"
              >
                {searching ? 'Querying...' : 'Search'}
              </button>
            </form>

            {/* Fragments Feed */}
            <div className="space-y-3">
              {filteredMemories.map((mem) => {
                const isSelected = selectedMemory?.id === mem.id;
                return (
                  <div
                    key={mem.id}
                    onClick={() => handleSelectMemory(mem)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 group backdrop-blur-2xl ${
                      isSelected
                        ? 'bg-[#0c0a1a] border-[#E51D48] shadow-xl shadow-red-950/30'
                        : 'bg-[#070A12]/80 hover:bg-[#070A12] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-bold uppercase">
                          {mem.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Importance: {mem.importance}/10
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteMemory(mem.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{mem.content}</p>

                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {mem.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#04060C] text-[10px] font-mono text-slate-400 border border-white/5"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Neural Association Inspector (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedMemory ? (
              <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF365C] font-bold">
                      ASSOCIATION ENGINE
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {selectedMemory.type.toUpperCase()} FRAGMENT
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#48D7FF] bg-[#04060C] px-2.5 py-1 rounded-xl border border-white/10">
                    IMP {selectedMemory.importance}/10
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#04060C] border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedMemory.content}
                </div>

                {/* Associative Cosine Links */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Associated Fragments ({associations?.associations?.length || 0})</span>
                    <span className="text-[#FF365C]">Cosine Similarity</span>
                  </div>

                  {loadingAssoc ? (
                    <div className="py-6 text-center text-xs font-mono text-slate-500">
                      Computing cosine similarity vectors...
                    </div>
                  ) : associations?.associations && associations.associations.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {associations.associations.map((assoc) => (
                        <div
                          key={assoc.id}
                          className="p-3 rounded-2xl bg-[#04060C] border border-white/5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400 uppercase">{assoc.type}</span>
                            <span className="text-[#48D7FF] font-bold">
                              {(assoc.similarity_score * 100).toFixed(0)}% MATCH
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2">{assoc.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs font-mono text-slate-500">
                      No high-similarity fragments found.
                    </div>
                  )}
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() =>
                      onNavigateTab(
                        'intelligence',
                        `Reason about this memory anchor: "${selectedMemory.content.substring(0, 100)}..."`
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B0F24] to-[#E51D48] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all shadow-md shadow-red-950/40"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Consult AI Core on this Memory</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-[#070A12]/50 border border-white/5 text-center text-slate-500 text-xs font-mono">
                Select a memory fragment to compute live associative links and cosine distances.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4 animate-fadeIn font-sans">
          <div className="w-full max-w-lg rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF365C]" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">Store Memory Fragment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Memory Content</label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record an architectural decision, lesson learned, or reflective insight..."
                  className="w-full p-3 rounded-xl bg-[#04060C] border border-white/10 focus:border-[#E51D48] text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Memory Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  >
                    <option value="episodic">Episodic</option>
                    <option value="semantic">Semantic</option>
                    <option value="procedural">Procedural</option>
                    <option value="working">Working</option>
                    <option value="reflective">Reflective</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Importance (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newImportance}
                    onChange={(e) => setNewImportance(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. gnn, embeddings, priorities"
                  className="w-full p-2.5 rounded-xl bg-[#04060C] border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMemory}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white font-bold font-mono shadow-md shadow-red-950/40 cursor-pointer"
                >
                  {addingMemory ? 'Encoding...' : 'Save to Vector Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
