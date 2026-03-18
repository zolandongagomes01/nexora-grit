'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Navbar from './Navbar';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Show loading state
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

  // If not authenticated, don't show header/navbar
  if (!user) {
    return <>{children}</>;
  }

  // Don't show header/navbar on onboarding page
  if (pathname === '/onboarding') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Header - Always visible for authenticated users */}
      <Header />
      
      {/* Main Content - Add padding for header */}
      <main className="pt-16 pb-20 md:pb-16">
        {children}
      </main>
      
      {/* Bottom Navigation - Only visible on mobile */}
      <Navbar />
    </div>
  );
}
