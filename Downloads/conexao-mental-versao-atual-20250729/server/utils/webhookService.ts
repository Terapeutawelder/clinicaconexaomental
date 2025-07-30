import { storage } from '../storage';
import crypto from 'crypto';

export interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
  source: 'appointment' | 'user' | 'professional' | 'payment' | 'system';
}

export class WebhookService {
  // Disparar webhook para um evento específico
  static async triggerWebhook(event: string, data: any, source: string = 'system') {
    try {
      // Buscar webhooks ativos para este evento
      const webhooks = await storage.getActiveWebhooksByEvent(event);
      
      if (webhooks.length === 0) {
        console.log(`No active webhooks found for event: ${event}`);
        return;
      }

      const webhookPayload: WebhookEvent = {
        event,
        data,
        timestamp: new Date().toISOString(),
        source: source as any
      };

      // Enviar para todos os webhooks configurados
      const promises = webhooks.map(webhook => 
        this.sendWebhook(webhook, webhookPayload)
      );

      await Promise.allSettled(promises);
      console.log(`Webhooks triggered for event: ${event} (${webhooks.length} endpoints)`);
    } catch (error) {
      console.error('Failed to trigger webhooks:', error);
    }
  }

  // Enviar payload para um webhook específico
  private static async sendWebhook(webhook: any, payload: WebhookEvent) {
    try {
      const body = JSON.stringify(payload);
      const signature = this.generateSignature(body, webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Source': 'ConexaoMental',
          'User-Agent': 'ConexaoMental-Webhooks/1.0'
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Webhook sent successfully to ${webhook.url} for event ${payload.event}`);
    } catch (error) {
      console.error(`Failed to send webhook to ${webhook.url}:`, error);
      // Aqui poderia implementar retry logic ou dead letter queue
    }
  }

  // Gerar assinatura HMAC para validação
  private static generateSignature(body: string, secret?: string): string {
    if (!secret) return '';
    
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  // Validar assinatura de webhook (para webhooks recebidos)
  static validateSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(body, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// Eventos disponíveis para webhooks
export const WEBHOOK_EVENTS = {
  // Usuários
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  // Profissionais
  PROFESSIONAL_CREATED: 'professional.created',
  PROFESSIONAL_APPROVED: 'professional.approved',
  PROFESSIONAL_REJECTED: 'professional.rejected',
  PROFESSIONAL_SUSPENDED: 'professional.suspended',
  PROFESSIONAL_UPDATED: 'professional.updated',
  
  // Agendamentos
  APPOINTMENT_CREATED: 'appointment.created',
  APPOINTMENT_UPDATED: 'appointment.updated',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  
  // Pagamentos
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_APPROVED: 'payment.approved',
  PAYMENT_REJECTED: 'payment.rejected',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Sistema
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_ALERT: 'system.alert',
  
  // Videochamadas
  VIDEO_CALL_STARTED: 'video.call.started',
  VIDEO_CALL_ENDED: 'video.call.ended',
  VIDEO_CALL_FAILED: 'video.call.failed',
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];