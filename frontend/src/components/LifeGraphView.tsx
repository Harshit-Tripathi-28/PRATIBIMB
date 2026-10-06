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
        return 'bg-[#8B0F24]/30 text-[#FF365C] border-[#E51D48]/50';
      case 'GOAL':
        return 'bg-[#E51D48]/20 text-[#FF365C] border-[#E51D48]/40';
      case 'MILESTONE':
        return 'bg-[#FF365C]/15 text-[#FF365C] border-[#FF365C]/30';
      case 'PROJECT':
        return 'bg-[#1E7BFF]/20 text-[#48D7FF] border-[#1E7BFF]/40';
      case 'TASK':
        return 'bg-[#123B73]/40 text-[#48D7FF] border-[#1E7BFF]/30';
      case 'MEMORY':
        return 'bg-[#8B0F24]/20 text-rose-300 border-rose-500/30';
      case 'HABIT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SKILL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AGENT':
        return 'bg-[#1E7BFF]/20 text-[#1E7BFF] border-[#1E7BFF]/40';
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
    <div className="space-y-6 animate-fadeIn text-[#F4F7FF] max-w-7xl mx-auto pb-20 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070A12]/90 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Personal World Cosmos</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#1E7BFF]/15 border border-[#1E7BFF]/30 text-[#48D7FF] font-mono text-[10px] font-bold">
                GNN GRAPH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Topological knowledge graph of typed entities, causal dependencies, and scenario propagation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchWorldModel}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-2xl bg-[#04060C] border border-white/10 hover:border-[#E51D48]/30 text-slate-300 hover:text-white font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF365C]' : ''}`} />
            <span>Sync Graph</span>
          </button>

          <button
            onClick={handleOpenGNNTensors}
            className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GNN Tensors</span>
          </button>
        </div>
      </div>

      {/* Multi-Hop Query & Filter Controls */}
      <div className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 space-y-3 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities, goals, memories, skills, or tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#04060C] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E51D48] font-sans"
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
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#E51D48]/30 text-slate-300 hover:text-white text-[11px] cursor-pointer transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Type Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {['ALL', 'USER', 'GOAL', 'PROJECT', 'TASK', 'MEMORY', 'HABIT', 'SKILL', 'AGENT'].map((type) => {
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#E51D48]/20 border border-[#E51D48]/50 text-white font-bold shadow-md shadow-red-950/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Graph Viewport + Entity Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Spatial 2D Graph Canvas (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#070A12]/90 border border-white/10 p-4 shadow-2xl relative flex flex-col h-[520px] overflow-hidden backdrop-blur-2xl">
          
          {/* Viewport Zoom & Pan Floating Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#04060C]/90 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Graph Status Pill */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#04060C]/90 border border-white/10 text-xs font-mono backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-[#FF365C] animate-pulse" />
            <span className="text-slate-300">
              {filteredEntities.length} Entities • {worldSnapshot?.relationships.length || 0} Relations
            </span>
          </div>

          {/* Interactive Graph SVG Canvas */}
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Background Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#E51D4810_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <svg
              className="w-full h-full"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Relationship Links (Filaments) */}
              {worldSnapshot?.relationships.map((rel) => {
                const src = entityMap.get(rel.source_id);
                const tgt = entityMap.get(rel.target_id);
                if (!src || !tgt) return null;

                const isConnected = selectedEntity && (selectedEntity.id === src.id || selectedEntity.id === tgt.id);
                const x1 = src.position_3d ? 320 + src.position_3d.x * 65 : 200;
                const y1 = src.position_3d ? 240 + src.position_3d.y * 65 : 200;
                const x2 = tgt.position_3d ? 320 + tgt.position_3d.x * 65 : 400;
                const y2 = tgt.position_3d ? 240 + tgt.position_3d.y * 65 : 200;

                return (
                  <g key={rel.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isConnected ? '#FF365C' : '#1E7BFF'}
                      strokeWidth={isConnected ? 2 : 1}
                      strokeOpacity={isConnected ? 0.85 : 0.25}
                      strokeDasharray={rel.epistemic_status === 'POTENTIAL_IMPACT' ? '4 3' : undefined}
                    />
                  </g>
                );
              })}

              {/* Entity Nodes */}
              {filteredEntities.map((entity) => {
                const isSelected = selectedEntity?.id === entity.id;
                const cx = entity.position_3d ? 320 + entity.position_3d.x * 65 : 320;
                const cy = entity.position_3d ? 240 + entity.position_3d.y * 65 : 240;

                let nodeColor = '#1E7BFF';
                if (entity.type === 'USER' || entity.type === 'GOAL') nodeColor = '#FF365C';
                else if (entity.type === 'PROJECT') nodeColor = '#48D7FF';
                else if (entity.type === 'SKILL') nodeColor = '#10B981';
                else if (entity.type === 'HABIT') nodeColor = '#F59E0B';

                return (
                  <g
                    key={entity.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity(entity);
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="18"
                        fill="none"
                        stroke="#FF365C"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={entity.type === 'USER' ? 12 : 8}
                      fill={nodeColor}
                      stroke="#070A12"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Node Label */}
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="10"
                      fontFamily="monospace"
                      className="pointer-events-none"
                    >
                      {entity.label.length > 14 ? entity.label.slice(0, 12) + '..' : entity.label}
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
            <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
              
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
                  <span className="text-xs font-mono font-bold text-[#FF365C] bg-[#04060C] px-2.5 py-1 rounded-xl border border-white/10">
                    IMP: {selectedEntity.importance}/10
                  </span>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Connected Topology ({connectedRelations.length})</span>
                  <span className="text-[#FF365C]">2-Hop Active</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                  {connectedRelations.map((rel) => {
                    const isSource = rel.source_id === selectedEntity.id;
                    const otherNode = entityMap.get(isSource ? rel.target_id : rel.source_id);
                    return (
                      <div key={rel.id} className="p-2 rounded-xl bg-[#04060C] border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{otherNode?.label || 'Node'}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#48D7FF]">
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
                  <div className="p-3.5 rounded-2xl bg-[#04060C] border border-white/5 space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono text-[#48D7FF] uppercase tracking-wider font-semibold">
                      GNN Causal Synthesis
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {queryResult.structured_synthesis}
                    </p>
                  </div>
                )}

                {propagationResult && (
                  <div className="p-3.5 rounded-2xl bg-[#04060C] border border-[#E51D48]/30 space-y-2 text-xs animate-fadeIn">
                    <div className="font-bold text-[#FF365C] font-mono text-[11px]">
                      Propagation Impact: {propagationResult.scenario_action.toUpperCase()}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {propagationResult.risk_assessment}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onNavigateTab('intelligence', `Analyze the causal dependencies and impact of entity: ${selectedEntity.label}`)}
                  className="w-full mt-2 py-2 rounded-xl bg-[#E51D48]/15 hover:bg-[#E51D48]/25 border border-[#E51D48]/30 text-[#FF365C] text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Consult AI Core on this Entity</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-[#070A12]/50 border border-white/5 text-center text-slate-500 text-xs">
              Select an entity node from the spatial graph to inspect causal dependencies.
            </div>
          )}
        </div>

      </div>

      {/* GNN Tensors Modal */}
      {showGNNModal && gnnTensors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#070A12] border border-[#E51D48]/30 p-6 shadow-2xl space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#FF365C]" />
                <h3 className="text-sm font-bold text-white font-mono">GNN-READY GRAPH TENSORS</h3>
              </div>
              <button onClick={() => setShowGNNModal(false)} className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer">
                Close [ESC]
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                  <div className="text-slate-400 text-[10px]">NUM NODES</div>
                  <div className="text-white font-bold text-base mt-0.5">{gnnTensors.num_nodes}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                  <div className="text-slate-400 text-[10px]">NUM EDGES</div>
                  <div className="text-white font-bold text-base mt-0.5">{gnnTensors.num_edges}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                  <div className="text-slate-400 text-[10px]">FEATURE DIM</div>
                  <div className="text-[#48D7FF] font-bold text-base mt-0.5">{gnnTensors.feature_dimension}D</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(gnnTensors.node_features.slice(0, 3), null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
