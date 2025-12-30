import { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average?: number;
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
  // Campos calculados para similaridade
  similarityScore?: number;
  commonGenres?: number;
  commonKeywords?: number;
}

interface Keyword {
  id: number;
  name: string;
}

interface UseSimilarMoviesOptions {
  movieId: number | null;
  apiKey: string;
  maxResults?: number;
  minRating?: number;
}

interface MovieWithDetails extends Movie {
  vote_average: number;
}

/**
 * Calcula a pontuação de similaridade entre dois filmes
 */
function calculateSimilarityScore(
  movie1: { genre_ids: number[]; keywords?: number[] },
  movie2: { genre_ids: number[]; keywords?: number[] },
  weightGenres: number = 0.6,
  weightKeywords: number = 0.4
): { score: number; commonGenres: number; commonKeywords: number } {
  // Calcula gêneros em comum
  const genreSet1 = new Set(movie1.genre_ids);
  const genreSet2 = new Set(movie2.genre_ids);
  const commonGenres = [...genreSet1].filter(id => genreSet2.has(id)).length;
  const maxGenres = Math.max(genreSet1.size, genreSet2.size);
  const genreSimilarity = maxGenres > 0 ? commonGenres / maxGenres : 0;

  // Calcula keywords em comum
  let keywordSimilarity = 0;
  let commonKeywords = 0;
  if (movie1.keywords && movie2.keywords && movie1.keywords.length > 0 && movie2.keywords.length > 0) {
    const keywordSet1 = new Set(movie1.keywords);
    const keywordSet2 = new Set(movie2.keywords);
    commonKeywords = [...keywordSet1].filter(id => keywordSet2.has(id)).length;
    const maxKeywords = Math.max(keywordSet1.size, keywordSet2.size);
    keywordSimilarity = maxKeywords > 0 ? commonKeywords / maxKeywords : 0;
  }

  // Pontuação final ponderada
  const score = (genreSimilarity * weightGenres) + (keywordSimilarity * weightKeywords);

  return {
    score,
    commonGenres,
    commonKeywords,
  };
}

/**
 * Função principal de recomendação de filmes similares
 */
