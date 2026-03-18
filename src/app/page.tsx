'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, TrendingUp, Shield, Zap, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white overflow-hidden">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/10 to-[#7C3AED]/10" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-black text-base">G</div>
            <span className="text-white font-bold text-2xl tracking-tight">GRIT</span>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 rounded-full px-4 py-2 text-sm text-[#4F8EF7]">
              <Zap className="w-4 h-4" />
              <span>Nova Era de Recrutamento Tech</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
              Proof of Work.
            </span>
            <br />
            <span className="text-white">Not Words.</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            O fim dos currículos estáticos. Mostra a tua execução real, validada por IA. O teu valor medido pelo que constróis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#4F8EF7] hover:bg-[#3D7AE6] text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4F8EF7]/25 flex items-center justify-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4F8EF7]">100%</div>
              <div className="text-sm text-gray-400">Proof of Work</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7C3AED]">IA</div>
              <div className="text-sm text-gray-400">Verificado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">CVs necessários</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
                Como funciona o GRIT
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Três pilares para mostrar o teu verdadeiro valor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#4F8EF7]/10 to-transparent border border-[#4F8EF7]/20 rounded-2xl p-8 hover:border-[#4F8EF7]/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-[#4F8EF7]/20 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-[#4F8EF7]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Grit Labs</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Documenta os teus projectos reais com milestones, provas e resultados concretos.
              </p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#4F8EF7] rounded-full" />Projectos com milestones</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#4F8EF7] rounded-full" />Timeline de progresso</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#4F8EF7] rounded-full" />Provas ligadas ao projecto</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#7C3AED]/10 to-transparent border border-[#7C3AED]/20 rounded-2xl p-8 hover:border-[#7C3AED]/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-[#7C3AED]/20 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">IA Verification</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                As tuas provas de trabalho são analisadas por IA para máxima credibilidade.
              </p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#7C3AED] rounded-full" />Validação automática</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#7C3AED] rounded-full" />Score de qualidade</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#7C3AED] rounded-full" />Credibilidade garantida</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Grit Score</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                A tua reputação construída com base em execuções reais, não em palavras.
              </p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" />Score baseado em acções</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" />Ranking entre talentos</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" />Visível para empresas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#4F8EF7]/20 to-[#7C3AED]/20 rounded-3xl p-12 border border-[#4F8EF7]/30">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Pronto para mostrar o teu valor real?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Junta-te à comunidade GRIT e começa a construir a tua reputação hoje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-[#4F8EF7] hover:bg-[#3D7AE6] text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Começar Gratuitamente
              </Link>
              <Link
                href="/signup?type=company"
                className="border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                Sou uma Empresa
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}