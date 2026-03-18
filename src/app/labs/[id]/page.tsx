'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Lab {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  user_id: string;
}

interface Milestone {
  id: string;
  lab_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
}

const statusConfig = {
  active: { label: 'Em curso', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  completed: { label: 'Concluído', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10 border-[#4F8EF7]/20' },
  paused: { label: 'Pausado', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
};

export default function LabDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [lab, setLab] = useState<Lab | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLab();
      fetchMilestones();
      fetchLinkedPosts();
    }
  }, [id]);

  async function fetchLab() {
    const { data } = await supabase
      .from('labs')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setLab(data);
    setLoading(false);
  }

  async function fetchMilestones() {
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('lab_id', id)
      .order('created_at', { ascending: true });
    if (data) setMilestones(data);
  }

  async function fetchLinkedPosts() {
    const { data } = await supabase
      .from('posts')
      .select('id, title, description, created_at, tags')
      .eq('lab_id', id)
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function addMilestone() {
    if (!newMilestone.trim() || !user) return;
    setAddingMilestone(true);
    const { data } = await supabase
      .from('milestones')
      .insert({ lab_id: id, title: newMilestone.trim(), completed: false })
      .select()
      .single();
    if (data) setMilestones(prev => [...prev, data]);
    setNewMilestone('');
    setAddingMilestone(false);
  }

  async function toggleMilestone(milestone: Milestone) {
    const { data } = await supabase
      .from('milestones')
      .update({ completed: !milestone.completed })
      .eq('id', milestone.id)
      .select()
      .single();
    if (data) setMilestones(prev => prev.map(m => m.id === data.id ? data : m));
  }

  async function changeStatus(status: 'active' | 'completed' | 'paused') {
    await supabase.from('labs').update({ status }).eq('id', id);
    if (lab) setLab({ ...lab, status });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <p className="text-gray-400">Lab não encontrado.</p>
      </div>
    );
  }

  const status = statusConfig[lab.status] || statusConfig.active;
  const completedCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-3xl">

        {/* Header */}
        <div className="mb-6 pt-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm">
            ← Voltar
          </button>
        </div>

        {/* Info do Lab */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold text-white">{lab.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full border ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          {lab.description && (
            <p className="text-gray-400 text-sm mb-4">{lab.description}</p>
          )}

          {/* Mudar status */}
          {user?.id === lab.user_id && (
            <div className="flex gap-2 flex-wrap">
              {(['active', 'paused', 'completed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    lab.status === s
                      ? statusConfig[s].bg + ' ' + statusConfig[s].color
                      : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Milestones + Progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">🎯 Milestones</h2>
            <span className="text-gray-400 text-xs">{completedCount}/{milestones.length}</span>
          </div>

          {/* Barra de progresso */}
          {milestones.length > 0 && (
            <div className="mb-4">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">{Math.round(progress)}% concluído</p>
            </div>
          )}

          {/* Lista de milestones */}
          <div className="space-y-2 mb-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-3 group">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggleMilestone(milestone)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      milestone.completed
                        ? 'bg-[#4F8EF7] border-[#4F8EF7]'
                        : 'border-white/20 hover:border-[#4F8EF7]'
                    }`}
                  >
                    {milestone.completed && <span className="text-white text-xs">✓</span>}
                  </button>
                  {index < milestones.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${milestone.completed ? 'bg-[#4F8EF7]/40' : 'bg-white/10'}`} />
                  )}
                </div>
                <span className={`text-sm flex-1 ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>

          {/* Adicionar milestone */}
          {user?.id === lab.user_id && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMilestone()}
                placeholder="Adicionar milestone..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors"
              />
              <button
                onClick={addMilestone}
                disabled={addingMilestone}
                className="px-4 py-2 bg-[#4F8EF7] text-white text-sm rounded-lg hover:bg-[#3D7AE6] transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Posts ligados */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">📝 Provas ligadas</h2>
            <Link
              href={`/post?lab_id=${lab.id}`}
              className="text-xs text-[#4F8EF7] hover:underline"
            >
              + Adicionar prova
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma prova ligada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-white text-sm font-medium mb-1">{post.title}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{post.description}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(post.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}