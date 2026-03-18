'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function GritScoreRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = Math.min(score / 1000, 1) * circ;
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke="url(#g2)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <div className="text-2xl font-black text-white">{score}</div>
        <div className="text-xs text-gray-400">GRIT</div>
      </div>
    </div>
  );
}

export default function TalentoPerfilPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  async function fetchAll() {
    const [profileRes, postsRes, labsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('posts').select('id, title, description, created_at, tags').eq('user_id', id).order('created_at', { ascending: false }).limit(5),
      supabase.from('labs').select('id, title, status, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (labsRes.data) setLabs(labsRes.data);

    // Verifica se já está nos favoritos
    if (user) {
      const { data: favData } = await supabase
        .from('company_favorites')
        .select('id')
        .eq('company_id', user.id)
        .eq('talent_id', id)
        .single();
      setIsFavorited(!!favData);
    }

    setLoading(false);
  }

  async function toggleFavorite() {
    if (!user || favLoading) return;
    setFavLoading(true);

    if (isFavorited) {
      await supabase
        .from('company_favorites')
        .delete()
        .eq('company_id', user.id)
        .eq('talent_id', id);
      setIsFavorited(false);
    } else {
      await supabase
        .from('company_favorites')
        .insert({ company_id: user.id, talent_id: id });
      setIsFavorited(true);
    }

    setFavLoading(false);
  }

  function getRank(score: number) {
    if (score >= 800) return { label: 'Elite', color: 'text-yellow-400' };
    if (score >= 500) return { label: 'Top 10%', color: 'text-[#4F8EF7]' };
    if (score >= 200) return { label: 'Top 25%', color: 'text-green-400' };
    return { label: 'Iniciante', color: 'text-gray-400' };
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <p className="text-gray-400">Talento não encontrado.</p>
    </div>
  );

  const rank = getRank(profile.grit_score || 0);
  const initials = (profile.full_name || 'U').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-3xl">

        {/* Header */}
        <div className="mb-6 pt-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm transition-colors">← Voltar</button>
          <span className="text-gray-600 text-sm">Vista Empresa</span>
        </div>

        {/* Perfil header */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white">{profile.full_name}</h1>
              <p className="text-gray-400 text-sm">@{profile.username}</p>
              <span className={`text-xs font-semibold ${rank.color}`}>{rank.label}</span>
              {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
            </div>
          </div>

          {/* Botões acção */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
              💬 Contactar
            </button>
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                isFavorited
                  ? 'bg-yellow-400/15 border-yellow-400/40 text-yellow-400 hover:bg-red-400/10 hover:border-red-400/40 hover:text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-yellow-400/10 hover:border-yellow-400/30 hover:text-yellow-400'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {favLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isFavorited ? '⭐' : '☆'}</span>
              )}
              {isFavorited ? 'Guardado' : 'Favoritar'}
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center">
            <GritScoreRing score={profile.grit_score || 0} />
            <p className="text-gray-400 text-xs mt-2">Grit Score</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-[#4F8EF7]">{posts.length}</div>
              <div className="text-xs text-gray-400">Provas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-[#7C3AED]">{labs.length}</div>
              <div className="text-xs text-gray-400">Labs</div>
            </div>
          </div>
        </div>

        {/* Provas recentes */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h2 className="text-white font-semibold mb-4">🔥 Provas de Trabalho</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhuma prova ainda</p>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-white text-sm font-medium mb-1">{post.title}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{post.description}</p>
                  {post.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {post.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-[#4F8EF7]/10 text-[#4F8EF7] rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Labs */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">🧪 Labs</h2>
          {labs.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum lab ainda</p>
          ) : (
            <div className="space-y-2">
              {labs.map(lab => (
                <div key={lab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <p className="text-white text-sm">{lab.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    lab.status === 'completed' ? 'text-[#4F8EF7] bg-[#4F8EF7]/10 border-[#4F8EF7]/20' :
                    lab.status === 'active'    ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                                                 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                  }`}>
                    {lab.status === 'completed' ? 'Concluído' : lab.status === 'active' ? 'Em curso' : 'Pausado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}