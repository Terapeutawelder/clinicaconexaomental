import { Express } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';

export function setupAdminIntegrationRoutes(app: Express, authenticate: any) {
  // Middleware para verificar se é admin
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // ========================================
  // API KEYS MANAGEMENT
  // ========================================

  // Listar API Keys
  app.get('/api/admin/api-keys', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys();
      // Não enviar hashes das chaves por segurança
      const safeApiKeys = apiKeys.map(key => {
        const { key_hash, ...safeKey } = key;
        return safeKey;
      });
      
      res.json({ apiKeys: safeApiKeys });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Criar nova API Key
  app.post('/api/admin/api-keys', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { name, permissions } = req.body;
      
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ 
          error: 'Name and permissions are required',
          example: {
            name: 'N8N Integration',
            permissions: ['users.read', 'appointments.write']
          }
        });
      }

      // Gerar chave aleatória
      const apiKey = crypto.randomBytes(32).toString('hex');
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      // Salvar no banco
      const newApiKey = await storage.createApiKey({
        name,
        key_hash: keyHash,
        permissions,
        active: true,
        created_by: req.user.id,
      });

      // Retornar a chave apenas uma vez
      const { key_hash: _, ...safeApiKey } = newApiKey;
      res.status(201).json({ 
        apiKey: safeApiKey,
        key: apiKey // Esta é a única vez que a chave é enviada
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Atualizar API Key (ativar/desativar)
  app.patch('/api/admin/api-keys/:id', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { active, permissions } = req.body;
      
      const updateData: any = {};
      if (typeof active === 'boolean') updateData.active = active;
      if (Array.isArray(permissions)) updateData.permissions = permissions;

      const updatedKey = await storage.updateApiKey(id, updateData);
      
      if (!updatedKey) {
        return res.status(404).json({ error: 'API Key not found' });
      }

      const { key_hash, ...safeKey } = updatedKey;
      res.json({ apiKey: safeKey });
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Excluir API Key
  app.delete('/api/admin/api-keys/:id', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteApiKey(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'API Key not found' });
      }

      res.json({ message: 'API Key deleted successfully' });
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========================================
  // WEBHOOKS MANAGEMENT
  // ========================================

  // Listar Webhooks
  app.get('/api/admin/webhooks', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const webhooks = await storage.getAllWebhooks();
      res.json({ webhooks });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Criar novo Webhook
  app.post('/api/admin/webhooks', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { name, url, events, secret } = req.body;
      
      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ 
          error: 'Name, URL and events are required',
          example: {
            name: 'N8N Webhook',
            url: 'https://your-webhook.com/endpoint',
            events: ['appointment.created', 'user.created'],
            secret: 'optional-secret-for-validation'
          }
        });
      }

      // Validar URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const webhook = await storage.createWebhook({
        name,
        url,
        events,
        secret: secret || null,
        active: true,
        created_by: req.user.id,
      });

      res.status(201).json({ webhook });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Atualizar Webhook
  app.patch('/api/admin/webhooks/:id', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, url, events, secret, active } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (url) {
        try {
          new URL(url);
          updateData.url = url;
        } catch {
          return res.status(400).json({ error: 'Invalid URL format' });
        }
      }
      if (Array.isArray(events)) updateData.events = events;
      if (secret !== undefined) updateData.secret = secret;
      if (typeof active === 'boolean') updateData.active = active;

      const updatedWebhook = await storage.updateWebhook(id, updateData);
      
      if (!updatedWebhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({ webhook: updatedWebhook });
    } catch (error) {
      console.error('Error updating webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Excluir Webhook
  app.delete('/api/admin/webhooks/:id', authenticate, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteWebhook(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  console.log('✅ Admin Integration routes configuradas');
}