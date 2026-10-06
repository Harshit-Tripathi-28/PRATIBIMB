import React, { useState, useEffect } from 'react';
import { 
  Share2, RefreshCw, Search, 
  ZoomIn, ZoomOut, Maximize2, Filter, Code2
} from 'lucide-react';
import type { 
  WorldGraphSnapshot, WorldEntity, 
  WorldQueryResult, PropagationScenarioResponse, GNNReadyGraphTensors 
} from '../types';
import { api } from '../services/api';

interface LifeGraphViewProps {
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
}

export const LifeGraphView: React.FC<LifeGraphViewProps> = ({ onNavigateTab }) => {
  const [worldSnapshot, setWorldSnapshot] = useState<WorldGraphSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<WorldEntity | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-hop query state
  const [queryResult, setQueryResult] = useState<WorldQueryResult | null>(null);
  const [_queryLoading, setQueryLoading] = useState<boolean>(false);

  // Propagation Simulation State
  const [propagationResult, setPropagationResult] = useState<PropagationScenarioResponse | null>(null);
  const [simulatingPropagation, setSimulatingPropagation] = useState<boolean>(false);

  // GNN Tensors Modal State
  const [showGNNModal, setShowGNNModal] = useState<boolean>(false);
  const [gnnTensors, setGnnTensors] = useState<GNNReadyGraphTensors | null>(null);

  // Canvas Viewport Controls (Zoom/Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchWorldModel = async () => {
    try {
      setLoading(true);
      const data = await api.getWorldModel();
      setWorldSnapshot(data);
      if (data.entities.length > 0 && !selectedEntity) {
        const root = data.entities.find((e) => e.type === 'USER') || data.entities[0];
        setSelectedEntity(root);
      }
    } catch (e) {
      console.error('Failed to load personal world model', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldModel();
  }, []);

  // Run contextual multi-hop query when selected entity changes
  useEffect(() => {
    if (selectedEntity) {
      runEntityQuery(selectedEntity.id);
      setPropagationResult(null);
    }
  }, [selectedEntity?.id]);

  const runEntityQuery = async (entityId: string, queryType: any = 'entity_dependencies') => {
    try {
      setQueryLoading(true);
      const res = await api.queryWorldModel({
        target_entity_id: entityId,
        query_type: queryType,
        max_depth: 2,
      });
      setQueryResult(res);
    } catch (e) {
      console.error('Failed to execute world model query', e);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSimulatePropagation = async (action: 'pause' | 'accelerate' | 'delay') => {
    if (!selectedEntity) return;
    try {
      setSimulatingPropagation(true);
      const res = await api.simulateWorldPropagation({
        entity_id: selectedEntity.id,
        scenario_action: action,
        duration_weeks: 4,
      });
      setPropagationResult(res);
    } catch (e) {
      console.error('Failed to simulate propagation', e);
    } finally {
      setSimulatingPropagation(false);
    }
  };

  const handleOpenGNNTensors = async () => {
    try {
      const data = await api.getWorldGNNTensors();
      setGnnTensors(data);
      setShowGNNModal(true);
    } catch (e) {
      console.error('Failed to fetch GNN tensors', e);
    }
  };

  // Canvas Drag & Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const getEntityBadgeStyle = (type: string) => {
    switch (type) {
      case 'USER':
        return 'bg-[#c33cff]/20 text-[#c33cff] border-[#c33cff]/40 shadow-violet-500/20';
      case 'GOAL':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';
      case 'MILESTONE':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      case 'PROJECT':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'TASK':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'MEMORY':
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
      case 'HABIT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SKILL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  const filteredEntities = worldSnapshot?.entities.filter((entity) => {
    const matchesFilter = filterType === 'ALL' || entity.type === filterType;
    const matchesSearch = entity.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entity.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const entityMap = new Map<string, WorldEntity>();
  worldSnapshot?.entities.forEach((e) => entityMap.set(e.id, e));

  const connectedRelations = worldSnapshot?.relationships.filter(
    (r) => r.source_id === selectedEntity?.id || r.target_id === selectedEntity?.id
  ) || [];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-20 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c4dff] to-[#22d3ee] flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Personal World Model</h1>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                GNN GRAPH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multidimensional topological graph of typed entities, causal dependencies, and scenario propagation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchWorldModel}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-2xl bg-[#140f2d] border border-white/10 hover:border-violet-500/30 text-slate-300 hover:text-white font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c33cff]' : ''}`} />
            <span>Sync Graph</span>
          </button>

          <button
            onClick={handleOpenGNNTensors}
            className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-95 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GNN Tensors</span>
          </button>
        </div>
      </div>

      {/* Multi-Hop Query & Filter Controls */}
      <div className="p-4 rounded-3xl bg-[#0c0a1a]/70 border border-white/10 space-y-3 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities, goals, memories, skills, or tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#140f2d] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c33cff] font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Query:</span>
            {[
              { id: 'affects_goal', label: 'Goal Dependencies' },
              { id: 'blocking_tasks', label: 'Blockers & Constraints' },
              { id: 'related_memories', label: 'Memory Anchors' },
              { id: 'skills_developed', label: 'Competencies' }
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  if (selectedEntity) runEntityQuery(selectedEntity.id, q.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/40 text-slate-300 hover:text-white text-[11px] cursor-pointer transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#c33cff]" /> Filter:
          </span>
          {['ALL', 'GOAL', 'TASK', 'MILESTONE', 'SKILL', 'MEMORY', 'HABIT', 'AGENT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'bg-[#140f2d]/40 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {t} {worldSnapshot?.entity_counts_by_type[t] ? `(${worldSnapshot.entity_counts_by_type[t]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Workspace & Deep Entity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Spatial Graph Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#080614] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden min-h-[520px] flex flex-col justify-between">
          
          {/* Top Canvas Controls Bar */}
          <div className="flex items-center justify-between z-10 select-none">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
                <span>{worldSnapshot?.entities.length || 0} Entities</span>
              </span>
              <span>•</span>
              <span>{worldSnapshot?.relationships.length || 0} Relationships</span>
              <span>•</span>
              <span className="text-violet-300">Density: {worldSnapshot?.graph_density || 0}</span>
            </div>

            {/* Zoom / Pan Controls */}
            <div className="flex items-center gap-1 bg-[#0c0a1a]/90 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Spatial Graph */}
          <div
            className="w-full h-[420px] relative overflow-hidden cursor-grab active:cursor-grabbing my-3"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              className="w-full h-full"
              viewBox="-300 -200 600 400"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <defs>
                <pattern id="worldGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="-600" y="-400" width="1200" height="800" fill="url(#worldGrid)" />

              {/* Relationship Lines */}
              {worldSnapshot?.relationships.map((rel) => {
                const src = entityMap.get(rel.source_id);
                const dst = entityMap.get(rel.target_id);
                if (!src || !dst) return null;

                const x1 = (src.position_3d?.x || 0) * 80;
                const y1 = (src.position_3d?.y || 0) * 80;
                const x2 = (dst.position_3d?.x || 0) * 80;
                const y2 = (dst.position_3d?.y || 0) * 80;

                const isSelected = selectedEntity && (selectedEntity.id === src.id || selectedEntity.id === dst.id);

                return (
                  <g key={rel.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        isSelected
                          ? rel.relation_type === 'BLOCKS'
                            ? '#f43f5e'
                            : '#c33cff'
                          : rel.relation_type === 'BLOCKS'
                          ? '#f43f5e88'
                          : 'rgba(108, 77, 255, 0.25)'
                      }
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={rel.relation_type === 'SIMILAR_TO' ? '3,3' : undefined}
                    />
                  </g>
                );
              })}

              {/* Entity Nodes */}
              {filteredEntities.map((ent) => {
                const x = (ent.position_3d?.x || 0) * 80;
                const y = (ent.position_3d?.y || 0) * 80;
                const isSelected = selectedEntity?.id === ent.id;

                let nodeFill = '#140f2d';
                let strokeColor = '#8b5cf6';
                if (ent.type === 'USER') { nodeFill = '#2e1065'; strokeColor = '#c33cff'; }
                else if (ent.type === 'GOAL') { nodeFill = '#083344'; strokeColor = '#22d3ee'; }
                else if (ent.type === 'TASK') { nodeFill = '#3b0764'; strokeColor = '#a855f7'; }
                else if (ent.type === 'MEMORY') { nodeFill = '#4a044e'; strokeColor = '#e879f9'; }
                else if (ent.type === 'HABIT') { nodeFill = '#451a03'; strokeColor = '#f59e0b'; }
                else if (ent.type === 'SKILL') { nodeFill = '#022c22'; strokeColor = '#10b981'; }

                return (
                  <g
                    key={ent.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity(ent);
                    }}
                    className="cursor-pointer group"
                  >
                    {isSelected && (
                      <circle r="22" fill="none" stroke={strokeColor} strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                    )}

                    <circle
                      r={ent.type === 'USER' ? 18 : 12}
                      fill={nodeFill}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-transform group-hover:scale-125"
                    />

                    {ent.progress !== undefined && ent.progress > 0 && (
                      <circle
                        r="15"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2"
                        strokeDasharray={`${(ent.progress / 100) * 94} 94`}
                        transform="rotate(-90)"
                      />
                    )}

                    <text
                      y={ent.type === 'USER' ? 28 : 22}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-300 group-hover:fill-white font-medium select-none pointer-events-none"
                    >
                      {ent.label.length > 14 ? `${ent.label.substring(0, 12)}...` : ent.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Entity Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedEntity ? (
            <div className="p-6 rounded-3xl bg-[#0c0a1a]/80 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${getEntityBadgeStyle(selectedEntity.type)}`}>
                    {selectedEntity.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{selectedEntity.label}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">{selectedEntity.metadata?.description || selectedEntity.category || ''}</p>
                </div>
                {selectedEntity.importance && (
                  <span className="text-xs font-mono font-bold text-violet-300 bg-[#140f2d] px-2.5 py-1 rounded-xl border border-white/10">
                    IMP: {selectedEntity.importance}/10
                  </span>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Connected Topology ({connectedRelations.length})</span>
                  <span className="text-violet-400">2-Hop Active</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                  {connectedRelations.map((rel) => {
                    const isSource = rel.source_id === selectedEntity.id;
                    const otherNode = entityMap.get(isSource ? rel.target_id : rel.source_id);
                    return (
                      <div key={rel.id} className="p-2 rounded-xl bg-[#140f2d]/60 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{otherNode?.label || 'Node'}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#22d3ee]">
                          {rel.relation_type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scenario Propagation Simulation */}
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Scenario Propagation
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulatePropagation('accelerate')}
                    disabled={simulatingPropagation}
                    className="py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    Accelerate
                  </button>
                  <button
                    onClick={() => handleSimulatePropagation('pause')}
                    disabled={simulatingPropagation}
                    className="py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleSimulatePropagation('delay')}
                    disabled={simulatingPropagation}
                    className="py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    Delay
                  </button>
                </div>

                {queryResult?.structured_synthesis && (
                  <div className="p-3.5 rounded-2xl bg-[#080614] border border-white/5 space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                      GNN Causal Synthesis
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {queryResult.structured_synthesis}
                    </p>
                  </div>
                )}

                {propagationResult && (
                  <div className="p-3.5 rounded-2xl bg-[#140f2d] border border-violet-500/30 space-y-2 text-xs animate-fadeIn">
                    <div className="font-bold text-violet-300 font-mono text-[11px]">
                      Propagation Impact: {propagationResult.scenario_action.toUpperCase()}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {propagationResult.risk_assessment}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onNavigateTab('intelligence', `Analyze the causal dependencies and impact of entity: ${selectedEntity.label}`)}
                  className="w-full mt-2 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Consult AI Core on this Entity</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-[#0c0a1a]/50 border border-white/5 text-center text-slate-500 text-xs">
              Select an entity node from the spatial graph to inspect causal dependencies.
            </div>
          )}
        </div>

      </div>

      {/* GNN Tensors Modal */}
      {showGNNModal && gnnTensors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c0a1a] border border-violet-500/30 p-6 shadow-2xl space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#c33cff]" />
                <h3 className="text-sm font-bold text-white font-mono">GNN-READY GRAPH TENSORS</h3>
              </div>
              <button onClick={() => setShowGNNModal(false)} className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer">
                Close [ESC]
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5">
                  <div className="text-slate-400 text-[10px]">NUM NODES</div>
                  <div className="text-white font-bold text-base mt-0.5">{gnnTensors.num_nodes}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5">
                  <div className="text-slate-400 text-[10px]">NUM EDGES</div>
                  <div className="text-white font-bold text-base mt-0.5">{gnnTensors.num_edges}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#140f2d] border border-white/5">
                  <div className="text-slate-400 text-[10px]">FEATURE DIM</div>
                  <div className="text-[#22d3ee] font-bold text-base mt-0.5">{gnnTensors.feature_dimension}D</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#080614] border border-white/5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(gnnTensors.node_features.slice(0, 3), null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
