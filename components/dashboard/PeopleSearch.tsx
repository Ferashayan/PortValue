'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Send, User, Mail, Sparkles, Loader2,
  BookOpen, Star, ChevronDown, Bot, AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Chunk {
  text: string;
  score: number;
  label?: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
}

interface SearchResult {
  profile: Profile;
  chunks: Chunk[];
  reason?: string;   // Gemini-generated match explanation
}

type MessageRole = 'user' | 'assistant' | 'error';

interface Message {
  id: string;
  role: MessageRole;
  content: string;           // user query or error text
  results?: SearchResult[];  // assistant payload
  loading?: boolean;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const Avatar = ({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  if (src) return <img src={src} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-tertiary/30 flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-tertiary/20 ring-2 ring-tertiary/30 flex items-center justify-center font-bold text-tertiary flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

const ScoreBadge = ({ score }: { score: number }) => {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    : pct >= 55 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    : 'text-on-surface-variant bg-white/5 border-white/10';
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      {pct}% match
    </span>
  );
};

const ResultCard = ({ result }: { result: SearchResult }) => {
  const [expanded, setExpanded] = useState(false);
  const { profile, chunks } = result;
  const topScore = chunks[0]?.score ?? 0;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/8 hover:border-tertiary/30 transition-all duration-300">
      {/* Profile header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar src={profile.image} name={profile.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-on-surface text-sm">{profile.name}</h3>
            <ScoreBadge score={topScore} />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail size={10} className="text-on-surface-variant" />
            <span className="text-[10px] text-on-surface-variant truncate">{profile.email}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="px-4 pb-2">
          <p className="text-xs text-on-surface-variant/80 leading-relaxed line-clamp-2">{profile.bio}</p>
        </div>
      )}

      {/* Gemini match explanation */}
      {result.reason && (
        <div className="mx-4 mb-3 rounded-xl bg-tertiary/8 border border-tertiary/15 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={10} className="text-tertiary" />
            <span className="text-[9px] uppercase tracking-widest text-tertiary font-bold">Why this match</span>
          </div>
          <p className="text-xs text-on-surface/80 leading-relaxed">{result.reason}</p>
        </div>
      )}

      {/* Knowledge chunks */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={10} />
            {chunks.length} knowledge {chunks.length === 1 ? 'chunk' : 'chunks'}
          </span>
          <ChevronDown size={11} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-2">
            {chunks.map((chunk, i) => (
              <div key={i} className="bg-white/4 rounded-xl p-3 border border-white/6">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Star size={9} className="text-tertiary" />
                    <span className="text-[9px] uppercase tracking-widest text-tertiary font-bold">
                      {chunk.label ?? 'general'}
                    </span>
                  </div>
                  <ScoreBadge score={chunk.score} />
                </div>
                <p className="text-xs text-on-surface/80 leading-relaxed">{chunk.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-tertiary/60"
        style={{ animation: `bounce 1.2s infinite ${i * 0.2}s` }}
      />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
  </div>
);

const SUGGESTIONS = [
  'Find a React developer',
  'Who has Python experience?',
  'Search for a data scientist',
  'Find someone with ML skills',
];

// ─── Main component ───────────────────────────────────────────────────────────

export const PeopleSearch = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: query.trim() };
    const loadingMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Search failed.');

      const assistantMsg: Message = {
        id: loadingMsg.id,
        role: 'assistant',
        content: '',
        results: data.results as SearchResult[],
      };

      setMessages(prev => prev.map(m => m.id === loadingMsg.id ? assistantMsg : m));
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: loadingMsg.id,
        role: 'error',
        content: err instanceof Error ? err.message : 'Something went wrong.',
      };
      setMessages(prev => prev.map(m => m.id === loadingMsg.id ? errorMsg : m));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-6" style={{ scrollbarWidth: 'thin' }}>

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-8 pt-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
                <Search size={32} className="text-tertiary" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-tertiary/20 border border-tertiary/30 flex items-center justify-center">
                <Sparkles size={10} className="text-tertiary" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-on-surface text-lg">Search for anyone</h2>
              <p className="text-on-surface-variant text-xs mt-1 max-w-xs">
                Describe who you&apos;re looking for in natural language. Results are matched by semantic meaning.
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendQuery(s)}
                  className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 text-on-surface-variant hover:border-tertiary/40 hover:text-on-surface hover:bg-tertiary/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            {msg.role === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-on-surface-variant" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-tertiary/15 border border-tertiary/25 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-tertiary" />
              </div>
            )}

            {/* Bubble / content */}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-3`}>

              {/* User query bubble */}
              {msg.role === 'user' && (
                <div className="bg-tertiary/15 border border-tertiary/20 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-on-surface">
                  {msg.content}
                </div>
              )}

              {/* Loading */}
              {msg.loading && (
                <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3">
                  <TypingDots />
                </div>
              )}

              {/* Error */}
              {msg.role === 'error' && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300">{msg.content}</p>
                </div>
              )}

              {/* Results */}
              {msg.role === 'assistant' && !msg.loading && msg.results !== undefined && (
                <div className="w-full space-y-3">
                  {msg.results.length === 0 ? (
                    <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-4 text-sm text-on-surface-variant">
                      No matching people found. Try a different search.
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant px-1">
                        Found {msg.results.length} {msg.results.length === 1 ? 'person' : 'people'}
                      </p>
                      {msg.results.map(r => (
                        <ResultCard key={r.profile.id} result={r} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 pt-4 border-t border-white/8">
        <div className="relative flex items-end gap-3 glass-panel rounded-2xl px-4 py-3 border border-white/10 focus-within:border-tertiary/40 transition-all">
          <Search size={16} className="text-on-surface-variant mb-1 flex-shrink-0" />
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search for people… e.g. 'I want to find Feras Alnassan'"
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: '120px', scrollbarWidth: 'thin' }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${t.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => sendQuery(input)}
            disabled={!input.trim() || loading}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all mb-0.5
              ${input.trim() && !loading
                ? 'bg-tertiary text-surface shadow-lg shadow-tertiary/20 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-on-surface-variant/30 cursor-not-allowed'
              }`}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />
            }
          </button>
        </div>
        <p className="text-[9px] text-on-surface-variant/30 text-center mt-2">
          Enter ↵ to send · Shift+Enter for new line · Powered by Pinecone llama-text-embed-v2
        </p>
      </div>
    </div>
  );
};
