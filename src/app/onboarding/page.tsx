'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Zap, Shield, TrendingUp, Sparkles, BarChart3, Rocket } from 'lucide-react';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleNextSlide = () => {
    if (currentSlide < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleFinish = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Vai redirecionar
  }

  // Slide 1: Welcome
  const slide1 = (
    <>
      {/* Animated Icons */}
      <div className="flex justify-center items-center gap-8 mb-12">
        <div className="animate-pulse">
          <Zap className="w-12 h-12 text-[#4F8EF7]" />
        </div>
        <div className="animate-pulse delay-75">
          <Shield className="w-12 h-12 text-[#7C3AED]" />
        </div>
        <div className="animate-pulse delay-150">
          <TrendingUp className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Welcome Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
          Bem-vindo ao teu
        </span>
        <br />
        <span className="text-white">Laboratório de Evolução</span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
        <span className="text-[#4F8EF7] font-semibold">A GRIT</span> não é sobre o que dizes que sabes. 
        <br />
        É sobre o que{' '}
        <span className="text-[#7C3AED] font-semibold">provas que constróis</span>.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#4F8EF7]/40 transition-all duration-300">
          <div className="w-12 h-12 bg-[#4F8EF7]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-[#4F8EF7]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Execução Real</h3>
          <p className="text-gray-400 text-sm">Provas concretas do que sabes fazer</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#7C3AED]/40 transition-all duration-300">
          <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Validação IA</h3>
          <p className="text-gray-400 text-sm">Reconhecimento automatizado do teu valor</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/40 transition-all duration-300">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Grit Score</h3>
          <p className="text-gray-400 text-sm">A tua reputação baseada em resultados</p>
        </div>
      </div>
    </>
  );

  // Slide 2: Grit Score
  const slide2 = (
    <>
      {/* Grit Score Icon */}
      <div className="flex justify-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] rounded-full flex items-center justify-center animate-pulse">
          <BarChart3 className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
          Grit Score
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
        A tua competência provada por{' '}
        <span className="text-[#4F8EF7] font-semibold">factos e IA</span>, 
        <br />
        não por{' '}
        <span className="text-[#7C3AED] font-semibold">conexões</span>.
      </p>

      {/* Score Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-4xl font-bold text-[#4F8EF7] mb-2">0 → 1000</div>
          <p className="text-gray-400">Escala de competência real</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-[#7C3AED] mb-2">IA Validado</div>
          <p className="text-gray-400">Análise automática do teu trabalho</p>
        </div>
      </div>

      {/* Score Progress */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">O teu Grit Score</span>
            <span className="text-[#4F8EF7] font-bold">0</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] h-3 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Completa projetos para aumentar o teu score</p>
        </div>
      </div>
    </>
  );

  // Slide 3: Ready to Start
  const slide3 = (
    <>
      {/* Rocket Icon */}
      <div className="flex justify-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] rounded-full flex items-center justify-center animate-bounce">
          <Rocket className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        <span className="text-white">Pronto para o</span>
        <br />
        <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
          próximo nível?
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
        Vamos configurar o teu perfil e{' '}
        <span className="text-[#4F8EF7] font-semibold">começar a tua jornada</span>.
      </p>

      {/* Ready Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[#4F8EF7] mb-2">🚀</div>
          <h3 className="text-white font-semibold mb-2">Começa Agora</h3>
          <p className="text-gray-400 text-sm">Sem demoras, sem burocracia</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[#7C3AED] mb-2">🎯</div>
          <h3 className="text-white font-semibold mb-2">Prova Real</h3>
          <p className="text-gray-400 text-sm">Mostra o que sabes fazer</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">⭐</div>
          <h3 className="text-white font-semibold mb-2">Reconhecimento</h3>
          <p className="text-gray-400 text-sm">Sê visto pela elite tech</p>
        </div>
      </div>

      {/* User Welcome */}
      <div className="max-w-md mx-auto mb-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
        <p className="text-gray-300 text-center">
          Bem-vindo, <span className="text-white font-semibold">{user.user_metadata?.full_name || user.email}</span>! 
          <br />
          <span className="text-sm text-gray-400">Estás pronto para mostrar o teu verdadeiro valor?</span>
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/10 to-[#7C3AED]/10" />
      
      <div className={`relative z-10 max-w-4xl mx-auto text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Slide Content */}
        {currentSlide === 1 && slide1}
        {currentSlide === 2 && slide2}
        {currentSlide === 3 && slide3}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {currentSlide < 3 ? (
            <button
              onClick={handleNextSlide}
              className="group bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] hover:from-[#3D7AE6] hover:to-[#6D28D9] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4F8EF7]/25 flex items-center justify-center gap-3 text-lg"
            >
              Próximo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="group bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] hover:from-[#3D7AE6] hover:to-[#6D28D9] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4F8EF7]/25 flex items-center justify-center gap-3 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Finalizar e ir para o Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors font-medium"
          >
            Pular tour
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {[1, 2, 3].map((slide) => (
            <div
              key={slide}
              className={`h-2 rounded-full transition-all duration-300 ${
                slide === currentSlide 
                  ? 'w-8 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED]' 
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
