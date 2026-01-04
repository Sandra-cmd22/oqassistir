import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePosterColors } from '../hooks/usePosterColors';
import { Heart, ChevronLeft, ChevronRight, Play, Download, Share2, Youtube, ArrowLeft } from 'lucide-react';
import { Navbar } from './Navbar';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average?: number;
  runtime?: number;
  imdb_id?: string;
  certification?: string;
  origin_country?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  trailer_key?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
  };
  watch_providers?: Array<{
    logo_path: string;
    provider_name: string;
  }>;
}

interface MovieViewerProps {
  movie: Movie;
  genres: { [key: number]: string };
  onClose: () => void;
  onActorClick?: (actor: { id: number; name: string; profile_path: string | null }) => void;
  isFavorite: boolean;
  onToggleFavorite: (movieId: number) => void;
  favoritesCount?: number;
  onNavigate?: (view: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random') => void;
  currentView?: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random';
  hasActiveFilters?: boolean;
  apiKey?: string;
  onMovieClick?: (movie: Movie, movieList?: Movie[]) => void;
}

export function MovieViewer({ movie, genres, onClose, onActorClick, isFavorite, onToggleFavorite, favoritesCount = 0, onNavigate, currentView = 'home', hasActiveFilters = false, apiKey, onMovieClick }: MovieViewerProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  // UHD para iPhone 12: w1920 (1920px) é ideal, mas w1280 já é excelente
  const backdropBaseUrl = 'https://image.tmdb.org/t/p/w1920';
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Extract colors from current movie poster
  const posterUrl = movie?.poster_path 
    ? `${imageBaseUrl}${movie.poster_path}` 
    : null;
  const colors = usePosterColors(posterUrl);

  // Fetch recommendations when movie changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!movie?.id || !apiKey) return;
      
      setLoadingRecommendations(true);
      try {
        // Try recommendations first
        const recommendationsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${apiKey}&language=pt-BR&page=1`
        );
        const recommendationsData = await recommendationsResponse.json();
        let results = recommendationsData.results?.slice(0, 10) || [];
        
        // If no recommendations, use similar movies as fallback
        if (results.length === 0) {
          const similarResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${apiKey}&language=pt-BR&page=1`
          );
          const similarData = await similarResponse.json();
          results = similarData.results?.slice(0, 10) || [];
        }
        
