# Como Gerar Ícones PWA com a Logo

Para usar a imagem da logo (com clapperboard, círculos roxos e "ASSISTIR?") como ícone do PWA na tela inicial do celular.

## 🎯 Método Recomendado: Gerador HTML

1. **Abra o arquivo `generate-pwa-icons.html` no navegador**
   - Pode ser aberto diretamente com um duplo clique
   - Ou arraste o arquivo para o navegador

2. **Faça upload da imagem da logo**
   - Clique em "Escolher Imagem"
   - Selecione a imagem com o clapperboard, círculos roxos e "ASSISTIR?"

3. **Baixe os ícones gerados**
   - Os ícones serão gerados automaticamente nos tamanhos 192x192 e 512x512
   - Clique em "Baixar 192x192" e "Baixar 512x512"

4. **Substitua os arquivos**
   - Substitua `src/public/icon-192.png` pelo arquivo baixado
   - Substitua `src/public/icon-512.png` pelo arquivo baixado

5. **Faça commit e push**
   ```bash
   git add src/public/icon-*.png
   git commit -m "Atualizar ícones PWA com logo"
   git push
   ```

## Opção Alternativa: Ferramenta Online

1. Acesse https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Faça upload da imagem da logo
3. Gere os ícones nos tamanhos 192x192 e 512x512
4. Baixe e substitua os arquivos em `src/public/`

## 📝 Notas Importantes

- Os ícones devem ter fundo `#0a0a0f` (cor do tema)
- A logo será centralizada automaticamente
- Certifique-se de que a imagem está em boa qualidade
- Os ícones devem ser quadrados (mesma largura e altura)

