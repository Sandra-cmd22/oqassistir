import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePosterColors } from '../hooks/usePosterColors';
import { Heart, ChevronLeft, ChevronRight, Play, Download, Plus, Share2, Youtube, ArrowLeft } from 'lucide-react';
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
}

export function MovieViewer({ movie, genres, onClose, onActorClick, isFavorite, onToggleFavorite, favoritesCount = 0, onNavigate, currentView = 'home', hasActiveFilters = false, apiKey }: MovieViewerProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
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
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${apiKey}&language=pt-BR&page=1`
        );
        const data = await response.json();
        setRecommendations(data.results?.slice(0, 10) || []);
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
        <p className="text-white text-center font-['Montserrat:Light',sans-serif] font-light">
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
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-black" style={{ pointerEvents: 'auto' }}>
      {/* Blurred poster background layer - Behind main poster */}
      {movie.poster_path && (
        <div 
          className="absolute inset-0 -z-20 transition-all duration-700"
          style={{
            backgroundImage: `url(${imageBaseUrl}${movie.poster_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) brightness(0.15)',
            transform: 'scale(1.3)',
          }}
        />
      )}

      {/* Subtle dark overlay - Apple TV style */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-700"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 0.9) 100%)',
        }}
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ paddingBottom: '100px', pointerEvents: 'auto' }}>
        {/* Poster Section - Full bleed */}
        <div className="relative w-full">
          {/* Poster Image - Full height, no blur */}
          <div className="relative w-full aspect-[9/16] -mt-16">
            {movie.poster_path ? (
              <ImageWithFallback
                src={`${imageBaseUrl}${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#d9d9d9] flex items-center justify-center text-white/50">
                Sem imagem
              </div>
            )}
            
            {/* Subtle fade at bottom - Apple TV style smooth transition */}
            <div 
              className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]"
              style={{
                height: '280px',
                background: 'linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.95) 15%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.1) 85%, rgba(0, 0, 0, 0) 100%)',
              }}
            />

            {/* Top bar - Back button (fixed) and IMDb rating (absolute) */}
            {/* Fixed back button */}
            <div className="fixed top-0 left-0 p-4 pt-16 z-[999]">
              <button
                onClick={onClose}
                className="bg-black/40 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-black/60 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Absolute IMDb rating - disappears with scroll */}
            {movie.vote_average && movie.vote_average > 0 && (
              <div className="absolute top-0 right-0 p-4 pt-16 z-10">
                <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <span className="font-['Montserrat:Bold',sans-serif] text-white text-[12px]">
                    IMDb {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content overlay on poster - positioned at bottom */}
          <div className="relative px-6 z-20" style={{ marginTop: '-168px' }}>
            {/* Movie Title */}
            <h1 className="text-white mb-3 leading-tight text-center drop-shadow-lg" style={{ fontFamily: 'SF Pro Display', fontWeight: 700, fontSize: '26px' }}>
              {movie.title}
            </h1>

            {/* Meta Tags - Centered */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px] font-['Montserrat:Medium',sans-serif] text-white">
                {firstGenre}
              </span>
              {movie.certification && (
                <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px] font-['Montserrat:Medium',sans-serif] text-white">
                  {movie.certification}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px] font-['Montserrat:Medium',sans-serif] text-white">
                {country}
              </span>
              <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-[12px] font-['Montserrat:Medium',sans-serif] text-white">
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
                  className="bg-white/22 backdrop-blur-md rounded-full p-3 hover:bg-white/35 transition-all active:scale-95"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </a>
              )}
              <button 
                onClick={() => onToggleFavorite(movie.id)}
                className="bg-white/22 backdrop-blur-md rounded-full p-3 hover:bg-white/35 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={handleShare}
                className="bg-white/22 backdrop-blur-md rounded-full p-3 hover:bg-white/35 transition-all active:scale-95"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Play Button */}
            {movie.trailer_key ? (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-white/90 h-[50px] rounded-[8px] flex items-center justify-center gap-3 px-4 py-2 shadow-lg transition-all active:scale-95 mb-8"
              >
                <Play className="w-5 h-5 text-black fill-black" />
                <p className="font-['Montserrat:Bold',sans-serif] text-black text-[16px]">
                  Play
                </p>
              </a>
            ) : (
              <div className="w-full bg-white/20 backdrop-blur-md h-[50px] rounded-[8px] flex items-center justify-center px-4 py-2 mb-8">
                <p className="font-['Montserrat:Regular',sans-serif] text-white/70 text-[14px]">
                  Sem trailer no momento
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information - Below the poster overlay */}
        <div className="px-6 pt-12 pb-6 flex flex-col gap-6">
          {/* Synopsis */}
          <div className="mb-8">
            <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
              Sinopse:
            </p>
            <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px] leading-relaxed">
              {movie.overview || 'Sinopse não disponível.'}
            </p>
          </div>

          {/* Where to Watch */}
          {movie.watch_providers && movie.watch_providers.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-3">
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
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[11px] text-center max-w-[80px]">
                      {provider.provider_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-[10px] p-4 mb-8">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
                Elenco:
              </p>
              <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                {cast.map((actor) => (
                  <button
                    key={actor.id}
                    onClick={() => onActorClick?.(actor)}
                    className="flex flex-col gap-2 items-center shrink-0 w-[90px] group"
                  >
                    <div className="bg-[#d9d9d9] h-[130px] w-full rounded-[8px] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
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
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[13px] text-center w-full break-words group-hover:text-white transition-colors">
                      {actor.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {loadingRecommendations ? (
            <div className="bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
                Recomendações:
              </p>
              <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px] leading-relaxed">
                Carregando...
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
                Recomendações:
              </p>
              <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                {recommendations.map((recommendation) => (
                  <button
                    key={recommendation.id}
                    onClick={() => {
                      // This would need to be handled by parent component
                      // For now, just close and let parent handle navigation
                      onClose();
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
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[13px] text-center w-full break-words group-hover:text-white transition-colors">
                      {recommendation.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Navbar */}
      {onNavigate && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
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
