'use client';

import { Search, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A2E] border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Grit</span>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#4F8EF7] rounded-full"></span>
            </button>

            {/* User Avatar */}
            {user && (
              <div className="w-8 h-8 bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
