'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  type: 'follower' | 'milestone' | 'post_verified' | 'profile_view' | 'message';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

const TYPE_CONFIG = {
  follower:      { icon: '👤', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10' },
  milestone:     { icon: '🎯', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  post_verified: { icon: '✅', color: 'text-green-400',  bg: 'bg-green-400/10'  },
  profile_view:  { icon: '🏢', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  message:       { icon: '💬', color: 'text-pink-400',   bg: 'bg-pink-400/10'   },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carrega notificações
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscrição realtime — novo sino sem refresh
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setLoading(false);
  }

  async function markAllRead() {
    if (!user || unreadCount === 0) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markOneRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Botão sino */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
        aria-label="Notificações"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7C3AED] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">

          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[#4F8EF7] text-xs hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-gray-500 text-sm text-center py-8">A carregar...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-500 text-sm">Sem notificações</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.message;
                return (
                  <div
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${
                      !n.read ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    {/* Ícone tipo */}
                    <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 text-base`}>
                      {config.icon}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{n.body}</p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">{timeAgo(n.created_at)}</p>
                    </div>

                    {/* Ponto não lida */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}