import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, CheckCircle2, 
  Database, Bot, RefreshCw, Zap, Cpu
} from 'lucide-react';
import type { ChatMessage, AIAction, DigitalTwin, LLMStatus } from '../types';
import { api } from '../services/api';

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
          content: `Greetings ${twin.profile.name}. PRATIBIMB AI Cognition Core is synchronized with your 64D latent representation, active goals, and episodic memory field. How can I reason on your behalf today?`,
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
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: res.actions || [],
        memory_citations: res.memory_citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Failed to send message to AI core', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while synthesizing reasoning with the Digital Twin state engine.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: AIAction) => {
    try {
      setExecutingActionId(action.id);
      await api.executeAIAction(action);
      
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.actions) return msg;
          return {
            ...msg,
            actions: msg.actions.map((act) =>
              act.id === action.id ? { ...act, status: 'executed' } : act
            ),
          };
        })
      );

      onRefreshTwin();
    } catch (e) {
      console.error('Failed to execute AI action', e);
    } finally {
      setExecutingActionId(null);
    }
  };

  const renderMessageContent = (content: string) => {
    const sections = content.split('\n\n');
    return (
      <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed">
        {sections.map((section, idx) => {
          if (section.startsWith('### ') || section.startsWith('## ')) {
            const title = section.replace(/^#+\s*/, '');
            return (
              <h4 key={idx} className="font-bold text-sm text-[#FF365C] pt-1">
                {title}
              </h4>
            );
          }
          if (section.startsWith('```')) {
            const code = section.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
            return (
              <div key={idx} className="p-3 rounded-2xl bg-[#04060C] border border-white/5 font-mono text-xs overflow-x-auto text-slate-200">
                <pre>{code}</pre>
              </div>
            );
          }
          return <p key={idx} className="text-slate-200">{section}</p>;
        })}
      </div>
    );
  };

  const quickPrompts = [
    { label: 'Priorities Check', text: 'Synthesize my top focus items based on active goals.' },
    { label: 'Causal Diagnostics', text: 'Diagnose potential bottlenecks in my task completion rate.' },
    { label: 'Simulate Sprint', text: 'Simulate allocating 15 hours of deep focus next week.' },
    { label: 'Summarize Memories', text: 'Summarize my recent architectural decisions and lessons.' },
  ];

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col rounded-3xl bg-[#070A12]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden font-sans selection:bg-[#E51D48] selection:text-white">
      
      {/* Top Header */}
      <div className="p-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-[#04060C]/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                PRATIBIMB AI COGNITION CORE
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#E51D48]/15 border border-[#E51D48]/30 text-[#FF365C] font-bold">
                {llmStatus?.configured ? 'MODEL ACTIVE' : 'REASONING'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-hop reasoning engine grounded in your evolving Digital Twin state.
            </p>
          </div>
        </div>

        {/* Telemetry Status Chips */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-[#FF365C]">
            64D Latent Active
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-[#48D7FF]">
            GNN Causal Synced
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
              <div className="w-8 h-8 rounded-xl bg-[#E51D48]/15 border border-[#E51D48]/30 flex items-center justify-center text-[#FF365C] shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-4.5 space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] text-white shadow-lg shadow-red-950/40 rounded-br-none'
                  : 'bg-[#04060C] border border-white/10 text-slate-100 shadow-md rounded-bl-none'
              }`}
            >
              {/* Formatted Text Content */}
              {msg.role === 'assistant' ? renderMessageContent(msg.content) : (
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</div>
              )}

              {/* Memory Citations Pill */}
              {msg.memory_citations && msg.memory_citations.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-[#48D7FF] flex items-center gap-1.5 uppercase tracking-wider font-bold">
                    <Database className="w-3 h-3" />
                    <span>Memory Field Grounding:</span>
                  </div>
                  <div className="space-y-1">
                    {msg.memory_citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-xl bg-[#070A12] border border-white/5 text-slate-300 italic font-sans"
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
                          : 'bg-[#070A12] border-[#E51D48]/30 hover:border-[#E51D48]/60'
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
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-red-950/40 flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B0F24] to-[#1E7BFF] flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5">
                {twin.profile.name.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E51D48]/20 border border-[#E51D48]/30 flex items-center justify-center text-[#FF365C] shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#04060C] border border-white/10 font-mono text-[11px] text-[#FF365C]">
              <span className="w-2 h-2 rounded-full bg-[#48D7FF] animate-ping" />
              <span>Synthesizing multi-hop reasoning from Neural Core...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 bg-[#04060C] border-t border-white/5 overflow-x-auto flex gap-2 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.text)}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 hover:border-[#E51D48]/30 transition-all whitespace-nowrap cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#070A12] border-t border-white/10">
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
            className="flex-1 bg-[#04060C] border border-white/10 focus:border-[#E51D48] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
