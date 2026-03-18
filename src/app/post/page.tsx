'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function PostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = searchParams.get('lab_id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!user) return;
    if (!title.trim()) { setError('O título é obrigatório.'); return; }
    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }

    setLoading(true);
    setError('');

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          console.warn('Upload falhou, a continuar sem imagem:', uploadError.message);
        } else {
          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const tags = tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#+/, ''))
        .filter(t => t.length > 0);

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          tags,
          image_url: imageUrl,
          lab_id: labId || null,
        });

      if (insertError) throw insertError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-2xl">
      <div className="mb-8 pt-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-white">Nova Prova de Trabalho</h1>
      </div>

      <div className="space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors"
            placeholder="Ex: Resolvi um bug de performance no React..."
          />
          <p className="text-gray-600 text-xs mt-1 text-right">{title.length}/100</p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={6}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors resize-none"
            placeholder="Descreve o desafio, o que fizeste e o que aprendeste..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F8EF7] transition-colors"
            placeholder="react, typescript, bug-fix (separadas por vírgula)"
          />
          {tagsInput && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tagsInput.split(',').map((t, i) => t.trim() && (
                <span key={i} className="text-xs px-2 py-1 bg-[#4F8EF7]/10 text-[#4F8EF7] rounded-full border border-[#4F8EF7]/20">
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upload imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagem <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
              <button
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-500/80 transition-colors"
              >✕</button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#4F8EF7]/40 transition-colors group"
            >
              <span className="text-2xl">📸</span>
              <span className="text-gray-400 text-sm group-hover:text-gray-300">Clica para adicionar imagem</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A publicar...</>
          ) : '🔥 Publicar Prova'}
        </button>
      </div>
    </main>
  );
}

export default function PostPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navigation />
      <Suspense fallback={
        <div className="lg:ml-64 pt-14 lg:pt-0 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PostForm />
      </Suspense>
    </div>
  );
}