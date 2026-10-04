import React, { useEffect, useRef, useState } from 'react';
import { 
  Network, Search, RefreshCw, Info, X, 
  User, Sparkles
} from 'lucide-react';
import type { DigitalTwin, DigitalTwinGraph, GraphNode } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface TwinGraphProps {
  twin?: DigitalTwin;
  onRefreshTwin?: () => void;
  onNavigateTab?: (tab: string, initialPrompt?: string) => void;
}

export const TwinGraph: React.FC<TwinGraphProps> = ({ twin, onRefreshTwin, onNavigateTab }) => {
  const [graphData, setGraphData] = useState<DigitalTwinGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
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
    const height = 500;

    simNodesRef.current = nodes.map((n, idx) => {
      if (n.group === 'user') {
        return { ...n, x: width / 2, y: height / 2, vx: 0, vy: 0, radius: 26 };
      }
      const angle = (idx / (nodes.length || 1)) * 2 * Math.PI;
      const dist = 130 + (idx % 3) * 35;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: n.group === 'goal' ? 18 : n.group === 'memory' ? 12 : 14,
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
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

      // Spring physics step
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.group !== 'user') {
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * 0.0004;
          node.vy += dy * 0.0004;

          node.vx *= 0.94;
          node.vy *= 0.94;
          node.x += node.vx;
          node.y += node.vy;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const diffX = other.x - node.x;
          const diffY = other.y - node.y;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
          if (dist < 110) {
            const force = ((110 - dist) / dist) * 0.02;
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

        if (filterGroup !== 'all') {
          if (sourceNode.group !== filterGroup && targetNode.group !== filterGroup && sourceNode.group !== 'user') {
            return;
          }
        }

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id) && link.label) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.fillText(link.label, midX, midY);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isMatch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const isTypeMatch = filterGroup === 'all' || node.group === filterGroup || node.group === 'user';
        const opacity = isMatch && isTypeMatch ? 1 : 0.2;

        let fillColor = '#06b6d4';
        if (node.group === 'user') fillColor = '#a855f7';
        else if (node.group === 'goal') fillColor = '#38bdf8';
        else if (node.group === 'task') fillColor = '#10b981';
        else if (node.group === 'habit') fillColor = '#f59e0b';
        else if (node.group === 'memory') fillColor = '#ec4899';
        else if (node.group === 'skill') fillColor = '#6366f1';

        // Halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = `${fillColor}25`;
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.lineWidth = selectedNode?.id === node.id ? 2.5 : 1.2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.fillStyle = '#f1f5f9';
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = simNodesRef.current.find((n) => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    setSelectedNode(clicked || null);
  };

  const profile = twin?.profile || {
    name: 'Explorer',
    title: 'Digital Twin Pioneer',
    bio: 'Calibrating digital intelligence model.',
    skills: [],
    interests: [],
    preferred_work_style: 'Flexible Blocks',
    avatar_config: {},
  };
  const state = twin?.state || { energy_level: 80, current_focus: 'Core System Initialization' };

  return (
    <div className="space-y-10 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-16">
      {/* 1. Top Narrative Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <User className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Your Digital Twin</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Who PRATIBIMB understands you to be — your identity, mental patterns, and living relationships.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('chat', 'What is your current understanding of my profile and goals?')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Ask Twin What It Knows</span>
          </button>
        )}
      </div>

      {/* 2. Identity Model & 3D Centerpiece */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left (5 Cols): 3D Avatar Centerpiece & Core Bio */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 p-8 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-xl">
          <div className="w-full h-72 sm:h-80 flex items-center justify-center">
            <CanonicalAvatar
              config={profile.avatar_config || {}}
              size="hero"
              mode="3d"
              showAura={true}
              showNodes={false}
            />
          </div>

          <div className="w-full text-center space-y-2 mt-4 pt-4 border-t border-slate-800/80">
            <h2 className="text-xl font-bold text-white tracking-wide">{profile.name}</h2>
            <p className="text-xs font-medium text-cyan-300">{profile.title}</p>
            {profile.bio && (
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Right (7 Cols): Understanding Matrix (Rhythm, Skills, Interests, State) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Cognitive Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-medium">Work Rhythm</span>
                <p className="text-slate-200 font-semibold">{profile.preferred_work_style || 'Sprint Blocks'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-medium">Current Focus</span>
                <p className="text-cyan-300 font-semibold">{state.current_focus || 'System Initialization'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-medium">Self-Reported Energy</span>
                <p className="text-amber-300 font-semibold">{state.energy_level}% capacity</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-medium">Status</span>
                <p className="text-emerald-400 font-semibold">Active Reflection</p>
              </div>
            </div>

            {/* Skills & Competencies */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Core Skills & Tools</span>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-medium border border-slate-700">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills specified yet</span>
                )}
              </div>
            </div>

            {/* Interests & Domains */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Focus Domains & Interests</span>
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-cyan-950/30 text-cyan-300 text-xs font-medium border border-cyan-500/20">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No interests listed yet</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Your Twin continuously adapts as you interact with PRATIBIMB.</span>
            {onRefreshTwin && (
              <button
                onClick={onRefreshTwin}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Neural Constellation Graph */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
        {/* Graph Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Living Knowledge Graph</h2>
              <p className="text-xs text-slate-400">
                Visualizing active connections between you, your goals, habits, and memories
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'goal', 'task', 'habit', 'memory', 'skill'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterGroup(type)}
                className={`px-3 py-1 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  filterGroup === type
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={fetchGraph}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative h-96 sm:h-[460px] bg-slate-950">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />

          {/* Node Drawer */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-80 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl p-5 backdrop-blur-md animate-fadeIn z-20">
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
                  <span className="text-slate-500">Category:</span>
                  <span className="capitalize text-slate-300">{selectedNode.group}</span>
                </div>
                {selectedNode.details && Object.entries(selectedNode.details).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-2">
                    <span className="text-[11px] text-slate-400 capitalize">{k.replace('_', ' ')}:</span>
                    <span className="text-[11px] text-cyan-300 font-mono text-right max-w-[170px] truncate">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
