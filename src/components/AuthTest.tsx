'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AuthTest() {
  const { user, loading, signOut } = useAuth();

  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Testando conexão com Supabase...');
      const { data, error } = await supabase.from('profiles').select('count');
      
      if (error) {
        console.log('⚠️ Erro esperado (tabela profiles não existe):', error.message);
      } else {
        console.log('✅ Conexão com Supabase OK:', data);
      }
    } catch (err) {
      console.error('❌ Erro na conexão:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
      
      <div className="space-y-1">
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Email: {user?.email || 'N/A'}</div>
      </div>

      <button
        onClick={testSupabaseConnection}
        className="mt-2 px-2 py-1 bg-blue-500 rounded text-xs"
      >
        Testar Supabase
      </button>

      {user && (
        <button
          onClick={signOut}
          className="mt-1 px-2 py-1 bg-red-500 rounded text-xs"
        >
          Logout
        </button>
      )}
    </div>
  );
}
