'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Talent {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  grit_score: number;
  post_count?: number;
  lab_count?: number;
}

export default function TalentosPage() {
  const [talentos, setTalentos] = useState<Talent[]>([]);
  const [filtered, setFiltered] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  useEffect(() => {
    fetchTalentos();
  }, []);

  useEffect(() => {
    let result = [...talentos];
    if (search) {
      result = result.filter(t =>
        t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.username?.toLowerCase().includes(search.toLowerCase()) ||
        t.bio?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (minScore > 0) {
      result = result.filter(t => (t.grit_score || 0) >= minScore);
    }
    if (sortBy === 'score') {
      result.sort((a, b) => (b.grit_score || 0) - (a.grit_score || 0));
    } else {
      result.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    }
    setFiltered(result);
  }, [talentos, search, minScore, sortBy]);

  async function fetchTalentos() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('grit_score', { ascending: false });

    if (!profiles) { setLoading(false); return; }

    const talentosComStats = await Promise.all(
      profiles.map(async (p) => {
        const [postsRes, labsRes] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', p.id),
          supabase.from('labs').select('id', { count: 'exact' }).eq('user_id', p.id),
        ]);
        return {
          ...p,
          post_count: postsRes.count || 0,
          lab_count: labsRes.count || 0,
        };
      })
    );

    setTalentos(talentosComStats);
    setLoading(false);
  }

  function getRankLabel(score: number) {
    if (score >= 800) return { label: 'Elite', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' };
    if (score >= 500) return { label: 'Top 10%', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10 border-[#4F8EF7]/20' };
    if (score >= 200) return { label: 'Top 25%', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' };
    return { label: 'Iniciante', color: 'text-gray-400', bg: 'bg-white/5 border-white/10' };
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl">

        {/* Header */}
        <div className="mb-6 pt-4 flex items-center gap-3">
          <Link href="/enterprise" className="text-gray-400 hover:text-white text-sm">← Voltar</Link>
          <h1 className="text-xl font-bold text-white">🔍 Procurar Talentos</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Procurar por nome, username ou bio..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors text-sm"
          />

          <div className="flex gap-3 flex-wrap">
            {/* Score mínimo */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Score mínimo:</span>
              <select
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#4F8EF7]"
              >
                <option value={0}>Todos</option>
                <option value={100}>100+</option>
                <option value={200}>200+</option>
                <option value={500}>500+</option>
                <option value={800}>800+ (Elite)</option>
              </select>
            </div>

            {/* Ordenar */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Ordenar:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSortBy('score')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${sortBy === 'score' ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  Score
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${sortBy === 'name' ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  Nome
                </button>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs">{filtered.length} talento(s) encontrado(s)</p>
        </div>

        {/* Lista de talentos */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white font-semibold mb-2">Nenhum talento encontrado</p>
            <p className="text-gray-400 text-sm">Tenta outros filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((talento, index) => {
              const rank = getRankLabel(talento.grit_score || 0);
              const initials = (talento.full_name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

              return (
                <div
                  key={talento.id}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#4F8EF7]/30 transition-all"
                >
                  {/* Rank number */}
                  <div className="text-gray-600 text-sm font-bold w-5 text-center flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-semibold truncate">
                        {talento.full_name || 'Utilizador'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${rank.bg} ${rank.color}`}>
                        {rank.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">@{talento.username}</p>
                    {talento.bio && (
                      <p className="text-gray-500 text-xs truncate mt-0.5">{talento.bio}</p>
                    )}
                    <div className="flex gap-3 mt-1">
                      <span className="text-gray-600 text-xs">🔥 {talento.post_count} provas</span>
                      <span className="text-gray-600 text-xs">🧪 {talento.lab_count} labs</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#4F8EF7] font-black text-lg">{talento.grit_score || 0}</div>
                    <div className="text-gray-500 text-xs">score</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}