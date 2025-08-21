#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DeFiLlamaScraper } from './scraper.js';
import { Airdrop, ScrapingOptions } from './types.js';

class AirdropMCPServer {
  private server: Server;
  private scraper: DeFiLlamaScraper;
  private cachedAirdrops: Airdrop[] = [];
  private lastUpdate: Date | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.server = new Server(
      {
        name: 'defillama-airdrops',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.scraper = new DeFiLlamaScraper();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_airdrops',
            description: 'Buscar todos os airdrops disponíveis no DeFiLlama',
            inputSchema: {
              type: 'object',
              properties: {
                forceRefresh: {
                  type: 'boolean',
                  description: 'Forçar atualização dos dados (ignorar cache)',
                  default: false
                },
                onlyActive: {
                  type: 'boolean',
                  description: 'Retornar apenas airdrops ativos',
                  default: false
                },
                chain: {
                  type: 'string',
                  description: 'Filtrar por blockchain específica'
                }
              }
            }
          },
          {
            name: 'filter_airdrops',
            description: 'Filtrar airdrops por critérios específicos',
            inputSchema: {
              type: 'object',
              properties: {
                minValue: {
                  type: 'number',
                  description: 'Valor mínimo estimado do airdrop'
                },
                status: {
                  type: 'string',
                  description: 'Status do airdrop (Active, Ended, TBD, etc.)'
                },
                chain: {
                  type: 'string',
                  description: 'Filtrar por blockchain'
                },
                searchTerm: {
                  type: 'string',
                  description: 'Buscar por termo no nome ou descrição'
                }
              }
            }
          },
          {
            name: 'get_best_airdrops',
            description: 'Obter os melhores airdrops baseado em critérios de valor e facilidade',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Número máximo de airdrops para retornar',
                  default: 10
                },
                sortBy: {
                  type: 'string',
                  enum: ['value', 'deadline', 'name'],
                  description: 'Critério de ordenação',
                  default: 'value'
                }
              }
            }
          },
          {
            name: 'debug_scraper',
            description: 'Debugar o scraper para verificar se está funcionando corretamente',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_airdrops':
            return await this.getAirdrops(args as any);
          
          case 'filter_airdrops':
            return await this.filterAirdrops(args as any);
          
          case 'get_best_airdrops':
            return await this.getBestAirdrops(args as any);
          
          case 'debug_scraper':
            return await this.debugScraper();
          
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async getAirdrops(args: { forceRefresh?: boolean; onlyActive?: boolean; chain?: string }) {
    const shouldRefresh = args.forceRefresh || 
                         !this.lastUpdate || 
                         (Date.now() - this.lastUpdate.getTime()) > this.cacheTimeout;

    if (shouldRefresh) {
      console.log('Atualizando cache de airdrops...');
      this.cachedAirdrops = await this.scraper.scrapeAirdrops();
      this.lastUpdate = new Date();
    }

    let airdrops = [...this.cachedAirdrops];

    // Aplicar filtros
    if (args.onlyActive) {
      airdrops = airdrops.filter(a => a.status?.toLowerCase().includes('active') || a.status?.toLowerCase().includes('ativo'));
    }

    if (args.chain) {
      airdrops = airdrops.filter(a => a.chain?.toLowerCase().includes(args.chain!.toLowerCase()));
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: airdrops.length,
            lastUpdate: this.lastUpdate?.toISOString(),
            airdrops: airdrops
          }, null, 2)
        }
      ]
    };
  }

  private async filterAirdrops(args: { minValue?: number; status?: string; chain?: string; searchTerm?: string }) {
    // Garantir que temos dados
    if (this.cachedAirdrops.length === 0) {
      await this.getAirdrops({ forceRefresh: true });
    }

    let filtered = [...this.cachedAirdrops];

    if (args.status) {
      filtered = filtered.filter(a => a.status?.toLowerCase().includes(args.status!.toLowerCase()));
    }

    if (args.chain) {
      filtered = filtered.filter(a => a.chain?.toLowerCase().includes(args.chain!.toLowerCase()));
    }

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: filtered.length,
            filters: args,
            airdrops: filtered
          }, null, 2)
        }
      ]
    };
  }

  private async getBestAirdrops(args: { limit?: number; sortBy?: string }) {
    // Garantir que temos dados
    if (this.cachedAirdrops.length === 0) {
      await this.getAirdrops({ forceRefresh: true });
    }

    let airdrops = [...this.cachedAirdrops];
    const limit = args.limit || 10;

    // Filtrar apenas airdrops ativos
    airdrops = airdrops.filter(a => 
      a.status?.toLowerCase().includes('active') || 
      a.status?.toLowerCase().includes('ativo') ||
      a.status?.toLowerCase() === 'tbd'
    );

    // Ordenar baseado no critério
    switch (args.sortBy) {
      case 'value':
        airdrops.sort((a, b) => {
          const aValue = this.parseValue(a.value);
          const bValue = this.parseValue(b.value);
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

    const best = airdrops.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: best.length,
            criteria: { limit, sortBy: args.sortBy },
            bestAirdrops: best
          }, null, 2)
        }
      ]
    };
  }

  private async debugScraper() {
    try {
      const debugInfo = await this.scraper.debugPage();
      return {
        content: [
          {
            type: 'text',
            text: `Debug Info:\n${debugInfo}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro no debug: ${error}`
          }
        ]
      };
    }
  }

  private parseValue(value?: string): number {
    if (!value) return 0;
    
    // Remover símbolos e converter para número
    const cleaned = value.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    
    if (isNaN(num)) return 0;
    
    // Detectar multiplicadores (K, M, B)
    if (value.toLowerCase().includes('k')) return num * 1000;
    if (value.toLowerCase().includes('m')) return num * 1000000;
    if (value.toLowerCase().includes('b')) return num * 1000000000;
    
    return num;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP DeFiLlama Airdrops Server rodando...');
  }

  async cleanup() {
    await this.scraper.close();
  }
}

// Configurar handlers de saída
const server = new AirdropMCPServer();

process.on('SIGINT', async () => {
  console.error('Recebido SIGINT, fechando servidor...');
  await server.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Recebido SIGTERM, fechando servidor...');
  await server.cleanup();
  process.exit(0);
});

// Iniciar servidor
server.run().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});