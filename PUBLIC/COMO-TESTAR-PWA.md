# Como Testar o PWA no iPhone e Android

## 📱 Testando no iPhone (Safari)

### Passo a passo:
1. **Abra o Safari** no iPhone (não use Chrome ou outros navegadores)
2. **Acesse o site** em produção
3. **Toque no botão de compartilhar** (ícone de caixa com seta para cima) na barra inferior
4. **Role para baixo** e toque em **"Adicionar à Tela Inicial"** ou **"Adicionar à Tela de Início"**
5. **Confirme o nome** (deve aparecer "Cinema em Casa")
6. **Toque em "Adicionar"**
7. **Verifique a tela inicial** - o ícone do app deve aparecer com a logo "Cinema em Casa"

### Dicas:
- O ícone deve aparecer imediatamente após adicionar
- Se não aparecer, limpe o cache do Safari: Configurações > Safari > Limpar Histórico e Dados
- O app abre em modo standalone (sem barra do navegador)

---

## 🤖 Testando no Android (Chrome)

### Passo a passo:
1. **Abra o Chrome** no Android
2. **Acesse o site** em produção
3. **Toque no menu** (três pontos no canto superior direito)
4. **Selecione "Adicionar à tela inicial"** ou **"Instalar app"**
5. **Confirme** na popup que aparece
6. **Verifique a tela inicial** - o ícone do app deve aparecer com a logo "Cinema"

### Dicas:
- O Chrome pode mostrar um banner na parte inferior oferecendo instalar o app
- O ícone deve aparecer na tela inicial ou na gaveta de apps
- O app abre em modo standalone (sem barra do navegador)

---

## 🔍 Verificações Técnicas

### Para verificar se está funcionando:
1. **Abra o DevTools** (F12 no desktop)
2. **Vá para a aba "Application"** (Chrome) ou "Application" (Edge)
3. **Verifique:**
   - ✅ Manifest está carregado
   - ✅ Service Worker está registrado
   - ✅ Ícones estão acessíveis (192x192, 512x512, 180x180)

### URLs para testar:
- **Produção:** https://oqassistir-[hash].vercel.app
- **Local:** http://localhost:3000 (após `npm run dev`)

---

## ⚠️ Problemas Comuns

### Ícone não aparece:
- Limpe o cache do navegador
- Remova o app da tela inicial e adicione novamente
- Verifique se os arquivos `/icons/icon-*.png` estão acessíveis
- Aguarde alguns minutos (cache do sistema pode demorar)

### App não abre em modo standalone:
- Verifique se o `display: "standalone"` está no manifest.json
- Certifique-se de que o manifest.json está linkado no index.html

### Nome do app está errado:
- Verifique o `name` e `short_name` no manifest.json
- Para iOS, verifique `apple-mobile-web-app-title` no index.html

---

## 📝 Checklist de Configuração

- [x] Manifest.json configurado com name: "Cinema em Casa"
- [x] Ícones criados (192x192, 512x512, 180x180)
- [x] Ícones na pasta `/public/icons/`
- [x] Meta tags iOS adicionadas no index.html
- [x] Manifest linkado no index.html
- [x] Build testado e funcionando

