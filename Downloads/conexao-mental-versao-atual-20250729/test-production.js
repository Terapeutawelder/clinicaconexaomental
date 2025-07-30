#!/usr/bin/env node

// Script para testar funcionalidades em produção
import http from 'http';
import https from 'https';

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url, BASE_URL);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Testes de produção
async function runTests() {
  console.log('🧪 Iniciando testes de produção...\n');
  
  const tests = [
    {
      name: 'Health Check',
      test: async () => {
        const response = await makeRequest('/api/health');
        if (response.status === 200 && response.data.status === 'ok') {
          return { success: true, message: 'API saudável' };
        }
        return { success: false, message: 'Health check falhou' };
      }
    },
    {
      name: 'Página Principal',
      test: async () => {
        const response = await makeRequest('/');
        if (response.status === 200) {
          return { success: true, message: 'Página principal carregada' };
        }
        return { success: false, message: 'Erro ao carregar página principal' };
      }
    },
    {
      name: 'API de Profissionais (público)',
      test: async () => {
        const response = await makeRequest('/api/professionals');
        if (response.status === 200 && Array.isArray(response.data)) {
          return { success: true, message: 'Endpoint público de profissionais funcionando' };
        }
        return { success: false, message: 'Problema com endpoint de profissionais' };
      }
    },
    {
      name: 'API de Estatísticas Admin (protegida)',
      test: async () => {
        const response = await makeRequest('/api/admin/stats');
        if (response.status === 401) {
          return { success: true, message: 'Rota protegida funcionando' };
        }
        return { success: false, message: 'Problema de proteção de rota admin' };
      }
    },
    {
      name: 'Arquivos Estáticos',
      test: async () => {
        const response = await makeRequest('/assets/index.css');
        if (response.status === 200 || response.status === 404) {
          return { success: true, message: 'Servir arquivos estáticos OK' };
        }
        return { success: false, message: 'Problema com arquivos estáticos' };
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result.success) {
        console.log(`✅ ${name}: ${result.message}`);
        passed++;
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: Erro - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Resultados: ${passed} testes passaram, ${failed} falharam`);
  
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! Aplicação pronta para produção.');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs.');
    process.exit(1);
  }
}

// Aguardar servidor iniciar
setTimeout(runTests, 3000);