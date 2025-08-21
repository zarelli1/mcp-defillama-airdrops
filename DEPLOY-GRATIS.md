# 🆓 Deploy GRATUITO - MCP DeFiLlama

## 🎯 Opção 1: Render (Mais Fácil - RECOMENDADO)

### Passo a passo:
1. **Acesse:** https://render.com
2. **Sign Up** com sua conta GitHub
3. **Dashboard** → **New** → **Web Service**
4. **Connect** repositório: `zarelli1/mcp-defillama-airdrops`
5. **Configurações:**
   ```
   Name: mcp-defillama-airdrops
   Environment: Node
   Build Command: npm install && npx tsc
   Start Command: npm run start:server
   Plan: Free
   Node Version: 18
   ```
6. **Create Web Service**
7. **Aguardar deploy** (5-10 minutos)
8. **Sua URL:** `https://mcp-defillama-airdrops.onrender.com`

### 🔧 Se der erro, use essas configurações:
- **Build Command:** `npm ci && npx tsc`
- **Start Command:** `node dist/http-server.js`
- **Environment Variables:** `NODE_ENV=production`

### ✅ Pronto! API online 24/7

---

## 🎯 Opção 2: Vercel (Super Rápido)

1. **Acesse:** https://vercel.com
2. **Sign Up** com GitHub
3. **Import Project**
4. **Selecionar:** `zarelli1/mcp-defillama-airdrops`
5. **Deploy** automático
6. **URL:** `https://mcp-defillama-airdrops.vercel.app`

---

## 🎯 Opção 3: Railway

1. **Acesse:** https://railway.app
2. **Login** com GitHub
3. **New Project** → **Deploy from GitHub**
4. **Select Repo:** `zarelli1/mcp-defillama-airdrops`
5. **Deploy**

---

## 📱 Configurar N8N

### Depois do deploy, use no N8N:

**URL da API:** `https://SEU-APP.onrender.com/n8n/best-airdrops`

**Nó HTTP Request:**
```json
{
  "method": "GET",
  "url": "https://SEU-APP.onrender.com/n8n/best-airdrops",
  "queryParameters": {
    "limit": "5"
  }
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "count": 5,
  "airdrops": [
    {
      "name": "LayerZero",
      "value": "$1000-5000", 
      "status": "Active",
      "chain": "ETH"
    }
  ]
}
```

---

## 🔄 Fluxo N8N → WhatsApp

1. **Schedule Trigger** (6 em 6 horas)
2. **HTTP Request** → Sua API
3. **Code Node** → Formatar mensagem
4. **HTTP Request** → Evolution API

### Código para formatar no N8N:
```javascript
const data = $input.first().json;
const airdrops = data.airdrops || [];

let msg = '🚀 *Top Airdrops*\\n\\n';

airdrops.forEach((a, i) => {
  msg += `${i+1}. *${a.name}*\\n`;
  msg += `💰 ${a.value}\\n`;
  msg += `⛓️ ${a.chain}\\n\\n`;
});

msg += '_🤖 Via DeFiLlama_';

return { message: msg };
```

---

## 💡 Dicas:

- **Render:** Melhor opção, 500h grátis/mês
- **Vercel:** Mais rápido para deploy
- **Railway:** Interface mais bonita
- **Todas são 100% GRATUITAS!**

## 🧪 Testar API:

```bash
curl https://SEU-APP.onrender.com/health
curl https://SEU-APP.onrender.com/n8n/best-airdrops?limit=3
```

---

## 🔧 TROUBLESHOOTING - Se der erro:

### ❌ Erro: "código de saída: 127"
**Solução:**
- Build Command: `npm ci && npx tsc`
- Start Command: `node dist/http-server.js`

### ❌ Erro: "npm not found"
**Solução:**
- Selecionar Node Version: `18`
- Build Command: `npm install && npm run build`

### ❌ Erro: "Module not found"
**Solução:**
- Verificar se `package.json` está correto
- Build Command: `npm ci --include=dev && npm run build`

### ❌ Aplicação não responde
**Solução:**
1. Verificar logs no painel do Render
2. Testar localmente: `npm run server`
3. Start Command: `npm run start:server`

### 🆘 Última opção - Deploy manual:
Se nada funcionar, use essa configuração:
```
Build Command: npm install typescript @types/node @types/express @types/cors && npx tsc
Start Command: node dist/http-server.js
```