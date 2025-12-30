import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePosterColors } from '../hooks/usePosterColors';
import { useSimilarMovies } from '../hooks/useSimilarMovies';
import { SimilarMovies } from './SimilarMovies';
import { Heart, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
  };
}

interface MovieSwiperProps {
  movies: Movie[];
  genres: { [key: number]: string };
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onActorClick: (actor: { id: number; name: string; profile_path: string | null }) => void;
  favorites: number[];
  onToggleFavorite: (movieId: number) => void;
  apiKey: string;
  onMovieClick: (movie: Movie, movieList: Movie[]) => void;
}

export function MovieSwiper({ movies, genres, currentIndex, onIndexChange, onActorClick, favorites, onToggleFavorite, apiKey, onMovieClick }: MovieSwiperProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const currentMovie = movies[currentIndex];
  
  // Extract colors from current movie poster
  const posterUrl = currentMovie?.poster_path 
    ? `${imageBaseUrl}${currentMovie.poster_path}` 
    : null;
  const colors = usePosterColors(posterUrl);

  // Buscar filmes similares
  const { similarMovies, loading: loadingSimilar } = useSimilarMovies({
    movieId: currentMovie?.id || null,
    apiKey,
    maxResults: 10,
  });

  if (!currentMovie) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white text-center font-['Montserrat:Light',sans-serif] font-light">
          Nenhum filme encontrado.
        </p>
      </div>
    );
  }

  const cast = currentMovie.credits?.cast.slice(0, 4) || [];
  const movieGenres = currentMovie.genre_ids.map(id => genres[id]).filter(Boolean).join(', ');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < movies.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      {/* Blurred poster background */}
      {currentMovie.poster_path && (
        <div 
          className="absolute inset-0 -z-20 transition-all duration-700"
          style={{
            backgroundImage: `url(${imageBaseUrl}${currentMovie.poster_path})`,
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

      {/* Favorite button - Fixed position */}
      <button
        onClick={() => onToggleFavorite(currentMovie.id)}
        className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-white/30 transition-all active:scale-95"
      >
        <Heart
          className={`w-6 h-6 transition-all duration-300 ${
            favorites.includes(currentMovie.id) 
              ? 'text-red-500 fill-red-500' 
              : 'text-white'
          }`}
        />
      </button>

      {/* Poster Display */}
      <div className="flex-shrink-0 py-8 px-8 relative">
        {/* Navigation buttons - Positioned beside poster */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-white/30 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {currentIndex < movies.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-white/30 transition-all active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        <div className="relative w-full aspect-[2/3] max-w-[320px] mx-auto rounded-[24px] overflow-hidden bg-[#d9d9d9] shadow-2xl">
          {currentMovie.poster_path ? (
            <ImageWithFallback
              src={`${imageBaseUrl}${currentMovie.poster_path}`}
              alt={currentMovie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Sem imagem
            </div>
          )}
        </div>
      </div>

      {/* Movie Information - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6">
        <div className="flex flex-col gap-4 items-center w-full max-w-[400px] mx-auto">
          {/* Title */}
          <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-center text-[24px]">
            {currentMovie.title}
          </h2>

          {/* Release Date */}
          <div className="bg-white/95 backdrop-blur-sm h-[44px] w-full rounded-[8px] flex items-center justify-center px-4 py-2 shadow-lg">
            <p className="font-['Montserrat:Black',sans-serif] text-[#0d0d0e] text-[16px]">
              {formatDate(currentMovie.release_date)}
            </p>
          </div>

          {/* Trailer Button */}
          {currentMovie.trailer_key ? (
            <a
              href={`https://www.youtube.com/watch?v=${currentMovie.trailer_key}`}
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

          {/* Genre */}
          {movieGenres && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
              <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
                Gênero:
              </p>
              <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px]">
                {movieGenres}
              </p>
            </div>
          )}

          {/* Synopsis */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
            <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-2">
              Sinopse:
            </p>
            <p className="font-['Montserrat:Light',sans-serif] text-white/90 text-[14px] leading-relaxed">
              {currentMovie.overview || 'Sinopse não disponível.'}
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
                    onClick={() => onActorClick(actor)}
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

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <SimilarMovies
              movies={similarMovies.filter(movie => !movies.some(m => m.id === movie.id))}
              genres={genres}
              loading={loadingSimilar}
              onMovieClick={(movie) => {
                // Verifica se o filme já está na lista
                const existingIndex = movies.findIndex(m => m.id === movie.id);
                if (existingIndex >= 0) {
                  // Se já está na lista, apenas navega para ele
                  onIndexChange(existingIndex);
                } else {
                  // Adiciona o filme similar à lista e navega para ele
                  const updatedMovies = [...movies, movie];
                  const newIndex = updatedMovies.length - 1;
                  onMovieClick(movie, updatedMovies);
                  onIndexChange(newIndex);
                }
              }}
            />
          )}

          {/* Movie indicator */}
          <div className="flex gap-2 py-4">
            {movies.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-2'
                }`}
              />
            ))}
            {movies.length > 10 && (
              <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[12px] ml-1">
                +{movies.length - 10}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}