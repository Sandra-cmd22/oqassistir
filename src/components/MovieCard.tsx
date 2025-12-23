import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
  };
}

interface MovieCardProps {
  movie: Movie;
  genres: { [key: number]: string };
}

export function MovieCard({ movie, genres }: MovieCardProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const cast = movie.credits?.cast.slice(0, 4) || [];
  const movieGenres = movie.genre_ids.map(id => genres[id]).filter(Boolean).join(', ');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col gap-[15px] items-center w-full max-w-[271px] mx-auto">
      {/* Poster */}
      <div className="relative w-full aspect-[3/4] rounded-[10px] overflow-hidden bg-[#d9d9d9]">
        {movie.poster_path ? (
          <ImageWithFallback
            src={`${imageBaseUrl}${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Sem imagem
          </div>
        )}
      </div>

      {/* Title and Release Date */}
      <div className="flex flex-col gap-[15px] items-start w-full">
        <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-white text-[16px] leading-[normal]">
          {movie.title}
        </p>
        <div className="bg-white h-[36px] w-full rounded-[5px] flex items-center justify-center px-[10px] py-[8px]">
          <p className="font-['Montserrat:Black',sans-serif] font-black text-[#0d0d0e] text-[16px] leading-[normal]">
            {formatDate(movie.release_date)}
          </p>
        </div>
      </div>

      {/* Genre */}
      {movieGenres && (
        <div className="w-full">
          <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-white text-[16px] leading-[normal] mb-[10px]">
            Gênero:
          </p>
          <p className="font-['Montserrat:Light',sans-serif] font-light text-white text-[14px] leading-[normal]">
            {movieGenres}
          </p>
        </div>
      )}

      {/* Synopsis */}
      <div className="w-full">
        <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-white text-[16px] leading-[normal] mb-[10px]">
          Sinopse:
        </p>
        <p className="font-['Montserrat:Light',sans-serif] font-light text-white text-[14px] leading-[normal]">
          {movie.overview || 'Sinopse não disponível.'}
        </p>
      </div>

      {/* Cast */}
      {cast.length > 0 && (
        <div className="w-full">
          <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-white text-[16px] leading-[normal] mb-[15px]">
            Elenco:
          </p>
          <div className="flex gap-[8px] w-full overflow-x-auto pb-2 scrollbar-hide">
            {cast.map((actor) => (
              <div key={actor.id} className="flex flex-col gap-[8px] items-center shrink-0 w-[92px]">
                <div className="bg-[#d9d9d9] h-[135px] w-full rounded-[5px] overflow-hidden">
                  {actor.profile_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      N/A
                    </div>
                  )}
                </div>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal text-white text-[14px] leading-[normal] text-center w-full break-words">
                  {actor.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
