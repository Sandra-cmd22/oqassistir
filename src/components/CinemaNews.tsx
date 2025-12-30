import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface NewsArticle {
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

interface CinemaNewsProps {
  onArticleClick: (article: NewsArticle) => void;
}

// Feeds RSS de notícias de cinema usando Google News
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search?q=cinema+OR+filmes+OR+ator+OR+atriz+OR+estreia+filme+OR+hollywood&hl=pt-BR&gl=BR&ceid=BR:pt-419';

// API proxy alternativo para RSS
const RSS_PROXY_1 = 'https://api.rss2json.com/v1/api.json?rss_url=';
const RSS_PROXY_2 = 'https://cors-anywhere.herokuapp.com/';

export function CinemaNews({ onArticleClick }: CinemaNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const allArticles: NewsArticle[] = [];

        // Tenta buscar notícias do Google News sobre cinema
        try {
          const proxyUrl = `${RSS_PROXY_1}${encodeURIComponent(GOOGLE_NEWS_RSS)}`;
          const response = await fetch(proxyUrl);

          if (response.ok) {
            const data = await response.json();

            if (data.status === 'ok' && data.items && Array.isArray(data.items)) {
              const newsArticles = data.items.map((item: any) => {
                // Extrai a fonte do título (Google News inclui a fonte no formato "Título - Fonte")
                let title = item.title || 'Sem título';
                let sourceName = 'Notícias';
                
                // Tenta extrair fonte do título
                const titleParts = title.split(' - ');
                if (titleParts.length > 1) {
                  title = titleParts.slice(0, -1).join(' - ');
                  sourceName = titleParts[titleParts.length - 1];
                }

                // Tenta extrair imagem da descrição HTML
                let imageUrl = null;
                if (item.content) {
                  const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }

                // Função auxiliar para limpar HTML (definida fora do map)
                const cleanHtmlText = (html: string) => {
                  if (!html) return '';
                  const div = document.createElement('div');
                  div.innerHTML = html;
                  return div.textContent || div.innerText || '';
                };

                return {
                  title: title,
                  description: cleanHtmlText(item.description || item.content || ''),
                  content: item.content || item.description || '',
                  url: item.link || '',
                  urlToImage: imageUrl || item.thumbnail || null,
                  publishedAt: item.pubDate || new Date().toISOString(),
                  source: {
                    name: sourceName,
                  },
                };
              });

              allArticles.push(...newsArticles);
            }
          }
        } catch (rssErr) {
          console.error('Erro ao buscar RSS:', rssErr);
        }

        // Se não encontrou notícias suficientes, adiciona mais fontes alternativas
        if (allArticles.length < 10) {
          // Tenta buscar de outras fontes RSS conhecidas
          const alternativeFeeds = [
            'https://feeds.feedburner.com/omelete/cinema',
            'https://www.adorocinema.com/rss/news.xml',
          ];

          for (const feedUrl of alternativeFeeds) {
            try {
              const proxyUrl = `${RSS_PROXY_1}${encodeURIComponent(feedUrl)}`;
              const response = await fetch(proxyUrl);

              if (response.ok) {
                const data = await response.json();

                if (data.status === 'ok' && data.items) {
                  const cleanHtmlText = (html: string) => {
                    if (!html) return '';
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    return div.textContent || div.innerText || '';
                  };

                  const feedArticles = data.items.map((item: any) => ({
                    title: item.title || 'Sem título',
                    description: cleanHtmlText(item.description || item.content || ''),
                    content: item.content || item.description || '',
                    url: item.link || '',
                    urlToImage: item.thumbnail || item.enclosure?.link || null,
                    publishedAt: item.pubDate || new Date().toISOString(),
                    source: {
                      name: data.feed?.title || 'Cinema',
                    },
                  }));

                  allArticles.push(...feedArticles);
                }
              }
            } catch (err) {
              // Continue tentando outras fontes
            }
          }
        }

        // Ordena por data (mais recentes primeiro) e limita a 30
        const sortedArticles = allArticles
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 30);

        if (sortedArticles.length === 0) {
          setError('Nenhuma notícia encontrada. Os feeds RSS podem estar temporariamente indisponíveis.');
        } else {
          setArticles(sortedArticles);
        }
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError(`Erro ao carregar notícias: ${err.message || 'Tente novamente mais tarde.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[14px]">
            Carregando notícias...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen py-20 px-4">
        <div className="bg-red-500/20 border border-red-500/40 rounded-[10px] p-4 max-w-md">
          <p className="font-['Montserrat:Regular',sans-serif] text-white text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4 pb-24">
        <div className="mb-6">
          <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[24px] mb-2">
            Notícias do Cinema
          </h2>
          <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[14px]">
            Fique por dentro das últimas novidades do mundo cinematográfico
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white/70 text-center font-['Montserrat:Light',sans-serif]">
              Nenhuma notícia encontrada no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <button
                key={index}
                onClick={() => onArticleClick(article)}
                className="block w-full bg-white/10 backdrop-blur-md rounded-[12px] overflow-hidden hover:bg-white/15 transition-all text-left"
              >
                {/* Image */}
                {article.urlToImage && (
                  <div className="w-full h-[200px] overflow-hidden bg-[#d9d9d9]">
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

                {/* Content */}
                <div className="p-4 flex flex-col h-full">
                  {/* Source */}
                  <div className="mb-2">
                    <span className="font-['Montserrat:SemiBold',sans-serif] text-[#6416ff] text-[12px]">
                      {article.source.name}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  {article.description && (
                    <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[14px] line-clamp-3 mb-3 flex-1">
                      {cleanHtml(article.description)}
                    </p>
                  )}

                  {/* Read more hint */}
                  <div className="flex items-center gap-2 text-[#6416ff] mb-2">
                    <span className="font-['Montserrat:SemiBold',sans-serif] text-[12px]">
                      Ler notícia completa
                    </span>
                  </div>

                  {/* Date at bottom */}
                  {article.publishedAt && (
                    <div className="mt-auto pt-2 border-t border-white/10">
                      <span className="font-['Montserrat:Light',sans-serif] text-[11px]" style={{ color: '#04FFA7' }}>
                        {formatDate(article.publishedAt)}
                        {formatTime(article.publishedAt) && ` às ${formatTime(article.publishedAt)}`}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
