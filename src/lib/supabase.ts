import { createClient } from '@supabase/supabase-js'

// Ler variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: mostrar variáveis no console
console.log('🔍 Supabase Config:');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
console.log('KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('📝 Cria o ficheiro .env.local com:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://teu-project.supabase.co');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-chave-anon-aqui');
  console.error('🔗 Obtém as credenciais em: https://supabase.com/dashboard');
  console.error('🔄 Reinicia o servidor após criar o .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
