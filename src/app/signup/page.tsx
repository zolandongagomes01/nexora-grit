'use client';

import { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, Check, Building2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'talent' | 'company'>('talent');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            account_type: accountType,
          }
        }
      });

      if (error) throw error;

      // Tenta login automático
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // Se der "email not confirmed", ignora e redireciona
      if (loginError) {
        if (loginError.message?.toLowerCase().includes('not confirmed') ||
            loginError.message?.toLowerCase().includes('email not confirmed')) {
          if (accountType === 'company') {
            window.location.href = '/enterprise';
          } else {
            window.location.href = '/onboarding';
          }
          return;
        }
        throw loginError;
      }

      if (loginData.user) {
        await supabase.from('profiles').upsert({
          id: loginData.user.id,
          full_name: formData.fullName,
          username: formData.email.split('@')[0],
          account_type: accountType,
        }, { onConflict: 'id' });
      }

      if (accountType === 'company') {
        window.location.href = '/enterprise';
      } else {
        window.location.href = '/onboarding';
      }

    } catch (error: any) {
      const msg = error.message?.toLowerCase() || '';

      if (msg.includes('rate limit') || msg.includes('email rate')) {
        setError('Demasiadas tentativas. Aguarda alguns minutos e tenta novamente com um email diferente.');
      } else if (msg.includes('already registered') || msg.includes('user already')) {
        setError('Este email já tem uma conta. Faz login em vez de criar conta nova.');
      } else if (msg.includes('invalid email')) {
        setError('Email inválido. Verifica o endereço e tenta novamente.');
      } else if (msg.includes('password')) {
        setError('Password fraca. Usa pelo menos 8 caracteres com maiúscula, minúscula e número.');
      } else {
        setError(error.message || 'Ocorreu um erro ao criar a conta. Tenta novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
    { regex: /[A-Z]/, text: 'Uma letra maiúscula' },
    { regex: /[a-z]/, text: 'Uma letra minúscula' },
    { regex: /[0-9]/, text: 'Um número' }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-black text-sm">G</div>
              <span className="text-white font-bold text-xl">GRIT</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cria a tua conta</h1>
            <p className="text-gray-400">Proof of Work. Not Words.</p>
          </div>

          {/* Escolha tipo de conta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('talent')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                accountType === 'talent'
                  ? 'bg-[#4F8EF7]/15 border-[#4F8EF7] text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Briefcase className={`w-6 h-6 ${accountType === 'talent' ? 'text-[#4F8EF7]' : 'text-gray-400'}`} />
              <span className="text-sm font-semibold">Talento</span>
              <span className="text-xs text-center leading-tight opacity-70">Partilha o teu trabalho</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('company')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                accountType === 'company'
                  ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Building2 className={`w-6 h-6 ${accountType === 'company' ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
              <span className="text-sm font-semibold">Empresa</span>
              <span className="text-xs text-center leading-tight opacity-70">Recruta talentos</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {accountType === 'company' ? 'Nome da Empresa' : 'Nome Completo'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {accountType === 'company'
                      ? <Building2 className="h-5 w-5 text-gray-400" />
                      : <User className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8EF7] focus:border-transparent transition-all"
                    placeholder={accountType === 'company' ? 'TechCorp Angola' : 'Nome completo'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8EF7] focus:border-transparent transition-all"
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8EF7] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword
                      ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    }
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-3 space-y-1.5">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check className={`w-3 h-3 ${req.regex.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`} />
                        <span className={req.regex.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Termos */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 bg-white/5 border-white/10 rounded"
                />
                <label className="text-sm text-gray-300 leading-relaxed">
                  Aceito os{' '}
                  <button type="button" className="text-[#4F8EF7] hover:underline">Termos de Serviço</button>
                  {' '}e a{' '}
                  <button type="button" className="text-[#4F8EF7] hover:underline">Política de Privacidade</button>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  accountType === 'company'
                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                    : 'bg-[#4F8EF7] hover:bg-[#3D7AE6]'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {accountType === 'company' ? 'Criar Conta Empresa' : 'Criar Conta Talento'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Já tens conta?{' '}
              <Link href="/login" className="text-[#4F8EF7] hover:text-[#3D7AE6] font-medium">
                Faz login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/20 to-[#7C3AED]/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] bg-clip-text text-transparent">
                Proof of Work.
              </span>
              <br />
              <span className="text-white">Not Words.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              O fim dos currículos estáticos. Mostra a tua execução real, validada por IA.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Validação por IA', desc: 'Provas reais do teu trabalho analisadas por inteligência artificial', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/20' },
                { title: 'Grit Score', desc: 'Reputação construída com base em execuções reais, não em promessas', color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/20' },
                { title: 'Recrutamento Real', desc: 'Empresas encontram talentos verificados pelo trabalho que fazem', color: 'text-white', bg: 'bg-white/20' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Check className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}