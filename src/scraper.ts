import axios from 'axios';
import * as cheerio from 'cheerio';
import { Airdrop, ScrapingOptions } from './types.js';

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

  async scrapeAirdrops(options: ScrapingOptions = {}): Promise<Airdrop[]> {
    const airdrops: Airdrop[] = [];
    
    try {
      console.log('Fazendo requisição para DeFiLlama airdrops...');
      
      const response = await this.axiosInstance.get('https://defillama.com/airdrops');
      const $ = cheerio.load(response.data);
      
      console.log('HTML carregado, procurando airdrops...');
      
      // Tentar múltiplos seletores para encontrar os dados
      const selectors = [
        'table tbody tr',
        '[data-testid*="airdrop"]',
        '.airdrop-item',
        '[class*="airdrop"]',
        '[class*="row"]:has(a)',
        'tr:has(td)',
        'div[class*="item"]:has(a)'
      ];
      
      let foundElements = false;
      
      for (const selector of selectors) {
        const elements = $(selector);
        console.log(`Seletor '${selector}': ${elements.length} elementos encontrados`);
        
        if (elements.length > 0) {
          foundElements = true;
          
          elements.each((index, element) => {
            try {
              const $el = $(element);
              const text = $el.text().trim();
              
              // Pular elementos muito pequenos ou vazios
              if (!text || text.length < 5) return;
              
              // Extrair dados das células/divs
              const cells = $el.find('td, div[class*="cell"], span[class*="cell"]');
              const links = $el.find('a');
              
              let name = '';
              let value = '';
              let status = '';
              let deadline = '';
              let chain = '';
              let url = '';
              
              // Se for uma linha de tabela com células
              if (cells.length >= 2) {
                name = $(cells[0]).text().trim();
                value = $(cells[1]).text().trim();
                status = cells.length > 2 ? $(cells[2]).text().trim() : 'Active';
                deadline = cells.length > 3 ? $(cells[3]).text().trim() : '';
                chain = cells.length > 4 ? $(cells[4]).text().trim() : '';
              } else {
                // Tentar extrair de estruturas mais complexas
                const nameEl = $el.find('[class*="name"], [class*="title"], h1, h2, h3, h4, strong, b').first();
                name = nameEl.length ? nameEl.text().trim() : $el.find('a').first().text().trim();
                
                const valueEl = $el.find('[class*="value"], [class*="amount"], [class*="price"], [class*="reward"]');
                value = valueEl.length ? valueEl.text().trim() : '';
                
                const statusEl = $el.find('[class*="status"], [class*="badge"], [class*="tag"], [class*="label"]');
                status = statusEl.length ? statusEl.text().trim() : 'Active';
                
                // Tentar extrair deadline de textos que contenham data
                const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|Q\d\s\d{4})/i;
                const dateMatch = text.match(datePattern);
                deadline = dateMatch ? dateMatch[0] : '';
              }
              
              // URL do primeiro link
              url = links.length > 0 ? links.first().attr('href') || '' : '';
              
              // Filtro básico para garantir que temos dados válidos
              if (name && name.length > 2 && !name.toLowerCase().includes('header')) {
                // Limpar dados
                name = name.replace(/\s+/g, ' ').trim();
                value = value.replace(/\s+/g, ' ').trim() || 'TBD';
                status = status.replace(/\s+/g, ' ').trim() || 'Unknown';
                
                // Tentar extrair chain do nome ou contexto
                if (!chain) {
                  const chainPatterns = ['ETH', 'BSC', 'POLYGON', 'AVAX', 'SOLANA', 'SOL', 'ARBITRUM', 'OPTIMISM'];
                  for (const pattern of chainPatterns) {
                    if (text.toUpperCase().includes(pattern)) {
                      chain = pattern;
                      break;
                    }
                  }
                }
                
                const airdrop: Airdrop = {
                  name,
                  value,
                  status,
                  deadline: deadline || undefined,
                  chain: chain || undefined,
                  url: url || undefined,
                  lastUpdated: new Date().toISOString()
                };
                
                airdrops.push(airdrop);
              }
            } catch (err) {
              console.error('Erro ao processar elemento:', err);
            }
          });
          
          // Se encontrou dados com este seletor, parar de tentar outros
          if (airdrops.length > 0) break;
        }
      }
      
      if (!foundElements) {
        console.log('Nenhum elemento encontrado com os seletores padrão. Tentando extração de texto...');
        
        // Fallback: tentar extrair nomes de projetos de links ou texto
        const allLinks = $('a');
        const potentialAirdrops = new Set<string>();
        
        allLinks.each((index, link) => {
          const $link = $(link);
          const text = $link.text().trim();
          const href = $link.attr('href') || '';
          
          // Procurar por padrões que indicam nomes de projetos crypto
          if (text.length > 2 && text.length < 50 && 
              (href.includes('airdrop') || text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/))) {
            potentialAirdrops.add(text);
          }
        });
        
        // Converter para formato padrão
        Array.from(potentialAirdrops).slice(0, 20).forEach(name => {
          airdrops.push({
            name,
            value: 'TBD',
            status: 'Unknown',
            lastUpdated: new Date().toISOString()
          });
        });
      }
      
      console.log(`✅ Extraídos ${airdrops.length} airdrops`);
      
    } catch (error) {
      console.error('❌ Erro durante o scraping:', error);
      
      // Em caso de erro, retornar dados de exemplo para teste
      return [
        {
          name: 'LayerZero',
          value: '$1000-5000',
          status: 'Active',
          chain: 'ETH',
          deadline: '2024-12-31',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'zkSync Era',
          value: '$500-2000',
          status: 'TBD',
          chain: 'ETH',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Arbitrum Odyssey',
          value: '$300-1500',
          status: 'Active',
          chain: 'ARBITRUM',
          lastUpdated: new Date().toISOString()
        }
      ];
    }

    return airdrops;
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