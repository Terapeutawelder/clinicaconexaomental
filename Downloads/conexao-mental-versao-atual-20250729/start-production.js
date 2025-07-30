#!/usr/bin/env node

// Script de inicialização para produção
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurar variáveis de ambiente
process.env.NODE_ENV = 'production';

console.log('🚀 Iniciando Conexão Mental em modo produção...');

// Verificar se o build existe
const buildPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(buildPath)) {
  console.error('❌ Build não encontrado. Execute: npm run build');
  process.exit(1);
}

// Configurações de produção
const productionConfig = {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NODE_OPTIONS: '--max-old-space-size=2048'
  },
  stdio: 'inherit'
};

// Iniciar aplicação
const child = spawn('node', [buildPath], productionConfig);

// Monitorar processo
child.on('error', (error) => {
  console.error('❌ Erro ao iniciar aplicação:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`📊 Aplicação encerrada com código: ${code}`);
  process.exit(code);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Recebido ${signal}. Encerrando aplicação...`);
  child.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log('✅ Aplicação iniciada em modo produção');
console.log('📊 Para verificar saúde: curl http://localhost:5000/api/health');
console.log('🌐 Dashboard admin: http://localhost:5000/admin');