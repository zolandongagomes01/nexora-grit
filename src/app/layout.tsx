import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GRIT — Proof of Work, Not Words',
  description: 'A plataforma onde o teu valor é medido pelo que constróis de verdade.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-[#0F0F1A]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}