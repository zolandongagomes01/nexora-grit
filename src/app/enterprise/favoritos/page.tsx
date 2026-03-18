'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FavoriteTalent {
  talent_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    grit_score: number;
    bio: string | null;
  };
}

function getRank(score: number) {
  if (score >= 800) return { label: 'Elite', color: 'text-yellow-400 bg-yellow-400/10' };
  if (score >= 500) return { label: 'Top 10%', color: 'text-purple-400 bg-purple-400/10' };
  if (score >= 200) return { label: 'Top 25%', color: 'text-[#4F8EF7] bg-[#4F8EF7]/10' };
  return { label: 'Iniciante', color: 'text-gray-400 bg-white/5' };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function FavoritosPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTalent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    setLoading(true);
    const { data } = await supabase
      .from('company_favorites')
      .select('talent_id, created_at, profiles!talent_id(id, full_name, username, grit_score, bio)')
      .eq('company_id', user!.id)
      .order('created_at', { ascending: false });

    setFavorites((data as unknown as FavoriteTalent[]) || []);
    setLoading(false);
  }

  async function removeFavorite(talentId: string) {
    await supabase
      .from('company_favorites')
      .delete()
      .eq('company_id', user!.id)
      .eq('talent_id', talentId);
    setFavorites(prev => prev.filter(f => f.talent_id !== talentId));
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl">

        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/enterprise" className="text-gray-500 hover:text-white text-sm transition-colors">← Voltar</Link>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⭐ Talentos Favoritos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {favorites.length} talento{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-white font-semibold mb-2">Ainda sem favoritos</p>
            <p className="text-gray-400 text-sm mb-6">
              Explora os talentos e clica na estrela para guardar os que te interessam
            </p>
            <Link
              href="/enterprise/talentos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-semibold py-3 px-6 rounded-full"
            >
              Explorar Talentos →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => {
              const p = fav.profiles;
              const rank = getRank(p.grit_score);
              return (
                <div
                  key={fav.talent_id}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#4F8EF7]/30 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(p.full_name || p.username || 'U')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{p.full_name || p.username}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rank.color}`}>
                        {rank.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">@{p.username}</p>
                    {p.bio && (
                      <p className="text-gray-500 text-xs mt-1 truncate">{p.bio}</p>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#4F8EF7] font-bold text-lg">{p.grit_score}</div>
                    <div className="text-gray-500 text-xs">score</div>
                  </div>

                  {/* Acções */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/enterprise/talento/${p.id}`}
                      className="px-3 py-1.5 bg-[#4F8EF7]/10 text-[#4F8EF7] text-xs rounded-lg hover:bg-[#4F8EF7]/20 transition-colors font-medium"
                    >
                      Ver perfil
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.talent_id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-400/10 hover:text-red-400 text-yellow-400 transition-colors text-base"
                      title="Remover dos favoritos"
                    >
                      ⭐
                    </button>
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