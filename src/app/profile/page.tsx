'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  grit_score: number;
  avatar_url: string | null;
}

interface Stats {
  posts: number;
  labs: number;
  milestones: number;
}

function GritScoreRing({ score }: { score: number }) {
  const max = 1000;
  const pct = Math.min(score / max, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke="url(#gritGrad)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gritGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-[#4F8EF7]">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0, labs: 0, milestones: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchRecentPosts();
    }
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    if (data) {
      setProfile(data);
      setBioInput(data.bio || '');
    }
    setLoading(false);
  }

  async function fetchStats() {
    const [postsRes, labsRes, milestonesRes] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', user!.id),
      supabase.from('labs').select('id', { count: 'exact' }).eq('user_id', user!.id),
      supabase.from('milestones').select('id', { count: 'exact' }).eq('completed', true),
    ]);
    setStats({
      posts: postsRes.count || 0,
      labs: labsRes.count || 0,
      milestones: milestonesRes.count || 0,
    });
  }

  async function fetchRecentPosts() {
    const { data } = await supabase
      .from('posts')
      .select('id, title, created_at, tags')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecentPosts(data);
  }

  async function saveBio() {
    await supabase.from('profiles').update({ bio: bioInput }).eq('id', user!.id);
    if (profile) setProfile({ ...profile, bio: bioInput });
    setEditingBio(false);
  }

  // Calcular Grit Score baseado em actividade real
  function calcGritScore() {
    return Math.min((stats.posts * 50) + (stats.labs * 80) + (stats.milestones * 20), 1000);
  }

  const gritScore = calcGritScore();
  const rank = gritScore >= 800 ? 'Elite' : gritScore >= 500 ? 'Top 10%' : gritScore >= 200 ? 'Top 25%' : 'Iniciante';
  const rankColor = gritScore >= 800 ? 'text-yellow-400' : gritScore >= 500 ? 'text-[#4F8EF7]' : 'text-green-400';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Utilizador';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-3xl">

        {/* Header do perfil */}
        <div className="mb-6 pt-4 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{displayName}</h1>
              <p className="text-gray-400 text-sm truncate">@{profile?.username || user?.email?.split('@')[0]}</p>
              <span className={`text-xs font-semibold ${rankColor}`}>{rank}</span>
            </div>
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-red-400 text-xs transition-colors"
            >
              Sair
            </button>
          </div>

          {/* Bio */}
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                rows={2}
                maxLength={160}
                className="w-full px-3 py-2 bg-white/5 border border-[#4F8EF7]/40 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none resize-none"
                placeholder="Escreve uma bio curta..."
              />
              <div className="flex gap-2">
                <button onClick={saveBio} className="text-xs px-3 py-1 bg-[#4F8EF7] text-white rounded-lg">Guardar</button>
                <button onClick={() => setEditingBio(false)} className="text-xs px-3 py-1 border border-white/10 text-gray-400 rounded-lg">Cancelar</button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingBio(true)}
              className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 transition-colors"
            >
              {profile?.bio || <span className="text-gray-600 italic">Clica para adicionar uma bio...</span>}
            </div>
          )}
        </div>

        {/* Grit Score + Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center">
            <GritScoreRing score={gritScore} />
            <p className="text-gray-400 text-xs mt-2 text-center">Grit Score</p>
          </div>

          {/* Stats */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-[#4F8EF7]">{stats.posts}</div>
              <div className="text-xs text-gray-400">Provas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-[#7C3AED]">{stats.labs}</div>
              <div className="text-xs text-gray-400">Labs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{stats.milestones}</div>
              <div className="text-xs text-gray-400">Milestones</div>
            </div>
          </div>
        </div>

        {/* Dimensões de trabalho */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">⚡ Dimensões de Trabalho</h2>
          <div className="space-y-3">
            <SkillBar label="Consistência" value={Math.min(stats.posts * 20, 100)} />
            <SkillBar label="Execução" value={Math.min(stats.milestones * 15, 100)} />
            <SkillBar label="Experimentação" value={Math.min(stats.labs * 30, 100)} />
            <SkillBar label="Documentação" value={Math.min(stats.posts * 15, 100)} />
          </div>
        </div>

        {/* Selos */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">🏅 Selos</h2>
          <div className="flex flex-wrap gap-3">
            {stats.posts >= 1 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 rounded-full">
                <span>🔥</span>
                <span className="text-[#4F8EF7] text-xs font-medium">Primeira Prova</span>
              </div>
            )}
            {stats.labs >= 1 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full">
                <span>🧪</span>
                <span className="text-[#7C3AED] text-xs font-medium">Laboratório Aberto</span>
              </div>
            )}
            {stats.milestones >= 3 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-400/10 border border-green-400/20 rounded-full">
                <span>🎯</span>
                <span className="text-green-400 text-xs font-medium">Executor</span>
              </div>
            )}
            {gritScore >= 200 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                <span>⭐</span>
                <span className="text-yellow-400 text-xs font-medium">Em Ascensão</span>
              </div>
            )}
            {stats.posts === 0 && stats.labs === 0 && (
              <p className="text-gray-600 text-sm">Completa acções para ganhar selos!</p>
            )}
          </div>
        </div>

        {/* Posts recentes */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">📝 Provas Recentes</h2>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhuma prova ainda</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-[#4F8EF7]/20 flex items-center justify-center text-[#4F8EF7] text-xs font-bold flex-shrink-0">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{post.title}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(post.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}