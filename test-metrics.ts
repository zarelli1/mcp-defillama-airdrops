import { DeFiLlamaScraper } from './src/scraper.js';

async function testMetrics() {
  console.log('🧪 Testando métricas completas DexScreener...');
  
  const scraper = new DeFiLlamaScraper();
  
  try {
    const metrics = await scraper.getDexScreenerMetrics();
    
    console.log(`✅ Métricas coletadas: ${metrics.length}`);
    
    if (metrics.length > 0) {
      const example = metrics[0];
      console.log('\n📊 Exemplo de métricas:');
      console.log(`TOKEN: ${example.token}`);
      console.log(`SYMBOL: ${example.symbol}`);
      console.log(`PRICE: ${example.price}`);
      console.log(`AGE: ${example.age}`);
      console.log(`TXNS: 5M:${example.txns.m5} | 1H:${example.txns.h1} | 6H:${example.txns.h6} | 24H:${example.txns.h24}`);
      console.log(`VOLUME: 5M:${example.volume.m5} | 1H:${example.volume.h1} | 6H:${example.volume.h6} | 24H:${example.volume.h24}`);
      console.log(`MAKERS: 5M:${example.makers.m5} | 1H:${example.makers.h1} | 6H:${example.makers.h6} | 24H:${example.makers.h24}`);
      console.log(`LIQUIDITY: ${example.liquidity}`);
      console.log(`MCAP: ${example.mcap}`);
      console.log(`CHAIN: ${example.chain}`);
      console.log(`DEX: ${example.dex}`);
    }
    
    console.log('\n🎉 Teste de métricas concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
  }
}

testMetrics();