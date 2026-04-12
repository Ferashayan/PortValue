'use client';

import React, { useState } from 'react';
import { Brain, CheckCircle, AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const KnowledgeUpload = () => {
  const [text, setText] = useState('');
  const [namespace, setNamespace] = useState('');
  const [showNamespace, setShowNamespace] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [lastId, setLastId] = useState('');

  const charCount = text.length;
  const isReady = charCount >= 20 && status !== 'loading';

  const handleEmbed = async () => {
    if (!isReady) return;
    setStatus('loading');
    setStatusMessage('');

    try {
      const res = await fetch('/api/knowledge/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          namespace: namespace.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unknown error occurred.');
      }

      setStatus('success');
      setLastId(data.id);
      setStatusMessage(`Vector stored successfully.`);
      setText('');
    } catch (err: unknown) {
      setStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to embed text.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setStatusMessage('');
    setLastId('');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
            <Brain size={18} className="text-tertiary" />
          </div>
          <Sparkles
            size={10}
            className="absolute -top-1 -right-1 text-tertiary opacity-70"
          />
        </div>
        <div>
          <h4 className="font-bold text-on-surface text-sm leading-none">Knowledge Ingestion</h4>
          <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">
            Embed via llama-text-embed-v2 · Pinecone
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); if (status !== 'idle') handleReset(); }}
          placeholder="Paste or type the knowledge chunk you want to embed and store in Pinecone…"
          rows={6}
          className="
            w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
            text-sm text-on-surface placeholder:text-on-surface-variant/50
            focus:outline-none focus:border-tertiary/50 focus:bg-white/8
            resize-none transition-all duration-200 leading-relaxed
          "
          style={{ scrollbarWidth: 'thin' }}
        />
        {/* Char counter */}
        <span
          className={`absolute bottom-3 right-3 text-[10px] font-mono transition-colors ${
            charCount < 20
              ? 'text-on-surface-variant/40'
              : charCount > 4000
              ? 'text-amber-400'
              : 'text-tertiary/60'
          }`}
        >
          {charCount.toLocaleString()}
        </span>
      </div>

      {/* Namespace (optional, collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowNamespace((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {showNamespace ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          Namespace (optional)
        </button>
        {showNamespace && (
          <input
            type="text"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="e.g. portfolio, resume, market-data"
            className="
              mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
              text-xs text-on-surface placeholder:text-on-surface-variant/40
              focus:outline-none focus:border-tertiary/40 transition-all
            "
          />
        )}
      </div>

      {/* Status feedback */}
      {status === 'success' && (
        <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <CheckCircle size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-emerald-300 font-semibold">{statusMessage}</p>
            <p className="text-[10px] text-emerald-400/60 mt-0.5 font-mono break-all">{lastId}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300">{statusMessage}</p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[10px] text-on-surface-variant/50 leading-relaxed">
          Min 20 chars · Stored with metadata · llama-text-embed-v2 (1024-dim)
        </p>

        <button
          type="button"
          onClick={handleEmbed}
          disabled={!isReady}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
            transition-all duration-200 flex-shrink-0
            ${isReady
              ? 'bg-tertiary text-surface shadow-lg shadow-tertiary/20 hover:bg-tertiary/90 hover:shadow-tertiary/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/5 text-on-surface-variant/30 cursor-not-allowed'
            }
          `}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Embedding…
            </>
          ) : (
            <>
              <Brain size={13} />
              Embed &amp; Store
            </>
          )}
        </button>
      </div>
    </div>
  );
};