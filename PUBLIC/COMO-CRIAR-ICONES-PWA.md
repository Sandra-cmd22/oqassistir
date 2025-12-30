# Como Criar os Ícones do PWA

Para que o app apareça com um ícone personalizado quando adicionado à tela inicial do celular, você precisa criar dois arquivos de ícone:

## Tamanhos Necessários:
- **icon-192.png** - 192x192 pixels
- **icon-512.png** - 512x512 pixels

## Opções para Criar os Ícones:

### Opção 1: Usar o Logo Existente (Recomendado)
1. Abra o arquivo `src/assets/logomovie.png` em um editor de imagens
2. Redimensione para 192x192 pixels e salve como `public/icon-192.png`
3. Redimensione para 512x512 pixels e salve como `public/icon-512.png`

### Opção 2: Usar Ferramentas Online
- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon.io**: https://favicon.io/

### Opção 3: Usar ImageMagick (Linha de Comando)
```bash
# Se tiver ImageMagick instalado:
convert src/assets/logomovie.png -resize 192x192 public/icon-192.png
convert src/assets/logomovie.png -resize 512x512 public/icon-512.png
```

## Importante:
- Os ícones devem ser **quadrados** (mesma largura e altura)
- Formato: **PNG** com fundo transparente ou sólido
- O ícone deve ser legível mesmo em tamanho pequeno
- Recomenda-se usar o logo do app (`logomovie.png`) como base

## Após Criar os Ícones:
1. Coloque os arquivos `icon-192.png` e `icon-512.png` na pasta `public/`
2. O manifest.json já está configurado para usar esses ícones
3. Faça um novo build e deploy

