// Configurações específicas para produção
export const productionConfig = {
  // Configurações de segurança
  security: {
    jwtSecret: process.env.JWT_SECRET || "ConexaoMental@2025#ProdSecretKey",
    sessionSecret: process.env.SESSION_SECRET || "ConexaoMental@SessionSecret2025",
    allowedOrigins: [
      'https://clinicaconexaomental.online',
      'https://www.clinicaconexaomental.online'
    ],
    cookieConfig: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  },

  // Configurações de banco de dados
  database: {
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: true
  },

  // Configurações de WebSocket
  websocket: {
    pingInterval: 30000, // 30 segundos
    maxConnections: 100,
    timeout: 60000 // 1 minuto
  },

  // Configurações de servidor
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    reusePort: true,
    timeout: 30000
  },

  // Configurações de log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: true,
    enableErrorLogging: true
  }
};

// Validação de variáveis de ambiente obrigatórias
export const validateEnvironment = () => {
  const required = ['DATABASE_URL'];
  
  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(`Required environment variable ${variable} is not set`);
    }
  }
};

// Headers de segurança para produção
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};

// Rate limiting para produção
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
};