'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 10;

interface Profile {
  full_name: string;
  username: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: Profile | Profile[] | null;
}

// Supabase pode retornar profiles como objecto ou array — normaliza sempre
function getProfile(profiles?: Profile | Profile[] | null): Profile | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] || null;
  return profiles;
}

// Limpa tags — remove # duplicados e espaços
function cleanTag(tag: string): string {
  return tag.replace(/^#+/, '').trim();
}

function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const profile = getProfile(post.profiles);

  const cleanTags = post.tags
    ? post.tags.map(cleanTag).filter(Boolean)
    : [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl hover:border-[#4F8EF7]/30 transition-all duration-200 overflow-hidden">

      {/* Imagem com lazy loading */}
      {post.image_url && !imgError && (
        <div className="relative w-full h-56">
          <Image
            src={post.image_url}
            alt={post.title || 'Post image'}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 672px"
            onError={() => setImgError(true)}
            unoptimized
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(profile?.full_name || profile?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">
              {profile?.full_name || profile?.username || 'Utilizador'}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(post.created_at).toLocaleDateString('pt-PT', {
                day: 'numeric', month: 'short'
              })}
            </p>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-white font-semibold mb-1 text-sm">{post.title}</h3>

        {/* Descrição */}
        <p className={`text-gray-400 text-sm mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
          {post.description}
        </p>

        {post.description && post.description.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#4F8EF7] text-xs mb-3 hover:underline"
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}

        {/* Tags limpas */}
        {cleanTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cleanTags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-[#4F8EF7]/10 text-[#4F8EF7] rounded-full border border-[#4F8EF7]/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchPosts(pageNum: number, reset = false) {
    if (pageNum === 0) setPostsLoading(true);
    else setLoadingMore(true);

    const { data, error } = await supabase
      .from('posts')
      // Só os campos necessários — menos dados, mais rápido
      .select('id, title, description, tags, image_url, created_at, user_id, profiles(full_name, username)')
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (!error && data) {
      setPosts(prev => reset ? (data as Post[]) : [...prev, ...(data as Post[])]);
      setHasMore(data.length === PAGE_SIZE);
    }

    setPostsLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    fetchPosts(0, true);
  }, []);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [hasMore, loadingMore, page]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Não autenticado.</p>
          <Link href="/login" className="text-[#4F8EF7]">Ir para Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-3xl">

        <div className="mb-6 pt-4">
          <h1 className="text-2xl font-bold text-white">
            Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'GRIT'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Vê o que a comunidade está a construir</p>
        </div>

        <Link
          href="/post"
          className="flex items-center gap-3 w-full p-4 mb-6 bg-white/5 border border-white/10 rounded-xl hover:border-[#4F8EF7]/40 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(user.user_metadata?.full_name || 'U')[0].toUpperCase()}
          </div>
          <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
            Partilha a tua prova de trabalho...
          </span>
          <span className="ml-auto text-[#4F8EF7] text-sm font-semibold">Postar →</span>
        </Link>

        {postsLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔥</p>
            <p className="text-white font-semibold mb-2">Nenhuma prova ainda</p>
            <p className="text-gray-400 text-sm mb-6">Sê o primeiro a postar!</p>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-semibold py-3 px-6 rounded-full"
            >
              Criar primeiro post →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            <div ref={bottomRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="w-6 h-6 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-600 text-sm">Viste tudo! 🎉</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}