# 🚀 Guia de Deploy - MCP DeFiLlama Airdrops

## 📋 Pré-requisitos
- ✅ Conta no GitHub
- ✅ N8N rodando (que você já tem!)

## 🎯 Passo 1: Subir no GitHub

1. **Criar repositório no GitHub:**
   - Acesse: https://github.com/new
   - Nome: `mcp-defillama-airdrops`
   - Público ou Privado (sua escolha)
   - ✅ Não inicializar com README

2. **Fazer commit e push:**
```bash
# No seu terminal, dentro da pasta do projeto
git init
git add .
git commit -m "feat: MCP server para scraping de airdrops do DeFiLlama"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mcp-defillama-airdrops.git
git push -u origin main
```

## 🌐 Passo 2: Deploy GRATUITO na Railway

### Opção A: Railway (Recomendado - Gratuito até 500h/mês)

1. **Acesse:** https://railway.app
2. **Login com GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione:** `mcp-defillama-airdrops`
5. **Deploy automático iniciará**
6. **Obtenha sua URL:** `https://seu-app.railway.app`

### Opção B: Render (Alternativa gratuita)

1. **Acesse:** https://render.com
2. **Login com GitHub** 
3. **New Web Service**
4. **Connect** seu repositório
5. **Configurações:**
   - Build Command: `npm run build`
   - Start Command: `npm run start:server`
   - Auto-Deploy: ✅ Yes

### Opção C: Vercel (Outra alternativa)

1. **Acesse:** https://vercel.com
2. **Import Project** do GitHub
3. **Deploy automático**

## 🔧 Passo 3: Configurar N8N

### URL da sua API (exemplo):
```
https://seu-app.railway.app
```

### Endpoints disponíveis:

1. **Health Check:**
   ```
   GET https://seu-app.railway.app/health
   ```

2. **Melhores Airdrops (Para N8N):**
   ```
   GET https://seu-app.railway.app/n8n/best-airdrops?limit=5
   ```

3. **Todos os Airdrops:**
   ```
   GET https://seu-app.railway.app/api/airdrops
   ```

4. **Filtrar Airdrops:**
   ```
   POST https://seu-app.railway.app/api/airdrops/filter
   Content-Type: application/json
   
   {
     "minValue": 1000,
     "status": "active",
     "chain": "eth"
   }
   ```

## 🤖 Passo 4: Configurar Fluxo N8N

### 1. Criar Nó HTTP Request:
- **URL:** `https://seu-app.railway.app/n8n/best-airdrops?limit=5`
- **Method:** GET
- **Trigger:** Schedule (a cada 6 horas)

### 2. Processar Dados:
```javascript
// Nó Code para formatar mensagem
const airdrops = $input.first().json.airdrops;

let message = '🚀 *Top 5 Airdrops do Momento*\\n\\n';

airdrops.forEach((airdrop, index) => {
  message += `${index + 1}. *${airdrop.name}*\\n`;
  message += `💰 Valor: ${airdrop.value}\\n`;
  message += `⛓️ Chain: ${airdrop.chain}\\n`;
  message += `📊 Status: ${airdrop.status}\\n`;
  if (airdrop.deadline) {
    message += `⏰ Deadline: ${airdrop.deadline}\\n`;
  }
  message += '\\n';
});

message += '_🤖 Atualizado via DeFiLlama MCP_';

return { message };
```

### 3. Enviar para WhatsApp (Evolution API):
- **URL:** `http://seu-evolution:8080/message/sendText/sua-instancia`
- **Method:** POST
- **Headers:** `apikey: SUA_API_KEY`
- **Body:**
```json
{
  "number": "5511999999999",
  "text": "{{ $json.message }}"
}
```

## 🎯 Exemplo de Resposta da API

```json
{
  "success": true,
  "count": 5,
  "updated": "2024-01-01T12:00:00.000Z",
  "airdrops": [
    {
      "name": "LayerZero",
      "value": "$1000-5000",
      "status": "Active",
      "chain": "ETH",
      "deadline": "2024-12-31",
      "url": "https://..."
    }
  ]
}
```

## 🔄 Fluxo Completo N8N → WhatsApp

1. **Schedule Trigger** (a cada 6h)
2. **HTTP Request** → Sua API
3. **Code** → Formatar mensagem
4. **HTTP Request** → Evolution API
5. **WhatsApp** → Envio automático

## 🛠️ Monitoramento

- **Health Check:** `https://seu-app.railway.app/health`
- **Logs:** No painel da Railway/Render
- **Uptime:** Services ficam online 24/7

## 🎉 Pronto!

Agora você tem:
- ✅ API online 24/7
- ✅ Dados atualizados automaticamente
- ✅ Integração com N8N
- ✅ Envio automático para WhatsApp
- ✅ Deploy automático via GitHub

### URLs importantes:
- **Seu GitHub:** `https://github.com/SEU_USUARIO/mcp-defillama-airdrops`
- **Sua API:** `https://seu-app.railway.app`
- **Para N8N:** `https://seu-app.railway.app/n8n/best-airdrops`