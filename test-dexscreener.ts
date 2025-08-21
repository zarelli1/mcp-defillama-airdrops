import { DeFiLlamaScraper } from './src/scraper.js';

async function testDexScreener() {
  console.log('🧪 Testando integração DexScreener...');
  
  const scraper = new DeFiLlamaScraper();
  
  try {
    // Testar perfis de tokens
    console.log('\n1. Testando perfis de tokens...');
    const profiles = await scraper.scrapeDexScreenerTokenProfiles();
    console.log(`✅ Perfis encontrados: ${profiles.length}`);
    if (profiles.length > 0) {
      console.log('Exemplo de perfil:', profiles[0]);
    }
    
    // Testar top tokens
    console.log('\n2. Testando top tokens...');
    const topTokens = await scraper.scrapeTopDexScreenerTokens();
    console.log(`✅ Top tokens encontrados: ${topTokens.length}`);
    if (topTokens.length > 0) {
      console.log('Exemplo de token:', {
        name: topTokens[0].baseToken?.name,
        symbol: topTokens[0].baseToken?.symbol,
        priceUsd: topTokens[0].priceUsd,
        volume24h: topTokens[0].volume?.h24,
        chain: topTokens[0].chainId
      });
    }
    
    // Testar dados combinados
    console.log('\n3. Testando dados combinados...');
    const combinedData = await scraper.getCombinedCryptoData();
    console.log(`✅ Dados combinados:
    - Airdrops: ${combinedData.airdrops.length}
    - Tokens: ${combinedData.tokens.length}
    - Perfis: ${combinedData.profiles.length}`);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
  }
}

testDexScreener();