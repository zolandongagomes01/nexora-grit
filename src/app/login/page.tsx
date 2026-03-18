'use client';

import { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Tentando fazer login com:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      console.log('✅ Login bem-sucedido:', data);

      // Redirecionar para onboarding após login bem-sucedido
      router.push('/onboarding');
    } catch (error: any) {
      console.error('❌ Erro completo no login:', error);
      setError(error.message || 'Ocorreu um erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/10 to-[#7C3AED]/10" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 rounded-full px-4 py-2 text-sm text-[#4F8EF7] mb-6">
            <span>Station F</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-400">
            Entra na tua conta para continuar
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8EF7] focus:border-transparent transition-all duration-200"
                  placeholder="o.teu.email@exemplo.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8EF7] focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 bg-white/5 border-white/10 rounded focus:ring-[#4F8EF7] focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                  Lembrar-me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-[#4F8EF7] hover:text-[#3D7AE6] transition-colors"
              >
                Esqueceste a password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F8EF7] hover:bg-[#3D7AE6] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4F8EF7]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
          <p className="text-gray-400">
            Ainda não tens conta?{' '}
            <Link 
              href="/signup" 
              className="text-[#4F8EF7] hover:text-[#3D7AE6] font-medium transition-colors"
            >
              Regista-te aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
