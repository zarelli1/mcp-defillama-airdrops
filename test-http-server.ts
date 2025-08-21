#!/usr/bin/env tsx

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testAPIEndpoints() {
  console.log('🧪 Testando endpoints da API HTTP...\n');
  
  try {
    // 1. Test Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', healthResponse.data);
    console.log();
    
    // 2. Test Get All Airdrops
    console.log('2️⃣ Testando Get All Airdrops...');
    const airdropsResponse = await axios.get(`${BASE_URL}/api/airdrops`);
    console.log('✅ Total airdrops:', airdropsResponse.data.total);
    console.log();
    
    // 3. Test Best Airdrops (para N8N)
    console.log('3️⃣ Testando N8N Best Airdrops...');
    const bestResponse = await axios.get(`${BASE_URL}/n8n/best-airdrops?limit=3`);
    console.log('✅ Best airdrops:', bestResponse.data.count);
    console.log('📊 Dados para N8N:');
    bestResponse.data.airdrops.forEach((airdrop: any, index: number) => {
      console.log(`   ${index + 1}. ${airdrop.name} - ${airdrop.value} (${airdrop.chain})`);
    });
    console.log();
    
    // 4. Test Filter
    console.log('4️⃣ Testando Filter...');
    const filterResponse = await axios.post(`${BASE_URL}/api/airdrops/filter`, {
      status: 'active',
      chain: 'ETH'
    });
    console.log('✅ Filtered airdrops:', filterResponse.data.total);
    console.log();
    
    // 5. Test Debug
    console.log('5️⃣ Testando Debug...');
    const debugResponse = await axios.get(`${BASE_URL}/api/debug`);
    console.log('✅ Debug executado com sucesso');
    console.log();
    
    console.log('🎉 Todos os endpoints estão funcionando!');
    console.log('\n📋 URLs para usar no N8N:');
    console.log(`   Health: ${BASE_URL}/health`);
    console.log(`   N8N Endpoint: ${BASE_URL}/n8n/best-airdrops?limit=5`);
    console.log(`   All Airdrops: ${BASE_URL}/api/airdrops`);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erro na requisição:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Servidor não está rodando!');
        console.log('Execute: npm run server');
      }
    } else {
      console.error('❌ Erro:', error);
    }
  }
}

// Aguardar 2 segundos para dar tempo do servidor iniciar
setTimeout(() => {
  testAPIEndpoints().catch(console.error);
}, 2000);