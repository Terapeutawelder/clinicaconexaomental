import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';

// Estender a interface Request para incluir apiKey
declare global {
  namespace Express {
    interface Request {
      apiKey?: any;
      apiUserId?: string;
    }
  }
}

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'API Key required',
        message: 'Provide a valid API key in Authorization header as Bearer token'
      });
    }

    const apiKeyValue = authHeader.substring(7); // Remove 'Bearer '
    
    // Hash da API key para comparar com o banco
    const keyHash = crypto.createHash('sha256').update(apiKeyValue).digest('hex');
    
    // Buscar API key no banco
    const apiKey = await storage.getApiKeyByHash(keyHash);
    
    if (!apiKey) {
      await logApiRequest(req, res, null, 401, 'Invalid API Key');
      return res.status(401).json({ 
        error: 'Invalid API Key',
        message: 'The provided API key is not valid or has been revoked'
      });
    }

    if (!apiKey.active) {
      await logApiRequest(req, res, apiKey.id, 403, 'API Key inactive');
      return res.status(403).json({ 
        error: 'API Key inactive',
        message: 'This API key has been deactivated'
      });
    }

    // Atualizar último uso
    await storage.updateApiKeyLastUsed(apiKey.id);
    
    // Adicionar informações da API key na request
    req.apiKey = apiKey;
    req.apiUserId = apiKey.created_by;
    
    next();
  } catch (error) {
    console.error('API Key authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Valid API key required for this endpoint'
      });
    }

    const permissions = req.apiKey.permissions || [];
    
    // Admin permission bypassa todas as outras
    if (permissions.includes('admin') || permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: `This API key does not have '${requiredPermission}' permission`,
      required_permission: requiredPermission,
      current_permissions: permissions
    });
  };
};

async function logApiRequest(req: Request, res: Response, apiKeyId: string | null, statusCode: number, message?: string) {
  try {
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;
    
    await storage.createApiLog({
      api_key_id: apiKeyId,
      endpoint: req.path,
      method: req.method,
      status_code: statusCode,
      response_time: responseTime,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'],
      request_body: req.body,
      response_body: message ? { message } : null,
    });
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

// Middleware para log automático de requests autenticadas
export const logApiMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Interceptar o final da response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log assíncrono para não afetar performance
    setImmediate(() => {
      if (req.apiKey) {
        storage.createApiLog({
          api_key_id: req.apiKey.id,
          endpoint: req.path,
          method: req.method,
          status_code: res.statusCode,
          response_time: responseTime,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'],
          request_body: req.body,
          response_body: body ? JSON.parse(body) : null,
        }).catch(err => console.error('Failed to log API request:', err));
      }
    });
    
    return originalSend.call(this, body);
  };
  
  next();
};