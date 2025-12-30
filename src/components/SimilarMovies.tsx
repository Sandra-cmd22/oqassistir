import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader2 } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
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

interface SimilarMoviesProps {
  movies: Movie[];
  genres: { [key: number]: string };
  loading: boolean;
  onMovieClick: (movie: Movie) => void;
}

export function SimilarMovies({ movies, genres, loading, onMovieClick }: SimilarMoviesProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
        <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
          Filmes Similares:
        </p>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-4">
      <p className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
        Você pode gostar também:
      </p>
      <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
        {movies.map((movie) => {
          const movieGenres = movie.genre_ids
            .map((id) => genres[id])
            .filter(Boolean)
            .slice(0, 2)
            .join(', ');

          return (
            <button
              key={movie.id}
              onClick={() => onMovieClick(movie)}
              className="flex flex-col gap-2 items-start shrink-0 w-[140px] group"
            >
              {/* Poster */}
              <div className="bg-[#d9d9d9] h-[200px] w-full rounded-[8px] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
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
              </div>

              {/* Movie Info */}
              <div className="flex flex-col gap-1 w-full">
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[14px] text-left line-clamp-2 group-hover:text-white/80 transition-colors">
                  {movie.title}
                </h3>
                {movie.release_date && (
                  <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[12px]">
                    {formatDate(movie.release_date)}
                  </p>
                )}
                {movieGenres && (
                  <p className="font-['Montserrat:Light',sans-serif] text-white/50 text-[11px] line-clamp-1">
                    {movieGenres}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

