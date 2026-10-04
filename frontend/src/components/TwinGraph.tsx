import React, { useEffect, useRef, useState } from 'react';
import { 
  Network, Search, 
  RefreshCw, Info, X 
} from 'lucide-react';
import type { DigitalTwinGraph, GraphNode } from '../types';
import { api } from '../services/api';

interface TwinGraphProps {
  onRefreshTwin?: () => void;
}

export const TwinGraph: React.FC<TwinGraphProps> = () => {
  const [graphData, setGraphData] = useState<DigitalTwinGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Node simulation physics state
  const simNodesRef = useRef<any[]>([]);

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const data = await api.getTwinGraph();
      setGraphData(data);
      initializePhysics(data.nodes);
    } catch (e) {
      console.error('Failed to fetch graph', e);
    } finally {
      setLoading(false);
    }
  };

  const initializePhysics = (nodes: GraphNode[]) => {
    const width = 800;
    const height = 600;

    simNodesRef.current = nodes.map((n, idx) => {
      // Position center node at the exact center
      if (n.group === 'user') {
        return { ...n, x: width / 2, y: height / 2, vx: 0, vy: 0, radius: 24 };
      }
      const angle = (idx / nodes.length) * 2 * Math.PI;
      const dist = 120 + Math.random() * 140;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: n.group === 'goal' ? 18 : n.group === 'memory' ? 12 : 14,
      };
    });
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const nodes = simNodesRef.current;
      const links = graphData.links;

      // Simple spring simulation step
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.group !== 'user') {
          // Attract towards center
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * 0.0005;
          node.vy += dy * 0.0005;

          // Damping
          node.vx *= 0.92;
          node.vy *= 0.92;
          node.x += node.vx;
          node.y += node.vy;
        }

        // Repel from other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const diffX = other.x - node.x;
          const diffY = other.y - node.y;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
          if (dist < 100) {
            const force = (100 - dist) / dist * 0.02;
            if (node.group !== 'user') {
              node.vx -= diffX * force;
              node.vy -= diffY * force;
            }
            if (other.group !== 'user') {
              other.vx += diffX * force;
              other.vy += diffY * force;
            }
          }
        }
      }

      // Draw Links
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        // Skip if filtered out
        if (filterGroup !== 'all') {
          if (sourceNode.group !== filterGroup && targetNode.group !== filterGroup && sourceNode.group !== 'user') {
            return;
          }
        }

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Relationship text on hover / link center
        if (selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id) && link.label) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(link.label, midX, midY);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isMatch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const isTypeMatch = filterGroup === 'all' || node.group === filterGroup || node.group === 'user';
        const opacity = isMatch && isTypeMatch ? 1 : 0.2;

        let fillColor = '#06b6d4'; // Cyan
        if (node.group === 'user') fillColor = '#a855f7'; // Purple
        else if (node.group === 'goal') fillColor = '#3b82f6'; // Blue
        else if (node.group === 'task') fillColor = '#10b981'; // Emerald
        else if (node.group === 'habit') fillColor = '#f59e0b'; // Amber
        else if (node.group === 'memory') fillColor = '#ec4899'; // Pink
        else if (node.group === 'skill') fillColor = '#6366f1'; // Indigo

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${fillColor}22`;
        ctx.fill();

        // Main circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = node.group === 'user' ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label, node.x, node.y + node.radius + 14);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [graphData, filterGroup, searchQuery, selectedNode]);

  // Handle canvas click to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = simNodesRef.current.find((n) => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    setSelectedNode(clicked || null);
  };

  return (
    <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl h-[calc(100vh-12rem)] flex flex-col animate-fadeIn">
      {/* Top Toolbar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Neural Constellation Graph</h2>
            <p className="text-xs text-slate-400">
              Interactive 2D Knowledge Graph of the Human Digital Twin
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'goal', 'task', 'habit', 'memory', 'skill'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterGroup(type)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filterGroup === type
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={fetchGraph}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh Knowledge Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 bg-slate-950">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
        />

        {/* Detail Inspection Drawer (Floating on right) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-5 backdrop-blur-md animate-fadeIn z-20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                    {selectedNode.group} Node
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedNode.label}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Node ID:</span>
                <span className="font-mono text-slate-300">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Centrality Weight:</span>
                <span className="font-mono text-cyan-300">{selectedNode.value || 1}</span>
              </div>

              {selectedNode.details && (
                <div className="pt-2 border-t border-slate-800/60 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Properties:</span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedNode.details).map(([key, val]) => (
                      <div key={key} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-2">
                        <span className="text-[11px] text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-[11px] text-cyan-300 font-mono text-right max-w-[180px] break-words">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
