import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
}

interface ActorMoviesProps {
  actor: Actor;
  apiKey: string;
  onClose: () => void;
  onMovieClick: (movie: Movie, movieList: Movie[]) => void;
}

export function ActorMovies({ actor, apiKey, onClose, onMovieClick }: ActorMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    const fetchActorMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${apiKey}&language=pt-BR`
        );
        const data = await response.json();
        
        // Filter and sort movies
        const sortedMovies = data.cast
          .filter((movie: Movie) => movie.poster_path) // Only movies with posters
          .sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.release_date || '1900-01-01');
            const dateB = new Date(b.release_date || '1900-01-01');
            return dateB.getTime() - dateA.getTime(); // Most recent first
          })
          .slice(0, 20); // Limit to 20 movies
        
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching actor movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActorMovies();
  }, [actor.id, apiKey]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { year: 'numeric' });
  };

  const handleMovieClick = async (movie: Movie) => {
    setLoadingMovie(true);
    
    try {
      // Fetch complete movie details
      const [creditsResponse, videosResponse, providersResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${apiKey}`)
      ]);
      
      const creditsData = await creditsResponse.json();
      const videosData = await videosResponse.json();
      const providersData = await providersResponse.json();
      
      // Find official trailer
      const trailer = videosData.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      // Get Brazil providers (flatrate = streaming)
      const brProviders = providersData.results?.BR?.flatrate || [];
      const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
        logo_path: provider.logo_path,
        provider_name: provider.provider_name
      }));
      
      // Create complete movie object
      const completeMovie: Movie = {
        ...movie,
        trailer_key: trailer?.key,
        watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
        credits: {
          cast: creditsData.cast.slice(0, 4)
        }
      };
      
      // Update the movies list with complete data
      const updatedMovies = movies.map(m => 
        m.id === movie.id ? completeMovie : m
      );
      
      setMovies(updatedMovies);
      
      // Call onMovieClick with complete movie data
      onMovieClick(completeMovie, updatedMovies);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      // If fetch fails, just open with basic data
      onMovieClick(movie, movies);
    } finally {
      setLoadingMovie(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#000000] from-25% to-[#5f5476] z-50 overflow-y-auto">
      {/* Loading overlay */}
      {loadingMovie && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-[16px] p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="font-['Montserrat:Regular',sans-serif] text-white text-[14px]">
              Carregando filme...
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex-1">
          <h1 className="font-['Montserrat:Bold',sans-serif] text-white text-[18px]">
            {actor.name}
          </h1>
          <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[12px]">
            Filmografia
          </p>
        </div>

        {actor.profile_path && (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d9d9d9]">
            <ImageWithFallback
              src={`${imageBaseUrl}${actor.profile_path}`}
              alt={actor.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      ) : (
        <div className="px-6 py-6">
          <p className="font-['Montserrat:Regular',sans-serif] text-white/80 text-[14px] mb-6">
            {movies.length} {movies.length === 1 ? 'filme encontrado' : 'filmes encontrados'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {movies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:scale-105 transition-transform">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                      N/A
                    </div>
                  )}
                </div>
                
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[13px] line-clamp-2 text-left mb-1">
                  {movie.title}
                </h3>
                
                <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[11px] text-left">
                  {formatDate(movie.release_date)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}