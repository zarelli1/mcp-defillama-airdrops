#!/bin/bash

echo "🚀 Preparando para publicar MCP DeFiLlama Airdrops..."

# Compilar o projeto
echo "📦 Compilando projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação!"
    exit 1
fi

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

- Servidor MCP completo com 4 ferramentas principais
- Scraping robusto com fallback de dados
- Cache inteligente de 5 minutos
- Filtros por status, chain, valor
- Ranking dos melhores airdrops
- Exemplo de integração N8N → WhatsApp
- Documentação completa

🤖 Generated with Claude Code"

echo "✅ Projeto pronto para push!"
echo ""
echo "Para publicar no GitHub:"
echo "1. Crie um repositório no GitHub"
echo "2. Execute: git remote add origin https://github.com/seu-usuario/mcp-defillama-airdrops.git"
echo "3. Execute: git push -u origin main"
echo ""
echo "Para testar localmente:"
echo "npm run dev"