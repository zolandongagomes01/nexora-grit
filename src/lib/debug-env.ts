// Ficheiro de verificação de ambiente - executar no terminal para debug
console.log('🔍 Verificação das variáveis de ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');

// Verificar se estamos em modo de desenvolvimento
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Estamos em modo dev?', process.env.NODE_ENV === 'development');
