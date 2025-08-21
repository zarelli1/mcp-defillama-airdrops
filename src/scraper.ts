import axios from 'axios';
import * as cheerio from 'cheerio';
import { Airdrop, ScrapingOptions, DefiProtocol } from './types.js';

export class DeFiLlamaScraper {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
  }

  // Buscar dados da API DeFiLlama - Protocolos com TVL
  async scrapeProtocols(): Promise<DefiProtocol[]> {
    try {
      console.log('🔍 Buscando protocolos DeFiLlama via API...');
      
      const response = await this.axiosInstance.get('https://api.llama.fi/protocols');
      const protocols = response.data;
      
      console.log(`📊 Encontrados ${protocols.length} protocolos`);
      
      const processedProtocols: DefiProtocol[] = protocols
        .filter((p: any) => p.tvl > 1000000) // Filtrar apenas protocolos com TVL > 1M
        .slice(0, 50) // Pegar top 50
        .map((protocol: any) => ({
          name: protocol.name,
          symbol: protocol.symbol || protocol.name.substring(0, 3).toUpperCase(),
          category: protocol.category || 'DeFi',
          tvl: protocol.tvl,
          change_1d: protocol.change_1d,
          change_7d: protocol.change_7d,
          change_1m: protocol.change_1m,
          listedAt: protocol.listedAt,
          logo: protocol.logo,
          url: protocol.url || `https://defillama.com/protocol/${protocol.slug}`,
          description: protocol.description,
          chain: protocol.chain || 'Multi-Chain',
          mcap: protocol.mcap
        }));
      
      return processedProtocols;
      
    } catch (error) {
      console.error('❌ Erro ao buscar protocolos:', error);
      
      // Dados de exemplo em caso de erro
      return [
        {
          name: 'Uniswap',
          symbol: 'UNI',
          category: 'DEX',
          tvl: 5200000000,
          change_1d: 2.5,
          change_7d: -1.2,
          change_1m: 5.8,
          listedAt: 1600300800,
          logo: 'https://icons.llama.fi/uniswap.jpg',
          url: 'https://defillama.com/protocol/uniswap',
          chain: 'Ethereum',
          mcap: 8500000000
        },
        {
          name: 'Aave',
          symbol: 'AAVE',
          category: 'Lending',
          tvl: 6800000000,
          change_1d: 1.8,
          change_7d: 3.2,
          change_1m: -2.1,
          listedAt: 1605888000,
          logo: 'https://icons.llama.fi/aave.jpg',
          url: 'https://defillama.com/protocol/aave',
          chain: 'Ethereum',
          mcap: 2100000000
        },
        {
          name: 'Compound',
          symbol: 'COMP',
          category: 'Lending',
          tvl: 3200000000,
          change_1d: -0.5,
          change_7d: 2.8,
          change_1m: 8.5,
          listedAt: 1592784000,
          logo: 'https://icons.llama.fi/compound.jpg',
          url: 'https://defillama.com/protocol/compound',
          chain: 'Ethereum',
          mcap: 850000000
        }
      ];
    }
  }

  async scrapeAirdrops(options: ScrapingOptions = {}): Promise<Airdrop[]> {
    try {
      console.log('🚀 Buscando dados de protocolos para airdrops...');
      
      // Primeiro buscar protocolos com dados completos
      const protocols = await this.scrapeProtocols();
      
      // Converter protocolos em airdrops potenciais
      const airdrops: Airdrop[] = protocols.map(protocol => ({
        name: protocol.name,
        symbol: protocol.symbol,
        category: protocol.category,
        tvl: this.formatNumber(protocol.tvl),
        change1d: this.formatPercentage(protocol.change_1d),
        change7d: this.formatPercentage(protocol.change_7d),
        change1m: this.formatPercentage(protocol.change_1m),
        listedAt: protocol.listedAt ? new Date(protocol.listedAt * 1000).toLocaleDateString() : undefined,
        logo: protocol.logo,
        url: protocol.url,
        chain: protocol.chain,
        mcap: this.formatNumber(protocol.mcap),
        value: this.estimateAirdropValue(protocol.tvl, protocol.mcap),
        status: this.determineAirdropStatus(protocol),
        lastUpdated: new Date().toISOString()
      }));
      
      console.log(`✅ Processados ${airdrops.length} airdrops potenciais`);
      return airdrops;
      
    } catch (error) {
      console.error('❌ Erro durante scraping:', error);
      
      // Fallback com dados de exemplo
      return [
        {
          name: 'LayerZero',
          symbol: 'ZRO',
          category: 'Infrastructure',
          tvl: '$2.5B',
          change1d: '+2.5%',
          change7d: '-1.2%',
          change1m: '+15.8%',
          listedAt: '2021-09-01',
          value: '$1000-5000',
          status: 'Active',
          chain: 'Multi-Chain',
          mcap: '$1.2B',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'zkSync Era',
          symbol: 'ZK',
          category: 'Layer 2',
          tvl: '$800M',
          change1d: '+1.8%',
          change7d: '+3.2%',
          change1m: '+8.5%',
          listedAt: '2023-03-24',
          value: '$500-2000',
          status: 'TBD',
          chain: 'Ethereum',
          mcap: '$650M',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Arbitrum',
          symbol: 'ARB',
          category: 'Layer 2',
          tvl: '$1.8B',
          change1d: '-0.5%',
          change7d: '+2.8%',
          change1m: '+12.1%',
          listedAt: '2021-05-28',
          value: '$300-1500',
          status: 'Active',
          chain: 'Arbitrum',
          mcap: '$2.1B',
          lastUpdated: new Date().toISOString()
        }
      ];
    }
  }

  // Helpers para formatação
  private formatNumber(num?: number): string {
    if (!num) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  }

  private formatPercentage(num?: number): string {
    if (num === undefined || num === null) return 'N/A';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  }

  private estimateAirdropValue(tvl?: number, mcap?: number): string {
    if (!tvl) return 'TBD';
    
    if (tvl > 5e9) return '$2000-10000';
    if (tvl > 1e9) return '$1000-5000';
    if (tvl > 500e6) return '$500-2000';
    if (tvl > 100e6) return '$200-1000';
    return '$50-500';
  }

  private determineAirdropStatus(protocol: DefiProtocol): string {
    // Lógica simples para determinar status do airdrop
    if (!protocol.symbol || protocol.symbol === protocol.name?.substring(0, 3).toUpperCase()) {
      return 'Potential'; // Pode ter airdrop no futuro
    }
    if (protocol.listedAt && protocol.listedAt > Date.now() / 1000 - 365 * 24 * 3600) {
      return 'Recent'; // Projeto recente, pode ter mais airdrops
    }
    return 'TBD';
  }

  async close(): Promise<void> {
    // Não há recursos para fechar com axios/cheerio
    console.log('Scraper fechado');
  }

  // Método para testar e debugar
  async debugPage(): Promise<string> {
    try {
      console.log('Fazendo debug da página...');
      const response = await this.axiosInstance.get('https://defillama.com/airdrops');
      const $ = cheerio.load(response.data);

      const pageInfo = {
        title: $('title').text(),
        url: 'https://defillama.com/airdrops',
        status: response.status,
        headers: response.headers['content-type'],
        bodyLength: response.data.length,
        elementCounts: {
          total: $('*').length,
          tables: $('table').length,
          divs: $('div').length,
          links: $('a').length,
          rows: $('tr').length
        },
        sampleText: $('body').text().slice(0, 500),
        foundStructures: {
          tableRows: $('table tbody tr').length,
          airdropElements: $('[class*="airdrop"]').length,
          itemElements: $('[class*="item"]').length
        }
      };

      return JSON.stringify(pageInfo, null, 2);
    } catch (error) {
      return `Erro no debug: ${error}`;
    }
  }
}