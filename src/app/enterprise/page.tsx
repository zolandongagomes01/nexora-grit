'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TopTalento {
  id: string;
  full_name: string;
  username: string;
  grit_score: number;
}

interface DashboardStats {
  totalTalentos: number;
  labsActivos: number;
  totalProvas: number;
  scoreMedio: number;
}

export default function EnterprisePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTalentos: 0,
    labsActivos: 0,
    totalProvas: 0,
    scoreMedio: 0,
  });
  const [topTalentos, setTopTalentos] = useState<TopTalento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Total de talentos (profiles com grit_score > 0)
        const { count: totalTalentos } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('grit_score', 0);

        // Labs activos
        const { count: labsActivos } = await supabase
          .from('labs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Total de provas (posts)
        const { count: totalProvas } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        // Score médio — busca todos os scores e calcula
        const { data: scoreData } = await supabase
          .from('profiles')
          .select('grit_score')
          .gt('grit_score', 0);

        const scoreMedio =
          scoreData && scoreData.length > 0
            ? Math.round(
                scoreData.reduce((acc, p) => acc + (p.grit_score || 0), 0) /
                  scoreData.length
              )
            : 0;

        // Top 3 talentos por grit_score
        const { data: topData } = await supabase
          .from('profiles')
          .select('id, full_name, username, grit_score')
          .order('grit_score', { ascending: false })
          .limit(3);

        setStats({
          totalTalentos: totalTalentos || 0,
          labsActivos: labsActivos || 0,
          totalProvas: totalProvas || 0,
          scoreMedio,
        });
        setTopTalentos(topData || []);
      } catch (err) {
        console.error('Erro ao carregar dashboard enterprise:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Iniciais do nome
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl">

        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 rounded-full text-[#4F8EF7] text-xs font-medium mb-3">
            🏢 Enterprise
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard de Recrutamento</h1>
          <p className="text-gray-400 text-sm">Encontra talentos verificados pela comunidade GRIT</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Talentos', value: loading ? '—' : String(stats.totalTalentos), icon: '👤', color: 'text-[#4F8EF7]' },
            { label: 'Labs Activos', value: loading ? '—' : String(stats.labsActivos), icon: '🧪', color: 'text-[#7C3AED]' },
            { label: 'Provas', value: loading ? '—' : String(stats.totalProvas), icon: '🔥', color: 'text-orange-400' },
            { label: 'Score Médio', value: loading ? '—' : String(stats.scoreMedio), icon: '⚡', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Acções principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/enterprise/talentos"
            className="p-6 bg-gradient-to-br from-[#4F8EF7]/10 to-[#7C3AED]/10 border border-[#4F8EF7]/20 rounded-xl hover:border-[#4F8EF7]/50 transition-all group"
          >
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-white font-bold mb-1 group-hover:text-[#4F8EF7] transition-colors">
              Procurar Talentos
            </h3>
            <p className="text-gray-400 text-sm">Filtra por skills, score e localização</p>
            <div className="mt-4 text-[#4F8EF7] text-sm font-medium">Ver talentos →</div>
          </Link>

          <div className="p-6 bg-white/5 border border-white/10 rounded-xl opacity-60">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-white font-bold mb-1">Mensagens</h3>
            <p className="text-gray-400 text-sm">Contacta talentos directamente</p>
            <div className="mt-4 text-gray-500 text-sm">Em breve...</div>
          </div>
        </div>

        {/* Top talentos — dados reais */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">🏆 Top Talentos</h2>
            <Link href="/enterprise/talentos" className="text-[#4F8EF7] text-xs hover:underline">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="text-gray-500 text-sm text-center py-4">A carregar...</div>
          ) : topTalentos.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">Nenhum talento encontrado</div>
          ) : (
            <div className="space-y-3">
              {topTalentos.map((talento) => (
                <Link
                  key={talento.id}
                  href={`/enterprise/talento/${talento.id}`}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(talento.full_name || talento.username || 'U')}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">
                      {talento.full_name || talento.username}
                    </p>
                    <p className="text-gray-400 text-xs">@{talento.username}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#4F8EF7] font-bold text-sm">{talento.grit_score}</div>
                    <div className="text-gray-500 text-xs">Grit Score</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}