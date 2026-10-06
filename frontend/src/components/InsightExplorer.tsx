import React, { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, TrendingDown,
  Sparkles, CheckCircle2, Filter,
  Layers, RefreshCw, Compass, Zap
} from 'lucide-react';
import type { DigitalTwin, CognitiveInsight, RecommendationDecisionRequest } from '../types';
import { api } from '../services/api';

interface InsightExplorerProps {
  twin: DigitalTwin;
  onRefresh: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
}

export const InsightExplorer: React.FC<InsightExplorerProps> = ({
  twin,
  onRefresh,
  onNavigateTab,
}) => {
  const [insights, setInsights] = useState<CognitiveInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  const [decisionFeedback, setDecisionFeedback] = useState<Record<string, string>>({});
  const [processingDecision, setProcessingDecision] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await api.getCognitiveInsights();
      setInsights(data);
      if (data.length > 0 && !activeInsightId) {
        setActiveInsightId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load cognitive insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [twin.state.last_updated]);

  const handleDecision = async (
    insight: CognitiveInsight,
    decision: 'accepted' | 'dismissed' | 'deferred'
  ) => {
    try {
      setProcessingDecision(insight.id);
      const req: RecommendationDecisionRequest = {
        insight_id: insight.id,
        recommendation_text: insight.recommended_action || insight.statement,
        decision,
        feedback_note: decisionFeedback[insight.id] || undefined,
      };
      await api.recordRecommendationDecision(req);
      // Remove or mark the insight
      setInsights((prev) => prev.filter((item) => item.id !== insight.id));
      onRefresh();
    } catch (err) {
      console.error('Failed to record decision', err);
    } finally {
      setProcessingDecision(null);
    }
  };

  const filteredInsights = insights.filter((item) => {
    const categoryMatch = selectedCategory === 'ALL' || item.category === selectedCategory;
    const domainMatch =
      selectedDomain === 'ALL' ||
      item.evidence_signals.some((s) => s.domain === selectedDomain);
    return categoryMatch && domainMatch;
  });

  const activeInsight = insights.find((i) => i.id === activeInsightId) || filteredInsights[0];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'TREND':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'CHANGE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'RELATIONSHIP':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
      case 'RISK':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'OPPORTUNITY':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  const getEpistemicBadge = (level: string) => {
    switch (level) {
      case 'OBSERVATION':
        return 'bg-white/5 text-slate-300 border-white/10';
      case 'ASSOCIATION':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30';
      case 'INTERPRETATION':
        return 'bg-violet-950/60 text-violet-300 border-violet-500/30';
      case 'PREDICTION':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100 max-w-7xl mx-auto pb-20 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0a1a]/80 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#6c4dff] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Cognitive Insights & Epistemic Signals</h1>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                SYNTHESIS ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded behavioral analysis distinguishing direct observations from correlational context and interventions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-2xl bg-[#140f2d] border border-white/10 hover:border-violet-500/30 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c33cff]' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => onNavigateTab('intelligence', 'Explain the latest cognitive insights about my workflow and energy.')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Inquire AI Core</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-[#0c0a1a]/70 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1 font-mono">
              <Filter className="w-3 h-3 text-[#c33cff]" /> Category:
            </span>
            {['ALL', 'TREND', 'CHANGE', 'RELATIONSHIP', 'RISK', 'OPPORTUNITY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                    : 'bg-[#140f2d]/50 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Domain Filters */}
          <div className="flex flex-wrap items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1 font-mono">
              Domain:
            </span>
            {['ALL', 'Focus', 'Goals', 'Tasks', 'Habits', 'Energy'].map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedDomain === dom
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#140f2d]/30 text-slate-500 hover:text-slate-300 border border-white/5'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Epistemic Reference Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
          <span>Epistemic Guardrails Active (No Unverified Causality)</span>
        </div>
      </div>

      {/* Main Two-Column Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Insight Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between font-mono">
            <span>Detected Cognitive Signals ({filteredInsights.length})</span>
            <span className="text-[10px] text-violet-400 font-mono">Real-time Stream</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2 rounded-3xl bg-[#0c0a1a]/40 border border-white/10">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c33cff]" />
              <div className="text-xs">Analyzing state vectors and event streams...</div>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="p-8 text-center text-slate-400 rounded-3xl bg-[#0c0a1a]/40 border border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-200">No active anomaly or risk signals</div>
              <div className="text-xs text-slate-500 max-w-xs mx-auto">
                Your digital twin telemetry is operating in balanced equilibrium.
              </div>
            </div>
          ) : (
            filteredInsights.map((item) => {
              const isSelected = activeInsight?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveInsightId(item.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2.5 backdrop-blur-xl ${
                    isSelected
                      ? 'bg-[#140f2d]/90 border-violet-500/80 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500/30'
                      : 'bg-[#0c0a1a]/70 border-white/5 hover:bg-[#140f2d]/60 hover:border-violet-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono border ${getEpistemicBadge(item.epistemic_level)}`}>
                      {item.epistemic_level}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {item.statement}
                  </p>

                  {/* Signals mini preview */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    {item.evidence_signals.slice(0, 2).map((sig, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0c0a1a] border border-white/10 font-mono">
                        {sig.direction === 'increasing' ? (
                          <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                        ) : sig.direction === 'decreasing' ? (
                          <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        )}
                        <span>{sig.metric_name}:</span>
                        <span className={sig.delta_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sig.delta_pct >= 0 ? `+${sig.delta_pct}%` : `${sig.delta_pct}%`}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep Diagnostic & Evidence Inspector (7 Cols) */}
        <div className="lg:col-span-7">
          {activeInsight ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0c0a1a]/75 border border-white/10 shadow-2xl space-y-6 backdrop-blur-2xl">
              
              {/* Card Header */}
              <div className="space-y-2 pb-4 border-b border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getCategoryBadge(activeInsight.category)}`}>
                      {activeInsight.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${getEpistemicBadge(activeInsight.epistemic_level)}`}>
                      Epistemic: {activeInsight.epistemic_level}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{activeInsight.timestamp}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activeInsight.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {activeInsight.statement}
                </p>
              </div>

              {/* 1. Observation & Correlational Explanation */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#c33cff]" />
                  Structured Diagnostic Breakdown
                </h3>

                <div className="p-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 font-mono">
                      Observed Change
                    </span>
                    <p className="text-xs text-slate-200 font-medium font-sans">
                      {activeInsight.explanation.observed_change}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block mb-0.5 font-mono">
                      Cognitive Interpretation (Non-Causal Association)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {activeInsight.explanation.interpretation}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Attributed Evidence Signals */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#22d3ee]" />
                  Attributed Metric Signals
                </h3>

                <div className="space-y-2">
                  {activeInsight.evidence_signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#140f2d]/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{sig.metric_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({sig.domain})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Previous: {sig.previous_value} → Current: {sig.current_value}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className={`font-bold ${sig.delta_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sig.delta_pct >= 0 ? `+${sig.delta_pct}%` : `${sig.delta_pct}%`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Confidence: {Math.round(sig.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Affected Entities in Life Graph */}
              {activeInsight.affected_entities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    Affected Life Graph Entities
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {activeInsight.affected_entities.map((entity, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#140f2d] border border-white/10 text-xs flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span className="font-semibold text-slate-200">{entity.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          ({entity.relationship_type.replace('_', ' ')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Actionable Recommendation & Decision Controls */}
              {activeInsight.recommended_action && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#140f2d] to-[#0c0a1a] border border-violet-500/30 space-y-4 shadow-lg shadow-violet-500/10">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] flex items-center gap-1.5 font-mono">
                      <Zap className="w-4 h-4 text-[#22d3ee]" />
                      Actionable Proposal
                    </div>
                    <span className="text-[10px] font-mono text-violet-300">High-leverage intervention</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed font-sans">
                    {activeInsight.recommended_action}
                  </p>

                  {/* Optional Feedback Note */}
                  <div>
                    <input
                      type="text"
                      placeholder="Optional feedback note (e.g., 'Scheduled for 2 PM')..."
                      value={decisionFeedback[activeInsight.id] || ''}
                      onChange={(e) =>
                        setDecisionFeedback((prev) => ({
                          ...prev,
                          [activeInsight.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0c0a1a] border border-white/10 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#c33cff]"
                    />
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleDecision(activeInsight, 'dismissed')}
                      disabled={processingDecision === activeInsight.id}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleDecision(activeInsight, 'deferred')}
                      disabled={processingDecision === activeInsight.id}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-300 font-semibold cursor-pointer transition-colors"
                    >
                      Remind Later
                    </button>
                    <button
                      onClick={() => handleDecision(activeInsight, 'accepted')}
                      disabled={processingDecision === activeInsight.id}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Accept Recommendation</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#0c0a1a]/40 border border-white/10">
              Select an insight from the stream to inspect signals and context.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
