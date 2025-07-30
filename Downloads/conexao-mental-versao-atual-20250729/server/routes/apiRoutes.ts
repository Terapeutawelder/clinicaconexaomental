import { Express } from 'express';
import { storage } from '../storage';
import { apiKeyAuth, checkPermission, logApiMiddleware } from '../middleware/apiAuth';
import { WebhookService, WEBHOOK_EVENTS } from '../utils/webhookService';
import crypto from 'crypto';

export function setupApiRoutes(app: Express) {
  // Aplicar middleware de log para todas as rotas da API externa
  app.use('/api/v1', logApiMiddleware);

  // ========================================
  // ROUTES PÚBLICAS - Informações do sistema
  // ========================================
  
  // Status da API
  app.get('/api/v1/status', (req, res) => {
    res.json({
      status: 'active',
      version: '1.0.0',
      service: 'Conexão Mental API',
      timestamp: new Date().toISOString(),
      endpoints: {
        authentication: '/api/v1/auth',
        users: '/api/v1/users',
        professionals: '/api/v1/professionals',
        appointments: '/api/v1/appointments',
        webhooks: '/api/v1/webhooks',
        management: '/api/v1/admin'
      }
    });
  });

  // Documentação dos eventos disponíveis para webhooks
  app.get('/api/v1/webhook-events', (req, res) => {
    res.json({
      events: Object.values(WEBHOOK_EVENTS),
      description: 'Lista de eventos disponíveis para configuração de webhooks',
      webhook_payload_example: {
        event: 'appointment.created',
        data: {
          appointment_id: 'uuid',
          patient_id: 'uuid',
          professional_id: 'uuid',
          scheduled_at: '2025-01-01T10:00:00.000Z',
          status: 'scheduled'
        },
        timestamp: '2025-01-01T10:00:00.000Z',
        source: 'appointment'
      }
    });
  });

  // ========================================
  // ROUTES PROTEGIDAS - Requerem API Key
  // ========================================

  // Middleware de autenticação para todas as rotas protegidas
  app.use('/api/v1/users', apiKeyAuth);
  app.use('/api/v1/professionals', apiKeyAuth);
  app.use('/api/v1/appointments', apiKeyAuth);
  app.use('/api/v1/admin', apiKeyAuth);

  // ========================================
  // USUÁRIOS
  // ========================================
  
  // Listar usuários
  app.get('/api/v1/users', checkPermission('users.read'), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      });
      
      res.json({
        users: sanitizedUsers,
        total: sanitizedUsers.length,
        page: 1,
        per_page: sanitizedUsers.length
      });
    } catch (error) {
      console.error('API Error - Get users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Obter usuário por ID
  app.get('/api/v1/users/:id', checkPermission('users.read'), async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error('API Error - Get user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Criar usuário
  app.post('/api/v1/users', checkPermission('users.write'), async (req, res) => {
    try {
      const { email, full_name, role = 'patient', password } = req.body;
      
      if (!email || !full_name || !password) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['email', 'full_name', 'password']
        });
      }

      // Verificar se usuário já existe
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash da senha
      const password_hash = await storage.hashPassword(password);
      
      const user = await storage.createUser({
        email: email.toLowerCase().trim(),
        full_name,
        password_hash,
        role,
      });

      // Disparar webhook
      await WebhookService.triggerWebhook(WEBHOOK_EVENTS.USER_CREATED, {
        user_id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }, 'user');

      const { password_hash: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error) {
      console.error('API Error - Create user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========================================
  // PROFISSIONAIS
  // ========================================
  
  // Listar profissionais
  app.get('/api/v1/professionals', checkPermission('professionals.read'), async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      
      res.json({
        professionals,
        total: professionals.length,
        page: 1,
        per_page: professionals.length
      });
    } catch (error) {
      console.error('API Error - Get professionals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Obter profissional por ID
  app.get('/api/v1/professionals/:id', checkPermission('professionals.read'), async (req, res) => {
    try {
      const professional = await storage.getProfessional(req.params.id);
      if (!professional) {
        return res.status(404).json({ error: 'Professional not found' });
      }
      
      res.json({ professional });
    } catch (error) {
      console.error('API Error - Get professional:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Aprovar/Rejeitar profissional
  app.patch('/api/v1/professionals/:id/status', checkPermission('professionals.write'), async (req, res) => {
    try {
      const { status, approved } = req.body;
      
      if (!status || approved === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['status', 'approved']
        });
      }

      const professional = await storage.updateProfessional(req.params.id, {
        status,
        approved,
        updated_at: new Date()
      });

      if (!professional) {
        return res.status(404).json({ error: 'Professional not found' });
      }

      // Disparar webhook baseado na ação
      const event = approved ? WEBHOOK_EVENTS.PROFESSIONAL_APPROVED : WEBHOOK_EVENTS.PROFESSIONAL_REJECTED;
      await WebhookService.triggerWebhook(event, {
        professional_id: professional.id,
        status,
        approved,
        updated_at: professional.updated_at
      }, 'professional');

      res.json({ professional });
    } catch (error) {
      console.error('API Error - Update professional status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========================================
  // AGENDAMENTOS
  // ========================================
  
  // Listar agendamentos
  app.get('/api/v1/appointments', checkPermission('appointments.read'), async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      
      res.json({
        appointments,
        total: appointments.length,
        page: 1,
        per_page: appointments.length
      });
    } catch (error) {
      console.error('API Error - Get appointments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Criar agendamento
  app.post('/api/v1/appointments', checkPermission('appointments.write'), async (req, res) => {
    try {
      const appointmentData = req.body;
      
      if (!appointmentData.patient_id || !appointmentData.professional_id || !appointmentData.scheduled_at) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['patient_id', 'professional_id', 'scheduled_at']
        });
      }

      const appointment = await storage.createAppointment(appointmentData);

      // Disparar webhook
      await WebhookService.triggerWebhook(WEBHOOK_EVENTS.APPOINTMENT_CREATED, {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status
      }, 'appointment');

      res.status(201).json({ appointment });
    } catch (error) {
      console.error('API Error - Create appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Atualizar status do agendamento
  app.patch('/api/v1/appointments/:id/status', checkPermission('appointments.write'), async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          error: 'Missing required field: status'
        });
      }

      const appointment = await storage.updateAppointment(req.params.id, {
        status,
        updated_at: new Date()
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Disparar webhook baseado no status
      let event = WEBHOOK_EVENTS.APPOINTMENT_UPDATED;
      if (status === 'cancelled') event = WEBHOOK_EVENTS.APPOINTMENT_CANCELLED;
      if (status === 'completed') event = WEBHOOK_EVENTS.APPOINTMENT_COMPLETED;
      if (status === 'confirmed') event = WEBHOOK_EVENTS.APPOINTMENT_CONFIRMED;

      await WebhookService.triggerWebhook(event, {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        status: appointment.status,
        updated_at: appointment.updated_at
      }, 'appointment');

      res.json({ appointment });
    } catch (error) {
      console.error('API Error - Update appointment status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========================================
  // ADMINISTRAÇÃO
  // ========================================
  
  // Estatísticas do sistema
  app.get('/api/v1/admin/stats', checkPermission('admin'), async (req, res) => {
    try {
      const [users, professionals, appointments] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllProfessionals(),
        storage.getAllAppointments()
      ]);

      const stats = {
        users: {
          total: users.length,
          patients: users.filter(u => u.role === 'patient').length,
          professionals: users.filter(u => u.role === 'professional').length,
          admins: users.filter(u => u.role === 'admin').length,
        },
        professionals: {
          total: professionals.length,
          approved: professionals.filter(p => p.approved).length,
          pending: professionals.filter(p => !p.approved).length,
        },
        appointments: {
          total: appointments.length,
          scheduled: appointments.filter(a => a.status === 'scheduled').length,
          completed: appointments.filter(a => a.status === 'completed').length,
          cancelled: appointments.filter(a => a.status === 'cancelled').length,
        }
      };

      res.json({ stats });
    } catch (error) {
      console.error('API Error - Get admin stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logs da API
  app.get('/api/v1/admin/logs', checkPermission('admin'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getApiLogs(limit);
      
      res.json({
        logs,
        total: logs.length,
        limit
      });
    } catch (error) {
      console.error('API Error - Get API logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teste de webhook manual
  app.post('/api/v1/admin/test-webhook', checkPermission('admin'), async (req, res) => {
    try {
      const { event, data } = req.body;
      
      if (!event) {
        return res.status(400).json({ error: 'Event is required' });
      }

      await WebhookService.triggerWebhook(event, data || { test: true, timestamp: new Date().toISOString() }, 'system');
      
      res.json({ 
        message: 'Webhook test triggered successfully',
        event,
        data: data || { test: true }
      });
    } catch (error) {
      console.error('API Error - Test webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========================================
  // GERENCIAMENTO DE API KEYS E WEBHOOKS
  // ========================================
  
  // Essas rotas serão implementadas no painel admin
  // mas também disponíveis via API para automação

  console.log('✅ API externa configurada em /api/v1');
  console.log('📚 Documentação: GET /api/v1/status');
  console.log('🔑 Autenticação: Bearer token nas rotas protegidas');
}