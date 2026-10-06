import React, { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, TrendingDown,
  Filter, RefreshCw, Zap, ArrowRight
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
  const [decisionFeedback] = useState<Record<string, string>>({});
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
      setInsights((prev) => prev.filter((item) => item.id !== insight.id));
      onRefresh();
    } catch (err) {
      console.error('Failed to record decision', err);
    } finally {
      setProcessingDecision(null);
    }
  };

  const getEpistemicBadgeStyle = (level: string) => {
    switch (level) {
      case 'OBSERVATION':
        return 'bg-white/10 text-white border-white/20';
      case 'ASSOCIATION':
        return 'bg-[#1E7BFF]/20 text-[#48D7FF] border-[#1E7BFF]/40';
      case 'INTERPRETATION':
        return 'bg-[#E51D48]/20 text-[#FF365C] border-[#E51D48]/40';
      case 'PREDICTION':
        return 'bg-[#48D7FF]/20 text-[#48D7FF] border-[#48D7FF]/40';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
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

  return (
    <div className="space-y-6 animate-fadeIn text-[#F4F7FF] max-w-7xl mx-auto pb-20 font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070A12]/90 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Cognitive Neural Signals</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-mono text-[10px] font-bold">
                EPISTEMIC DIAGNOSTICS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict causal inference, evidence telemetry, and grounded recommendations from your Digital Twin.
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-[#04060C] hover:bg-[#0c0a1a] border border-white/10 hover:border-[#E51D48]/30 text-slate-300 hover:text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF365C]' : ''}`} />
          <span>Refresh Signals</span>
        </button>
      </div>

      {/* Filter Matrix */}
      <div className="p-4 rounded-3xl bg-[#070A12]/80 border border-white/10 space-y-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
            {['ALL', 'TREND', 'CHANGE', 'RELATIONSHIP', 'RISK', 'OPPORTUNITY', 'ANOMALY'].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#E51D48]/20 border border-[#E51D48]/50 text-white font-bold shadow-md shadow-red-950/30'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-500 text-[10px] uppercase">Domain:</span>
            {['ALL', 'FOCUS', 'ENERGY', 'GOALS'].map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-2 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors ${
                  selectedDomain === dom
                    ? 'bg-[#1E7BFF]/30 text-[#48D7FF] font-bold border border-[#1E7BFF]/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500">
            {filteredInsights.length} Verified Signals
          </span>
        </div>
      </div>

      {/* Main Signal Viewport (Split List & Deep Diagnostic View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Signals Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredInsights.map((insight) => {
            const isSelected = activeInsight?.id === insight.id;
            return (
              <div
                key={insight.id}
                onClick={() => setActiveInsightId(insight.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-2 group backdrop-blur-2xl ${
                  isSelected
                    ? 'bg-[#0c0a1a] border-[#E51D48] shadow-xl shadow-red-950/30'
                    : 'bg-[#070A12]/80 hover:bg-[#070A12] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border font-bold ${getEpistemicBadgeStyle(insight.epistemic_level)}`}>
                    {insight.epistemic_level}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{insight.timestamp}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#FF365C] transition-colors leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                  {insight.statement}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Causal Diagnostic Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeInsight ? (
            <div className="p-6 rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold ${getEpistemicBadgeStyle(activeInsight.epistemic_level)}`}>
                      {activeInsight.epistemic_level}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Category: {activeInsight.category}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{activeInsight.title}</h2>
                </div>

                <span className="text-xs font-mono font-bold text-[#48D7FF] bg-[#04060C] px-2.5 py-1 rounded-xl border border-white/10">
                  {activeInsight.explanation?.confidence ? `${Math.round(activeInsight.explanation.confidence * 100)}% CONF` : 'VERIFIED'}
                </span>
              </div>

              {/* Grounded Statement */}
              <div className="p-4 rounded-2xl bg-[#04060C] border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Observed Fact</span>
                <p className="text-slate-200 leading-relaxed font-sans font-medium">
                  {activeInsight.statement}
                </p>
              </div>

              {/* Supporting Telemetry Signals */}
              {activeInsight.evidence_signals && activeInsight.evidence_signals.length > 0 && (
                <div className="space-y-2 font-mono text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Supporting Metric Signals</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeInsight.evidence_signals.map((sig, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#04060C] border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300">{sig.metric_name}</span>
                        <span className={`flex items-center gap-0.5 font-bold ${
                          sig.direction === 'increasing' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {sig.direction === 'increasing' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {sig.delta_pct > 0 ? `+${sig.delta_pct}%` : `${sig.delta_pct}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action & Decision Handlers */}
              {activeInsight.recommended_action && (
                <div className="p-4 rounded-2xl bg-[#0c0a1a] border border-[#E51D48]/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF365C] uppercase font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Prescribed Action</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans font-medium">
                    {activeInsight.recommended_action}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() =>
                        onNavigateTab('intelligence', `Execute recommended action: "${activeInsight.recommended_action}"`)
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white font-bold text-xs font-mono shadow-md shadow-red-950/40 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Reason in AI Core</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecision(activeInsight, 'dismissed')}
                        disabled={processingDecision === activeInsight.id}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleDecision(activeInsight, 'accepted')}
                        disabled={processingDecision === activeInsight.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 cursor-pointer font-bold"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#070A12]/50 border border-white/5 text-center text-slate-500 text-xs font-mono">
              Select a cognitive signal to inspect grounded evidence and epistemic diagnostics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
