#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { DeFiLlamaScraper } from './scraper.js';
import { Airdrop } from './types.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache global
let cachedAirdrops: Airdrop[] = [];
let lastUpdate: Date | null = null;
const cacheTimeout = 5 * 60 * 1000; // 5 minutos

const scraper = new DeFiLlamaScraper();

// Função para obter airdrops com cache
async function getAirdropsWithCache(forceRefresh = false): Promise<Airdrop[]> {
  const shouldRefresh = forceRefresh || 
                       !lastUpdate || 
                       (Date.now() - lastUpdate.getTime()) > cacheTimeout;

  if (shouldRefresh) {
    console.log('🔄 Atualizando cache de airdrops...');
    try {
      cachedAirdrops = await scraper.scrapeAirdrops();
      lastUpdate = new Date();
      console.log(`✅ Cache atualizado com ${cachedAirdrops.length} airdrops`);
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error);
      // Manter cache anterior se houver erro
    }
  }

  return cachedAirdrops;
}

// Função para parsing de valores
function parseValue(value?: string): number {
  if (!value) return 0;
  
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) return 0;
  
  if (value.toLowerCase().includes('k')) return num * 1000;
  if (value.toLowerCase().includes('m')) return num * 1000000;
  if (value.toLowerCase().includes('b')) return num * 1000000000;
  
  return num;
}

// Rotas da API

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    lastUpdate: lastUpdate?.toISOString() || null,
    cacheSize: cachedAirdrops.length
  });
});

