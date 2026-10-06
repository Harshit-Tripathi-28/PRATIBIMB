import React, { useEffect, useRef, useState } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import type { DigitalTwin, DigitalTwinGraph, GraphNode } from '../types';
import { api } from '../services/api';

interface TwinGraphProps {
  twin?: DigitalTwin;
  onRefreshTwin?: () => void;
  onNavigateTab?: (tab: string, initialPrompt?: string) => void;
}

export const TwinGraph: React.FC<TwinGraphProps> = ({ twin: _twin, onRefreshTwin: _onRefreshTwin, onNavigateTab: _onNavigateTab }) => {
  const [graphData, setGraphData] = useState<DigitalTwinGraph | null>(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const height = 480;

    simNodesRef.current = nodes.map((n, idx) => {
      if (n.group === 'user') {
        return { ...n, x: width / 2, y: height / 2, vx: 0, vy: 0, radius: 24 };
      }
      const angle = (idx / (nodes.length || 1)) * 2 * Math.PI;
      const dist = 125 + (idx % 3) * 30;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: n.group === 'goal' ? 16 : n.group === 'memory' ? 11 : 13,
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(139, 92, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 45;
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

      // Draw Edges
      graphData.links.forEach((l) => {
        const src = simNodesRef.current.find((n) => n.id === l.source);
        const dst = simNodesRef.current.find((n) => n.id === l.target);
        if (src && dst) {
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
          ctx.strokeStyle = 'rgba(108, 77, 255, 0.22)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw Nodes
      simNodesRef.current.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius || 12, 0, Math.PI * 2);
        if (n.group === 'user') {
          ctx.fillStyle = '#c33cff';
        } else if (n.group === 'goal') {
          ctx.fillStyle = '#22d3ee';
        } else if (n.group === 'memory') {
          ctx.fillStyle = '#8b5cf6';
        } else {
          ctx.fillStyle = '#6c4dff';
        }
        ctx.fill();

        // Node outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label || '', n.x, n.y + (n.radius || 12) + 12);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData]);

  return (
    <div className="space-y-4 animate-fadeIn font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#22d3ee] flex items-center justify-center text-slate-950 shadow-lg shadow-violet-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Identity Graph Network</h2>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                TOPOLOGY ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Topological visualization of the interconnected identity graph.
            </p>
          </div>
        </div>

        <button
          onClick={fetchGraph}
          disabled={loading}
          className="px-3.5 py-2.5 rounded-2xl bg-[#140f2d] border border-white/10 hover:border-violet-500/30 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c33cff]' : ''}`} />
          <span>Sync Topology</span>
        </button>
      </div>

      <div className="relative w-full h-[460px] rounded-3xl bg-[#080614] border border-white/10 overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};
