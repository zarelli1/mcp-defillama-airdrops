# 📱 Guia Completo N8N - Airdrops DeFiLlama

## 🧪 **PASSO 1: TESTE PRIMEIRO**

### **1.1 Importar Fluxo de Teste:**
1. **N8N** → **Workflows** → **Import from File**
2. **Selecionar:** `n8n-teste-completo.json`
3. **Substituir URL:** Trocar `https://SEU-APP.onrender.com` pela sua URL real

### **1.2 Configurar URLs:**
```
Health Check: https://sua-url.onrender.com/health
Airdrops: https://sua-url.onrender.com/n8n/best-airdrops?limit=3
Todos: https://sua-url.onrender.com/api/airdrops
```

### **1.3 Executar Teste:**
1. **Clicar em "🚀 Iniciar Teste Manual"**
2. **Execute** → **Ver logs no console**
3. **Verificar se todos os ✅ passaram**

---

## 📱 **PASSO 2: PRODUÇÃO WHATSAPP**

### **2.1 Importar Fluxo de Produção:**
1. **Import:** `n8n-producao-whatsapp.json`
2. **Configurar suas informações:**

### **2.2 Configurações Necessárias:**

#### **🔗 URLs da API (substituir em todos os nós):**
```
Health: https://sua-url.onrender.com/health
Airdrops: https://sua-url.onrender.com/n8n/best-airdrops
```

#### **📱 Evolution API (configurar no nó WhatsApp):**
```javascript
URL: http://localhost:8080/message/sendText/SUA-INSTANCIA
Headers: 
  - apikey: SUA_API_KEY_EVOLUTION
  - Content-Type: application/json

Body:
{
  "number": "5511999999999@c.us",
  "text": "{{ $json.message }}"
}
```

### **2.3 Personalizar:**

#### **⏰ Frequência:**
- Padrão: **A cada 6 horas**
- Personalizar: No nó "⏰ A cada 6 horas"

#### **📊 Quantidade de Airdrops:**
- Padrão: **Top 5**
- Mudar: No nó "🚀 Buscar Top 5 Airdrops" → Query Parameter `limit`

#### **📱 Número WhatsApp:**
- Trocar: `5511999999999@c.us` pelo seu número

---

## 🛠️ **CONFIGURAÇÃO MANUAL (se não importar JSON)**

### **Criar Fluxo do Zero:**

#### **1. Schedule Trigger:**
```
Interval: Every 6 hours
```

#### **2. HTTP Request - Health Check:**
```
Method: GET
URL: https://sua-url.onrender.com/health
```

#### **3. IF Node - API Online:**
```
Condition: {{ $json.status }} equals "online"
```

#### **4. HTTP Request - Get Airdrops:**
```
Method: GET
URL: https://sua-url.onrender.com/n8n/best-airdrops
Query Parameters: limit=5
```

#### **5. Code Node - Format Message:**
```javascript
const data = $input.first().json;
const airdrops = data.airdrops || [];

let message = '🚀 *TOP AIRDROPS*\\n\\n';

airdrops.forEach((airdrop, index) => {
  message += `${index + 1}. *${airdrop.name}*\\n`;
  message += `💰 ${airdrop.value}\\n`;
  message += `⛓️ ${airdrop.chain}\\n\\n`;
});

message += '_🤖 Via DeFiLlama MCP_';

return { message };
```

#### **6. HTTP Request - Send WhatsApp:**
```
Method: POST
URL: http://localhost:8080/message/sendText/SUA-INSTANCIA
Headers: apikey: SUA_API_KEY
Body: {
  "number": "5511999999999@c.us",
  "text": "{{ $json.message }}"
}
```

---

## 🔧 **TROUBLESHOOTING**

### **❌ Erro: "API offline"**
**Soluções:**
1. Verificar se URL está correta
2. Testar URL no browser: `sua-url.onrender.com/health`
3. Aguardar alguns minutos (API pode estar "dormindo")

### **❌ Erro: "Evolution API"**
**Soluções:**
1. Verificar se Evolution está rodando: `http://localhost:8080`
2. Conferir API Key
3. Verificar formato do número: `5511999999999@c.us`

### **❌ Erro: "Nenhum airdrop"**
**Normal!** API funciona com fallback de dados de exemplo.

### **❌ Erro: "CORS"**
**Solução:**
- Adicionar header: `Origin: http://localhost:5678`

---

## 📊 **EXEMPLO DE MENSAGEM WHATSAPP:**

```
🚀 TOP 5 AIRDROPS DO MOMENTO

1. LayerZero
💰 Valor: $1000-5000
🔷 Chain: ETH
✅ Status: Active

2. zkSync Era  
💰 Valor: $500-2000
🔷 Chain: ETH
⏳ Status: TBD

3. Arbitrum Odyssey
💰 Valor: $300-1500
🔵 Chain: ARBITRUM
✅ Status: Active

🕐 Atualizado: 21/08/2024 15:30:25
📊 Dados via DeFiLlama MCP
🤖 Enviado automaticamente a cada 6h
```

---

## 🎯 **ENDPOINTS DISPONÍVEIS:**

```bash
# Health Check
GET /health

# Melhores airdrops (para N8N)  
GET /n8n/best-airdrops?limit=5

# Todos os airdrops
GET /api/airdrops

# Filtrar airdrops
POST /api/airdrops/filter
{
  "status": "active",
  "chain": "ETH",
  "minValue": 1000
}

# Debug
GET /api/debug
```

---

## ✅ **CHECKLIST FINAL:**

- [ ] API funcionando (teste `/health`)
- [ ] URLs corretas no N8N
- [ ] Evolution API configurada
- [ ] Número WhatsApp correto
- [ ] API Key válida
- [ ] Teste manual executado
- [ ] Schedule ativado

**🎉 Pronto! Airdrops automáticos no WhatsApp a cada 6 horas!**