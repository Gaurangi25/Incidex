
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Send, Bot, User, Sparkles, BrainCircuit,
  Zap, Command, ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function AIChat({ messages, onSendMessage }: AIChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const suggestions = [
    {
      icon: '⚡',
      title: 'Critical incidents',
      text: 'What are the critical severity incidents currently open?'
    },
    {
      icon: '📍',
      title: 'Location analysis',
      text: 'Which location has the most active incidents?'
    },
    {
      icon: '📊',
      title: 'Incident overview',
      text: 'Show all active incidents'
    },
    {
      icon: '🌐',
      title: 'Network issues',
      text: 'What incidents are related to network connectivity?'
    }
  ];

  return (
    <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#080E1B] text-white">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.12] blur-[110px]" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-600/[0.13] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.07] blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100,180,255,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,180,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '42px 42px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)'
          }}
        />
      </div>

      {/* Chat header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0B1425]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-lg shadow-cyan-500/10">
            <BrainCircuit className="h-6 w-6 text-cyan-300" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0B1425] bg-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wide text-white">
                AI Intelligence Copilot
              </h2>
              <span className="rounded-md border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                RAG Powered
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Ask questions. Investigate incidents. Discover insights.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-[10px] font-semibold text-emerald-300">
            Intelligence Online
          </span>
        </div>
      </header>

      {/* Messages */}
      <section className="relative z-10 flex-1 overflow-y-auto px-5 py-6 sm:px-8">

        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center py-8">

            {/* AI visual */}
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
              <div className="absolute inset-5 rounded-full border border-violet-400/20" />
              <div className="absolute inset-8 rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-[0_0_45px_rgba(34,211,238,0.15)]" />
              <BrainCircuit className="relative z-10 h-12 w-12 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              <span className="absolute right-3 top-5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
              <span className="absolute bottom-5 left-3 h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_#c4b5fd]" />
            </div>

            <div className="mb-8 max-w-lg text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-[3px] text-cyan-300">
                  Intelligence at your fingertips
                </span>
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              <h3 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Your incidents.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Decoded by AI.
                </span>
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
                Explore incident patterns, identify root causes and get
                intelligent answers from your incident knowledge base.
              </p>
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
                  Explore your intelligence
                </p>
                <span className="text-[10px] text-slate-600">Suggested prompts</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    onClick={() => onSendMessage(suggestion.text)}
                    className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:shadow-lg hover:shadow-cyan-900/10"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xl">{suggestion.icon}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-300" />
                    </div>
                    <p className="mb-1 text-xs font-bold text-slate-200 transition group-hover:text-cyan-200">
                      {suggestion.title}
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      {suggestion.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center gap-2 text-[10px] text-slate-600">
              <Zap className="h-3 w-3 text-cyan-500" />
              Powered by Retrieval-Augmented Generation
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map(message => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    isUser
                      ? 'border-blue-400/20 bg-blue-500/20'
                      : 'border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-violet-500/20'
                  }`}>
                    {isUser
                      ? <User className="h-4 w-4 text-blue-300" />
                      : <Bot className="h-4 w-4 text-cyan-300" />
                    }
                  </div>

                  <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="mb-1.5 text-[10px] font-semibold text-slate-500">
                      {isUser ? 'YOU' : 'AI INTELLIGENCE'}
                    </span>

                    <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'rounded-tr-sm border-blue-400/20 bg-gradient-to-br from-blue-600/90 to-indigo-600/90 text-white shadow-blue-950/20'
                        : 'rounded-tl-sm border-white/[0.09] bg-[#131E31]/90 text-slate-200 shadow-black/10'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.message}
                      </div>

                      {message.incidentRefs && message.incidentRefs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                          {message.incidentRefs.map(ref => (
                            <span
                              key={ref}
                              className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="mt-2 text-[10px] text-slate-600">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {/* Input */}
      <footer className="relative z-10 border-t border-white/[0.07] bg-[#0B1425]/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl"
        >
          <div className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-[#131E31] p-2 transition-all focus-within:border-cyan-400/40 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.08)]">
            <div className="hidden pl-2 sm:block">
              <Command className="h-4 w-4 text-slate-500" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI about incidents, patterns or root causes..."
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-slate-600">
            AI-generated responses may need verification. Powered by your incident knowledge base.
          </p>
        </form>
      </footer>
    </main>
  );
}
