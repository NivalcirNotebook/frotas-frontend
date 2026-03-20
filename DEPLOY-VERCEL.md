# Deploy do Frontend na Vercel

Este guia explica como fazer deploy do frontend (React) na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório Git com o código do frontend
- Backend já deployado no Render (você vai precisar da URL)

## 🗂️ Estrutura do Repositório Frontend

Se você separou os repositórios, o repo do frontend deve conter:

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── utils/
│   ├── App.js
│   ├── config.js  ← IMPORTANTE!
│   └── index.js
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se que você tem os arquivos corretos:

1. **src/config.js** deve existir com:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
   export { API_URL };
   ```

2. **Crie .env.local** para testes locais (NÃO comitar):
   ```bash
   REACT_APP_API_URL=https://frotas-backend.onrender.com
   ```

3. **Verifique .gitignore** (deve conter):
   ```
   .env
   .env.local
   .env.production
   ```

### 2. Deploy na Vercel

#### Opção 1: Via Dashboard (Recomendado para primeira vez)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório do GitHub/GitLab
4. Configure o projeto:

   **Framework Preset**: `Create React App`
   
   **Root Directory**: 
   - Se o código está na raiz: deixe vazio
   - Se está em subpasta `client/`: coloque `client`
   
   **Build Command**: `npm run build` (ou deixe padrão)
   
   **Output Directory**: `build` (ou deixe padrão)

5. **Variáveis de Ambiente** - Adicione:
   ```
   REACT_APP_API_URL=https://frotas-backend.onrender.com
   ```
   (Substitua pela URL real do seu backend no Render)

6. Clique em **"Deploy"**

#### Opção 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# No diretório do frontend
vercel login

# Deploy
vercel

# Quando perguntado, configure:
# - Set up and deploy: Y
# - Which scope: Sua conta
# - Link to existing project: N
# - Project name: frotas-frontend
# - Directory: ./ (ou client/ se aplicável)
# - Override settings: N

# Adicionar variável de ambiente
vercel env add REACT_APP_API_URL

# Quando perguntado, cole: https://frotas-backend.onrender.com

# Deploy em produção
vercel --prod
```

### 3. Atualizar CORS no Backend

**IMPORTANTE:** Após obter a URL da Vercel (ex: `https://frotas-sistema.vercel.app`):

1. Volte no **Render** (painel do backend)
2. Vá em **Environment** → Edite a variável `FRONTEND_URL`
3. Substitua por: `https://frotas-sistema.vercel.app` (sua URL real)
4. Salve - o Render fará redeploy automaticamente

Isso permite que o frontend faça requisições ao backend sem erros de CORS.

### 4. Verificar Deploy

1. Acesse a URL fornecida pela Vercel (ex: `https://frotas-sistema.vercel.app`)
2. Teste o login
3. Verifique se as requisições à API estão funcionando
4. Abra o Console do navegador (F12) para verificar erros

## 🔒 Configurar Domínio Personalizado (Opcional)

1. No dashboard da Vercel, vá no seu projeto
2. Clique em **"Settings"** → **"Domains"**
3. Adicione seu domínio personalizado
4. Siga as instruções para configurar DNS

Depois de configurar:
- Atualize `FRONTEND_URL` no Render com o novo domínio

## 🔄 Atualizações Futuras

### Deploy Automático
A Vercel fará deploy automaticamente quando você der push na branch principal.

### Deploy Manual
```bash
vercel --prod
```

### Preview Deploys
Cada pull request gera um deploy de preview automático!

## 📊 Monitoramento

A Vercel fornece:
- **Analytics**: Tráfego e performance
- **Logs**: Logs de build e runtime
- **Speed Insights**: Métricas de velocidade

## 🔧 Troubleshooting

### Erro: "API_URL is not defined"
- Verifique se `REACT_APP_API_URL` está nas variáveis de ambiente
- Variáveis devem começar com `REACT_APP_`
- Após adicionar variável, faça redeploy

### Erro CORS
```
Access to fetch at 'https://backend.onrender.com/api/...' 
has been blocked by CORS policy
```

**Solução:**
1. Verifique a variável `FRONTEND_URL` no Render
2. Deve ser exatamente a URL da Vercel (incluindo `https://`)
3. Não pode ter barra `/` no final
4. Após atualizar, aguarde o redeploy do backend

### Erro 404 em Rotas
Se ao acessar diretamente uma URL (ex: `/veiculos`) der 404:

1. Crie `vercel.json` na raiz do projeto:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

### Build Falha
- Verifique os logs na Vercel
- Teste o build localmente: `npm run build`
- Verifique se todas as dependências estão no `package.json`

### Frontend Não Conecta com Backend
1. Abra DevTools (F12) → Network
2. Veja a URL da requisição
3. Confirme que está usando a URL do Render
4. Teste a URL do backend diretamente no navegador

## 💡 Dicas de Performance

1. **Cache estático**: A Vercel já otimiza automaticamente
2. **Imagens**: Use formatos modernos (WebP, AVIF)
3. **Code splitting**: React já faz automaticamente
4. **Environment por branch**: Configure diferentes APIs para staging/production

## 🎯 Checklist Final

- [ ] Backend deployado e funcionando no Render
- [ ] `REACT_APP_API_URL` configurada na Vercel
- [ ] `FRONTEND_URL` configurada no Render
- [ ] Login funcionando
- [ ] Requisições à API funcionando
- [ ] Sem erros no console
- [ ] CORS configurado corretamente

## ✅ Sucesso!

Se tudo estiver funcionando:
- ✅ Frontend acessível na Vercel
- ✅ Backend respondendo no Render
- ✅ Login e autenticação funcionando
- ✅ Dados carregando corretamente

Seu sistema de gestão de frotas está no ar! 🚀
