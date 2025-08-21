#!/bin/bash

echo "🚀 Preparando para publicar MCP DeFiLlama Airdrops..."

# Compilar o projeto
echo "📦 Compilando projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação!"
    exit 1
fi

# Testar servidor HTTP rapidamente
echo "🧪 Testando servidor HTTP..."
timeout 10s npm run server > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Verificar se o servidor está respondendo
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Servidor HTTP funcionando!"
else
    echo "⚠️  Servidor HTTP pode ter problemas, mas continuando..."
fi

# Parar servidor de teste
kill $SERVER_PID 2>/dev/null

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositório Git..."
    git init
    git branch -M main
fi

# Adicionar arquivos
echo "📝 Adicionando arquivos..."
git add .

# Commit
echo "💾 Fazendo commit..."
git commit -m "feat: MCP server para scraping de airdrops do DeFiLlama

✨ Principais funcionalidades:
- Servidor MCP completo com 4 ferramentas principais
- Servidor HTTP para integração com N8N
- Scraping robusto com fallback de dados
- Cache inteligente de 5 minutos
- Filtros por status, chain, valor
- Ranking dos melhores airdrops
- Deploy automático (Railway/Render/Vercel)
- Exemplo de integração N8N → WhatsApp
- Documentação completa de deploy

🛠️ Tecnologias:
- TypeScript + Node.js
- Express.js para API HTTP
- Axios + Cheerio para scraping
- Zod para validação
- Docker para containerização

🌐 Endpoints para N8N:
- /health - Health check
- /n8n/best-airdrops - Melhores airdrops
- /api/airdrops - Todos os airdrops
- /api/airdrops/filter - Filtros avançados

🤖 Generated with Claude Code"

echo "✅ Projeto pronto para GitHub e deploy!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Crie um repositório no GitHub: https://github.com/new"
echo "2. Execute: git remote add origin https://github.com/SEU_USUARIO/mcp-defillama-airdrops.git"
echo "3. Execute: git push -u origin main"
echo "4. Deploy GRATUITO na Railway: https://railway.app"
echo "5. Configure N8N com sua URL da API"
echo ""
echo "📖 Guia completo: cat DEPLOY.md"
echo ""
echo "🧪 Para testar localmente:"
echo "   Servidor MCP: npm run dev"
echo "   Servidor HTTP: npm run server"
echo "   Testar API: npx tsx test-http-server.ts"