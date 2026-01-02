# 🔗 Como Configurar Domínio Fixo na Vercel

## Problema
A Vercel gera links de preview diferentes a cada deploy, o que atrapalha ao testar a PWA.

## Solução: Configurar Domínio de Produção Fixo

### Passo 1: Acessar o Painel da Vercel
1. Acesse: https://vercel.com
2. Faça login
3. Encontre o projeto `oqassistir`

### Passo 2: Configurar Domínio de Produção
1. Vá em **Settings** > **Domains**
2. Você verá o domínio padrão: `oqassistir.vercel.app`
3. Este domínio **NÃO muda** - é sempre o mesmo!

### Passo 3: Usar Apenas o Link de Produção
**Link fixo de produção:**
```
https://oqassistir.vercel.app
```

### Passo 4: Desabilitar Preview Deploys (Opcional)
Se quiser evitar deploys de preview:
1. Vá em **Settings** > **Git**
2. Desabilite "Automatic Preview Deployments" (opcional)

### Passo 5: Configurar Domínio Customizado (Opcional)
Se quiser um domínio próprio (ex: oqassistir.com.br):
1. Vá em **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio
4. Siga as instruções de DNS

## ✅ Link Fixo Atual
**Use sempre este link:**
```
https://oqassistir.vercel.app
```

Este link **nunca muda** e sempre aponta para a versão de produção mais recente.

