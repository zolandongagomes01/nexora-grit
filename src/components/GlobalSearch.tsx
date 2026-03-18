'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResultUser  { type: 'user';  id: string; full_name: string; username: string; grit_score: number; }
interface ResultPost  { type: 'post';  id: string; title: string; description: string; }
interface ResultLab   { type: 'lab';   id: string; title: string; description: string; status: string; }

type Result = ResultUser | ResultPost | ResultLab;

const CATEGORY_CONFIG = {
  user: { label: 'Utilizadores', icon: '👤', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10' },
  post: { label: 'Provas',       icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  lab:  { label: 'Labs',         icon: '🧪', color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // ✅ CORRECTO — adiciona undefined
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca com debounce (espera 300ms após parar de escrever)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function search(q: string) {
    setLoading(true);
    setOpen(true);
    const term = `%${q}%`;

    const [usersRes, postsRes, labsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, username, grit_score')
        .or(`full_name.ilike.${term},username.ilike.${term}`)
        .limit(4),
      supabase
        .from('posts')
        .select('id, title, description')
        .or(`title.ilike.${term},description.ilike.${term}`)
        .limit(4),
      supabase
        .from('labs')
        .select('id, title, description, status')
        .or(`title.ilike.${term},description.ilike.${term}`)
        .limit(4),
    ]);

    const combined: Result[] = [
      ...(usersRes.data || []).map((u) => ({ ...u, type: 'user' as const })),
      ...(postsRes.data || []).map((p) => ({ ...p, type: 'post' as const })),
      ...(labsRes.data  || []).map((l) => ({ ...l, type: 'lab'  as const })),
    ];

    setResults(combined);
    setLoading(false);
  }

  function handleSelect(result: Result) {
    setOpen(false);
    setQuery('');
    if (result.type === 'user') router.push(`/profile`);
    if (result.type === 'post') router.push(`/dashboard`);
    if (result.type === 'lab')  router.push(`/labs/${result.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  // Agrupa resultados por tipo
  const grouped = {
    user: results.filter((r): r is ResultUser => r.type === 'user'),
    post: results.filter((r): r is ResultPost => r.type === 'post'),
    lab:  results.filter((r): r is ResultLab  => r.type === 'lab'),
  };
  const hasResults = results.length > 0;

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar utilizadores, provas, labs..."
          className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7]/50 focus:bg-white/8 transition-all"
        />
        {/* Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-[#4F8EF7]/30 border-t-[#4F8EF7] rounded-full animate-spin" />
          </div>
        )}
        {/* Limpar */}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown resultados */}
      {open && (
        <div className="absolute top-11 left-0 right-0 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">

          {!hasResults && !loading && query.length >= 2 && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-gray-500 text-sm">Sem resultados para <span className="text-white">"{query}"</span></p>
            </div>
          )}

          {/* Secção Utilizadores */}
          {grouped.user.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <span className="text-xs font-semibold text-[#4F8EF7] uppercase tracking-wider">👤 Utilizadores</span>
              </div>
              {grouped.user.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(u.full_name || u.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.full_name || u.username}</p>
                    <p className="text-gray-500 text-xs">@{u.username}</p>
                  </div>
                  <div className="text-[#4F8EF7] text-xs font-bold flex-shrink-0">{u.grit_score} pts</div>
                </div>
              ))}
            </div>
          )}

          {/* Secção Provas */}
          {grouped.post.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">🔥 Provas</span>
              </div>
              {grouped.post.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-400/10 flex items-center justify-center flex-shrink-0 text-base">
                    🔥
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.title || 'Sem título'}</p>
                    {p.description && (
                      <p className="text-gray-500 text-xs truncate">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Secção Labs */}
          {grouped.lab.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">🧪 Labs</span>
              </div>
              {grouped.lab.map((l) => (
                <div
                  key={l.id}
                  onClick={() => handleSelect(l)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-400/10 flex items-center justify-center flex-shrink-0 text-base">
                    🧪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{l.title || 'Sem título'}</p>
                    {l.description && (
                      <p className="text-gray-500 text-xs truncate">{l.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    l.status === 'active'    ? 'bg-green-400/10 text-green-400' :
                    l.status === 'completed' ? 'bg-[#4F8EF7]/10 text-[#4F8EF7]' :
                                               'bg-white/5 text-gray-400'
                  }`}>
                    {l.status === 'active' ? 'Em curso' : l.status === 'completed' ? 'Concluído' : 'Pausado'}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}