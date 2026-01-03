import { useState, useMemo, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { FilmStrip, Calendar, House, Television } from 'phosphor-react';
import { StreamingBadge } from './StreamingBadge';
import { SkeletonSection } from './SkeletonCard';
import logoImage from '../assets/logo.oficial.svg';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
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

interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
}

interface Company {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

interface Keyword {
  id: number;
  name: string;
}

interface HomeProps {
  upcomingMovies: Movie[];
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
  nostalgicMovies: Movie[];
  tvShows: TVShow[];
  onMovieClick: (movie: Movie, movieList: Movie[]) => void;
  onTVShowClick: (show: TVShow) => void;
  onActorClick: (actor: { id: number; name: string; profile_path: string | null }) => void;
  apiKey: string;
  genres?: { [key: number]: string };
  selectedGenres?: number[];
  selectedMonth?: number | null;
  onGenreToggle?: (genreId: number) => void;
  onFilterClick?: () => void;
}

export function Home({ upcomingMovies, popularMovies, nowPlayingMovies, nostalgicMovies, tvShows, onMovieClick, onTVShowClick, onActorClick, apiKey, genres = {}, selectedGenres = [], selectedMonth = null, onGenreToggle, onFilterClick }: HomeProps) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w300';
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchTVResults, setSearchTVResults] = useState<TVShow[]>([]);
  const [searchActorResults, setSearchActorResults] = useState<Actor[]>([]);
  const [searchCollectionResults, setSearchCollectionResults] = useState<Collection[]>([]);
  const [searchCompanyResults, setSearchCompanyResults] = useState<Company[]>([]);
  const [searchKeywordResults, setSearchKeywordResults] = useState<Keyword[]>([]);
  const [genreSearchResults, setGenreSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllNowPlaying, setShowAllNowPlaying] = useState(false);
  const [showAllThisWeek, setShowAllThisWeek] = useState(false);
  const [showAllNostalgic, setShowAllNostalgic] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [showAllTVShows, setShowAllTVShows] = useState(false);
  
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

  // Debounce search query - only search after 3 characters and 300ms delay
  useEffect(() => {
    if (searchQuery.length === 0) {
      setDebouncedSearchQuery('');
      return;
    }

    if (searchQuery.length < 3) {
      setDebouncedSearchQuery('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    // Check if there are active filters
    const hasActiveFilters = selectedGenres.length > 0 || selectedMonth !== null;
    
    // Only search if we have at least 3 characters or active filters
    const shouldSearch = (debouncedSearchQuery && debouncedSearchQuery.length >= 3) || hasActiveFilters;
    
    if (!shouldSearch) {
      // Clear all results if no search
      setSearchResults([]);
      setSearchTVResults([]);
      setSearchActorResults([]);
      setSearchCollectionResults([]);
      setSearchCompanyResults([]);
      setSearchKeywordResults([]);
      setGenreSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // AbortController for cancelling previous requests
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Build discover URL with filters (only used when there's no search query)
    const buildDiscoverUrl = () => {
      const params = new URLSearchParams({
        api_key: apiKey,
        language: 'pt-BR',
        sort_by: 'title.asc', // Ordem alfabética quando não há busca
        page: '1'
      });

      // Add genre filters
      if (selectedGenres.length > 0) {
        params.append('with_genres', selectedGenres.join(','));
      }

      // Add month filter (convert to date range)
      if (selectedMonth !== null) {
        const currentYear = new Date().getFullYear();
        const monthStart = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
        const monthEnd = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`;
        params.append('primary_release_date.gte', monthStart);
        params.append('primary_release_date.lte', monthEnd);
      }

      return `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
    };

    // Use search API if there's a query, otherwise use discover API for filters only
    const hasFilters = selectedGenres.length > 0 || selectedMonth !== null;
    const fetchPromises: Promise<void>[] = [];
    
    // Buscar filmes
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 3) {
      // Se há texto de busca, sempre usar search API
      const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}&language=pt-BR`;
      
      const moviePromise = fetch(searchUrl, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch movies');
          return response.json();
        })
        .then(async (data) => {
          if (signal.aborted) return;
          let movies = data.results || [];
          
          // Aplicar filtros localmente se houver
          if (selectedGenres.length > 0) {
            movies = movies.filter((movie: Movie) => 
              movie.genre_ids && movie.genre_ids.some((id: number) => selectedGenres.includes(id))
            );
          }
          
          if (selectedMonth !== null) {
            const currentYear = new Date().getFullYear();
            const targetMonth = selectedMonth + 1;
            movies = movies.filter((movie: Movie) => {
              if (!movie.release_date) return false;
              const releaseDate = new Date(movie.release_date);
              return releaseDate.getFullYear() === currentYear && releaseDate.getMonth() === selectedMonth;
            });
          }
          
          // Buscar imdb_id para cada filme (limitado a 20 para performance)
          const moviesWithImdb = await Promise.all(
            movies.slice(0, 20).map(async (movie: Movie) => {
              if (signal.aborted) return movie;
              try {
                const detailsResponse = await fetch(
                  `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`,
                  { signal }
                );
                const details = await detailsResponse.json();
                return { ...movie, imdb_id: details.imdb_id };
              } catch {
                return movie;
              }
            })
          );
          if (!signal.aborted) {
            setSearchResults(moviesWithImdb);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching search results:', error);
          if (!signal.aborted) {
            setSearchResults([]);
          }
        });
      fetchPromises.push(moviePromise);
    } else if (hasFilters && !debouncedSearchQuery) {
      // Se não há texto mas há filtros, usar discover API
      const discoverUrl = buildDiscoverUrl();
      
      const moviePromise = fetch(discoverUrl, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch movies');
          return response.json();
        })
        .then(async (data) => {
          if (signal.aborted) return;
          const movies = data.results || [];
          // Buscar imdb_id para cada filme (limitado a 20 para performance)
          const moviesWithImdb = await Promise.all(
            movies.slice(0, 20).map(async (movie: Movie) => {
              if (signal.aborted) return movie;
              try {
                const detailsResponse = await fetch(
                  `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`,
                  { signal }
                );
                const details = await detailsResponse.json();
                return { ...movie, imdb_id: details.imdb_id };
              } catch {
                return movie;
              }
            })
          );
          if (!signal.aborted) {
            setSearchResults(moviesWithImdb);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching discover results:', error);
          if (!signal.aborted) {
            setSearchResults([]);
          }
        });
      fetchPromises.push(moviePromise);
    } else {
      // Sem busca e sem filtros, limpar resultados
      setSearchResults([]);
    }

    // Only fetch other results if we have a search query (not just filters)
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 3) {
      // Buscar séries
      const tvPromise = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}&language=pt-BR`, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch TV shows');
          return response.json();
        })
        .then(data => {
          if (!signal.aborted) {
            setSearchTVResults(data.results || []);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching TV search results:', error);
          if (!signal.aborted) {
            setSearchTVResults([]);
          }
        });
      fetchPromises.push(tvPromise);

      // Buscar atores/atrizes
      const actorPromise = fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}&language=pt-BR`, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch actors');
          return response.json();
        })
        .then(data => {
          if (!signal.aborted) {
            setSearchActorResults(data.results || []);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching actor search results:', error);
          if (!signal.aborted) {
            setSearchActorResults([]);
          }
        });
      fetchPromises.push(actorPromise);

      // Buscar coleções
      const collectionPromise = fetch(`https://api.themoviedb.org/3/search/collection?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}&language=pt-BR`, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch collections');
          return response.json();
        })
        .then(data => {
          if (!signal.aborted) {
            setSearchCollectionResults(data.results || []);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching collection search results:', error);
          if (!signal.aborted) {
            setSearchCollectionResults([]);
          }
        });
      fetchPromises.push(collectionPromise);

      // Buscar empresas
      const companyPromise = fetch(`https://api.themoviedb.org/3/search/company?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}`, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch companies');
          return response.json();
        })
        .then(data => {
          if (!signal.aborted) {
            setSearchCompanyResults(data.results || []);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching company search results:', error);
          if (!signal.aborted) {
            setSearchCompanyResults([]);
          }
        });
      fetchPromises.push(companyPromise);

      // Buscar palavras-chave
      const keywordPromise = fetch(`https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(debouncedSearchQuery)}`, { signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch keywords');
          return response.json();
        })
        .then(data => {
          if (!signal.aborted) {
            setSearchKeywordResults(data.results || []);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching keyword search results:', error);
          if (!signal.aborted) {
            setSearchKeywordResults([]);
          }
        });
      fetchPromises.push(keywordPromise);
    } else {
      // Clear these if no search query
      setSearchTVResults([]);
      setSearchActorResults([]);
      setSearchCollectionResults([]);
      setSearchCompanyResults([]);
      setSearchKeywordResults([]);
    }

    // Always clear genre search results (removed genreMatch logic)
    setGenreSearchResults([]);

    // Wait for all promises to complete
    Promise.all(fetchPromises)
      .then(() => {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      });

    // Cleanup: abort requests when dependencies change
    return () => {
      abortController.abort();
    };
  }, [debouncedSearchQuery, apiKey, selectedGenres, selectedMonth]);

  // Featured movie para o header destacado
  const featuredMovie = !debouncedSearchQuery && (popularMovies.length > 0 || upcomingMovies.length > 0)
    ? (popularMovies[0] || upcomingMovies[0])
    : null;
  
  const featuredBackdropUrl = featuredMovie 
    ? (featuredMovie.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}`
        : featuredMovie.poster_path 
        ? `https://image.tmdb.org/t/p/w1280${featuredMovie.poster_path}`
        : null)
    : null;
  
  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-black min-h-screen overflow-y-auto scrollbar-hide pb-[60px]" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="pt-8 pb-4">
        <div className="px-4 mb-4">
          {/* Logo */}
          <div className="h-[24px] w-auto">
            <img 
              src={logoImage} 
              alt="OQ Assistir" 
              className="h-full w-auto object-contain"
            />
          </div>
        </div>

        {/* Search Input with Filter Icon */}
        <div className="px-4 flex items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 z-10 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes..."
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[16px] pl-12 pr-4 py-3 text-white placeholder:text-white/30 font-['Montserrat:Regular',sans-serif] text-[14px] focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin z-10" />
            )}
          </div>
          {onFilterClick && debouncedSearchQuery && debouncedSearchQuery.length >= 3 && (
            <button
              onClick={onFilterClick}
              className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-[16px] transition-all flex-shrink-0"
            >
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>


      {/* Search Results */}
      {debouncedSearchQuery && (
        <div className="mb-8">
          {/* Movies Results */}
          {searchResults.length > 0 && (
            <>
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Filmes
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
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
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Séries
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchTVResults.length} {searchTVResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
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
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Atores e Atrizes
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchActorResults.length} {searchActorResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
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
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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

          {/* Genre Search Results */}
          {genreSearchResults.length > 0 && (
            <>
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Filmes por Gênero
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {genreSearchResults.length} {genreSearchResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
                {genreSearchResults.slice(0, 20).map((movie) => (
                  <button
                    key={`genre-movie-${movie.id}`}
                    onClick={() => onMovieClick(movie, genreSearchResults)}
                    className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3 hover:bg-white/20 transition-all group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="w-[60px] h-[90px] rounded-[6px] overflow-hidden bg-[#d9d9d9] shrink-0">
                      {movie.poster_path ? (
                        <ImageWithFallback
                          src={`${imageBaseUrl}${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]">
                          N/A
                        </div>
                      )}
                    </div>
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

          {/* Collections Results */}
          {searchCollectionResults.length > 0 && (
            <>
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Coleções
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchCollectionResults.length} {searchCollectionResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
                {searchCollectionResults.slice(0, 10).map((collection) => (
                  <div
                    key={`collection-${collection.id}`}
                    className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3"
                  >
                    <div className="w-[60px] h-[90px] rounded-[6px] overflow-hidden bg-[#d9d9d9] shrink-0">
                      {collection.poster_path ? (
                        <ImageWithFallback
                          src={`${imageBaseUrl}${collection.poster_path}`}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1 text-left">
                      <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[15px] line-clamp-2">
                        {collection.name}
                      </h3>
                      <span className="font-['Montserrat:Bold',sans-serif] text-[#00D98B] text-[10px] px-2 py-0.5 bg-[#00D98B]/20 rounded-full">
                        COLEÇÃO
                      </span>
                      {collection.overview && (
                        <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[12px] line-clamp-2">
                          {collection.overview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Companies Results */}
          {searchCompanyResults.length > 0 && (
            <>
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Empresas de Produção
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchCompanyResults.length} {searchCompanyResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 space-y-3 pb-6">
                {searchCompanyResults.slice(0, 10).map((company) => (
                  <div
                    key={`company-${company.id}`}
                    className="w-full bg-white/10 backdrop-blur-md rounded-[10px] p-3 flex gap-3"
                  >
                    <div className="w-[60px] h-[60px] rounded-[6px] overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                      {company.logo_path ? (
                        <ImageWithFallback
                          src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                          alt={company.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1 text-left">
                      <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[15px]">
                        {company.name}
                      </h3>
                      <span className="font-['Montserrat:Bold',sans-serif] text-[#ff6416] text-[10px] px-2 py-0.5 bg-[#ff6416]/20 rounded-full">
                        EMPRESA
                      </span>
                      {company.origin_country && (
                        <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px]">
                          {company.origin_country}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Keywords Results */}
          {searchKeywordResults.length > 0 && (
            <>
              <div className="px-4 mb-4">
                <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                  Palavras-chave
                </h2>
                <p className="font-['Montserrat:Light',sans-serif] text-white/60 text-[13px] mt-1">
                  {searchKeywordResults.length} {searchKeywordResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
              
              <div className="px-4 flex flex-wrap gap-2 pb-6">
                {searchKeywordResults.slice(0, 20).map((keyword) => (
                  <span
                    key={`keyword-${keyword.id}`}
                    className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white text-[13px] font-['Montserrat:Regular',sans-serif]"
                  >
                    {keyword.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {searchResults.length === 0 && searchTVResults.length === 0 && searchActorResults.length === 0 && 
           genreSearchResults.length === 0 && searchCollectionResults.length === 0 && 
           searchCompanyResults.length === 0 && searchKeywordResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[14px]">
                Nenhum resultado encontrado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Now Playing Section */}
      {!debouncedSearchQuery && nowPlayingMovies.length === 0 && popularMovies.length === 0 && upcomingMovies.length === 0 && (
        <SkeletonSection />
      )}
      {!debouncedSearchQuery && nowPlayingMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilmStrip className="w-5 h-5" style={{ color: '#F4F2F2' }} weight="fill" />
              <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                Em Cartaz
            </h2>
            </div>
            <button 
              onClick={() => setShowAllNowPlaying(!showAllNowPlaying)}
              className="text-white/60 text-[12px] font-['Montserrat:Regular',sans-serif] hover:text-white transition-colors"
            >
              {showAllNowPlaying ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          
          <div className={`flex gap-4 ${showAllNowPlaying ? 'flex-wrap px-4' : 'overflow-x-auto scrollbar-hide px-4 pb-2 scroll-smooth'}`}>
            {(showAllNowPlaying ? nowPlayingMovies : nowPlayingMovies.slice(0, 10)).map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, nowPlayingMovies)}
                className="shrink-0 w-[140px] group transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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
      {!debouncedSearchQuery && filteredThisWeekMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#F4F2F2' }} weight="fill" />
              <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
              Lançamentos da Semana
            </h2>
            </div>
            <button 
              onClick={() => setShowAllThisWeek(!showAllThisWeek)}
              className="text-white/60 text-[12px] font-['Montserrat:Regular',sans-serif] hover:text-white transition-colors"
            >
              {showAllThisWeek ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          
          <div className={`flex gap-4 ${showAllThisWeek ? 'flex-wrap px-4' : 'overflow-x-auto scrollbar-hide px-4 pb-2 scroll-smooth'}`}>
            {(showAllThisWeek ? filteredThisWeekMovies : filteredThisWeekMovies.slice(0, 10)).map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, thisWeekMovies)}
                className="shrink-0 w-[140px] group transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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

      {/* Nostalgic Movies Section - Indicações para ver em casa */}
      {!debouncedSearchQuery && nostalgicMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <House className="w-5 h-5" style={{ color: '#F4F2F2' }} weight="fill" />
              <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                Nostalgia - Ver em casa
              </h2>
            </div>
            <button 
              onClick={() => setShowAllNostalgic(!showAllNostalgic)}
              className="text-white/60 text-[12px] font-['Montserrat:Regular',sans-serif] hover:text-white transition-colors"
            >
              {showAllNostalgic ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          <p className="px-4 mb-4 font-['Montserrat:Light',sans-serif] text-white/60 text-[12px]">
            Clássicos e filmes antigos que mudam toda semana
          </p>
          
          <div className={`flex gap-4 ${showAllNostalgic ? 'flex-wrap px-4' : 'overflow-x-auto scrollbar-hide px-4 pb-2 scroll-smooth'}`}>
            {(showAllNostalgic ? nostalgicMovies : nostalgicMovies.slice(0, 10)).map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, nostalgicMovies)}
                className="shrink-0 w-[140px] group transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">
                      N/A
                    </div>
                  )}
                  {/* Streaming providers badge */}
                  {movie.watch_providers && <StreamingBadge providers={movie.watch_providers} />}
                  {/* Year badge for nostalgic movies */}
                  {movie.release_date && (
                    <div className="absolute top-2 right-2 bg-[#6416ff]/90 backdrop-blur-sm rounded-[6px] px-2 py-1">
                      <p className="font-['Montserrat:Bold',sans-serif] text-white text-[10px]">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    </div>
                  )}
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
      {!debouncedSearchQuery && filteredPopularMovies.length > 0 && (
        <div className="mb-8">
          <div className="px-4 mb-4 flex items-center justify-between">
            <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
              Mais Populares
            </h2>
            <button 
              onClick={() => setShowAllPopular(!showAllPopular)}
              className="text-white/60 text-[12px] font-['Montserrat:Regular',sans-serif] hover:text-white transition-colors"
            >
              {showAllPopular ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          
          <div className={`flex gap-4 ${showAllPopular ? 'flex-wrap px-4' : 'overflow-x-auto scrollbar-hide px-4 pb-2 scroll-smooth'}`}>
            {(showAllPopular ? filteredPopularMovies : filteredPopularMovies.slice(0, 10)).map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick(movie, popularMovies)}
                className="shrink-0 w-[140px] group transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {movie.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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
      {!debouncedSearchQuery && tvShows.length > 0 && (
        <div className="mb-8">
          <div className="px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Television className="w-5 h-5" style={{ color: '#F4F2F2' }} weight="fill" />
              <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
              Séries no Ar
            </h2>
            </div>
            <button 
              onClick={() => setShowAllTVShows(!showAllTVShows)}
              className="text-white/60 text-[12px] font-['Montserrat:Regular',sans-serif] hover:text-white transition-colors"
            >
              {showAllTVShows ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          
          <div className={`flex gap-4 ${showAllTVShows ? 'flex-wrap px-4' : 'overflow-x-auto scrollbar-hide px-4 pb-2 scroll-smooth'}`}>
            {(showAllTVShows ? tvShows : tvShows.slice(0, 10)).map((show) => (
              <button
                key={show.id}
                onClick={() => onTVShowClick(show)}
                className="shrink-0 w-[140px] group transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative mb-2 rounded-[10px] overflow-hidden bg-[#d9d9d9] aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {show.poster_path ? (
                    <ImageWithFallback
                      src={`${imageBaseUrl}${show.poster_path}`}
                      alt={show.name}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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
      {!debouncedSearchQuery && (
        <div className="mb-8">
          <div className="px-4 mb-4">
            <h2 className="text-white text-[20px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
              Todos os Próximos Lançamentos
            </h2>
          </div>
          
          <div className="px-4 space-y-3 pb-6">
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
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
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