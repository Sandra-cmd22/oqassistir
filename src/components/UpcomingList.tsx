import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
}

interface UpcomingListProps {
  movies: Movie[];
  genres: { [key: number]: string };
  onMovieClick: (index: number) => void;
}

export function UpcomingList({ movies, genres, onMovieClick }: UpcomingListProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w200';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px] mb-4">
        Próximos Lançamentos
      </h2>
      
      {movies.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/70 text-center font-['Montserrat:Light',sans-serif]">
            Nenhum filme encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {movies.map((movie, index) => {
            const movieGenres = movie.genre_ids.map(id => genres[id]).filter(Boolean).slice(0, 2).join(', ');
            
            return (
              <button
                key={movie.id}
                onClick={() => onMovieClick(index)}
                className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3 hover:bg-white/20 transition-all"
              >
                {/* Poster thumbnail */}
                <div className="w-[60px] h-[90px] rounded-[6px] overflow-hidden bg-[#d9d9d9] shrink-0">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]">
                      N/A
                    </div>
                  )}
                </div>

                {/* Movie info */}
                <div className="flex-1 flex flex-col items-start gap-1 text-left">
                  <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[15px] line-clamp-2">
                    {movie.title}
                  </h3>
                  
                  <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px]">
                    {formatDate(movie.release_date)}
                  </p>
                  
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
      )}
    </div>
  );
}
