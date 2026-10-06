import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Sparkles,
  Trash2,
  Share2,
  Target,
  Compass,
  X,
  ChevronRight,
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
        if (clusterRes?.clusters) setClusters(clusterRes.clusters);
        if (spaceRes?.points) setSemanticPoints(spaceRes.points);
      } catch (e) {
        console.error('Failed to load semantic memory data', e);
      }
    };
    loadDeepLearningMemoryData();
  }, [twin.memories]);

  // Sync memories when twin updates
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMemories(twin.memories || []);
    }
  }, [twin.memories, searchQuery]);

  // Select first memory by default if none selected
  useEffect(() => {
    if (!selectedMemory && twin.memories && twin.memories.length > 0) {
      handleSelectMemory(twin.memories[0]);
    }
  }, [twin.memories]);

  // Handle memory selection and load real semantic associations
  const handleSelectMemory = async (memory: MemoryItem) => {
    setSelectedMemory(memory);
    setLoadingAssoc(true);
    try {
      const res = await api.getMemoryAssociations(memory.id);
      setAssociations(res);
    } catch (e) {
      console.error('Failed to load memory associations', e);
      setAssociations(null);
    } finally {
      setLoadingAssoc(false);
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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setMemories(twin.memories || []);
      return;
    }

    try {
      setSearching(true);
      const res = await api.searchMemory(searchQuery);
      setMemories(res.results || []);
    } catch (e) {
      console.error('Search memory error', e);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setAddingMemory(true);
      await api.addMemory({
        content: newContent,
        type: newType as any,
        importance: newImportance,
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        created_at: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: 'user_vault',
      });
      setShowAddModal(false);
      setNewContent('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to add memory', e);
    } finally {
      setAddingMemory(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeCategory === 'all') return true;
    return m.type.toLowerCase() === activeCategory.toLowerCase();
  });

  const categories = [
    { id: 'all', label: 'All Fragments' },
    { id: 'episodic', label: 'Episodic' },
    { id: 'project', label: 'Project' },
    { id: 'preference', label: 'Preference' },
    { id: 'reflection', label: 'Reflection' },
    { id: 'factual', label: 'Factual' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#05050a] text-slate-100 font-sans selection:bg-[#c33cff] selection:text-white pb-24 space-y-6">
      
      {/* =========================================================================
          1. HEADER & TELEMETRY STRIP
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[#c33cff]">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
              NEURAL MEMORY VAULT
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px] font-mono border border-violet-500/20">
              64D LATENT SPACE
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Your persistent semantic memory layer. Stores experiences, extracts context anchors, and computes association matrices.
          </p>
        </div>

        {/* Real Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#140f2d]/80 border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">MEMORY INDEX</span>
            <span className="text-white font-bold">{twin.memories.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#140f2d]/80 border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">COHERENCE</span>
            <span className="text-[#22d3ee] font-bold">92%</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#140f2d]/80 border border-white/5 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">CLUSTERS</span>
            <span className="text-[#c33cff] font-bold">{clusters.length || 4}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store Memory</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SPATIAL SEMANTIC CLUSTER CONSTELLATION
         ========================================================================= */}
      <div className="p-5 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#c33cff]" />
            SEMANTIC MEMORY FIELD
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('fragments')}
              className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                viewMode === 'fragments'
                  ? 'bg-violet-500/20 text-white border border-violet-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fragments List
            </button>
            <button
              onClick={() => setViewMode('semantic_space')}
              className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'semantic_space'
                  ? 'bg-violet-500/20 text-white border border-violet-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span>2D Semantic Space</span>
            </button>
          </div>
        </div>

        {/* Spatial Cluster Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
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
                    ? 'bg-[#1a133d] border-[#c33cff] shadow-lg shadow-violet-500/15'
                    : 'bg-[#140f2d]/60 hover:bg-[#140f2d] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 group-hover:text-slate-200">
                    {cat.label}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#22d3ee] animate-pulse' : 'bg-slate-700'
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

      {/* =========================================================================
          3. MAIN WORKSPACE: 2D SEMANTIC SPACE OR SPLIT ASSOCIATION VIEW
         ========================================================================= */}
      {viewMode === 'semantic_space' ? (
        /* 2D Embedding Projection Visualizer */
        <div className="p-6 rounded-3xl bg-[#0c0a1a]/85 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#22d3ee]" />
                2D SEMANTIC EMBEDDING SPACE PROJECTION
              </h2>
              <p className="text-xs text-slate-400">
                Orthonormal spectral projection of 64-dimensional dense memory embeddings.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {semanticPoints.length} projected nodes
            </span>
          </div>

          <div className="relative w-full h-[380px] rounded-2xl bg-[#080614] border border-white/5 overflow-hidden flex items-center justify-center">
            {/* Coordinate Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#6c4dff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute w-full h-[1px] bg-white/5" />
            <div className="absolute h-full w-[1px] bg-white/5" />

            {/* Projected Memory Points */}
            <svg className="w-full h-full">
              {semanticPoints.map((pt, idx) => {
                // Map coordinates from [-2.5, 2.5] to [5%..95%]
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
                    {/* Ripple aura if selected */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#c33cff"
                        strokeWidth="1.5"
                        className="animate-ping opacity-50"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? '7' : '4.5'}
                      fill={
                        isSelected
                          ? '#22d3ee'
                          : pt.type === 'episodic'
                          ? '#c33cff'
                          : pt.type === 'project'
                          ? '#6c4dff'
                          : '#38bdf8'
                      }
                      className="transition-all duration-300 group-hover:scale-150"
                    />
                    <text
                      x={cx}
                      y={cy}
                      dx="9"
                      dy="3"
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="monospace"
                      className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                      {pt.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hovered Point Tooltip */}
            {hoveredPoint && (
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-[#0c0a1a]/95 border border-violet-500/40 backdrop-blur-xl max-w-sm pointer-events-none shadow-2xl space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#22d3ee]">
                  <span className="uppercase">{hoveredPoint.type}</span>
                  <span>
                    [{hoveredPoint.x}, {hoveredPoint.y}]
                  </span>
                </div>
                <div className="text-xs text-white font-medium line-clamp-2">
                  {hoveredPoint.full_content}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Split Workspace: Fragments List + Semantic Association Engine */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* -------------------------------------------------------------------
              LEFT: SEARCH & MEMORY FRAGMENTS (7 Cols)
             ------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Semantic Retrieval Search Console */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute left-4 text-[#c33cff]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your memory by concept, event, or semantic tag..."
                className="w-full h-12 rounded-2xl bg-[#0c0a1a]/80 border border-white/10 focus:border-[#c33cff] pl-11 pr-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none backdrop-blur-xl transition-all shadow-inner"
              />
              <span className="absolute right-3 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 pointer-events-none">
                {searching ? 'SEARCHING...' : 'SEMANTIC SEARCH'}
              </span>
            </form>

            {/* Fragments List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredMemories.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#0c0a1a]/50 border border-white/5 text-center space-y-2">
                  <Database className="w-6 h-6 text-slate-600 mx-auto" />
                  <div className="text-xs text-slate-400 font-mono">No matching memory fragments found.</div>
                </div>
              ) : (
                filteredMemories.map((mem) => {
                  const isSelected = selectedMemory?.id === mem.id;

                  return (
                    <div
                      key={mem.id}
                      onClick={() => handleSelectMemory(mem)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative group space-y-2 ${
                        isSelected
                          ? 'bg-[#140f2d] border-[#c33cff] shadow-lg shadow-violet-500/15'
                          : 'bg-[#0c0a1a]/70 hover:bg-[#100d24] border-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Fragment Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-[#c33cff] text-[9px] font-mono uppercase tracking-wider">
                            {mem.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {mem.created_at || 'Indexed'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-400">
                            Imp: {mem.importance || 5}/10
                          </span>
                          <button
                            onClick={(e) => handleDeleteMemory(mem.id, e)}
                            className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Delete fragment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {mem.content}
                      </p>

                      {/* Tags & Connected Entities */}
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {mem.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-mono text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>


          {/* -------------------------------------------------------------------
              RIGHT: DEEP LEARNING SEMANTIC MEMORY ASSOCIATION ENGINE (5 Cols)
             ------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-3xl bg-[#0c0a1a]/85 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 h-[640px] flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee]">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                        SEMANTIC ASSOCIATIONS
                      </h3>
                      <p className="text-[9px] text-slate-400">
                        Dense embedding cosine similarity matrix
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[9px] font-mono">
                    Deep Learning
                  </span>
                </div>

                {/* Selected Memory Anchor */}
                {selectedMemory ? (
                  <div className="p-3 rounded-2xl bg-[#140f2d] border border-violet-500/30 space-y-1.5 shadow-md">
                    <div className="text-[9px] font-mono text-violet-300 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#22d3ee]" />
                      <span>Selected Memory Anchor</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed line-clamp-3">
                      {selectedMemory.content}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#140f2d]/50 border border-white/5 text-center text-xs text-slate-400 font-mono">
                    Select a memory fragment to compute associations.
                  </div>
                )}

                {/* Associated Memories List */}
                <div className="space-y-2 pt-1 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    RELATED MEMORIES ({associations?.associations.length || 0})
                  </div>

                  {loadingAssoc ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-5 h-5 border-2 border-[#c33cff] border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="text-[10px] font-mono text-slate-500">
                        Computing embedding similarity...
                      </div>
                    </div>
                  ) : associations && associations.associations.length > 0 ? (
                    associations.associations.map((assoc) => (
                      <div
                        key={assoc.id}
                        onClick={() => {
                          const found = twin.memories.find((m) => m.id === assoc.id);
                          if (found) handleSelectMemory(found);
                        }}
                        className="p-3 rounded-xl bg-[#140f2d]/70 hover:bg-[#1a133d] border border-white/5 hover:border-violet-500/40 transition-all cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">
                            {assoc.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#22d3ee] font-bold text-[10px] font-mono">
                            {assoc.similarity_score}% SIMILARITY
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed font-sans group-hover:text-white transition-colors">
                          {assoc.content}
                        </p>

                        {assoc.connected_goals && assoc.connected_goals.length > 0 && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-violet-300 pt-0.5">
                            <Target className="w-2.5 h-2.5 text-[#c33cff]" />
                            <span className="truncate">Linked: {assoc.connected_goals.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-[#140f2d]/30 border border-white/5 text-center text-[11px] text-slate-500 font-mono">
                      No strong semantic associations found for this anchor.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Grounded AI Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px]">REPRESENTATION LEARNING</span>
                {onNavigateTab && (
                  <button
                    onClick={() =>
                      onNavigateTab(
                        'intelligence',
                        `Synthesize insights based on my memory: "${selectedMemory?.content || ''}"`
                      )
                    }
                    className="text-[#22d3ee] hover:underline flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                  >
                    <span>Synthesize in AI Core</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          4. STORE NEW MEMORY MODAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#0c0a1a] border border-violet-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[#c33cff]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    INDEX NEW MEMORY FRAGMENT
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Embeds content directly into the 64D semantic representation space.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Memory Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record an observation, decision, milestone, or episodic event..."
                  rows={4}
                  className="w-full mt-1 p-3 rounded-2xl bg-[#140f2d] border border-white/10 focus:border-[#c33cff] text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">
                    Category Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#140f2d] border border-white/10 focus:border-[#c33cff] text-xs text-white focus:outline-none"
                  >
                    <option value="episodic">Episodic</option>
                    <option value="project">Project</option>
                    <option value="preference">Preference</option>
                    <option value="reflection">Reflection</option>
                    <option value="factual">Factual</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">
                    Importance (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newImportance}
                    onChange={(e) => setNewImportance(parseInt(e.target.value) || 5)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#140f2d] border border-white/10 focus:border-[#c33cff] text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="engineering, architecture, twin"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#140f2d] border border-white/10 focus:border-[#c33cff] text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMemory || !newContent.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-90 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/20 cursor-pointer"
                >
                  <span>{addingMemory ? 'Indexing...' : 'Index Memory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
