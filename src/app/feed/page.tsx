'use client';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Feed</h1>
        
        {/* Feed Content Placeholder */}
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Post de Exemplo {item}</h3>
                  <p className="text-gray-300 text-sm">Conteúdo do post aqui...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
