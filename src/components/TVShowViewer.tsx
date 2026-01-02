import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePosterColors } from '../hooks/usePosterColors';
import { ArrowLeft, Youtube, Share2, Heart, Play, Plus } from 'lucide-react';
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
  const imageBaseUrl = 'https://image.tmdb.org/t/p';
  
  // Use backdrop_path for full-bleed, fallback to poster_path
  const fullBleedImage = show.backdrop_path 
    ? `${imageBaseUrl}/w1280${show.backdrop_path}` 
    : show.poster_path 
    ? `${imageBaseUrl}/w1280${show.poster_path}` 
    : null;
  
  // Extract colors from poster
  const posterUrl = show.poster_path 
    ? `${imageBaseUrl}/w500${show.poster_path}` 
    : null;
  const colors = usePosterColors(posterUrl);

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
    <div className="relative w-full h-full overflow-y-auto scrollbar-hide flex flex-col bg-black" style={{ paddingTop: 0, marginTop: 0, paddingBottom: '80px' }}>
      {/* Hero Poster - Full-bleed até a status bar */}
      <div 
        className="relative w-full"
        style={{
          height: '60vh',
          minHeight: '400px',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        {/* Full-bleed background image */}
        {fullBleedImage && (
          <div 
            className="absolute inset-0 w-full h-full z-0"
            style={{
              backgroundImage: `url(${fullBleedImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              top: 0,
              left: 0,
              right: 0,
            }}
          />
        )}

        {/* Strong black gradient overlay at bottom - Netflix/Apple TV style */}
        <div 
          className="absolute inset-x-0 bottom-0 z-[5]"
          style={{
            height: '100%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 20%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.9) 60%, rgba(0, 0, 0, 0.98) 80%, rgba(0, 0, 0, 1) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Bar - Back button and IMDb rating */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 1rem), 1rem)' }}>
          <button
            onClick={onClose}
            className="bg-black/40 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-black/60 transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          {imdbRating && (
            <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
              <span className="font-['Montserrat:Medium',sans-serif] text-white text-[14px]">IMDb</span>
              <span className="font-['Montserrat:Bold',sans-serif] text-white text-[14px]">{imdbRating}</span>
            </div>
          )}
        </div>

      </div>

      {/* Content Section - Below poster */}
      <div className="relative bg-black pt-8 px-4 pb-6" style={{ backgroundColor: '#000000' }}>
        <div className="flex flex-col gap-6 items-center w-full max-w-[400px] mx-auto">
          {/* Title - Centered below poster */}
          <h2 className="font-['SF Pro Display',sans-serif] text-white text-center text-[32px] mb-2" style={{ fontWeight: 700 }}>
            {show.name}
          </h2>

          {/* Tags - Genre, Certification, Country, Year */}
          <div className="flex gap-2 justify-center items-center flex-wrap">
            {/* Genre tag */}
            {showGenres.slice(0, 1).map((genre, index) => (
              <span
                key={index}
                className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[12px] font-['Montserrat:Medium',sans-serif] whitespace-nowrap"
              >
                {genre}
              </span>
            ))}
            {/* Certification */}
            {show.certification && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[12px] font-['Montserrat:Medium',sans-serif] whitespace-nowrap">
                {show.certification}
              </span>
            )}
            {/* Country */}
            {originCountry && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[12px] font-['Montserrat:Medium',sans-serif] whitespace-nowrap">
                {originCountry}
              </span>
            )}
            {/* Year */}
            {releaseYear && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[12px] font-['Montserrat:Medium',sans-serif] whitespace-nowrap">
                {releaseYear}
              </span>
            )}
          </div>

          {/* Action Buttons - Trailer, Add, Share - Round buttons */}
          <div className="flex gap-3 justify-center">
            {/* YouTube/Trailer Button */}
            {show.trailer_key ? (
              <a
                href={`https://www.youtube.com/watch?v=${show.trailer_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 border border-white/20"
                style={{ backgroundColor: '#1A1817' }}
              >
                <Youtube className="w-6 h-6 text-white" />
              </a>
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-50 border border-white/20" style={{ backgroundColor: '#1A1817' }}>
                <Youtube className="w-6 h-6 text-white/50" />
              </div>
            )}
            
            {/* Add to List Button */}
            {!isFavorite && (
              <button
                onClick={() => onToggleFavorite(show.id)}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 border border-white/20"
                style={{ backgroundColor: '#1A1817' }}
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            )}
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 border border-white/20"
              style={{ backgroundColor: '#1A1817' }}
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Play Button - Large white button */}
          <button className="w-full bg-white text-black rounded-lg h-[50px] flex items-center justify-center gap-2 font-['Montserrat:Bold',sans-serif] text-[16px] hover:bg-white/90 transition-all active:scale-95">
            <Play className="w-5 h-5 fill-black" />
            Play
          </button>

          {/* Synopsis Section */}
          <div className="w-full">
            <h3 className="font-['Montserrat:Bold',sans-serif] text-white text-[16px] mb-3">
              Sinopse:
            </h3>
            <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[12px] leading-tight">
              {show.overview || 'Sinopse não disponível.'}
            </p>
          </div>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="w-full">
              <h3 className="font-['Montserrat:Bold',sans-serif] text-white text-[16px] mb-4">
                Elenco:
              </h3>
              <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                {cast.map((actor) => (
                  <button
                    key={actor.id}
                    className="flex flex-col gap-2 items-center shrink-0 w-[90px] cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                    onClick={() => onActorClick?.(actor)}
                  >
                    <div className="bg-[#d9d9d9] h-[130px] w-full rounded-[8px] overflow-hidden shadow-md">
                      {actor.profile_path ? (
                        <ImageWithFallback
                          src={`${imageBaseUrl}/w500${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                          N/A
                        </div>
                      )}
                    </div>
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[13px] text-center w-full break-words">
                      {actor.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

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
