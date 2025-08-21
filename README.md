# MCP DeFiLlama Airdrops

Um servidor MCP (Model Context Protocol) para extrair dados de airdrops do DeFiLlama.

## 🚀 Funcionalidades

- **Scraping automático** de airdrops do DeFiLlama
- **Cache inteligente** (5 minutos) para otimizar performance
- **Filtros avançados** por status, chain, valor mínimo
- **Ranking dos melhores airdrops** por critérios configuráveis
- **Dados estruturados** em formato JSON
- **Fallback de dados** para garantir funcionamento

## 🛠️ Ferramentas Disponíveis

### `get_airdrops`
Busca todos os airdrops disponíveis.

**Parâmetros:**
- `forceRefresh` (boolean): Forçar atualização ignorando cache
- `onlyActive` (boolean): Retornar apenas airdrops ativos  
- `chain` (string): Filtrar por blockchain específica

### `filter_airdrops`
Filtra airdrops por critérios específicos.

**Parâmetros:**
- `minValue` (number): Valor mínimo estimado
- `status` (string): Status do airdrop
- `chain` (string): Blockchain
- `searchTerm` (string): Buscar no nome/descrição

### `get_best_airdrops`
Obtém os melhores airdrops rankeados.

**Parâmetros:**
- `limit` (number): Máximo de resultados (padrão: 10)
- `sortBy` (string): Critério de ordenação (value, deadline, name)

### `debug_scraper`
Debug e teste do scraper.

## 📊 Formato dos Dados

```json
{
  "name": "LayerZero",
  "value": "$1000-5000", 
  "status": "Active",
  "chain": "ETH",
  "deadline": "2024-12-31",
  "url": "https://...",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Instalação e Uso

```bash
# Instalar dependências
npm install

# Compilar
npm run build

# Executar servidor MCP
npm start

# Ou modo desenvolvimento
npm run dev
```

## 🧪 Teste

```bash
# Testar scraper
npx tsx test-scraper.ts
```

## 🔗 Integração com N8N

1. Configure o MCP como servidor HTTP
2. Use nó HTTP Request no N8N
3. Endpoint: `http://localhost:3000/tools/get_best_airdrops`
4. Configure filtros conforme necessário

## 📱 Exemplo de Fluxo N8N → WhatsApp

```
[MCP] → [Filtrar Top 5] → [Formatar Mensagem] → [Evolution API] → [WhatsApp]
```

## ⚠️ Limitações

- Site protegido por Cloudflare (usa dados de fallback)
- Cache de 5 minutos para performance
- Dados dependem da estrutura do site DeFiLlama

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch para feature
3. Commit suas mudanças
4. Push para branch
5. Abra Pull Request

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.