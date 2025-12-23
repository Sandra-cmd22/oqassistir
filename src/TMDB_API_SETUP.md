# 🎬 Configuração da API TMDB

**Documentação Oficial**: [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)

## Como Obter sua Chave de API

### Passo 1: Criar Conta
1. Acesse [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Clique em "Entrar" no canto superior direito
3. Selecione "Registre-se"
4. Preencha seus dados:
   - Nome de usuário
   - Senha
   - Email
   - Confirme que você leu os termos

### Passo 2: Verificar Email
1. Verifique sua caixa de entrada
2. Abra o email de verificação do TMDB
3. Clique no link de ativação

### Passo 3: Solicitar API Key
1. Faça login na sua conta
2. Vá para seu perfil (clique no ícone no canto superior direito)
3. Selecione **"Configurações"**
4. No menu lateral, clique em **"API"**
5. Clique em **"Solicitar uma chave de API"**
6. Escolha a opção **"Developer"** (gratuita)

### Passo 4: Preencher Formulário
Complete o formulário com informações básicas:
- **Tipo de uso**: Educacional/Pessoal
- **URL da aplicação**: http://localhost:3000 (ou seu domínio)
- **Descrição**: "App para visualizar filmes futuros"
- Aceite os termos de uso

### Passo 5: Copiar a Chave
1. Após a aprovação (instantânea), você verá sua API Key
2. Copie a chave que aparece em **"API Key (v3 auth)"**
3. **IMPORTANTE**: Não compartilhe esta chave publicamente!

## Instalação no App

### Método 1: Editar Arquivo Diretamente
1. Abra o arquivo `/App.tsx`
2. Na linha 8, encontre:
   ```typescript
   const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';
   ```
3. Substitua por sua chave:
   ```typescript
   const TMDB_API_KEY = 'sua_chave_aqui';
   ```

### Método 2: Usar Variável de Ambiente (Recomendado para Produção)
1. Crie um arquivo `.env` na raiz do projeto:
   ```
   VITE_TMDB_API_KEY=sua_chave_aqui
   ```
2. No `/App.tsx`, altere para:
   ```typescript
   const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
   ```
3. **IMPORTANTE**: Adicione `.env` ao `.gitignore`

## Testando a Configuração

1. Salve o arquivo após adicionar a chave
2. Recarregue a aplicação
3. O banner de aviso "Usando dados de demonstração" deve desaparecer
4. Você verá filmes reais da API do TMDB

## Limites da API Gratuita

- ✅ **40 requisições por 10 segundos**
- ✅ **Sem limite diário** (uso razoável)
- ✅ **Dados em tempo real**
- ✅ **Imagens de alta qualidade**
- ✅ **Múltiplos idiomas** (incluindo PT-BR)

## Endpoints Utilizados

Este app usa os seguintes endpoints:

1. **Genre List**
   ```
   GET https://api.themoviedb.org/3/genre/movie/list
   ```
   - Retorna lista de gêneros de filmes

2. **Upcoming Movies**
   ```
   GET https://api.themoviedb.org/3/movie/upcoming
   ```
   - Retorna filmes que serão lançados

3. **Movie Credits**
   ```
   GET https://api.themoviedb.org/3/movie/{movie_id}/credits
   ```
   - Retorna elenco e equipe do filme

## Exemplo de Resposta da API

### Filme
```json
{
  "id": 693134,
  "title": "Duna: Parte Dois",
  "overview": "Paul Atreides se une a Chani...",
  "poster_path": "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  "release_date": "2024-02-28",
  "genre_ids": [878, 12]
}
```

### Créditos
```json
{
  "cast": [
    {
      "id": 1190668,
      "name": "Timothée Chalamet",
      "profile_path": "/vnbNdSYfTl96lHy2fSnKwpEf6bB.jpg"
    }
  ]
}
```

## Segurança

### ⚠️ IMPORTANTE: Não Exponha sua API Key

1. **Nunca comite** a chave no Git
2. **Use variáveis de ambiente** em produção
3. **Não compartilhe** a chave publicamente
4. **Regenere** se comprometida

### Para Regenerar uma Chave
1. Vá em Configurações → API
2. Clique em "Reset API Key"
3. Confirme a ação
4. Atualize o app com a nova chave

## Troubleshooting

### Erro 401 (Unauthorized)
- Verifique se a API key está correta
- Confirme que não há espaços extras
- Regenere a chave se necessário

### Erro 404 (Not Found)
- Verifique a URL da API
- Confirme que o endpoint existe
- Verifique se o ID do filme é válido

### Erro 429 (Too Many Requests)
- Você excedeu o limite de requisições
- Aguarde alguns segundos
- Implemente cache para reduzir requisições

### Nenhum Filme Aparece
- Abra o Console (F12)
- Verifique erros de rede
- Confirme que a API key está configurada
- Teste diretamente no navegador:
  ```
  https://api.themoviedb.org/3/movie/upcoming?api_key=SUA_CHAVE&language=pt-BR
  ```

## Recursos Adicionais

- **API Status**: https://status.themoviedb.org/
- **Fórum de Suporte**: https://www.themoviedb.org/talk/category/5047958519c29526b50017d6
- **Exemplos de Código**: https://github.com/themoviedb

## Alternativas

Se não quiser usar a API:
1. O app funciona com dados de demonstração (5 filmes de exemplo)
2. Você pode adicionar mais filmes mock em `getMockMovies()` no `/App.tsx`

## Política de Uso

- ✅ Uso pessoal e educacional
- ✅ Aplicativos gratuitos
- ✅ Atribuição recomendada
- ❌ Revender os dados
- ❌ Uso comercial sem permissão

---

**Dica**: Salve sua API key em um gerenciador de senhas para não perder!