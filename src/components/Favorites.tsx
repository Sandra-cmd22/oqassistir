import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, Calendar, Play, Bookmark } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
}

interface FavoritesProps {
  movies: Movie[];
  genres: { [key: number]: string };
  onMovieClick: (movie: Movie) => void;
  onToggleFavorite: (movieId: number) => void;
  watchedMovies: number[];
  onToggleWatched: (movieId: number) => void;
}

export function Favorites({ movies, genres, onMovieClick, onToggleFavorite, watchedMovies, onToggleWatched }: FavoritesProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Sort movies by release_date (most recent first)
  const sortedMovies = [...movies].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return dateB - dateA;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (sortedMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Heart className="w-20 h-20 text-white/20 mb-4" />
        <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[24px] mb-2">
          Nenhum favorito ainda
        </h2>
        <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[14px]">
          Adicione filmes aos seus favoritos tocando no ícone de coração
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-black/60 to-transparent flex-shrink-0">
        <h1 className="text-white text-[28px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
          Meus Favoritos
        </h1>
        <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[14px] mt-1">
          {sortedMovies.length} {sortedMovies.length === 1 ? 'filme' : 'filmes'}
        </p>
      </div>

      {/* Movies Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-[60px] scrollbar-hide">
        <div className="flex flex-col gap-4">
          {sortedMovies.map((movie) => {
            const movieGenres = movie.genre_ids.map(id => genres[id]).filter(Boolean).slice(0, 2).join(', ');
            
            return (
              <div
                key={movie.id}
                className="bg-white/10 backdrop-blur-md rounded-[16px] overflow-hidden shadow-lg relative"
              >
                {/* Watched Bookmark - Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatched(movie.id);
                  }}
                  className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    watchedMovies.includes(movie.id)
                      ? 'bg-[#04FFA7] border-2 border-[#04FFA7]'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <Bookmark 
                    className={`w-5 h-5 transition-colors ${
                      watchedMovies.includes(movie.id) ? 'text-white fill-white' : 'text-white/60'
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                <div className="flex gap-4 p-4">
                  {/* Poster */}
                  <button
                    onClick={() => onMovieClick(movie)}
                    className="flex-shrink-0 w-[100px] h-[150px] rounded-[12px] overflow-hidden bg-[#d9d9d9] shadow-md active:opacity-80 transition-opacity"
                  >
                    {movie.poster_path ? (
                      <ImageWithFallback
                        src={`${imageBaseUrl}${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                        Sem imagem
                      </div>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2">
                    <button
                      onClick={() => onMovieClick(movie)}
                      className="text-left active:opacity-80 transition-opacity"
                    >
                      <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] leading-tight line-clamp-2">
                        {movie.title}
                      </h3>
                    </button>

                    {/* Release Date */}
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <p className="font-['Montserrat:Regular',sans-serif] text-[13px]">
                        {formatDate(movie.release_date)}
                      </p>
                    </div>

                    {/* Genre */}
                    {movieGenres && (
                      <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[12px] line-clamp-1">
                        {movieGenres}
                      </p>
                    )}

                    {/* Synopsis */}
                    <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[13px] leading-relaxed line-clamp-2">
                      {movie.overview || 'Sinopse não disponível.'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      {/* Trailer Button */}
                      {movie.trailer_key && (
                        <a
                          href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-[8px] transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                          <span className="font-['Montserrat:SemiBold',sans-serif] text-white text-[12px]">
                            Trailer
                          </span>
                        </a>
                      )}

                      {/* Remove from Favorites */}
                      <button
                        onClick={() => onToggleFavorite(movie.id)}
                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-[8px] transition-all active:scale-95"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span className="font-['Montserrat:SemiBold',sans-serif] text-white text-[12px]">
                          Remover
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
