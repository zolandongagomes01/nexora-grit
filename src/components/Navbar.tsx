'use client';

import { useState } from 'react';
import { Home, FlaskConical, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Feed',
      href: '/feed',
      icon: Home,
      active: pathname === '/feed' || pathname === '/'
    },
    {
      name: 'Labs',
      href: '/labs',
      icon: FlaskConical,
      active: pathname === '/labs'
    },
    {
      name: 'Post',
      href: '/post',
      icon: Plus,
      active: pathname === '/post',
      isSpecial: true
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: User,
      active: pathname === '/profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A2E] border-t border-white/10 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
                ${item.isSpecial 
                  ? 'bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white shadow-lg shadow-[#4F8EF7]/25' 
                  : item.active 
                    ? 'text-[#4F8EF7]' 
                    : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <div className={`
                ${item.isSpecial ? 'w-12 h-12 flex items-center justify-center rounded-full' : 'w-6 h-6'}
              `}>
                <Icon 
                  className={`
                    ${item.isSpecial ? 'w-6 h-6' : 'w-5 h-5'}
                  `} 
                />
              </div>
              {item.isSpecial ? (
                <span className="text-xs font-medium mt-1 text-white">Post</span>
              ) : (
                <span className={`
                  text-xs mt-1
                  ${item.active ? 'text-[#4F8EF7]' : 'text-gray-400'}
                `}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
