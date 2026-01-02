import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { MovieViewer } from './components/MovieViewer';
import { CinemaNews, NewsArticle } from './components/CinemaNews';
import { NewsDetail } from './components/NewsDetail';
import { FilterPanel } from './components/FilterPanel';
import { InstallPrompt } from './components/InstallPrompt';
import { Navbar } from './components/Navbar';
import { ActorMovies } from './components/ActorMovies';
import { Favorites } from './components/Favorites';
import { TVShowViewer } from './components/TVShowViewer';
import { SplashScreen } from './components/SplashScreen';
import { RandomMovie } from './components/RandomMovie';
import { SEO } from './components/SEO';
import { Loader2, SlidersHorizontal } from 'lucide-react';

/**
 * TMDB API Configuration
 * 
 * Para usar a API do TMDB e obter dados reais de filmes:
 * 1. Acesse: https://www.themoviedb.org/documentation/api
 * 2. Crie uma conta gratuita
 * 3. Solicite uma API Key (Developer - gratuita)
 * 4. Substitua 'YOUR_TMDB_API_KEY_HERE' abaixo pela sua chave
 * 
 * Sem API Key: O app funciona com 5 filmes de demonstração
 * Com API Key: Acesso a milhares de filmes reais e atualizados
 */
const TMDB_API_KEY = '73f2254f34af837336993597eab9f5ff'; // ← Cole sua API Key aqui
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
  vote_average?: number;
  imdb_id?: string;
  certification?: string;
  origin_country?: string;
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

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  first_air_date: string;
  last_air_date?: string;
  overview: string;
  genre_ids: number[];
  trailer_key?: string;
  vote_average?: number;
  imdb_id?: string;
  certification?: string;
  origin_country?: string;
  watch_providers?: {
    logo_path: string;
    provider_name: string;
  }[];
  number_of_seasons?: number;
  last_episode_to_air?: {
    season_number: number;
    episode_number: number;
    air_date?: string;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
  };
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [nostalgicMovies, setNostalgicMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [tvFavorites, setTVFavorites] = useState<number[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<number[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<{ [key: number]: string }>({});
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'news' | 'favorites' | 'newsDetail' | 'random'>('home');
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentMovieList, setCurrentMovieList] = useState<Movie[]>([]);
  const [selectedActor, setSelectedActor] = useState<{ id: number; name: string; profile_path: string | null } | null>(null);
  const [selectedTVShow, setSelectedTVShow] = useState<TVShow | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [loadingTVShow, setLoadingTVShow] = useState(false);

  // Check if API key is configured
  const isApiKeyConfigured = TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE';

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      // Set default genres
      const defaultGenres: { [key: number]: string } = {
        28: 'Ação',
        12: 'Aventura',
        16: 'Animação',
        35: 'Comédia',
        80: 'Crime',
        99: 'Documentário',
        18: 'Drama',
        10751: 'Família',
        14: 'Fantasia',
        36: 'História',
        27: 'Terror',
        10402: 'Música',
        9648: 'Mistério',
        10749: 'Romance',
        878: 'Ficção Científica',
        10770: 'Cinema TV',
        53: 'Thriller',
        10752: 'Guerra',
        37: 'Faroeste'
      };
      
      setGenres(defaultGenres);
      
      if (!isApiKeyConfigured) return;
      
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        const data = await response.json();
        const genresMap: { [key: number]: string } = {};
        data.genres.forEach((genre: { id: number; name: string }) => {
          genresMap[genre.id] = genre.name;
        });
        setGenres(genresMap);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, [isApiKeyConfigured]);

  // Fetch upcoming movies
  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      setLoading(true);
      
      if (!isApiKeyConfigured) {
        // Use mock data if API key is not configured
        const mockMovies = getMockMovies();
        setMovies(mockMovies);
        setPopularMovies(mockMovies.slice(0, 3));
        setLoading(false);
        return;
      }
      
      try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        // Fetch upcoming movies - multiple pages to get more movies
        const allMovies: Movie[] = [];
        
        // Fetch from upcoming endpoint (multiple pages)
        for (let page = 1; page <= 5; page++) {
          const response = await fetch(
            `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}&region=BR`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            allMovies.push(...data.results);
          }
        }
        
        // Additionally, fetch movies by discovery for future years (2025, 2026, 2027)
        for (let year = currentYear; year <= currentYear + 2; year++) {
          try {
            const discoverResponse = await fetch(
              `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&primary_release_year=${year}&sort_by=popularity.desc&page=1`
            );
            const discoverData = await discoverResponse.json();
            
            if (discoverData.results) {
              // Filter movies from 1 month ago to future releases
              const oneMonthAgo = new Date(currentDate);
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              
              const recentAndFutureMovies = discoverData.results.filter((movie: Movie) => {
                const releaseDate = new Date(movie.release_date);
                return releaseDate >= oneMonthAgo;
              });
              allMovies.push(...recentAndFutureMovies);
            }
          } catch (error) {
            console.error(`Error fetching movies for year ${year}:`, error);
          }
        }
        
        // Remove duplicates based on movie ID
        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        );
        
        // Sort by release date
        uniqueMovies.sort((a, b) => 
          new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
        );
        
        // Fetch credits for each movie
        const moviesWithCredits = await Promise.all(
          uniqueMovies.map(async (movie: Movie) => {
            try {
              // Fetch credits
              const creditsResponse = await fetch(
                `${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`
              );
              const creditsData = await creditsResponse.json();
              
              // Fetch videos (trailers)
              const videosResponse = await fetch(
                `${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
              );
              const videosData = await videosResponse.json();
              
              // Find official trailer
              const trailer = videosData.results?.find(
                (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
              );
              
              // Fetch watch providers
              const providersResponse = await fetch(
                `${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`
              );
              const providersData = await providersResponse.json();
              
              // Get Brazil providers (flatrate = streaming)
              const brProviders = providersData.results?.BR?.flatrate || [];
              const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
                logo_path: provider.logo_path,
                provider_name: provider.provider_name
              }));
              
              return {
                ...movie,
                trailer_key: trailer?.key,
                watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
                credits: {
                  cast: creditsData.cast.slice(0, 4)
                }
              };
            } catch {
              return movie;
            }
          })
        );
        
        setMovies(moviesWithCredits);
        
        // Fetch popular upcoming movies
        try {
          const popularResponse = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1&region=BR`
          );
          const popularData = await popularResponse.json();
          
          // Filter to only include movies with future release dates
          const popularUpcoming = popularData.results.filter((movie: Movie) => {
            const releaseDate = new Date(movie.release_date);
            return releaseDate >= currentDate;
          }).slice(0, 10);
          
          // Fetch credits for popular movies
          const popularWithCredits = await Promise.all(
            popularUpcoming.map(async (movie: Movie) => {
              try {
                const creditsResponse = await fetch(
                  `${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`
                );
                const creditsData = await creditsResponse.json();
                return {
                  ...movie,
                  credits: {
                    cast: creditsData.cast.slice(0, 4)
                  }
                };
              } catch {
                return movie;
              }
            })
          );
          
          setPopularMovies(popularWithCredits);
        } catch (error) {
          console.error('Error fetching popular movies:', error);
          setPopularMovies(moviesWithCredits.slice(0, 10));
        }

        // Fetch now playing movies (em cartaz)
        try {
          const nowPlayingResponse = await fetch(
            `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=1&region=BR`
          );
          const nowPlayingData = await nowPlayingResponse.json();
          
          // Fetch credits and details for now playing movies
          const nowPlayingWithCredits = await Promise.all(
            (nowPlayingData.results || []).slice(0, 20).map(async (movie: Movie) => {
              try {
                const creditsResponse = await fetch(
                  `${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`
                );
                const creditsData = await creditsResponse.json();
                
                // Fetch videos (trailers)
                const videosResponse = await fetch(
                  `${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
                );
                const videosData = await videosResponse.json();
                
                // Find official trailer
                const trailer = videosData.results?.find(
                  (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
                );
                
                // Fetch watch providers
                const providersResponse = await fetch(
                  `${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`
                );
                const providersData = await providersResponse.json();
                
                // Get Brazil providers (flatrate = streaming)
                const brProviders = providersData.results?.BR?.flatrate || [];
                const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
                  logo_path: provider.logo_path,
                  provider_name: provider.provider_name
                }));
                
                return {
                  ...movie,
                  trailer_key: trailer?.key,
                  watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
                  credits: {
                    cast: creditsData.cast.slice(0, 4)
                  }
                };
              } catch {
                return movie;
              }
            })
          );
          
          setNowPlayingMovies(nowPlayingWithCredits);
        } catch (error) {
          console.error('Error fetching now playing movies:', error);
          setNowPlayingMovies([]);
        }

        // Fetch nostalgic/classic movies (rotates weekly)
        try {
          // Calculate week number of the year for rotation
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);
          const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
          const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
          
          // Use week number to calculate page offset (10 movies per week, ~100 movies per page)
          // We'll fetch from different pages based on week number to get variety
          const pageOffset = (weekNumber % 10) + 1; // Rotate between pages 1-10
          
          // Fetch classic/old movies (released before 2000, with good ratings)
          const nostalgicResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_date.lte=1999-12-31&vote_average.gte=7&vote_count.gte=100&page=${pageOffset}`
          );
          const nostalgicData = await nostalgicResponse.json();
          
          if (nostalgicData.results && nostalgicData.results.length > 0) {
            // Take first 10 movies and fetch their details
            const nostalgicWithDetails = await Promise.all(
              nostalgicData.results.slice(0, 10).map(async (movie: Movie) => {
                try {
                  // Fetch watch providers
                  const providersResponse = await fetch(
                    `${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`
                  );
                  const providersData = await providersResponse.json();
                  
                  // Get Brazil providers (flatrate = streaming)
                  const brProviders = providersData.results?.BR?.flatrate || [];
                  const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
                    logo_path: provider.logo_path,
                    provider_name: provider.provider_name
                  }));
                  
                  return {
                    ...movie,
                    watch_providers: watchProviders
                  };
                } catch {
                  return movie;
                }
              })
            );
            
            setNostalgicMovies(nostalgicWithDetails);
          }
        } catch (error) {
          console.error('Error fetching nostalgic movies:', error);
          setNostalgicMovies([]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Fallback to mock data if API fails
        const mockMovies = getMockMovies();
        setMovies(mockMovies);
        setPopularMovies(mockMovies.slice(0, 3));
        setNowPlayingMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, [isApiKeyConfigured]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    const savedTVFavorites = localStorage.getItem('tvFavorites');
    if (savedTVFavorites) {
      setTVFavorites(JSON.parse(savedTVFavorites));
    }
    
    const savedWatched = localStorage.getItem('watchedMovies');
    if (savedWatched) {
      setWatchedMovies(JSON.parse(savedWatched));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Save TV favorites to localStorage
  useEffect(() => {
    localStorage.setItem('tvFavorites', JSON.stringify(tvFavorites));
  }, [tvFavorites]);

  // Save watched movies to localStorage
  useEffect(() => {
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  // Fetch TV Shows
  useEffect(() => {
    const fetchTVShows = async () => {
      if (!isApiKeyConfigured) return;
      
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`
        );
        const data = await response.json();
        
        if (data.results) {
          // Fetch credits, trailers, and season info for each TV show
          const showsWithDetails = await Promise.all(
            data.results.slice(0, 10).map(async (show: TVShow) => {
              try {
                // Fetch show details for season info
                const detailsResponse = await fetch(
                  `${TMDB_BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=pt-BR`
                );
                const detailsData = await detailsResponse.json();
                
                // Fetch credits
                const creditsResponse = await fetch(
                  `${TMDB_BASE_URL}/tv/${show.id}/credits?api_key=${TMDB_API_KEY}`
                );
                const creditsData = await creditsResponse.json();
                
                // Fetch videos (trailers)
                const videosResponse = await fetch(
                  `${TMDB_BASE_URL}/tv/${show.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
                );
                const videosData = await videosResponse.json();
                
                // Find official trailer
                const trailer = videosData.results?.find(
                  (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
                );
                
                // Fetch watch providers
                const providersResponse = await fetch(
                  `${TMDB_BASE_URL}/tv/${show.id}/watch/providers?api_key=${TMDB_API_KEY}`
                );
                const providersData = await providersResponse.json();
                
                // Get Brazil providers (flatrate = streaming)
                const brProviders = providersData.results?.BR?.flatrate || [];
                const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
                  logo_path: provider.logo_path,
                  provider_name: provider.provider_name
                }));
                
                return {
                  ...show,
                  trailer_key: trailer?.key,
                  watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
                  number_of_seasons: detailsData.number_of_seasons,
                  last_episode_to_air: detailsData.last_episode_to_air,
                  credits: {
                    cast: creditsData.cast.slice(0, 4)
                  }
                };
              } catch {
                return show;
              }
            })
          );
          
          setTVShows(showsWithDetails);
        }
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      }
    };

    fetchTVShows();
  }, [isApiKeyConfigured]);

  // Filter movies by selected month and genres
  useEffect(() => {
    let filtered = movies;
    
    // Filter by month
    if (selectedMonth !== null) {
      filtered = filtered.filter((movie) => {
        const releaseDate = new Date(movie.release_date);
        return releaseDate.getMonth() === selectedMonth;
      });
    }
    
    // Filter by genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((movie) => {
        return movie.genre_ids.some(genreId => selectedGenres.includes(genreId));
      });
    }
    
    setFilteredMovies(filtered);
    setCurrentMovieIndex(0);
  }, [movies, selectedMonth, selectedGenres]);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleApplyFilters = (month: number | null, genres: number[]) => {
    setSelectedMonth(month);
    setSelectedGenres(genres);
  };

  const handleClearFilters = () => {
    setSelectedMonth(null);
    setSelectedGenres([]);
  };


  const handleHomeMovieClick = async (movie: Movie, movieList: Movie[]) => {
    setLoadingMovie(true);
    setSelectedActor(null); // Clear actor view when clicking a movie
    setSelectedTVShow(null); // Clear TV show view when clicking a movie
    
    try {
      // Fetch complete movie details
      const [creditsResponse, videosResponse, providersResponse, detailsResponse, externalIdsResponse, releaseDatesResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${TMDB_API_KEY}`)
      ]);
      
      const creditsData = await creditsResponse.json();
      const videosData = await videosResponse.json();
      const providersData = await providersResponse.json();
      const detailsData = await detailsResponse.json();
      const externalIdsData = await externalIdsResponse.json();
      const releaseDatesData = await releaseDatesResponse.json();
      
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
      
      // Get certification from release dates (Brazil or US)
      const brRelease = releaseDatesData.results?.find((r: any) => r.iso_3166_1 === 'BR');
      const usRelease = releaseDatesData.results?.find((r: any) => r.iso_3166_1 === 'US');
      const certification = brRelease?.release_dates?.[0]?.certification || 
                           usRelease?.release_dates?.[0]?.certification || 
                           null;
      
      // Get origin country (first production country)
      const originCountry = detailsData.production_countries?.[0]?.iso_3166_1 || null;
      
      // Create complete movie object
      const completeMovie: Movie = {
        ...movie,
        backdrop_path: detailsData.backdrop_path || movie.backdrop_path,
        trailer_key: trailer?.key,
        vote_average: detailsData.vote_average,
        imdb_id: externalIdsData.imdb_id,
        certification: certification,
        origin_country: originCountry,
        watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
        credits: {
          cast: creditsData.cast.slice(0, 4)
        }
      };
      
      setSelectedMovie(completeMovie);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      // If fetch fails, use basic movie data
      setSelectedMovie(movie);
    } finally {
      setLoadingMovie(false);
    }
  };

  const handleTVShowClick = async (show: TVShow) => {
    setLoadingTVShow(true);
    setSelectedActor(null); // Clear actor view when clicking a TV show
    setSelectedMovie(null); // Clear movie view when clicking a TV show
    
    try {
      // Fetch complete TV show details
      const [creditsResponse, videosResponse, providersResponse, detailsResponse, externalIdsResponse, contentRatingsResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/tv/${show.id}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/tv/${show.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/tv/${show.id}/watch/providers?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/tv/${show.id}/external_ids?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/tv/${show.id}/content_ratings?api_key=${TMDB_API_KEY}`)
      ]);
      
      const creditsData = await creditsResponse.json();
      const videosData = await videosResponse.json();
      const providersData = await providersResponse.json();
      const detailsData = await detailsResponse.json();
      const externalIdsData = await externalIdsResponse.json();
      const contentRatingsData = await contentRatingsResponse.json();
      
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
      
      // Get certification from content ratings (Brazil or US)
      const brRating = contentRatingsData.results?.find((r: any) => r.iso_3166_1 === 'BR');
      const usRating = contentRatingsData.results?.find((r: any) => r.iso_3166_1 === 'US');
      const certification = brRating?.rating || usRating?.rating || null;
      
      // Get origin country (first country from origin_country array)
      const originCountry = detailsData.origin_country?.[0] || null;
      
      // Create complete TV show object
      const completeShow: TVShow = {
        ...show,
        backdrop_path: detailsData.backdrop_path || show.backdrop_path,
        trailer_key: trailer?.key,
        vote_average: detailsData.vote_average,
        imdb_id: externalIdsData.imdb_id,
        certification: certification,
        origin_country: originCountry,
        watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
        number_of_seasons: detailsData.number_of_seasons,
        last_episode_to_air: detailsData.last_episode_to_air,
        credits: {
          cast: creditsData.cast.slice(0, 4)
        }
      };
      
      setSelectedTVShow(completeShow);
    } catch (error) {
      console.error('Error fetching TV show details:', error);
      // If fetch fails, use basic TV show data
      setSelectedTVShow(show);
    } finally {
      setLoadingTVShow(false);
    }
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setCurrentMovieIndex(0);
  };

  const handleNavigation = (view: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random') => {
    setCurrentView(view);
    setCurrentMovieIndex(0);
    setSelectedMovie(null); // Clear movie view when navigating
    setSelectedTVShow(null); // Clear TV show view when navigating
    setSelectedActor(null); // Also clear actor view
    if (view !== 'home') {
      setCurrentMovieList([]);
    }
  };

  const hasActiveFilters = selectedMonth !== null || selectedGenres.length > 0;

  // If newsDetail view but no article, redirect back to news
  useEffect(() => {
    if (currentView === 'newsDetail' && !selectedNewsArticle) {
      setCurrentView('news');
    }
  }, [currentView, selectedNewsArticle]);

  // Toggle favorite
  const toggleFavorite = (movieId: number) => {
    setFavorites(prev => {
      if (prev.includes(movieId)) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };
  
  // Toggle TV favorite
  const toggleWatched = (movieId: number) => {
    setWatchedMovies(prev => {
      if (prev.includes(movieId)) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const toggleTVFavorite = (showId: number) => {
    setTVFavorites(prev => {
      if (prev.includes(showId)) {
        return prev.filter(id => id !== showId);
      } else {
        return [...prev, showId];
      }
    });
  };

  // Meta tags SEO globais
  const seoTitle = 'CineBuzz - Próximos Lançamentos';
  const seoDescription = 'Descubra os próximos lançamentos de filmes, notícias do cinema e receba sugestões personalizadas baseadas no seu humor e momento.';
  // Imagem de preview para compartilhamento (Open Graph)
  // Usando o logo do app (logomovie.png) como imagem de preview
  const seoImage = '/og-image.png'; // Logo copiado de src/assets/logomovie.png para public/og-image.png

  // Show Splash Screen
  if (showSplash) {
    return (
      <>
        <SEO 
          title={seoTitle}
          description={seoDescription}
          image={seoImage}
        />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // Show Actor Movies view
  if (selectedActor) {
    return (
      <ActorMovies
        actor={selectedActor}
        apiKey={TMDB_API_KEY}
        onClose={() => setSelectedActor(null)}
        onMovieClick={handleHomeMovieClick}
      />
    );
  }

  // Show Movie Viewer view (full-bleed hero poster)
  if (selectedMovie) {
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden" style={{ paddingTop: 0, marginTop: 0, top: 0 }}>
        {loadingMovie ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : (
          <MovieViewer
            movie={selectedMovie}
            genres={genres}
            onClose={() => setSelectedMovie(null)}
            onActorClick={(actor) => {
              setSelectedMovie(null);
              setSelectedActor(actor);
            }}
            isFavorite={favorites.includes(selectedMovie.id)}
            onToggleFavorite={toggleFavorite}
            favoritesCount={favorites.length + tvFavorites.length}
            onNavigate={handleNavigation}
            currentView={currentView}
            hasActiveFilters={hasActiveFilters}
            apiKey={TMDB_API_KEY}
          />
        )}
      </div>
    );
  }

  // Show TV Show Viewer view (full-bleed hero poster)
  if (selectedTVShow) {
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden" style={{ paddingTop: 0, marginTop: 0, top: 0 }}>
        {loadingTVShow ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : (
          <TVShowViewer
            show={selectedTVShow}
            genres={genres}
            onClose={() => setSelectedTVShow(null)}
            onActorClick={(actor) => {
              setSelectedTVShow(null);
              setSelectedActor(actor);
            }}
            isFavorite={tvFavorites.includes(selectedTVShow.id)}
            onToggleFavorite={toggleTVFavorite}
            favoritesCount={favorites.length + tvFavorites.length}
            onNavigate={handleNavigation}
            currentView={currentView}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  // Show News Detail view - Check this BEFORE any other view checks
  // Must check before home/favorites/return to ensure proper rendering
  if (currentView === 'newsDetail' && selectedNewsArticle) {
    return (
      <>
        <NewsDetail 
          article={selectedNewsArticle}
          onBack={() => {
            setCurrentView('news');
            setSelectedNewsArticle(null);
          }}
        />
        <Navbar 
          currentView="news"
          onNavigate={(view) => {
            if (view !== 'newsDetail') {
              handleNavigation(view);
              setSelectedNewsArticle(null);
            }
          }}
          hasActiveFilters={hasActiveFilters}
          favoritesCount={favorites.length + tvFavorites.length}
        />
        <InstallPrompt />
      </>
    );
  }

  // Show Home view
  if (currentView === 'home') {
    return (
      <>
        <SEO 
          title={seoTitle}
          description={seoDescription}
          image={seoImage}
        />
        <Home
          upcomingMovies={movies}
          popularMovies={popularMovies}
          nowPlayingMovies={nowPlayingMovies}
          nostalgicMovies={nostalgicMovies}
          tvShows={tvShows}
          onMovieClick={handleHomeMovieClick}
          onTVShowClick={handleTVShowClick}
          onActorClick={setSelectedActor}
          apiKey={TMDB_API_KEY}
          genres={genres}
          selectedGenres={selectedGenres}
          selectedMonth={selectedMonth}
          onGenreToggle={handleGenreToggle}
          onFilterClick={() => setShowFilters(true)}
        />
        <Navbar 
          currentView={currentView}
          onNavigate={handleNavigation}
          hasActiveFilters={hasActiveFilters}
          favoritesCount={favorites.length + tvFavorites.length}
        />
        <InstallPrompt />
        
        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            selectedMonth={selectedMonth}
            selectedGenres={selectedGenres}
            genres={genres}
            onMonthChange={setSelectedMonth}
            onGenreToggle={handleGenreToggle}
            onClose={() => setShowFilters(false)}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        )}
      </>
    );
  }

  // Show Random Movie view
  if (currentView === 'random') {
    return (
      <>
        <SEO 
          title="Não sei o que assistir - CineBuzz"
          description="Receba sugestões personalizadas de filmes baseadas no seu humor e momento. Encontre o filme perfeito para assistir agora!"
          image={seoImage}
        />
        <RandomMovie 
          apiKey={TMDB_API_KEY}
          genres={genres}
          onMovieClick={handleHomeMovieClick}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />
        <Navbar 
          currentView={currentView}
          onNavigate={handleNavigation}
          hasActiveFilters={hasActiveFilters}
          favoritesCount={favorites.length + tvFavorites.length}
        />
        <InstallPrompt />
      </>
    );
  }

  // Show News view
  if (currentView === 'news') {
    return (
      <>
        <SEO 
          title="Notícias do Cinema - CineBuzz"
          description="Fique por dentro das últimas notícias do cinema, lançamentos, atores e muito mais!"
          image={seoImage}
        />
        <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen flex flex-col">
          <CinemaNews 
            onArticleClick={(article) => {
              setSelectedNewsArticle(article);
              setCurrentView('newsDetail');
            }}
          />
          <Navbar 
            currentView={currentView}
            onNavigate={handleNavigation}
            hasActiveFilters={hasActiveFilters}
            favoritesCount={favorites.length + tvFavorites.length}
          />
          <InstallPrompt />
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            selectedMonth={selectedMonth}
            selectedGenres={selectedGenres}
            genres={genres}
            onMonthChange={setSelectedMonth}
            onGenreToggle={handleGenreToggle}
            onClose={() => setShowFilters(false)}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        )}
      </>
    );
  }

  // Show Favorites view
  if (currentView === 'favorites') {
    const favoriteMovies = movies.filter(movie => favorites.includes(movie.id));
    
    return (
      <>
        <SEO 
          title="Meus Favoritos - CineBuzz"
          description="Veja seus filmes e séries favoritos salvos"
          image={seoImage}
        />
        <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen flex flex-col">
          <Favorites
            movies={favoriteMovies}
            genres={genres}
            onMovieClick={(movie) => handleHomeMovieClick(movie, favoriteMovies)}
            onToggleFavorite={toggleFavorite}
            watchedMovies={watchedMovies}
            onToggleWatched={toggleWatched}
          />
          <Navbar 
            currentView={currentView}
            onNavigate={handleNavigation}
            hasActiveFilters={hasActiveFilters}
            favoritesCount={favorites.length + tvFavorites.length}
          />
          <InstallPrompt />
        </div>
      </>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#000000] from-25% to-[#5f5476] min-h-screen flex flex-col">
      {/* API Key Warning Banner */}
      {!isApiKeyConfigured && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/40 px-4 py-2">
          <p className="text-white text-center text-[12px] font-['Montserrat:Light',sans-serif]">
            ⚠️ Usando dados de demonstração. Configure sua API Key do TMDB para dados reais.
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="w-10"></div>
        
        <h1 className="text-[28px] text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
          Próximos Lançamentos
        </h1>
        
        <button
          onClick={() => setShowFilters(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-all relative"
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
          {hasActiveFilters && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pb-[72px]">
      </div>

      {/* Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={handleNavigation}
        hasActiveFilters={hasActiveFilters}
        favoritesCount={favorites.length + tvFavorites.length}
      />

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          selectedMonth={selectedMonth}
          selectedGenres={selectedGenres}
          genres={genres}
          onMonthChange={setSelectedMonth}
          onGenreToggle={handleGenreToggle}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

// Mock data fallback
function getMockMovies(): Movie[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  return [
    {
      id: 1,
      title: "Duna - Parte II",
      poster_path: null,
      release_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      overview: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo, ele deve evitar um futuro terrível que só ele pode prever.",
      genre_ids: [878, 12],
      credits: {
        cast: [
          { id: 1, name: "Timothée Chalamet", profile_path: null },
          { id: 2, name: "Zendaya", profile_path: null },
          { id: 3, name: "Florence Pugh", profile_path: null },
          { id: 4, name: "Austin Butler", profile_path: null }
        ]
      }
    },
    {
      id: 2,
      title: "Avatar 3",
      poster_path: null,
      release_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`,
      overview: "A família Sully deve enfrentar novos desafios enquanto explora novas regiões de Pandora e confrontam ameaças ainda maiores vindas dos humanos.",
      genre_ids: [878, 12, 28],
      credits: {
        cast: [
          { id: 5, name: "Sam Worthington", profile_path: null },
          { id: 6, name: "Zoe Saldana", profile_path: null },
          { id: 7, name: "Sigourney Weaver", profile_path: null },
          { id: 8, name: "Kate Winslet", profile_path: null }
        ]
      }
    },
    {
      id: 3,
      title: "Missão Impossível 8",
      poster_path: null,
      release_date: `${currentYear}-${String((currentMonth + 1) % 12 + 1).padStart(2, '0')}-10`,
      overview: "Ethan Hunt e sua equipe da IMF embarcam em sua missão mais perigosa de todos os tempos: rastrear uma nova arma aterrorizante que ameaça toda a humanidade.",
      genre_ids: [28, 53, 12],
      credits: {
        cast: [
          { id: 9, name: "Tom Cruise", profile_path: null },
          { id: 10, name: "Hayley Atwell", profile_path: null },
          { id: 11, name: "Rebecca Ferguson", profile_path: null },
          { id: 12, name: "Simon Pegg", profile_path: null }
        ]
      }
    },
    {
      id: 4,
      title: "Homem-Aranha: Além do Aranhaverso",
      poster_path: null,
      release_date: `${currentYear}-${String((currentMonth + 2) % 12 + 1).padStart(2, '0')}-18`,
      overview: "Miles Morales continua sua jornada pelo multiverso com Gwen Stacy e novos aliados para enfrentar um vilão que ameaça todas as realidades.",
      genre_ids: [16, 28, 12, 878],
      credits: {
        cast: [
          { id: 13, name: "Shameik Moore", profile_path: null },
          { id: 14, name: "Hailee Steinfeld", profile_path: null },
          { id: 15, name: "Oscar Isaac", profile_path: null },
          { id: 16, name: "Jake Johnson", profile_path: null }
        ]
      }
    },
    {
      id: 5,
      title: "Deadpool & Wolverine 2",
      poster_path: null,
      release_date: `${currentYear}-${String((currentMonth + 3) % 12 + 1).padStart(2, '0')}-25`,
      overview: "Wade Wilson e Logan unem forças mais uma vez em uma aventura cheia de ação, comédia e pancadaria através do multiverso Marvel.",
      genre_ids: [28, 35, 878],
      credits: {
        cast: [
          { id: 17, name: "Ryan Reynolds", profile_path: null },
          { id: 18, name: "Hugh Jackman", profile_path: null },
          { id: 19, name: "Emma Corrin", profile_path: null },
          { id: 20, name: "Matthew Macfadyen", profile_path: null }
        ]
      }
    }
  ];
}