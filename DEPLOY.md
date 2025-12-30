# 🚀 Guia de Deploy

## Opções de Deploy

### 1. **Vercel (Recomendado - Mais Fácil)**

#### Deploy Automático (Recomendado):
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Selecione o repositório: `Sandra-cmd22/oqassistir`
5. O Vercel detectará automaticamente o `vercel.json`
6. Clique em "Deploy"
7. **Pronto!** Cada push no GitHub fará deploy automático

#### Deploy Manual (via CLI):
```bash
# 1. Faça push dos commits
git push origin main

# 2. Deploy via Vercel CLI
vercel

# Ou deploy em produção
vercel --prod
```

### 2. **Netlify**

1. Acesse: https://netlify.com
2. Faça login com GitHub
3. "Add new site" > "Import an existing project"
4. Selecione o repositório
5. Configurações:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Deploy!

### 3. **GitHub Pages** (Gratuito, mas mais limitado)

Precisa configurar GitHub Actions. Não é automático por padrão.

## ⚙️ Configuração Atual

- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Framework:** Vite
- **Arquivo de Config:** `vercel.json` ✅

## 📝 Próximos Passos

1. **Faça push dos commits:**
   ```bash
   git push origin main
   ```

2. **Conecte ao Vercel:**
   - Acesse vercel.com
   - Conecte o repositório GitHub
   - Deploy automático será ativado!

## ✅ Deploy Automático

Após conectar ao Vercel, cada `git push` fará deploy automático!