// Obter todos os airdrops
app.get('/api/airdrops', async (req, res) => {
  try {
    const { forceRefresh, onlyActive, chain } = req.query;
    
    let airdrops = await getAirdropsWithCache(forceRefresh === 'true');
    
    // Aplicar filtros
    if (onlyActive === 'true') {
      airdrops = airdrops.filter(a => 
        a.status?.toLowerCase().includes('active') || 
        a.status?.toLowerCase().includes('ativo')
      );
    }
    
    if (chain) {
      airdrops = airdrops.filter(a => 
        a.chain?.toLowerCase().includes(String(chain).toLowerCase())
      );
    }
    
    res.json({
      success: true,
      total: airdrops.length,
      lastUpdate: lastUpdate?.toISOString(),
      data: airdrops
    });
  } catch (error) {
    console.error('Erro na rota /api/airdrops:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Filtrar airdrops
app.post('/api/airdrops/filter', async (req, res) => {
  try {
    const { minValue, status, chain, searchTerm } = req.body;
    
    let airdrops = await getAirdropsWithCache();
    
    // Aplicar filtros
    if (status) {
      airdrops = airdrops.filter(a => 
        a.status?.toLowerCase().includes(String(status).toLowerCase())
      );
    }
    
    if (chain) {
      airdrops = airdrops.filter(a => 
        a.chain?.toLowerCase().includes(String(chain).toLowerCase())
      );
    }
    
    if (minValue) {
      airdrops = airdrops.filter(a => parseValue(a.value) >= Number(minValue));
    }
    
    if (searchTerm) {
      const term = String(searchTerm).toLowerCase();
      airdrops = airdrops.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }
    
    res.json({
      success: true,
      total: airdrops.length,
      filters: { minValue, status, chain, searchTerm },
      data: airdrops
    });
  } catch (error) {
    console.error('Erro na rota /api/airdrops/filter:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Obter melhores airdrops
app.get('/api/airdrops/best', async (req, res) => {
  try {
    const { limit = '10', sortBy = 'value' } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Filtrar apenas airdrops ativos
    airdrops = airdrops.filter(a => 
      a.status?.toLowerCase().includes('active') || 
      a.status?.toLowerCase().includes('ativo') ||
      a.status?.toLowerCase() === 'tbd'
    );
    
    // Ordenar baseado no critério
    switch (sortBy) {
      case 'value':
        airdrops.sort((a, b) => {
          const aValue = parseValue(a.value);
          const bValue = parseValue(b.value);
          return bValue - aValue;
        });
        break;
      case 'deadline':
        airdrops.sort((a, b) => {
          const aDate = new Date(a.deadline || '9999-12-31');
          const bDate = new Date(b.deadline || '9999-12-31');
          return aDate.getTime() - bDate.getTime();
        });
        break;
      default:
        airdrops.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const best = airdrops.slice(0, Number(limit));
    
    res.json({
      success: true,
      total: best.length,
      criteria: { limit: Number(limit), sortBy },
      data: best
    });
  } catch (error) {
    console.error('Erro na rota /api/airdrops/best:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Debug do scraper
app.get('/api/debug', async (req, res) => {
  try {
    const debugInfo = await scraper.debugPage();
    res.json({
      success: true,
      debug: debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na rota /api/debug:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no debug',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota especial para N8N - formato simplificado
app.get('/n8n/best-airdrops', async (req, res) => {
  try {
    const { limit = '5' } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Filtrar apenas airdrops ativos e ordenar por valor
    airdrops = airdrops
      .filter(a => 
        a.status?.toLowerCase().includes('active') || 
        a.status?.toLowerCase().includes('ativo') ||
        a.status?.toLowerCase() === 'tbd'
      )
      .sort((a, b) => {
        const aValue = parseValue(a.value);
        const bValue = parseValue(b.value);
        return bValue - aValue;
      })
      .slice(0, Number(limit));
    
    // Formato simplificado para WhatsApp
    const simplified = airdrops.map(airdrop => ({
      name: airdrop.name,
      value: airdrop.value || 'TBD',
      status: airdrop.status || 'Unknown',
      chain: airdrop.chain || 'Multi',
      deadline: airdrop.deadline || null,
      url: airdrop.url || null
    }));
    
    res.json({
      success: true,
      count: simplified.length,
      updated: lastUpdate?.toISOString(),
      airdrops: simplified
    });
  } catch (error) {
    console.error('Erro na rota /n8n/best-airdrops:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint simples - apenas dados dos airdrops
app.get('/airdrops', async (req, res) => {
  try {
    const { limit, active, chain } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Filtros opcionais
    if (active === 'true') {
      airdrops = airdrops.filter(a => 
        a.status?.toLowerCase().includes('active') || 
        a.status?.toLowerCase().includes('ativo') ||
        a.status?.toLowerCase() === 'tbd'
      );
    }
    
    if (chain) {
      airdrops = airdrops.filter(a => 
        a.chain?.toLowerCase().includes(String(chain).toLowerCase())
      );
    }
    
    // Ordenar por valor (maiores primeiro)
    airdrops = airdrops.sort((a, b) => {
      const aValue = parseValue(a.value);
      const bValue = parseValue(b.value);
      return bValue - aValue;
    });
    
    // Limitar quantidade se especificado
    if (limit) {
      airdrops = airdrops.slice(0, Number(limit));
    }
    
    // Retornar apenas a lista de airdrops
    res.json(airdrops);
    
  } catch (error) {
    console.error('Erro na rota /airdrops:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint super simples - apenas nomes dos airdrops
app.get('/airdrops/names', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Filtrar apenas ativos e pegar os nomes
    const names = airdrops
      .filter(a => 
        a.status?.toLowerCase().includes('active') || 
        a.status?.toLowerCase().includes('ativo') ||
        a.status?.toLowerCase() === 'tbd'
      )
      .sort((a, b) => {
        const aValue = parseValue(a.value);
        const bValue = parseValue(b.value);
        return bValue - aValue;
      })
      .slice(0, Number(limit))
      .map(a => a.name);
    
    res.json(names);
    
  } catch (error) {
    console.error('Erro na rota /airdrops/names:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint completo com dados DeFiLlama - name, category, tvl, listed at, 1d change, 7d, 1m
app.get('/protocols', async (req, res) => {
  try {
    const { limit, category, minTvl } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Filtros
    if (category) {
      airdrops = airdrops.filter(a => 
        a.category?.toLowerCase().includes(String(category).toLowerCase())
      );
    }
    
    if (minTvl) {
      airdrops = airdrops.filter(a => {
        const tvlNum = parseValue(a.tvl);
        return tvlNum >= Number(minTvl);
      });
    }
    
    // Ordenar por TVL (maiores primeiro)
    airdrops = airdrops.sort((a, b) => {
      const aTvl = parseValue(a.tvl);
      const bTvl = parseValue(b.tvl);
      return bTvl - aTvl;
    });
    
    if (limit) {
      airdrops = airdrops.slice(0, Number(limit));
    }
    
    // Retornar dados formatados
    const protocols = airdrops.map(airdrop => ({
      name: airdrop.name,
      symbol: airdrop.symbol || 'N/A',
      category: airdrop.category || 'DeFi',
      tvl: airdrop.tvl || 'N/A',
      listedAt: airdrop.listedAt || 'N/A',
      change1d: airdrop.change1d || 'N/A',
      change7d: airdrop.change7d || 'N/A',
      change1m: airdrop.change1m || 'N/A',
      chain: airdrop.chain || 'Multi-Chain',
      mcap: airdrop.mcap || 'N/A',
      logo: airdrop.logo || null,
      url: airdrop.url || null
    }));
    
    res.json(protocols);
    
  } catch (error) {
    console.error('Erro na rota /protocols:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para dados específicos que você pediu
app.get('/data/complete', async (req, res) => {
  try {
    const { fields, limit = '20' } = req.query;
    
    let airdrops = await getAirdropsWithCache();
    
    // Ordenar por TVL
    airdrops = airdrops.sort((a, b) => {
      const aTvl = parseValue(a.tvl);
      const bTvl = parseValue(b.tvl);
      return bTvl - aTvl;
    }).slice(0, Number(limit));
    
    // Se campos específicos foram solicitados
    if (fields) {
      const requestedFields = String(fields).split(',');
      const filteredData = airdrops.map(airdrop => {
        const obj: any = {};
        
        requestedFields.forEach(field => {
          const key = field.trim().toLowerCase();
          switch (key) {
            case 'name':
              obj.name = airdrop.name;
              break;
            case 'category':
              obj.category = airdrop.category || 'DeFi';
              break;
            case 'tvl':
              obj.tvl = airdrop.tvl || 'N/A';
              break;
            case 'listedat':
            case 'listed_at':
              obj.listedAt = airdrop.listedAt || 'N/A';
              break;
            case '1d':
            case 'change1d':
              obj.change1d = airdrop.change1d || 'N/A';
              break;
            case '7d':
            case 'change7d':
              obj.change7d = airdrop.change7d || 'N/A';
              break;
            case '1m':
            case 'change1m':
              obj.change1m = airdrop.change1m || 'N/A';
              break;
            case 'symbol':
              obj.symbol = airdrop.symbol || 'N/A';
              break;
            case 'chain':
              obj.chain = airdrop.chain || 'Multi-Chain';
              break;
            case 'mcap':
              obj.mcap = airdrop.mcap || 'N/A';
              break;
          }
        });
        
        return obj;
      });
      
      res.json(filteredData);
    } else {
      // Retornar todos os dados
      res.json(airdrops.map(airdrop => ({
        name: airdrop.name,
        category: airdrop.category || 'DeFi',
        tvl: airdrop.tvl || 'N/A',
        listedAt: airdrop.listedAt || 'N/A',
        change1d: airdrop.change1d || 'N/A',
        change7d: airdrop.change7d || 'N/A',
        change1m: airdrop.change1m || 'N/A',
        symbol: airdrop.symbol || 'N/A',
        chain: airdrop.chain || 'Multi-Chain',
        mcap: airdrop.mcap || 'N/A'
      })));
    }
    
  } catch (error) {
    console.error('Erro na rota /data/complete:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Middleware de erro global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Inicializar cache na inicialização
async function initializeCache() {
  console.log('🚀 Inicializando servidor HTTP MCP DeFiLlama...');
  try {
    await getAirdropsWithCache(true);
    console.log('✅ Cache inicial carregado');
  } catch (error) {
    console.error('⚠️ Erro ao carregar cache inicial:', error);
  }
}

// Iniciar servidor
app.listen(port, async () => {
  console.log(`🌐 Servidor HTTP rodando na porta ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`📊 API Airdrops: http://localhost:${port}/api/airdrops`);
  console.log(`🎯 N8N Endpoint: http://localhost:${port}/n8n/best-airdrops`);
  console.log(`💎 Apenas Airdrops: http://localhost:${port}/airdrops`);
  console.log(`📝 Apenas Nomes: http://localhost:${port}/airdrops/names`);
  console.log(`🚀 Protocolos DeFiLlama: http://localhost:${port}/protocols`);
  console.log(`📈 Dados Completos: http://localhost:${port}/data/complete`);
  
  await initializeCache();
});

// Endpoints DexScreener
app.get('/dexscreener/profiles', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const profiles = await scraper.scrapeDexScreenerTokenProfiles();
    
    const result = limit ? profiles.slice(0, Number(limit)) : profiles;
    
    res.json(result);
  } catch (error) {
    console.error('Erro na rota /dexscreener/profiles:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/dexscreener/tokens', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const tokens = await scraper.scrapeTopDexScreenerTokens();
    
    const result = limit ? tokens.slice(0, Number(limit)) : tokens;
    
    res.json(result);
  } catch (error) {
    console.error('Erro na rota /dexscreener/tokens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/dexscreener/metrics', async (req, res) => {
  try {
    const { limit, sortBy } = req.query;
    
    let metrics = await scraper.getDexScreenerMetrics();
    
    // Ordenar por critério
    if (sortBy === 'volume24h') {
      metrics.sort((a, b) => {
        const aVol = parseFloat(a.volume.h24.replace(/[$,BMK]/g, ''));
        const bVol = parseFloat(b.volume.h24.replace(/[$,BMK]/g, ''));
        return bVol - aVol;
      });
    } else if (sortBy === 'liquidity') {
      metrics.sort((a, b) => {
        const aLiq = parseFloat(a.liquidity.replace(/[$,BMK]/g, ''));
        const bLiq = parseFloat(b.liquidity.replace(/[$,BMK]/g, ''));
        return bLiq - aLiq;
      });
    } else if (sortBy === 'txns24h') {
      metrics.sort((a, b) => b.txns.h24 - a.txns.h24);
    }
    
    const result = limit ? metrics.slice(0, Number(limit)) : metrics;
    
    res.json(result);
  } catch (error) {
    console.error('Erro na rota /dexscreener/metrics:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/dexscreener/combined', async (req, res) => {
  try {
    const combinedData = await scraper.getCombinedCryptoData();
    
    res.json(combinedData);
  } catch (error) {
    console.error('Erro na rota /dexscreener/combined:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, fechando servidor...');
  await scraper.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, fechando servidor...');
  await scraper.close();
  process.exit(0);
});