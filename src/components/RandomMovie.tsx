import { useState } from 'react';
import { Shuffle, Star, Heart, House, Users, Rainbow, Play, DotsThree } from 'phosphor-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  popularity?: number;
  watch_providers?: {
    logo_path: string;
    provider_name: string;
  }[];
  trailer_key?: string;
}

interface RandomMovieProps {
  apiKey: string;
  genres: { [key: number]: string };
  onMovieClick: (movie: Movie, movieList: Movie[]) => void;
  onToggleFavorite?: (movieId: number) => void;
  favorites?: number[];
}

// Mapeamento de humor/momento para gêneros do TMDB
const MOOD_GENRES: { [key: string]: number[] } = {
  'feliz': [35, 10402, 10751], // Comédia, Música, Família
  'triste': [18, 10749], // Drama, Romance
  'animado': [28, 12, 878], // Ação, Aventura, Ficção Científica
  'relaxado': [99, 36], // Documentário, História
  'empolgado': [28, 53, 80], // Ação, Thriller, Crime
  'reflexivo': [18, 36, 99], // Drama, História, Documentário
};

// Mapeamento de momentos com configurações precisas
const moments = {
  emCasa: {
    genres: [35, 10749]
  },
  comAlguem: {
    genres: [35, 10749],
    exclude: [27] // horror
  },
  sozinho: {
    genres: [18, 53]
  },
  teen: {
    keywords: ["teen", "high school"] 
  },
  lgbt: {
    keywords: ["lgbt", "gay", "lesbian", "queer"]
  }
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300';

// Função para calcular score
function calculateScore(movie: any): number {
  const voteAvg = movie.vote_average || 0;
  const popularity = movie.popularity || 0;
  // Normaliza popularity (geralmente entre 0-1000, mas pode variar)
  const normalizedPopularity = Math.min(popularity / 100, 10);
  return (voteAvg * 0.6) + (normalizedPopularity * 0.4);
}

// Função para embaralhar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função para pegar filme aleatório
function pickRandom(list: any[]): any {
  return list[Math.floor(Math.random() * list.length)];
}

export function RandomMovie({ apiKey, genres, onMovieClick, onToggleFavorite, favorites = [] }: RandomMovieProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [suggestedMovie, setSuggestedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [candidateMovies, setCandidateMovies] = useState<Movie[]>([]);

  const fetchMovieDetails = async (movie: any): Promise<Movie> => {
    try {
      const [providersResponse, videosResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${apiKey}`),
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${apiKey}&language=pt-BR`)
      ]);
      
      const providersData = await providersResponse.json();
      const videosData = await videosResponse.json();
      
      const brProviders = providersData.results?.BR?.flatrate || [];
      const watchProviders = brProviders.slice(0, 3).map((provider: any) => ({
        logo_path: provider.logo_path,
        provider_name: provider.provider_name
      }));

      const trailer = videosData.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      return {
        ...movie,
        watch_providers: watchProviders.length > 0 ? watchProviders : undefined,
        trailer_key: trailer?.key,
        popularity: movie.popularity
      };
    } catch {
      return {
        ...movie,
        popularity: movie.popularity
      };
    }
  };

  const handleSuggestMovie = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setSuggestedMovie(null);
    setCandidateMovies([]);

    try {
      let genreIds: number[] = [];
      let excludeGenreIds: number[] = [];
      let keywords: string[] = [];
      
      // Adiciona gêneros baseados no humor/momento
      if (selectedMood && MOOD_GENRES[selectedMood]) {
        genreIds = [...genreIds, ...MOOD_GENRES[selectedMood]];
      }

      // Processa sugestões com a nova estrutura moments
      const suggestionMap: { [key: string]: keyof typeof moments } = {
        'em-casa': 'emCasa',
        'com-alguem': 'comAlguem',
        'sozinho': 'sozinho',
        'teen': 'teen',
        'lgbtq': 'lgbt'
      };
      
      if (selectedSuggestion && suggestionMap[selectedSuggestion]) {
        const momentKey = suggestionMap[selectedSuggestion];
        const moment = moments[momentKey];
        
        if ('genres' in moment && moment.genres) {
          genreIds = [...genreIds, ...moment.genres];
        }
        
        if ('exclude' in moment && moment.exclude) {
          excludeGenreIds = [...excludeGenreIds, ...moment.exclude];
        }
        
        if ('keywords' in moment && moment.keywords) {
          keywords = [...keywords, ...moment.keywords];
        }
      }

      // Remove duplicatas
      genreIds = [...new Set(genreIds)];
      excludeGenreIds = [...new Set(excludeGenreIds)];

      let allMovies: any[] = [];

      // Se há keywords, busca por keywords usando múltiplas estratégias
      if (keywords.length > 0) {
        // Para LGBTQ+: busca usando conjunto de keywords + gêneros + score de similaridade
        if (keywords.some(k => k.includes('lgbt') || k.includes('gay') || k.includes('lesbian') || k.includes('queer'))) {
          try {
            // Conjunto completo de keywords LGBTQ+
            const lgbtKeywords = [
              'lgbt', 'gay', 'lesbian', 'queer',
              'same-sex', 'homosexuality',
              'coming out', 'transgender', 'bisexual'
            ];
            
            // Função para calcular score LGBTQ+ de um filme
            const calculateLGBTScore = (movieKeywords: any[], movieGenres: number[], overview: string = ''): number => {
              let score = 0;
              const overviewLower = overview.toLowerCase();
              
              // Verifica keywords do filme
              movieKeywords.forEach((kw: any) => {
                const kwName = kw.name?.toLowerCase() || '';
                if (kwName.includes('gay')) score += 3;
                else if (kwName.includes('lesbian')) score += 3;
                else if (kwName.includes('lgbt')) score += 2;
                else if (kwName.includes('queer')) score += 2;
                else if (kwName.includes('same-sex') || kwName.includes('homosexuality')) score += 2;
                else if (kwName.includes('coming out') || kwName.includes('transgender') || kwName.includes('bisexual')) score += 2;
              });
              
              // Verifica gêneros (Drama e Romance são comuns em filmes LGBTQ+)
              if (movieGenres.includes(18)) score += 1; // Drama
              if (movieGenres.includes(10749)) score += 1; // Romance
              
              // Verifica termos no overview (peso menor)
              lgbtKeywords.forEach(kw => {
                if (overviewLower.includes(kw)) {
                  score += 0.5;
                }
              });
              
              return score;
            };
            
            // Função para verificar se filme é realmente LGBTQ+
            const isLGBTFilm = (score: number): boolean => {
              return score >= 4; // Score mínimo de 4 para aceitar
            };
            
            // PASSO 1: Busca ampla com gêneros Drama e Romance
            // Evita classificação indicativa muito baixa (family/kids) - vote_average.gte=6.5
            const pagesToFetch = 3;
            const allDiscoverPromises = [];
            
            for (let page = 1; page <= pagesToFetch; page++) {
              allDiscoverPromises.push(
                fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=18,10749&sort_by=popularity.desc&vote_average.gte=6.5&vote_count.gte=50&page=${page}`)
                  .then(r => r.json())
                  .catch(() => ({ results: [] }))
              );
            }
            
            const allDiscoverResults = await Promise.all(allDiscoverPromises);
            let allCandidates: any[] = [];
            
            allDiscoverResults.forEach(data => {
              if (data.results) {
                allCandidates = [...allCandidates, ...data.results];
              }
            });
            
            // Remove duplicatas
            allCandidates = allCandidates.filter((movie, index, self) => 
              index === self.findIndex(m => m.id === movie.id)
            );
            
            // PASSO 2: Refinamento por keywords - verifica os primeiros 50 candidatos
            const verifiedLgbtMovies: any[] = [];
            const exclusionTerms = ['boxing', 'fighter', 'rocky', 'lutador', 'boxe', 'champion', 'sport', 'esporte'];
            
            for (const movie of allCandidates.slice(0, 50)) {
              try {
                // Exclui filmes com termos irrelevantes
                const titleLower = (movie.title || '').toLowerCase();
                const overviewLower = (movie.overview || '').toLowerCase();
                
                if (exclusionTerms.some(term => titleLower.includes(term) || overviewLower.includes(term))) {
                  continue;
                }
                
                // Busca keywords do filme
                const keywordsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/keywords?api_key=${apiKey}`);
                const keywordsData = await keywordsResponse.json();
                const movieKeywords = keywordsData.keywords || [];
                
                // Calcula score LGBTQ+
                const lgbtScore = calculateLGBTScore(
                  movieKeywords,
                  movie.genre_ids || [],
                  movie.overview || ''
                );
                
                // PASSO 3: Filtra resultado final - só aceita com score >= 4
                if (isLGBTFilm(lgbtScore)) {
                  verifiedLgbtMovies.push({
                    ...movie,
                    lgbtScore // Guarda o score para ordenação
                  });
                }
              } catch (error) {
                // Se falhar ao buscar keywords, pula o filme
                continue;
              }
            }
            
            // Ordena por score + popularidade
            verifiedLgbtMovies.sort((a, b) => {
              const scoreDiff = (b.lgbtScore || 0) - (a.lgbtScore || 0);
              if (scoreDiff !== 0) return scoreDiff;
              return (b.popularity || 0) - (a.popularity || 0);
            });
            
            // Se encontrou filmes verificados, usa eles
            if (verifiedLgbtMovies.length > 0) {
              // Remove a propriedade lgbtScore antes de adicionar
              const cleanMovies = verifiedLgbtMovies.map(({ lgbtScore, ...movie }) => movie);
              allMovies = [...allMovies, ...cleanMovies];
            }
          } catch (error) {
            console.error('Error fetching LGBTQ+ movies:', error);
          }
        }
        
        // Para Teen: busca por termos relacionados a adolescência
        if (keywords.some(k => k.includes('teen') || k.includes('high school'))) {
          const teenTerms = ['teen', 'adolescente', 'high school', 'escola', 'juventude'];
          const searchPromises = teenTerms.slice(0, 3).map(term =>
            fetch(`${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(term)}&page=1`)
              .then(r => r.json())
          );
          
          const searchResults = await Promise.all(searchPromises);
          let teenMovies: any[] = [];
          
          searchResults.forEach(data => {
            if (data.results) {
              teenMovies = [...teenMovies, ...data.results];
            }
          });
          
          // Remove duplicatas
          teenMovies = teenMovies.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
          );
          
          // Filtra por qualidade
          let filteredResults = teenMovies.filter((movie: any) => 
            movie.vote_average >= 6 && movie.vote_count >= 50
          );
          
          // Se há gêneros especificados, filtra por eles também
          if (genreIds.length > 0) {
            filteredResults = filteredResults.filter((movie: any) => 
              movie.genre_ids && movie.genre_ids.some((id: number) => genreIds.includes(id))
            );
          }
          
          allMovies = [...allMovies, ...filteredResults];
        }
      }

      // Busca por gêneros usando discover (múltiplas páginas para ter mais opções)
      if (genreIds.length > 0) {
        const pagesToFetch = 2; // Busca 2 páginas para ter mais filmes
        const discoverPromises: Promise<Response>[] = [];
        
        for (let page = 1; page <= pagesToFetch; page++) {
          let discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreIds.join(',')}&vote_average.gte=7&vote_count.gte=50&page=${page}`;
          
          if (excludeGenreIds.length > 0) {
            discoverUrl += `&without_genres=${excludeGenreIds.join(',')}`;
          }
          
          discoverPromises.push(fetch(discoverUrl));
        }
        
        const discoverResponses = await Promise.all(discoverPromises);
        const discoverDataArray = await Promise.all(discoverResponses.map((r: Response) => r.json()));
        
        discoverDataArray.forEach(data => {
          if (data.results && data.results.length > 0) {
            let filteredResults = data.results;
            
            // Filtra exclusões (fallback)
            if (excludeGenreIds.length > 0) {
              filteredResults = data.results.filter((movie: any) => 
                !movie.genre_ids || !movie.genre_ids.some((id: number) => excludeGenreIds.includes(id))
              );
            }
            
            allMovies = [...allMovies, ...filteredResults];
          }
        });
      }

      // Remove duplicatas por ID
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex((m) => m.id === movie.id)
      );

      if (uniqueMovies.length === 0) {
        // Fallback: busca filme popular aleatório
        const fallbackResponse = await fetch(
          `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=pt-BR&page=${Math.floor(Math.random() * 10) + 1}`
        );
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.results && fallbackData.results.length > 0) {
          const movie = pickRandom(fallbackData.results);
          const detailedMovie = await fetchMovieDetails(movie);
          setSuggestedMovie(detailedMovie);
          setCandidateMovies([detailedMovie]);
        }
        return;
      }

      // Calcula score e ordena
      const moviesWithScore = uniqueMovies.map(movie => ({
        ...movie,
        score: calculateScore(movie)
      }));

      // Ordena por score (maior primeiro)
      moviesWithScore.sort((a, b) => b.score - a.score);

      // Pega 20-30 filmes do topo
      const topMovies = moviesWithScore.slice(0, Math.min(30, moviesWithScore.length));

      // Embaralha
      const shuffledMovies = shuffleArray(topMovies);

      // Pega 3 filmes aleatórios
      const selectedMovies = shuffledMovies.slice(0, 3);

      // Busca detalhes dos filmes selecionados
      const detailedMovies = await Promise.all(
        selectedMovies.map(movie => fetchMovieDetails(movie))
      );

      setCandidateMovies(detailedMovies);
      
      // Seleciona o primeiro filme para exibir
      const firstMovie = detailedMovies[0];
      setSuggestedMovie(firstMovie);
    } catch (error) {
      console.error('Error fetching random movie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnotherMovie = () => {
    if (candidateMovies.length > 1) {
      // Remove o filme atual e pega o próximo
      const remainingMovies = candidateMovies.filter(m => m.id !== suggestedMovie?.id);
      if (remainingMovies.length > 0) {
        setSuggestedMovie(pickRandom(remainingMovies));
      } else {
        // Se não há mais filmes, busca novos
        handleSuggestMovie();
      }
    } else {
      // Se só tem 1 filme, busca novos
      handleSuggestMovie();
    }
  };

  const handleWatchTrailer = () => {
    if (suggestedMovie?.trailer_key) {
      window.open(`https://www.youtube.com/watch?v=${suggestedMovie.trailer_key}`, '_blank');
    }
  };

  const getEmotionalMessage = () => {
    const moodMessages: { [key: string]: string } = {
      'feliz': "Pelo seu clima de hoje, achamos esse 💙",
      'triste': "Esse combina com seu momento agora",
      'animado': "Boa escolha pra assistir hoje 🍿",
      'relaxado': "Perfeito para relaxar agora",
      'empolgado': "Esse vai te empolgar! 🎬",
      'reflexivo': "Ideal para refletir e se emocionar"
    };

    if (selectedMood && moodMessages[selectedMood]) {
      return moodMessages[selectedMood];
    }

    return "Boa escolha pra assistir hoje 🍿";
  };

  const moods = [
    { id: 'feliz', label: 'Feliz', icon: Star },
    { id: 'triste', label: 'Triste', icon: Heart },
    { id: 'animado', label: 'Animado', icon: Shuffle },
    { id: 'relaxado', label: 'Relaxado', icon: House },
    { id: 'empolgado', label: 'Empolgado', icon: Star },
    { id: 'reflexivo', label: 'Reflexivo', icon: Heart },
  ];

  const suggestions = [
    { id: 'em-casa', label: 'Em casa', icon: House },
    { id: 'com-alguem', label: 'Com alguém', icon: Users },
    { id: 'sozinho', label: 'Sozinho', icon: Heart },
    { id: 'teen', label: 'Teen', icon: Users },
    { id: 'lgbtq', label: 'LGBTQ+', icon: Rainbow },
  ];

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] min-h-screen overflow-y-auto scrollbar-hide pb-[72px]">
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-white text-[28px] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
          Não sei o que assistir
        </h1>
        <p className="font-['Montserrat:Light',sans-serif] text-white/70 text-[14px] mb-6">
          Deixe-nos sugerir o filme perfeito para você
        </p>

        {/* Filtros de Humor/Momento */}
        <div className="mb-6">
          <h2 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-3">
            Como você está hoje?
          </h2>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(isSelected ? null : mood.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all ${
                    isSelected
                      ? 'bg-[#8E61FF] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" weight={isSelected ? 'fill' : 'regular'} />
                  <span className="font-['Montserrat:SemiBold',sans-serif] text-[13px]">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sugestões */}
        <div className="mb-6">
          <h2 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-3">
            Qual o momento?
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              const isSelected = selectedSuggestion === suggestion.id;
              return (
                <button
                  key={suggestion.id}
                  onClick={() => setSelectedSuggestion(isSelected ? null : suggestion.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all ${
                    isSelected
                      ? 'bg-[#8E61FF] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" weight={isSelected ? 'fill' : 'regular'} />
                  <span className="font-['Montserrat:SemiBold',sans-serif] text-[13px]">
                    {suggestion.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Sugerir */}
        <button
          onClick={handleSuggestMovie}
          disabled={isLoading}
          className="w-full bg-white text-[#0a0a0f] font-['Montserrat:Bold',sans-serif] text-[18px] h-[48px] rounded-[12px] flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <Shuffle className="w-7 h-7 text-[#0a0a0f]" weight="fill" />
          {isLoading ? 'Buscando...' : 'escolhe pra mim'}
        </button>

        {/* Filme Sugerido */}
        {suggestedMovie && (
          <div className="space-y-4">
            {/* Card do Filme */}
            <div
              className="bg-white/10 backdrop-blur-md rounded-[16px] p-4 animate-fade-in"
              onClick={() => onMovieClick(suggestedMovie, candidateMovies.length > 0 ? candidateMovies : [suggestedMovie])}
            >
              <div className="flex gap-4">
                {suggestedMovie.poster_path && (
                  <div className="w-[100px] h-[150px] rounded-[10px] overflow-hidden bg-[#d9d9d9] shrink-0">
                    <ImageWithFallback
                      src={`${IMAGE_BASE_URL}${suggestedMovie.poster_path}`}
                      alt={suggestedMovie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-['Montserrat:Bold',sans-serif] text-white text-[18px] mb-2">
                    {suggestedMovie.title}
                  </h3>
                  {suggestedMovie.release_date && (
                    <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[12px] mb-2">
                      {new Date(suggestedMovie.release_date).getFullYear()}
                    </p>
                  )}
                  {suggestedMovie.vote_average > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-['Montserrat:SemiBold',sans-serif] text-white text-[14px]">
                        ⭐ {suggestedMovie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {suggestedMovie.overview && (
                    <p className="font-['Montserrat:Light',sans-serif] text-white/80 text-[13px] line-clamp-3">
                      {suggestedMovie.overview}
                    </p>
                  )}
                  {suggestedMovie.watch_providers && suggestedMovie.watch_providers.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {suggestedMovie.watch_providers.map((provider, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded overflow-hidden bg-white"
                          title={provider.provider_name}
                        >
                          {provider.logo_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnotherMovie();
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-['Montserrat:SemiBold',sans-serif] text-[14px] py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all"
              >
                <Shuffle className="w-5 h-5" weight="fill" />
                Outro
              </button>
              
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(suggestedMovie.id);
                  }}
                  className={`flex-1 font-['Montserrat:SemiBold',sans-serif] text-[14px] py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all ${
                    favorites.includes(suggestedMovie.id)
                      ? 'bg-[#04FFA7] text-[#0a0a0f]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Heart className="w-5 h-5" weight={favorites.includes(suggestedMovie.id) ? 'fill' : 'regular'} />
                  Salvar
                </button>
              )}

              {suggestedMovie.trailer_key && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWatchTrailer();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-['Montserrat:SemiBold',sans-serif] text-[14px] py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-5 h-5" weight="fill" />
                  Trailer
                </button>
              )}
            </div>
          </div>
        )}

        {hasSearched && !suggestedMovie && !isLoading && (
          <div className="text-center py-8">
            <p className="font-['Montserrat:Regular',sans-serif] text-white/60 text-[14px]">
              Não encontramos um filme com esses filtros. Tente outros!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