        setRecommendations(results);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [movie?.id, apiKey]);

  // Block body scroll when MovieViewer is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white text-center" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 300 }}>
          Nenhum filme encontrado.
        </p>
      </div>
    );
  }

  const cast = movie.credits?.cast.slice(0, 4) || [];
  const movieGenres = movie.genre_ids.map(id => genres[id]).filter(Boolean);
  const firstGenre = movieGenres[0] || 'N/A';
  const releaseYear = new Date(movie.release_date).getFullYear();
  
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
  const country = movie.origin_country ? (countryNames[movie.origin_country] || movie.origin_country) : 'USA';
  
  // Format runtime (e.g., "2h 1m")
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Check if movie is in theaters (release date is in the future or recent)
  const isInTheaters = () => {
    if (!movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Consider movies released in the last 3 months as "in theaters"
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return releaseDate >= threeMonthsAgo;
  };

  // Get streaming link
  const getStreamingLink = () => {
    if (movie.watch_providers && movie.watch_providers.length > 0) {
      // Link to JustWatch search for the movie
      const searchQuery = encodeURIComponent(movie.title);
      return `https://www.justwatch.com/br/busca?q=${searchQuery}`;
    }
    return null;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.overview,
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
            {(movie.backdrop_path || movie.poster_path) ? (
              <ImageWithFallback
                src={movie.backdrop_path ? `${backdropBaseUrl}${movie.backdrop_path}` : `${imageBaseUrl}${movie.poster_path}`}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'top' }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#d9d9d9] flex items-center justify-center text-white/50">
                Sem imagem
              </div>
            )}
            
            {/* Fade at top - ensures status bar contrast */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none z-[5]"
              style={{
                height: '20%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
              }}
            />
            
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
            {movie.vote_average && movie.vote_average > 0 && (
              <div className="absolute right-0 p-4 z-10" style={{ top: 'env(safe-area-inset-top, 16px)' }}>
                <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <span className="text-white text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}>
                    IMDb {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content overlay on poster - positioned at bottom */}
          <div className="absolute left-0 right-0 px-6 z-20" style={{ bottom: '24px' }}>
            {/* Movie Title */}
            <h1 className="text-white mb-3 leading-tight text-center drop-shadow-lg" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, fontSize: '20px' }}>
              {movie.title}
            </h1>

            {/* Meta Tags - Centered */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                {firstGenre}
              </span>
              {movie.certification && (
                <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                  {movie.certification}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                {country}
              </span>
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500, color: '#D8D8D8' }}>
                {releaseYear}
              </span>
            </div>

            {/* Action Buttons - Centered */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {movie.trailer_key && (
                <a
                  href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/22 backdrop-blur-md rounded-full p-4 hover:bg-white/35 transition-all active:scale-95"
                >
                  <Youtube className="w-6 h-6 text-white" style={{ color: 'rgba(255, 255, 255, 0.95)' }} />
                </a>
              )}
              <button 
                onClick={() => onToggleFavorite(movie.id)}
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
            ) : isInTheaters() ? (
              <div className="w-full bg-white/20 backdrop-blur-md h-[50px] rounded-[8px] flex items-center justify-center px-4 py-2">
                <p className="text-[14px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400, color: '#969696' }}>
                  Disponível só nos cinemas
                </p>
              </div>
            ) : movie.trailer_key ? (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
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
          <div className="w-full max-w-full px-6 pb-6 flex flex-col" style={{ gap: '24px' }}>
            {/* Synopsis */}
            <div className="w-full">
              <p className="text-white text-[16px] mb-3" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}>
                Sinopse:
              </p>
              <p className="text-[14px] leading-relaxed" style={{ paddingBottom: '24px', fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400, color: '#969696' }}>
                {movie.overview || 'Sinopse não disponível.'}
              </p>
            </div>

            {/* Where to Watch */}
            {movie.watch_providers && movie.watch_providers.length > 0 && (
              <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                <p className="text-white text-[16px] mb-3" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}>
                  Onde Assistir:
                </p>
                <div className="flex gap-3 flex-wrap">
                  {movie.watch_providers.map((provider, index) => (
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
              <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
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

            {/* Recommendations */}
            <div className="w-full">
              <p className="text-white text-[16px] mb-3" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, paddingTop: '24px' }}>
                Recomendações:
              </p>
              {loadingRecommendations ? (
                <p className="text-white/90 text-[14px] leading-relaxed" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 300 }}>
                  Carregando...
                </p>
              ) : recommendations.length > 0 ? (
                <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                  {recommendations.map((recommendation) => (
                    <button
                      key={recommendation.id}
                      onClick={() => {
                        if (onMovieClick) {
                          // Call onMovieClick directly - it will update selectedMovie and replace the current viewer
                          onMovieClick(recommendation, recommendations);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex flex-col gap-2 items-center shrink-0 w-[90px] group"
                    >
                      <div className="bg-[#d9d9d9] h-[130px] w-full rounded-[8px] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                        {recommendation.poster_path ? (
                          <ImageWithFallback
                            src={`${imageBaseUrl}${recommendation.poster_path}`}
                            alt={recommendation.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                            N/A
                          </div>
                        )}
                      </div>
                      <p className="text-white/90 text-[13px] text-center w-full break-words group-hover:text-white transition-colors" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}>
                        {recommendation.title}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-[14px]" style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 300 }}>
                  Nenhuma recomendação disponível no momento.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
