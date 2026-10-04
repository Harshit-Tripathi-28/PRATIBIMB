import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, CheckCircle2, 
  Database, Bot, RefreshCw, Zap
} from 'lucide-react';
import type { ChatMessage, AIAction, DigitalTwin, LLMStatus } from '../types';
import { api } from '../services/api';
import { CanonicalAvatar } from './CanonicalAvatar';

interface TwinChatProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
  onNavigateTab: (tab: string) => void;
  initialPrompt?: string;
}

export const TwinChat: React.FC<TwinChatProps> = ({ twin, onRefreshTwin, onNavigateTab, initialPrompt }) => {
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
          content: `Hello ${twin.profile.name}. I am your PRATIBIMB AI Core. I reason directly from your identity, goals, habits, and stored memories. How can I assist you today?`,
          timestamp: 'Just now',
          memory_citations: recentMemory ? [`Memory: ${recentMemory.content.substring(0, 70)}...`] : undefined,
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
        content: 'AI Core is temporarily unavailable. Try again shortly.',
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

  // Helper to format assistant message paragraphs and lists cleanly
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-100">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-cyan-400 font-mono text-xs mt-0.5">{trimmed.match(/^\d+\./)?.[0]}</span>
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
    'What should I focus on today?',
    'Synthesize my current goals and pending tasks',
    'Review my daily habits and suggest a focus block',
    'Log an insight into my Memory vault',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl animate-fadeIn">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">PRATIBIMB AI Core</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                {llmStatus?.configured ? 'AI Core Online' : 'AI Core Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Talk to the intelligence behind your Digital Twin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('twin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-violet-400" />
            <span>Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4.5 space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-950/70 border border-slate-800/90 text-slate-100 shadow-md'
              }`}
            >
              {/* Formatted Text Content */}
              {msg.role === 'assistant' ? renderMessageContent(msg.content) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Memory Citations Pill */}
              {msg.memory_citations && msg.memory_citations.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                    <Database className="w-3 h-3" />
                    <span>Referenced from Memory Vault:</span>
                  </div>
                  <div className="space-y-1">
                    {msg.memory_citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 italic"
                      >
                        "{cite}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured AI Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Proposed Twin Action</span>
                  </div>

                  {msg.actions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        action.status === 'executed'
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {action.title}
                        </div>
                        {action.description && (
                          <div className="text-[11px] text-slate-400">{action.description}</div>
                        )}
                      </div>

                      {action.status === 'executed' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          Executed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction(action)}
                          disabled={executingActionId === action.id}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
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

              <div className="text-[10px] text-slate-400 text-right font-mono mt-1">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Synthesizing response from your Digital Twin...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto flex gap-2">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
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
            placeholder="Ask your digital twin or instruct it to take action..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
