import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Youtube, Share2, Heart, Play } from 'lucide-react';
import { Navbar } from './Navbar';
import { useEffect } from 'react';

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
  vote_average?: number;
  imdb_id?: string;
  certification?: string;
  number_of_seasons?: number;
  last_episode_to_air?: {
    season_number: number;
    episode_number: number;
  };
  watch_providers?: {
    logo_path: string;
    provider_name: string;
  }[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
  };
}

interface TVShowViewerProps {
  show: TVShow;
  genres: { [key: number]: string };
  onClose: () => void;
  onActorClick?: (actor: { id: number; name: string; profile_path: string | null }) => void;
  isFavorite: boolean;
  onToggleFavorite: (showId: number) => void;
  favoritesCount?: number;
  onNavigate?: (view: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random') => void;
  currentView?: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random';
  hasActiveFilters?: boolean;
}

export function TVShowViewer({ show, genres, onClose, onActorClick, isFavorite, onToggleFavorite, favoritesCount = 0, onNavigate, currentView = 'home', hasActiveFilters = false }: TVShowViewerProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  // UHD para iPhone 12: w1920 (1920px) é ideal, mas w1280 já é excelente
  const backdropBaseUrl = 'https://image.tmdb.org/t/p/w1920';

  const cast = show.credits?.cast.slice(0, 4) || [];
  const showGenres = show.genre_ids.map(id => {
    const genre = genres[id];
    // Abreviar "Ficção Científica" para "Ficção C."
    return genre === 'Ficção Científica' ? 'Ficção C.' : genre;
  }).filter(Boolean);
  const releaseYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;
  const imdbRating = show.vote_average ? show.vote_average.toFixed(1) : null;
  
  // Map country codes to names
  const countryNames: { [key: string]: string } = {
    'US': 'USA',
    'BR': 'Brasil',
    'GB': 'UK',
    'CA': 'Canadá',
    'AU': 'Austrália',
    'FR': 'França',
    'DE': 'Alemanha',
    'ES': 'Espanha',
    'IT': 'Itália',
    'JP': 'Japão',
    'KR': 'Coreia',
    'MX': 'México',
    'AR': 'Argentina',
  };
  const originCountry = show.origin_country ? (countryNames[show.origin_country] || show.origin_country) : null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Get streaming link
  const getStreamingLink = () => {
    if (show.watch_providers && show.watch_providers.length > 0) {
      // Link to JustWatch search for the TV show
      const searchQuery = encodeURIComponent(show.name);
      return `https://www.justwatch.com/br/busca?q=${searchQuery}`;
    }
    return null;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: show.name,
          text: show.overview,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Block body scroll when TVShowViewer is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col bg-black overflow-y-auto" style={{ height: '100vh', pointerEvents: 'auto', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Poster Section - Full bleed até status bar - FORA do scroll */}
      <section 
        className="relative w-full overflow-hidden flex-shrink-0"
        style={{ 
          height: '100svh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
          {/* Poster Image - Full height, extends to status bar */}
          <div 
            className="absolute inset-0 w-full h-full"
          >
            {(show.backdrop_path || show.poster_path) ? (
              <ImageWithFallback
                src={show.backdrop_path ? `${backdropBaseUrl}${show.backdrop_path}` : `${imageBaseUrl}${show.poster_path}`}
                alt={show.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'top' }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#d9d9d9] flex items-center justify-center text-white/50">
                Sem imagem
              </div>
            )}
            
            {/* Fade at bottom - starts only in the last 30% (from 70%) */}
            <div 
              className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]"
              style={{
                height: '30%',
                background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)',
              }}
            />

            {/* Top bar - Back button (fixed) and IMDb rating (absolute) */}
            {/* Fixed back button */}
            <div className="fixed left-0 p-4 z-[999]" style={{ top: 'env(safe-area-inset-top, 16px)' }}>
              <button
                onClick={onClose}
                className="bg-black/40 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-black/60 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Absolute IMDb rating - disappears with scroll */}
            {show.vote_average && show.vote_average > 0 && (
              <div className="absolute right-0 p-4 z-10" style={{ top: 'env(safe-area-inset-top, 16px)' }}>
                <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <span className="text-white text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                    IMDb {show.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content overlay on poster - positioned at bottom */}
          <div className="absolute left-0 right-0 px-6 z-20" style={{ bottom: '24px' }}>
            {/* TV Show Title */}
            <h1 className="text-white mb-3 leading-tight text-center drop-shadow-lg" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, fontSize: '20px' }}>
              {show.name}
            </h1>

            {/* Meta Tags - Centered */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              {showGenres.slice(0, 1).map((genre, index) => (
                <span key={index} className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                  {genre}
                </span>
              ))}
              {show.certification && (
                <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                  {show.certification}
                </span>
              )}
              {originCountry && (
                <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                  {originCountry}
                </span>
              )}
              {releaseYear && (
                <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                  {releaseYear}
                </span>
              )}
            </div>

            {/* Action Buttons - Centered */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {show.trailer_key && (
                <a
                  href={`https://www.youtube.com/watch?v=${show.trailer_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/22 backdrop-blur-md rounded-full p-4 hover:bg-white/35 transition-all active:scale-95"
                >
                  <Youtube className="w-6 h-6 text-white" style={{ color: 'rgba(255, 255, 255, 0.95)' }} />
                </a>
              )}
              <button 
                onClick={() => onToggleFavorite(show.id)}
                className={`bg-white/22 backdrop-blur-md rounded-full p-4 hover:bg-white/35 transition-all active:scale-95 ${isFavorite ? 'bg-white/35' : ''}`}
              >
                <Heart className={`w-6 h-6 text-white ${isFavorite ? 'fill-white' : ''}`} style={{ color: 'rgba(255, 255, 255, 0.95)' }} />
              </button>
              <button 
                onClick={handleShare}
                className="bg-white/22 backdrop-blur-md rounded-full p-4 hover:bg-white/35 transition-all active:scale-95"
              >
                  <Share2 className="w-6 h-6 text-white" style={{ color: 'rgba(255, 255, 255, 0.95)' }} />
              </button>
            </div>

            {/* Play Button */}
            {getStreamingLink() ? (
              <a
                href={getStreamingLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-white/90 h-[50px] rounded-[24px] flex items-center justify-center gap-3 px-4 py-2 shadow-lg transition-all active:scale-95"
              >
                <Play className="w-5 h-5 text-black" fill="#000000" />
                <p className="text-[14px] text-black" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                  Assistir
                </p>
              </a>
            ) : show.trailer_key ? (
              <a
                href={`https://www.youtube.com/watch?v=${show.trailer_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-white/90 h-[50px] rounded-[24px] flex items-center justify-center gap-3 px-4 py-2 shadow-lg transition-all active:scale-95"
              >
                <Play className="w-5 h-5 text-black" fill="#000000" />
                <p className="text-[14px] text-black" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                  Ver Trailer
                </p>
              </a>
            ) : (
              <div className="w-full bg-white/20 backdrop-blur-md h-[50px] rounded-[8px] flex items-center justify-center px-4 py-2">
                <p className="text-[14px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400, color: '#969696' }}>
                  Sem trailer no momento
                </p>
              </div>
            )}
          </div>
        </section>

      {/* Main Content - Scrollable - Agora separado do poster */}
      <div className="flex-shrink-0 scrollbar-hide bg-black" style={{ paddingBottom: 'env(safe-area-inset-bottom, 60px)', pointerEvents: 'auto', backgroundColor: '#000000' }}>
        {/* Additional Information - Below the poster */}
        <div className="w-full bg-black relative" style={{ backgroundColor: '#000000', zIndex: 10, paddingTop: '24px' }}>
          <div className="w-full max-w-full px-6 pb-6 flex flex-col gap-8">
            {/* Synopsis */}
            <div className="w-full">
              <p className="text-white text-[16px] mb-2" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}>
                Sinopse:
              </p>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400, color: '#969696' }}>
                {show.overview || 'Sinopse não disponível.'}
              </p>
            </div>

            {/* Where to Watch */}
            {show.watch_providers && show.watch_providers.length > 0 && (
              <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
                <p className="text-white text-[16px] mb-3" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}>
                  Onde Assistir:
                </p>
                <div className="flex gap-3 flex-wrap">
                  {show.watch_providers.map((provider, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="rounded-[8px] p-2 w-16 h-16 flex items-center justify-center">
                        <ImageWithFallback
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="w-full h-full object-contain rounded-[6px]"
                        />
                      </div>
                      <p className="text-white/90 text-[11px] text-center max-w-[80px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}>
                        {provider.provider_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
                <p className="text-white text-[16px] mb-4" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}>
                  Elenco:
                </p>
                <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                  {cast.map((actor) => (
                    <button
                      key={actor.id}
                      onClick={() => onActorClick?.(actor)}
                      className="flex flex-col gap-2 items-center shrink-0 w-[90px] group"
                    >
                      <div className="bg-[#d9d9d9] w-[90px] h-[90px] rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                        {actor.profile_path ? (
                          <ImageWithFallback
                            src={`${imageBaseUrl}${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                            N/A
                          </div>
                        )}
                      </div>
                      <p className="text-white/90 text-[13px] text-center w-full break-words group-hover:text-white transition-colors" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}>
                        {actor.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navbar */}
      {onNavigate && (
        <div className="fixed bottom-0 left-0 right-0 z-[100]" style={{ pointerEvents: 'auto' }}>
          <Navbar 
            currentView={currentView}
            onNavigate={onNavigate}
            hasActiveFilters={hasActiveFilters}
            favoritesCount={favoritesCount}
          />
        </div>
      )}
    </div>
  );
}
