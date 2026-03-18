'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
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
  profiles?: { full_name: string };
}

const statusConfig = {
  active: { label: 'Em curso', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  completed: { label: 'Concluído', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10 border-[#4F8EF7]/20' },
  paused: { label: 'Pausado', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
};

export default function LabsPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function fetchLabs() {
    const { data, error } = await supabase
      .from('labs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (!error && data) setLabs(data);
    setLoading(false);
  }

  useEffect(() => { fetchLabs(); }, []);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl">

        {/* Header */}
        <div className="mb-6 pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🧪 Labs</h1>
            <p className="text-gray-400 text-sm mt-1">Os teus projectos em construção</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all"
          >
            + Novo Lab
          </button>
        </div>

        {/* Grid de Labs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🧪</p>
            <p className="text-white font-semibold mb-2">Nenhum lab ainda</p>
            <p className="text-gray-400 text-sm mb-6">Cria o teu primeiro projecto!</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-semibold py-3 px-6 rounded-full"
            >
              + Criar Lab
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labs.map((lab) => {
              const status = statusConfig[lab.status] || statusConfig.active;
              return (
                <Link
                  key={lab.id}
                  href={`/labs/${lab.id}`}
                  className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#4F8EF7]/40 transition-all duration-200 group"
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4F8EF7]/20 to-[#7C3AED]/20 flex items-center justify-center text-lg">
                      🧪
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold mb-1 group-hover:text-[#4F8EF7] transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{lab.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{lab.profiles?.full_name || 'Tu'}</span>
                    <span>{new Date(lab.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Criar Lab */}
      {showModal && (
        <CreateLabModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchLabs(); }}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
}

function CreateLabModal({ onClose, onCreated, userId }: {
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!title.trim()) { setError('O título é obrigatório.'); return; }
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('labs')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        status: 'active',
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Novo Lab</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors"
              placeholder="Ex: MVP da GRIT..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors resize-none"
              placeholder="O que estás a construir?"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'A criar...' : 'Criar Lab'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}