async function getSimilarMovies(
  movieId: number,
  apiKey: string,
  maxResults: number = 10,
  minRating: number = 7.0
): Promise<MovieWithDetails[]> {
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  try {
    // 1. Buscar detalhes do filme original (gêneros, keywords)
    const [movieDetailsResponse, keywordsResponse, similarResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=pt-BR`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/keywords?api_key=${apiKey}`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${apiKey}&language=pt-BR&page=1`),
    ]);

    const movieDetails = await movieDetailsResponse.json();
    const keywordsData = await keywordsResponse.json();
    const similarData = await similarResponse.json();

    const originalGenres = movieDetails.genres?.map((g: { id: number }) => g.id) || [];
    const originalKeywords = keywordsData.keywords?.map((k: Keyword) => k.id) || [];

    // 2. Buscar filmes similares da API
    const similarMovies = similarData.results || [];

    // 3. Buscar filmes usando /discover com gêneros
    let discoveredMovies: any[] = [];
    if (originalGenres.length > 0) {
      const genreQuery = originalGenres.join(',');
      const discoverResponse = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=${genreQuery}&sort_by=popularity.desc&vote_average.gte=${minRating}&page=1`
      );
      const discoverData = await discoverResponse.json();
      discoveredMovies = discoverData.results || [];
    }

    // 4. Buscar keywords de todos os filmes candidatos
    const allCandidateIds = new Set<number>();
    similarMovies.forEach((m: any) => allCandidateIds.add(m.id));
    discoveredMovies.forEach((m: any) => allCandidateIds.add(m.id));

    // Buscar keywords em paralelo para todos os filmes
    const moviesWithKeywords = await Promise.all(
      Array.from(allCandidateIds).slice(0, 50).map(async (id) => {
        try {
          const kwResponse = await fetch(`${TMDB_BASE_URL}/movie/${id}/keywords?api_key=${apiKey}`);
          const kwData = await kwResponse.json();
          return {
            id,
            keywords: kwData.keywords?.map((k: Keyword) => k.id) || [],
          };
        } catch {
          return { id, keywords: [] };
        }
      })
    );

    const keywordsMap = new Map(moviesWithKeywords.map(m => [m.id, m.keywords]));

    // 5. Combinar todos os resultados e adicionar keywords
    const allMovies = new Map<number, any>();

    // Adicionar filmes similares
    similarMovies.forEach((movie: any) => {
      if (movie.id !== movieId && movie.vote_average >= minRating) {
        allMovies.set(movie.id, {
          ...movie,
          keywords: keywordsMap.get(movie.id) || [],
        });
      }
    });

    // Adicionar filmes descobertos
    discoveredMovies.forEach((movie: any) => {
      if (movie.id !== movieId && movie.vote_average >= minRating) {
        if (!allMovies.has(movie.id)) {
          allMovies.set(movie.id, {
            ...movie,
            keywords: keywordsMap.get(movie.id) || [],
          });
        }
      }
    });

    // 6. Calcular pontuação de similaridade para cada filme
    const moviesWithScores = Array.from(allMovies.values()).map((movie) => {
      const similarity = calculateSimilarityScore(
        { genre_ids: originalGenres, keywords: originalKeywords },
        { genre_ids: movie.genre_ids || [], keywords: movie.keywords || [] }
      );

      // Pontuação final = similaridade (0-1) + normalização da nota (0-1)
      // Peso: 70% similaridade, 30% nota
      const normalizedRating = (movie.vote_average || 0) / 10;
      const finalScore = (similarity.score * 0.7) + (normalizedRating * 0.3);

      return {
        ...movie,
        similarityScore: finalScore,
        commonGenres: similarity.commonGenres,
        commonKeywords: similarity.commonKeywords,
      };
    });

    // 7. Filtrar e ordenar por relevância
    const filteredAndSorted = moviesWithScores
      .filter(movie => movie.vote_average >= minRating && movie.id !== movieId)
      .sort((a, b) => {
        // Ordena por pontuação de similaridade (maior primeiro)
        if (b.similarityScore! !== a.similarityScore!) {
          return b.similarityScore! - a.similarityScore!;
        }
        // Em caso de empate, ordena por nota
        return (b.vote_average || 0) - (a.vote_average || 0);
      })
      .slice(0, maxResults);

    // 8. Buscar detalhes adicionais (credits, trailer, providers) para os filmes finais
    const moviesWithDetails = await Promise.all(
      filteredAndSorted.map(async (movie) => {
        try {
          const [creditsResponse, videosResponse, providersResponse] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${apiKey}`),
            fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${apiKey}&language=pt-BR`),
            fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${apiKey}`),
          ]);

          const creditsData = await creditsResponse.json();
          const videosData = await videosResponse.json();
          const providersData = await providersResponse.json();

          const trailer = videosData.results?.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
          );

          const brProviders = providersData.results?.BR?.flatrate || [];
          const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
            logo_path: provider.logo_path,
            provider_name: provider.provider_name,
          }));

          return {
            ...movie,
            trailer_key: trailer?.key,
            watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
            credits: {
              cast: creditsData.cast?.slice(0, 4) || [],
            },
          } as MovieWithDetails;
        } catch {
          return movie as MovieWithDetails;
        }
      })
    );

    return moviesWithDetails;
  } catch (error) {
    console.error('Error in getSimilarMovies:', error);
    throw error;
  }
}

export function useSimilarMovies({ movieId, apiKey, maxResults = 10, minRating = 7.0 }: UseSimilarMoviesOptions) {
  const [similarMovies, setSimilarMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId || !apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      setSimilarMovies([]);
      return;
    }

    const fetchSimilarMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const movies = await getSimilarMovies(movieId, apiKey, maxResults, minRating);
        setSimilarMovies(movies);
      } catch (err) {
        console.error('Error fetching similar movies:', err);
        setError('Erro ao buscar filmes similares');
        setSimilarMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId, apiKey, maxResults, minRating]);

  return { similarMovies, loading, error };
}
