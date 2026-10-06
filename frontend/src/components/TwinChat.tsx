import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, CheckCircle2, 
  Database, Bot, RefreshCw, Zap
} from 'lucide-react';
import type { ChatMessage, AIAction, DigitalTwin, LLMStatus } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface TwinChatProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  initialPrompt?: string;
}

export const TwinChat: React.FC<TwinChatProps> = ({ twin, onRefreshTwin, onNavigateTab: _onNavigateTab, initialPrompt }) => {
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLLMStatus();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  const fetchLLMStatus = async () => {
    try {
      const status = await api.getAIStatus();
      setLlmStatus(status);
      
      const recentMemory = twin.memories[0];
      setMessages([
        {
          id: 'init-msg',
          role: 'assistant',
          content: `Greetings ${twin.profile.name}. PRATIBIMB AI Core is synchronized with your 64D latent representation, active goals, and episodic memory vault. How can I reason on your behalf today?`,
          timestamp: 'Just now',
          memory_citations: recentMemory ? [`Memory Anchor: ${recentMemory.content.substring(0, 75)}...`] : undefined,
        }
      ]);
    } catch (e) {
      console.error('Failed to fetch AI status', e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(query);
      const assistantMsg: ChatMessage = {
        id: `resp-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
        memory_citations: response.memory_citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      onRefreshTwin();
    } catch (e) {
      console.error('Chat error', e);
      const friendlyErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'AI Core reasoning engine is synchronizing state. Please retry shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, friendlyErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: AIAction) => {
    try {
      setExecutingActionId(action.id);
      const res = await api.executeAIAction(action);
      if (res.success) {
        onRefreshTwin();
        setMessages((prev) =>
          prev.map((m) => {
            if (m.actions) {
              return {
                ...m,
                actions: m.actions.map((act) =>
                  act.id === action.id ? { ...act, status: 'executed' } : act
                ),
              };
            }
            return m;
          })
        );
      }
    } catch (e) {
      console.error('Failed to execute action', e);
    } finally {
      setExecutingActionId(null);
    }
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-100 font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#c33cff] font-bold">•</span>
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#22d3ee] font-mono text-xs mt-0.5">{trimmed.match(/^\d+\./)?.[0]}</span>
                <span>{trimmed.replace(/^\d+\.\s*/, '')}</span>
              </div>
            );
          }
          return <p key={idx}>{trimmed}</p>;
        })}
      </div>
    );
  };

  const quickPrompts = [
    { label: 'Focus Priority', text: 'What is the highest-leverage focus priority for my engineering goals today?' },
    { label: 'Synthesize Goals', text: 'Synthesize my current goal trajectory, active milestones, and pending tasks.' },
    { label: 'Memory Ingestion', text: 'Extract and summarize recent cognitive memories from my memory vault.' },
    { label: 'Simulate Scenario', text: 'Simulate the downstream impact of accelerating my primary engineering goal.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-3xl bg-[#0c0a1a]/85 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl animate-fadeIn font-sans">
      
      {/* Header Bar */}
      <div className="px-6 py-4 bg-[#140f2d]/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c33cff] to-[#6c4dff] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0a1a] bg-[#22d3ee] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide font-sans">PRATIBIMB AI CORE</h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                {llmStatus?.configured ? 'SYNCHRONIZED' : 'ACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-hop reasoning engine grounded in your evolving Digital Twin state.
            </p>
          </div>
        </div>

        {/* Telemetry Status Chips */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-violet-300">
            64D Spectral Latent
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-cyan-300">
            GNN Active
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[#c33cff] shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-4.5 space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#6c4dff] via-[#8b5cf6] to-[#c33cff] text-white shadow-lg shadow-violet-500/15 rounded-br-none'
                  : 'bg-[#140f2d]/90 border border-white/10 text-slate-100 shadow-md rounded-bl-none'
              }`}
            >
              {/* Formatted Text Content */}
              {msg.role === 'assistant' ? renderMessageContent(msg.content) : (
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</div>
              )}

              {/* Memory Citations Pill */}
              {msg.memory_citations && msg.memory_citations.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-[#22d3ee] flex items-center gap-1.5 uppercase tracking-wider">
                    <Database className="w-3 h-3" />
                    <span>Memory Vault Grounding:</span>
                  </div>
                  <div className="space-y-1">
                    {msg.memory_citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-xl bg-[#0c0a1a] border border-white/5 text-slate-300 italic font-sans"
                      >
                        "{cite}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured AI Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Proposed State Action</span>
                  </div>

                  {msg.actions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        action.status === 'executed'
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-[#0c0a1a] border-violet-500/30 hover:border-violet-500/60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {action.title}
                        </div>
                        {action.description && (
                          <div className="text-[11px] text-slate-400 font-sans">{action.description}</div>
                        )}
                      </div>

                      {action.status === 'executed' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          Executed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction(action)}
                          disabled={executingActionId === action.id}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c33cff] to-[#6c4dff] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-violet-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {executingActionId === action.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          <span>Execute Action</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[9px] text-slate-400 text-right font-mono mt-1">
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="shrink-0 mt-0.5">
                <CanonicalAvatar config={twin.profile.avatar_config} size="xs" mode="2d" showAura={false} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[#c33cff] shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#140f2d] border border-white/10 font-mono text-[11px] text-violet-300">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-ping" />
              <span>Synthesizing multi-hop reasoning from Digital Twin...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 bg-[#0c0a1a]/80 border-t border-white/5 overflow-x-auto flex gap-2 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.text)}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 hover:border-violet-500/40 transition-all whitespace-nowrap cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#0c0a1a] border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your digital twin or instruct it to reason..."
            className="flex-1 bg-[#140f2d] border border-white/10 focus:border-[#c33cff] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#c33cff] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
