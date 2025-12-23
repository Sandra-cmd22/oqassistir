# 📱 Configuração PWA - Filmes em Breve

## O que é um PWA?

Progressive Web App (PWA) é uma aplicação web que funciona como um aplicativo nativo, podendo ser instalado no dispositivo móvel e funcionar offline.

## ✨ Funcionalidades Implementadas

### 1. **Manifest.json** (`/public/manifest.json`)
- Define como o app aparece quando instalado
- Configurações de ícones, cores e orientação
- Nome do app: "Filmes em Breve"
- Modo standalone (tela cheia sem navegador)

### 2. **Service Worker** (`/public/service-worker.js`)
- Cache de recursos estáticos
- Funcionamento offline
- Estratégia: Cache First, Network Fallback
- Atualização automática de cache

### 3. **Ícones do App**
- `icon-192.png` - Ícone padrão (192x192)
- `icon-512.png` - Ícone de alta resolução (512x512)
- Formato maskable para Android adaptável

### 4. **Meta Tags PWA** (`/index.html`)
```html
<!-- Viewport otimizado -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- Cor do tema -->
<meta name="theme-color" content="#5f5476">

<!-- Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- iOS específico -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Filmes em Breve">
```

## 📲 Como Instalar

### Android (Chrome)
1. Abra o site no Chrome
2. Aguarde o banner de instalação OU
3. Toque no menu (⋮) → "Adicionar à tela inicial"
4. Confirme a instalação
5. O ícone aparecerá na tela inicial

### iOS (Safari)
1. Abra o site no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. Role e selecione "Adicionar à Tela de Início"
4. Personalize o nome se desejar
5. Toque em "Adicionar"

### Desktop (Chrome/Edge)
1. Clique no ícone de instalação na barra de endereços
2. Ou vá em Menu → "Instalar Filmes em Breve"
3. Confirme a instalação
4. O app abrirá em uma janela separada

## 🔧 Testando PWA Localmente

### Chrome DevTools
1. Abra DevTools (F12)
2. Vá para aba "Application"
3. Verifique:
   - **Manifest**: Deve mostrar todos os dados
   - **Service Workers**: Status "activated and running"
   - **Cache Storage**: Recursos em cache
4. Use Lighthouse para auditoria PWA

### Lighthouse Audit
1. DevTools → Lighthouse
2. Selecione "Progressive Web App"
3. Execute o teste
4. Verifique pontuação (objetivo: 90+)

## 🎯 Checklist PWA

- ✅ HTTPS (obrigatório para produção)
- ✅ Manifest.json válido
- ✅ Service Worker registrado
- ✅ Ícones em múltiplos tamanhos
- ✅ Responsivo para mobile
- ✅ Meta tags corretas
- ✅ Offline fallback
- ✅ Cores do tema definidas
- ✅ Título e descrição

## 📊 Recursos em Cache

O Service Worker faz cache de:
- `/` (página principal)
- `/index.html`
- `/styles/globals.css`
- Assets JavaScript (automático)
- Respostas da API (runtime cache)

## 🚀 Próximas Melhorias

### Push Notifications
```javascript
// Adicionar ao service worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png'
  });
});
```

### Background Sync
```javascript
// Sincronizar dados quando online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-movies') {
    event.waitUntil(syncMovies());
  }
});
```

### Share API
```javascript
// Compartilhar filmes
if (navigator.share) {
  navigator.share({
    title: movie.title,
    text: movie.overview,
    url: window.location.href
  });
}
```

## 🔍 Troubleshooting

### Service Worker não registra
- Verifique se está usando HTTPS (ou localhost)
- Confirme que `/service-worker.js` está acessível
- Limpe cache do navegador

### App não instala
- Verifique se manifest.json está válido
- Confirme que há ícones 192x192 e 512x512
- Teste com Lighthouse

### Cache não funciona
- Verifique DevTools → Application → Cache Storage
- Force atualização do Service Worker
- Limpe e re-registre o Service Worker

## 📱 Compatibilidade

| Browser | Android | iOS | Desktop |
|---------|---------|-----|---------|
| Chrome  | ✅      | ❌  | ✅      |
| Safari  | ❌      | ✅  | ✅      |
| Firefox | ✅      | ❌  | ✅      |
| Edge    | ✅      | ❌  | ✅      |
| Samsung | ✅      | ❌  | ❌      |

## 🛠️ Ferramentas Úteis

- **[PWA Builder](https://www.pwabuilder.com/)** - Gerar assets PWA
- **[Manifest Generator](https://app-manifest.firebaseapp.com/)** - Criar manifest.json
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Auditar PWA
- **[Workbox](https://developers.google.com/web/tools/workbox)** - Service Worker avançado

## 📚 Recursos

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Web.dev Learn PWA](https://web.dev/learn/pwa/)
