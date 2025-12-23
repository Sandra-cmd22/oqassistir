# Como Gerar Ícones PWA com a Logo

Para usar a logo como ícone do PWA na tela inicial do celular, você precisa gerar os arquivos PNG a partir da logo SVG.

## Opção 1: Usar Ferramenta Online

1. Acesse https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem da logo (exporte o componente Group7 como PNG primeiro)
3. Gere os ícones nos tamanhos 192x192 e 512x512
4. Substitua os arquivos em `src/public/icon-192.png` e `src/public/icon-512.png`

## Opção 2: Usar o Componente Group7

1. Abra o projeto no navegador
2. Use as ferramentas de desenvolvedor para capturar a logo
3. Exporte como PNG nos tamanhos necessários
4. Substitua os arquivos de ícone

## Opção 3: Criar Manualmente

1. Abra o componente `src/imports/Group7.tsx` no navegador
2. Capture a tela da logo
3. Use um editor de imagens para criar ícones quadrados (192x192 e 512x512)
4. Centralize a logo no ícone com fundo #0a0a0f
5. Salve como `icon-192.png` e `icon-512.png` em `src/public/`

## Estrutura da Logo

A logo consiste em:
- Film strip (faixa de filme) branca
- Texto "Oq" em roxo (#6416FF)
- Texto "Assistir" em branco

Certifique-se de que os ícones mantenham essa identidade visual.

