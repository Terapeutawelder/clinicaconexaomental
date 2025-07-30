#!/usr/bin/env node

import { productionConfig, validateEnvironment, securityHeaders } from './config/production';
import express from 'express';
import { registerRoutes } from './routes';
import { serveStatic } from './vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar variáveis de ambiente para produção
process.env.NODE_ENV = 'production';

// Validar ambiente
try {
  validateEnvironment();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();

// Middleware de segurança
app.use((req, res, next) => {
  // Aplicar headers de segurança
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // CORS para produção
  const origin = req.headers.origin;
  if (productionConfig.security.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
});

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Logging de requisições
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `${new Date().toISOString()} - ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
    
    if (req.path.startsWith('/api') || res.statusCode >= 400) {
      console.log(logLine);
    }
  });

  next();
});

// Inicializar aplicação
async function startServer() {
  try {
    console.log('🚀 Starting Conexão Mental platform in production mode...');
    
    // Registrar rotas
    const server = await registerRoutes(app);
    
    // Servir arquivos estáticos
    serveStatic(app);
    
    // Middleware de erro global
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Global error handler:', err);
      
      const status = err.status || err.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
      
      res.status(status).json({ 
        error: message,
        timestamp: new Date().toISOString()
      });
    });

    // Iniciar servidor
    const { host, port } = productionConfig.server;
    
    server.listen(port, host, () => {
      console.log(`✅ Server running on ${host}:${port}`);
      console.log(`🌐 Health check: http://${host}:${port}/api/health`);
      console.log(`📊 Dashboard: http://${host}:${port}/admin`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log('⚠️  Forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer().catch(console.error);