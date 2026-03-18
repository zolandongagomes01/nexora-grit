'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearch from '@/components/GlobalSearch';

const talentNavItems = [
  { href: '/dashboard', label: 'Feed', icon: '⚡' },
  { href: '/labs', label: 'Labs', icon: '🧪' },
  { href: '/post', label: 'Postar', icon: '➕', highlight: true },
  { href: '/feed', label: 'Explorar', icon: '🔍' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

const companyNavItems = [
  { href: '/enterprise', label: 'Dashboard', icon: '🏢' },
  { href: '/enterprise/talentos', label: 'Talentos', icon: '👥' },
  { href: '/enterprise/favoritos', label: 'Favoritos', icon: '⭐' },
  { href: '/dashboard', label: 'Feed', icon: '⚡' },
  { href: '/labs', label: 'Labs', icon: '🧪' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, accountType, signOut } = useAuth();

  const isCompany = accountType === 'company';
  const navItems = isCompany ? companyNavItems : talentNavItems;
  const homeHref = isCompany ? '/enterprise' : '/dashboard';

  return (
    <>
      {/* ── SIDEBAR DESKTOP (lg+) ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-[#0F0F1A] border-r border-white/10 z-40 px-4 py-6">

        {/* Logo + Sino */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link href={homeHref} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-black text-sm">G</div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">GRIT</span>
              {isCompany && (
                <span className="block text-[10px] text-[#7C3AED] font-medium -mt-1">Enterprise</span>
              )}
            </div>
          </Link>
          <NotificationBell />
        </div>

        {/* Busca global */}
        <div className="mb-6 px-1">
          <GlobalSearch />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {/* Separador para empresa */}
          {isCompany && (
            <p className="text-gray-600 text-[10px] uppercase tracking-widest px-4 mb-1">Recrutamento</p>
          )}
          {navItems.slice(0, isCompany ? 3 : navItems.length).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${'highlight' in item && item.highlight
                    ? 'bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white shadow-lg shadow-[#4F8EF7]/20 hover:opacity-90'
                    : active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Secção comunidade para empresa */}
          {isCompany && (
            <>
              <p className="text-gray-600 text-[10px] uppercase tracking-widest px-4 mt-4 mb-1">Comunidade</p>
              {navItems.slice(3).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Badge empresa */}
        {isCompany && (
          <div className="mx-2 mb-4 px-3 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl">
            <p className="text-[#7C3AED] text-xs font-semibold">🏢 Conta Empresa</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{user?.user_metadata?.full_name}</p>
          </div>
        )}

        {user && (
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isCompany ? 'bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7]' : 'bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED]'
              }`}>
                {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.user_metadata?.full_name || 'Utilizador'}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="w-full text-left px-4 py-2 text-gray-400 hover:text-red-400 text-xs rounded-lg hover:bg-red-400/10 transition-all">
              Sair →
            </button>
          </div>
        )}
      </aside>

      {/* ── HEADER MOBILE ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0F0F1A]/95 backdrop-blur-md border-b border-white/10 z-40 flex items-center gap-3 px-4">
        <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white font-black text-xs">G</div>
        </Link>
        <div className="flex-1"><GlobalSearch /></div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <NotificationBell />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            isCompany ? 'bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7]' : 'bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED]'
          }`}>
            {user ? (user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase() : 'G'}
          </div>
        </div>
      </header>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F0F1A]/95 backdrop-blur-md border-t border-white/10 z-40 flex items-center justify-around px-2">
        {isCompany ? (
          <>
            <Link href="/enterprise" className={`flex flex-col items-center gap-0.5 px-2 py-1 ${pathname === '/enterprise' ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
              <span className="text-lg">🏢</span>
              <span className="text-[10px]">Dashboard</span>
            </Link>
            <Link href="/enterprise/talentos" className={`flex flex-col items-center gap-0.5 px-2 py-1 ${pathname.startsWith('/enterprise/talentos') ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
              <span className="text-lg">👥</span>
              <span className="text-[10px]">Talentos</span>
            </Link>
            <Link href="/enterprise/favoritos" className={`flex flex-col items-center gap-0.5 px-2 py-1 ${pathname === '/enterprise/favoritos' ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
              <span className="text-lg">⭐</span>
              <span className="text-[10px]">Favoritos</span>
            </Link>
            <Link href="/dashboard" className={`flex flex-col items-center gap-0.5 px-2 py-1 ${pathname === '/dashboard' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">⚡</span>
              <span className="text-[10px]">Feed</span>
            </Link>
            <Link href="/labs" className={`flex flex-col items-center gap-0.5 px-2 py-1 ${pathname === '/labs' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">🧪</span>
              <span className="text-[10px]">Labs</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/dashboard' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">⚡</span>
              <span className="text-[10px]">Feed</span>
            </Link>
            <Link href="/labs" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/labs' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">🧪</span>
              <span className="text-[10px]">Labs</span>
            </Link>
            <Link href="/post" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white shadow-lg -mt-5">
              <span className="text-xl">➕</span>
              <span className="text-[10px] font-bold">Postar</span>
            </Link>
            <Link href="/feed" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/feed' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">🔍</span>
              <span className="text-[10px]">Explorar</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/profile' ? 'text-[#4F8EF7]' : 'text-gray-500'}`}>
              <span className="text-lg">👤</span>
              <span className="text-[10px]">Perfil</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );
}