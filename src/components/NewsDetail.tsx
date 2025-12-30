import { ArrowLeft, ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsDetailProps {
  article: NewsArticle;
  onBack: () => void;
}

export function NewsDetail({ article, onBack }: NewsDetailProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data não disponível';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Remove tags HTML e limpa o conteúdo
  const cleanHtml = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen flex flex-col pb-24">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="font-['Montserrat:Bold',sans-serif] text-white text-[18px] flex-1">
          Notícia
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Image */}
          {article.urlToImage && (
            <div className="w-full h-[300px] md:h-[400px] rounded-[16px] overflow-hidden bg-[#d9d9d9] mb-6">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Source and Date */}
          <div className="mb-4">
            <span className="font-['Montserrat:SemiBold',sans-serif] text-[#6416ff] text-[14px]">
              {article.source.name}
            </span>
            {article.publishedAt && (
              <p className="font-['Montserrat:Light',sans-serif] text-[#04FFA7] text-[12px] mt-1">
                {formatDate(article.publishedAt)}
                {formatTime(article.publishedAt) && ` às ${formatTime(article.publishedAt)}`}
              </p>
            )}
          </div>

          {/* Title */}
          <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[28px] md:text-[32px] mb-6 leading-tight">
            {article.title}
          </h2>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="font-['Montserrat:Light',sans-serif] text-white/90 text-[16px] leading-relaxed">
              {/* Se tem conteúdo HTML completo, renderiza com HTML */}
              {article.content && article.content.includes('<') ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: article.content,
                  }}
                  className="[&_p]:mb-4 [&_p]:leading-relaxed [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_a]:text-[#6416ff] [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4"
                />
              ) : (
                /* Caso contrário, renderiza texto limpo */
                <div className="space-y-4">
                  {article.description && (
                    <p className="mb-4 leading-relaxed text-[17px]">
                      {cleanHtml(article.description)}
                    </p>
                  )}
                  {article.content && article.content !== article.description && (
                    <p className="leading-relaxed">
                      {cleanHtml(article.content)}
                    </p>
                  )}
                  {(!article.content || article.content === article.description) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-6">
                      <p className="text-white/70 text-[14px] mb-3">
                        Para ler o conteúdo completo da matéria, clique no botão abaixo para abrir no site original.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Button to view original */}
          {article.url && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#6416ff] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-[12px] transition-all font-['Montserrat:SemiBold',sans-serif] text-[14px]"
              >
                <ExternalLink className="w-4 h-4" />
                Ver matéria completa no site original
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

