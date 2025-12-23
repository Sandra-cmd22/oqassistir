import { useState, useMemo, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Loader2 } from 'lucide-react';
import { StreamingBadge } from './StreamingBadge';
import Group7 from '../imports/Group7';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  imdb_id?: string;
  watch_providers?: {
    logo_path: string;
    provider_name: string;
  }[];
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  watch_providers?: {
    logo_path: string;
    provider_name: string;
  }[];
}

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}

interface HomeProps {
  upcomingMovies: Movie[];
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
  tvShows: TVShow[];
  onMovieClick: (movie: Movie, movieList: Movie[]) => void;
  onTVShowClick: (show: TVShow) => void;
  onActorClick: (actor: { id: number; name: string; profile_path: string | null }) => void;
  apiKey: string;
}

export function Home({ upcomingMovies, popularMovies, nowPlayingMovies, tvShows, onMovieClick, onTVShowClick, onActorClick, apiKey }: HomeProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w300';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchTVResults, setSearchTVResults] = useState<TVShow[]>([]);
  const [searchActorResults, setSearchActorResults] = useState<Actor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get movies releasing this week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const thisWeekMovies = upcomingMovies.filter(movie => {
    const releaseDate = new Date(movie.release_date);
    return releaseDate >= today && releaseDate <= nextWeek;
  }).slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Filter movies based on search
  const filteredUpcomingMovies = upcomingMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPopularMovies = popularMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredThisWeekMovies = thisWeekMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      
      // Buscar filmes
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchQuery}&language=pt-BR`)
        .then(response => response.json())
        .then(async (data) => {
          const movies = data.results || [];
          // Buscar imdb_id para cada filme
          const moviesWithImdb = await Promise.all(
            movies.slice(0, 20).map(async (movie: Movie) => {
              try {
                const detailsResponse = await fetch(
                  `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`
                );
                const details = await detailsResponse.json();
                return { ...movie, imdb_id: details.imdb_id };
              } catch {
                return movie;
              }
            })
          );
          setSearchResults(moviesWithImdb);
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
          setSearchResults([]);
        });

      // Buscar séries
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${searchQuery}&language=pt-BR`)
        .then(response => response.json())
        .then(data => {
          setSearchTVResults(data.results || []);
        })
        .catch(error => {
          console.error('Error fetching TV search results:', error);
          setSearchTVResults([]);
        });

      // Buscar atores/atrizes
      fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${searchQuery}&language=pt-BR`)
        .then(response => response.json())
        .then(data => {
          setSearchActorResults(data.results || []);
          setIsSearching(false);
        })
        .catch(error => {
          console.error('Error fetching actor search results:', error);
          setSearchActorResults([]);
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
      setSearchTVResults([]);
      setSearchActorResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, apiKey]);

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen overflow-y-auto scrollbar-hide pb-[72px]">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        {/* Logo */}
        <div className="h-[36px] w-[60px] mb-[15px]">
          <Group7 />
        </div>
        
        <h1 className="font-['Montserrat:Black',sans-serif] text-white text-[28px] mb-2">
          Explore
        </h1>
        <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[14px] mb-4">
          Descubra os melhores lançamentos
        </p>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar filmes e séries..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-[12px] pl-12 pr-4 py-3 text-white placeholder:text-white/40 font-['Montserrat:Regular',sans-serif] text-[14px] focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 animate-spin z-10" />
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          {/* Movies Results */}
          {searchResults.length > 0 && (
            <>
              <div className="px-6 mb-4">
                <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
                  Filmes
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-6 space-y-3 pb-6">
                {searchResults.slice(0, 20).map((movie) => (
                  <button
                    key={`movie-${movie.id}`}
                    onClick={() => onMovieClick(movie, searchResults)}
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
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Montserrat:Bold',sans-serif] text-[#6416ff] text-[10px] px-2 py-0.5 bg-[#6416ff]/20 rounded-full">
                          FILME
                        </span>
                        {movie.release_date && (
                          <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px]">
                            {new Date(movie.release_date).getFullYear()}
                          </p>
                        )}
                        {movie.imdb_id && (
                          <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-['Montserrat:Regular',sans-serif] text-[#ffa500] text-[11px] hover:underline"
                          >
                            IMDb
                          </a>
                        )}
                      </div>
                      
                      {movie.overview && (
                        <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[12px] line-clamp-2">
                          {movie.overview}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* TV Shows Results */}
          {searchTVResults.length > 0 && (
            <>
              <div className="px-6 mb-4">
                <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
                  Séries
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchTVResults.length} {searchTVResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-6 space-y-3 pb-6">
                {searchTVResults.slice(0, 20).map((show) => (
                  <button
                    key={`tv-${show.id}`}
                    onClick={() => onTVShowClick(show)}
                    className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3 hover:bg-white/20 transition-all"
                  >
                    {/* Poster thumbnail */}
                    <div className="w-[60px] h-[90px] rounded-[6px] overflow-hidden bg-[#d9d9d9] shrink-0">
                      {show.poster_path ? (
                        <ImageWithFallback
                          src={`${imageBaseUrl}${show.poster_path}`}
                          alt={show.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]">
                          N/A
                        </div>
                      )}
                    </div>

                    {/* TV Show info */}
                    <div className="flex-1 flex flex-col items-start gap-1 text-left">
                      <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[15px] line-clamp-2">
                        {show.name}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-['Montserrat:Bold',sans-serif] text-[#ff6416] text-[10px] px-2 py-0.5 bg-[#ff6416]/20 rounded-full">
                          SÉRIE
                        </span>
                        {show.first_air_date && (
                          <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px]">
                            {new Date(show.first_air_date).getFullYear()}
                          </p>
                        )}
                      </div>
                      
                      {show.overview && (
                        <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[12px] line-clamp-2">
                          {show.overview}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Actors Results */}
          {searchActorResults.length > 0 && (
            <>
              <div className="px-6 mb-4">
                <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
                  Atores e Atrizes
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchActorResults.length} {searchActorResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-6 space-y-3 pb-6">
                {searchActorResults.slice(0, 20).map((actor) => (
                  <button
                    key={`actor-${actor.id}`}
                    onClick={() => onActorClick({ id: actor.id, name: actor.name, profile_path: actor.profile_path })}
                    className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3 hover:bg-white/20 transition-all"
                  >
                    {/* Profile photo */}
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#d9d9d9] shrink-0">
                      {actor.profile_path ? (
                        <ImageWithFallback
                          src={`${imageBaseUrl}${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] bg-[#6416ff]/20">
                          {actor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Actor info */}
                    <div className="flex-1 flex flex-col items-start gap-1 text-left">
                      <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[15px]">
                        {actor.name}
                      </h3>
                      
                      {actor.known_for_department && (
                        <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px]">
                          {actor.known_for_department === 'Acting' ? 'Ator/Atriz' : actor.known_for_department}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {searchResults.length === 0 && searchTVResults.length === 0 && searchActorResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[14px]">
                Nenhum resultado encontrado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Now Playing Section */}
      {!searchQuery && nowPlayingMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-6 mb-4 flex items-center gap-2">
            <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
              🎬 Em Cartaz
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
            {nowPlayingMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, nowPlayingMovies)}
                className="shrink-0 w-[140px] group"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-active:opacity-80 transition-opacity">
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
                  {/* Streaming providers badge */}
                  {movie.watch_providers && <StreamingBadge providers={movie.watch_providers} />}
                </div>
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[13px] line-clamp-2 text-left h-[36px]">
                  {movie.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* This Week Section */}
      {!searchQuery && filteredThisWeekMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-6 mb-4 flex items-center gap-2">
            <StreamingBadge />
            <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
              Lançamentos da Semana
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
            {filteredThisWeekMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, thisWeekMovies)}
                className="shrink-0 w-[140px] group"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-active:opacity-80 transition-opacity">
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
                  {/* Streaming providers badge */}
                  {movie.watch_providers && <StreamingBadge providers={movie.watch_providers} />}
                  {/* Release date badge */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-[6px] px-2 py-1">
                    <p className="font-['Montserrat:Bold',sans-serif] text-[#0d0d0e] text-[11px] text-center">
                      {formatDate(movie.release_date)}
                    </p>
                  </div>
                </div>
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[13px] line-clamp-2 text-left h-[36px]">
                  {movie.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Movies Section */}
      {!searchQuery && filteredPopularMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-6 mb-4 flex items-center gap-2">
            <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
              Mais Populares
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
            {filteredPopularMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, popularMovies)}
                className="shrink-0 w-[140px] group"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-active:opacity-80 transition-opacity">
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
                  {/* Streaming providers badge */}
                  {movie.watch_providers && <StreamingBadge providers={movie.watch_providers} />}
                </div>
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[13px] line-clamp-2 text-left h-[36px]">
                  {movie.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TV Shows Section */}
      {!searchQuery && tvShows.length > 0 && (
        <div className="mb-8">
          <div className="px-6 mb-4 flex items-center gap-2">
            <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
              Séries no Ar
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
            {tvShows.map((show) => (
              <button
                key={show.id}
                onClick={() => onTVShowClick(show)}
                className="shrink-0 w-[140px] group"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-active:opacity-80 transition-opacity">
                  {show.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${show.poster_path}`}
                      alt={show.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                      N/A
                    </div>
                  )}
                  {/* Streaming providers badge */}
                  {show.watch_providers && <StreamingBadge providers={show.watch_providers} />}
                  {/* Air date badge */}
                  {show.first_air_date && (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-[6px] px-2 py-1">
                      <p className="font-['Montserrat:Bold',sans-serif] text-[#0d0d0e] text-[11px] text-center">
                        {formatDate(show.first_air_date)}
                      </p>
                    </div>
                  )}
                </div>
                <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[13px] line-clamp-2 text-left h-[36px]">
                  {show.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Upcoming Section */}
      {!searchQuery && (
        <div className="mb-8">
          <div className="px-6 mb-4">
            <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
              Todos os Próximos Lançamentos
            </h2>
          </div>
          
          <div className="px-6 space-y-3 pb-6">
            {filteredUpcomingMovies.slice(0, 15).map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, upcomingMovies)}
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
                  
                  <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[12px] line-clamp-2">
                    {movie.overview}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}