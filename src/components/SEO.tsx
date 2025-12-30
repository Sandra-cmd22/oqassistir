import { Helmet } from 'react-helmet-async';

interface SEOProps {
  /**
   * Título da página (aparece na aba do navegador e no preview)
   */
  title?: string;
  
  /**
   * Descrição da página (aparece no preview das redes sociais)
   */
  description?: string;
  
  /**
   * URL da imagem para preview (deve ser absoluta e pública)
   * Tamanho recomendado: 1200x630px
   */
  image?: string;
  
  /**
   * URL completa da página (deve ser absoluta)
   */
  url?: string;
  
  /**
   * Tipo de conteúdo (website, article, etc.)
   */
  type?: string;
}

/**
 * Componente SEO para gerenciar meta tags Open Graph e Twitter Card
 * 
 * Open Graph: Usado por Facebook, WhatsApp, Instagram, Telegram, Discord
 * Twitter Card: Usado por Twitter/X
 * 
 * @example
 * <SEO 
 *   title="CineBuzz - Descubra os melhores filmes"
 *   description="Encontre os próximos lançamentos de cinema, notícias e sugestões personalizadas"
 *   image="https://seusite.com/og-image.png"
 *   url="https://seusite.com"
 * />
 */
export function SEO({
  title = 'CineBuzz - Próximos Lançamentos',
  description = 'Descubra os próximos lançamentos de filmes, notícias do cinema e receba sugestões personalizadas baseadas no seu humor e momento.',
  image = '/og-image.png', // Imagem de preview usando o logo do app
  url = typeof window !== 'undefined' ? window.location.href : 'https://seusite.com',
  type = 'website'
}: SEOProps) {
  // Garante que a URL da imagem seja absoluta
  const absoluteImageUrl = image.startsWith('http') 
    ? image 
    : typeof window !== 'undefined' 
      ? `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`
      : image;

  const absoluteUrl = url.startsWith('http') 
    ? url 
    : typeof window !== 'undefined' 
      ? window.location.origin + (url.startsWith('/') ? url : `/${url}`)
      : url;

  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook / WhatsApp / Instagram / Telegram / Discord */}
      {/* og:title - Título que aparece no preview */}
      <meta property="og:title" content={title} />
      
      {/* og:description - Descrição que aparece no preview */}
      <meta property="og:description" content={description} />
      
      {/* og:image - Imagem que aparece no preview (1200x630px recomendado) */}
      <meta property="og:image" content={absoluteImageUrl} />
      
      {/* og:url - URL completa da página */}
      <meta property="og:url" content={absoluteUrl} />
      
      {/* og:type - Tipo de conteúdo (website, article, etc.) */}
      <meta property="og:type" content={type} />
      
      {/* og:site_name - Nome do site */}
      <meta property="og:site_name" content="CineBuzz" />
      
      {/* og:locale - Idioma (pt_BR para português brasileiro) */}
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      {/* twitter:card - Tipo de card (summary_large_image mostra imagem grande) */}
      <meta name="twitter:card" content="summary_large_image" />
      
      {/* twitter:title - Título para Twitter */}
      <meta name="twitter:title" content={title} />
      
      {/* twitter:description - Descrição para Twitter */}
      <meta name="twitter:description" content={description} />
      
      {/* twitter:image - Imagem para Twitter */}
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Meta tags adicionais para melhor compatibilidade */}
      <meta name="twitter:site" content="@cinebuzz" />
      <meta name="twitter:creator" content="@cinebuzz" />
    </Helmet>
  );
}

