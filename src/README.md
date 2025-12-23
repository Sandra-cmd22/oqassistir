# 🎬 CineBuzz - Próximos Lançamentos

Um Progressive Web App (PWA) mobile para descobrir filmes que irão lançar futuramente, com navegação intuitiva, filtros avançados e background dinâmico.

## 🚀 Características

- ✅ **PWA Instalável** - Pode ser instalado como um app nativo no dispositivo móvel
- 📱 **Design Mobile-First** - Interface otimizada para smartphones
- 🎨 **Background Dinâmico** - Blur com color bleed baseado no poster do filme
- 🏠 **Tela Home** - Navegação intuitiva entre modos de visualização
- 🎯 **Visualização Individual** - Um filme por vez em fullscreen com swipe
- 📋 **Lista Completa** - Visualize todos os lançamentos em formato de lista
- 🔍 **Filtros Avançados** - Filtre por mês e/ou gênero
- 🎭 **Informações Completas** - Sinopse, elenco, gênero e data de lançamento
- 📡 **Funciona Offline** - Service Worker para cache e funcionamento offline
- 🎬 **API TMDB** - Integração com The Movie Database para dados reais
- 🔄 **Dados Demo** - Funciona sem API key com 5 filmes de exemplo

## 🛠️ Configuração Rápida

### Opção 1: Usar com Dados Demo
O app funciona imediatamente com dados de demonstração. Nenhuma configuração necessária!

### Opção 2: Configurar API TMDB (Recomendado)

Para dados reais de filmes:

1. **Obter API Key**: [Siga o guia completo](TMDB_API_SETUP.md)
2. **Configurar**: Edite `/App.tsx` linha 8:
   ```typescript
   const TMDB_API_KEY = 'sua_chave_aqui';
   ```
3. **Pronto!** Os filmes reais aparecerão automaticamente

📖 **Documentação Detalhada**: [TMDB_API_SETUP.md](TMDB_API_SETUP.md)

## 🎨 Funcionalidades

### Tela Home
- Navegação para "Descobrir Filmes" (swiper)
- Navegação para "Lista Completa" (lista de lançamentos)
- Design moderno com ícones e animações

### Modo Descobrir (Swiper)
- **Um filme por vez** - Visualização fullscreen imersiva
- **Background dinâmico** - Blur com color bleed extraído do poster
- **Swipe vertical** - Navegue entre filmes deslizando
- **Setas de navegação** - Clique para anterior/próximo
- **Indicadores visuais** - Bolinhas mostrando posição atual

### Lista de Lançamentos
- **Cards compactos** - Thumbnail, título, data e gênero
- **Clique para expandir** - Abre o filme no modo swiper
- **Scroll infinito** - Role para ver todos os filmes

### Sistema de Filtros
- **Filtro por Mês** - Janeiro a Dezembro ou "Todos"
- **Filtro por Gênero** - Múltiplos gêneros selecionáveis
- **Indicador de filtros ativos** - Ponto branco no ícone
- **Interface modal** - Painel fullscreen para melhor experiência

### Navegação
- **Header fixo** - Botão Home, título e filtros sempre visíveis
- **Touch gestures** - Suporte completo para gestos de toque
- **Transições suaves** - Animações fluidas entre telas

## 📲 Instalar como PWA

### Android (Chrome)
1. Abra o site no Chrome
2. Toque no banner "Instalar" que aparece OU
3. Menu (⋮) → "Adicionar à tela inicial"

### iOS (Safari)
1. Abra no Safari
2. Ícone de compartilhar → "Adicionar à Tela de Início"

### Desktop
1. Clique no ícone de instalação na barra de endereços
2. Ou Menu → "Instalar CineBuzz"

📖 **Guia Completo de PWA**: [PWA_SETUP.md](PWA_SETUP.md)

## 🔧 Tecnologias

- **React** + **TypeScript** - Framework e tipagem
- **Tailwind CSS** - Estilização
- **TMDB API** - Dados de filmes
- **Service Worker** - Cache e offline
- **Web Manifest** - Configuração PWA
- **Lucide React** - Ícones
- **Canvas API** - Extração de cores do poster

## 📁 Estrutura do Projeto

```
/
├── App.tsx                      # Componente principal com navegação
├── components/
│   ├── Home.tsx                # Tela inicial
│   ├── MovieSwiper.tsx         # Visualização fullscreen com swipe
│   ├── UpcomingList.tsx        # Lista de próximos lançamentos
│   ├── FilterPanel.tsx         # Painel de filtros
│   ├── MovieCard.tsx           # Card de filme (legado)
│   ├── MonthFilter.tsx         # Filtro de meses (legado)
│   └── InstallPrompt.tsx       # Prompt de instalação PWA
├── public/
│   ├── manifest.json           # Configuração PWA
│   ├── service-worker.js       # Service Worker
│   ├── icon-192.png           # Ícone 192x192
│   └── icon-512.png           # Ícone 512x512
├── index.html                  # HTML principal
├── README.md                   # Este arquivo
├── TMDB_API_SETUP.md          # Guia da API
└── PWA_SETUP.md               # Guia do PWA
```

## 🎯 Como Usar

1. **Abrir o App**
   - Acesse via navegador ou instale como PWA
   
2. **Escolher Modo de Visualização**
   - "Descobrir Filmes" - Explore um por vez
   - "Lista Completa" - Veja todos de uma vez
   
3. **Aplicar Filtros**
   - Toque no ícone de filtros (topo direito)
   - Selecione mês e/ou gêneros
   - Os filmes são filtrados automaticamente
   
4. **Navegar no Modo Swiper**
   - Deslize verticalmente para mudar de filme
   - Use as setas ou indicadores
   - Background muda de acordo com cada poster
   
5. **Usar a Lista**
   - Role para ver todos os filmes
   - Clique em um filme para abrir no swiper

## 🎨 Recursos Visuais

### Background Dinâmico
- Extrai cor dominante do poster do filme
- Aplica blur e color bleed
- Cria atmosfera imersiva única para cada filme
- Usa fallback caso o poster não carregue

### Efeitos Visuais
- Backdrop blur nos cards
- Transições suaves
- Animações no hover
- Gradientes personalizados

## 📊 Dados Disponíveis

### Com API Key (TMDB)
- ✅ Milhares de filmes futuros
- ✅ Imagens reais de alta qualidade
- ✅ Elenco completo com fotos
- ✅ Sinopses oficiais em PT-BR
- ✅ Dados atualizados diariamente

### Modo Demo (Sem API Key)
- ⚡ 5 filmes de exemplo
- 📝 Sinopses fictícias
- 👥 Elenco sem fotos
- 🎯 Perfeito para testar o app

## 🚀 Próximos Passos Sugeridos

- [ ] Adicionar busca de filmes
- [ ] Implementar sistema de favoritos
- [ ] Adicionar notificações push para lançamentos
- [ ] Criar página de detalhes expandida
- [ ] Adicionar trailers e vídeos
- [ ] Implementar compartilhamento social
- [ ] Adicionar classificação e avaliações
- [ ] Modo escuro/claro