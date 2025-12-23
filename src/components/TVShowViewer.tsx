import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePosterColors } from '../hooks/usePosterColors';
import { ChevronLeft, Play, ArrowLeft, Heart } from 'lucide-react';

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
  number_of_seasons?: number;
  last_episode_to_air?: {
    season_number: number;
    episode_number: number;
  };
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
}

export function TVShowViewer({ show, genres, onClose, onActorClick, isFavorite, onToggleFavorite }: TVShowViewerProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  // Extract colors from show poster
  const posterUrl = show.poster_path 
    ? `${imageBaseUrl}${show.poster_path}` 
    : null;
  const colors = usePosterColors(posterUrl);

  const cast = show.credits?.cast.slice(0, 4) || [];
  const showGenres = show.genre_ids.map(id => genres[id]).filter(Boolean).join(', ');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      {/* Blurred poster background */}
      {show.poster_path && (
        <div 
          className="absolute inset-0 -z-20 transition-all duration-700"
          style={{
            backgroundImage: `url(${imageBaseUrl}${show.poster_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.4)',
            transform: 'scale(1.2)',
          }}
        />
      )}

      {/* Gradient overlay with extracted colors */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${colors.backgroundColor} 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.9) 100%)`,
        }}
      />

      {/* Back button - Fixed position */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-white/30 transition-all active:scale-95"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      {/* Poster Display */}
      <div className="flex-shrink-0 py-8 px-8">
        <div className="relative w-full aspect-[2/3] max-w-[320px] mx-auto rounded-[24px] overflow-hidden bg-[#d9d9d9] shadow-2xl">
          {show.poster_path ? (
            <ImageWithFallback
              src={`${imageBaseUrl}${show.poster_path}`}
              alt={show.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Sem imagem
            </div>
          )}
        </div>
      </div>

      {/* Show Information - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6">
        <div className="flex flex-col gap-4 items-center w-full max-w-[400px] mx-auto">
          {/* Title */}
          <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-center text-[24px]">
            {show.name}
          </h2>

          {/* First Air Date */}
          <div className="bg-white/95 backdrop-blur-sm h-[44px] w-full rounded-[8px] flex items-center justify-center px-4 py-2 shadow-lg">
            <p className="font-['Montserrat:Black',sans-serif] text-[#0d0d0e] text-[16px]">
              {formatDate(show.first_air_date)}
            </p>
          </div>

          {/* Trailer Button */}
          {show.trailer_key ? (
            <a
              href={`https://www.youtube.com/watch?v=${show.trailer_key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 hover:bg-red-700 h-[50px] rounded-[10px] flex items-center justify-center gap-3 px-4 py-2 shadow-lg transition-all active:scale-95"
            >
              <Play className="w-5 h-5 text-white fill-white" />
              <p className="font-['Montserrat:Bold',sans-serif] text-white text-[16px]">
                Assistir Trailer
              </p>
            </a>
          ) : (
            <div className="w-full bg-white/10 backdrop-blur-md h-[50px] rounded-[10px] flex items-center justify-center px-4 py-2">
              <p className="font-['Montserrat:Regular',sans-serif] text-white/70 text-[14px]">
                Sem trailer no momento
              </p>
            </div>
          )}

          {/* Season Information */}
          {(show.number_of_seasons || show.last_episode_to_air) && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
                Temporada Atual:
              </p>
              <div className="flex flex-col gap-1">
                {show.last_episode_to_air && (
                  <p className="font-['Montserrat:Bold',sans-serif] text-white/90 text-[15px]">
                    Temporada {show.last_episode_to_air.season_number} • Episódio {show.last_episode_to_air.episode_number}
                  </p>
                )}
                {show.number_of_seasons && (
                  <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[13px]">
                    Total: {show.number_of_seasons} {show.number_of_seasons === 1 ? 'temporada' : 'temporadas'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Genre */}
          {showGenres && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
                Gênero:
              </p>
              <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px]">
                {showGenres}
              </p>
            </div>
          )}

          {/* Synopsis */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
            <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
              Sinopse:
            </p>
            <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px] leading-relaxed">
              {show.overview || 'Sinopse não disponível.'}
            </p>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
                Elenco:
              </p>
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
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/90 text-[13px] text-center w-full break-words">
                      {actor.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(show.id)}
            className={`w-full h-[50px] rounded-[10px] flex items-center justify-center gap-3 px-4 py-2 shadow-lg transition-all active:scale-95 ${
              isFavorite 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-white/10 backdrop-blur-md hover:bg-white/20'
            }`}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'text-white fill-white' : 'text-white/70'}`}
            />
            <p className="font-['Montserrat:Bold',sans-serif] text-white text-[16px]">
              {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}